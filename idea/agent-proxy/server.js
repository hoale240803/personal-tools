const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json({ limit: "50mb" }));

// Điền các key free của bạn vào đây
const API_KEYS = [];

let currentIndex = 0;

app.post("/v1/chat/completions", async (req, res) => {
  let attempts = 0;

  // Chuẩn hóa payload sạch cho Gemini
  const sanitizedBody = {
    model: req.body.model,
    messages: req.body.messages,
  };
  if (req.body.temperature !== undefined)
    sanitizedBody.temperature = req.body.temperature;
  if (req.body.max_tokens !== undefined)
    sanitizedBody.max_tokens = req.body.max_tokens;
  if (req.body.stream !== undefined) sanitizedBody.stream = req.body.stream;
  if (req.body.top_p !== undefined) sanitizedBody.top_p = req.body.top_p;

  while (attempts < API_KEYS.length) {
    const currentKey = API_KEYS[currentIndex];
    try {
      console.log(
        `[Proxy] Đang thử kết nối với Key số ${currentIndex + 1}/${API_KEYS.length} (Model: ${sanitizedBody.model})...`,
      );

      // SỬA ĐOẠN NÀY: Chuyển endpoint sang /v1/chat/completions chuẩn của Google AI Studio
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/chat/completions`,
        sanitizedBody,
        {
          headers: {
            Authorization: `Bearer ${currentKey}`,
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status >= 200 && status < 600,
        },
      );

      if (response.status === 200) {
        console.log(`✅ Key số ${currentIndex + 1} phản hồi thành công!`);
        return res.json(response.data);
      }

      // Xoay key nếu dính Rate Limit (429) hoặc lỗi quá tải hệ thống (503, 500, 502)
      if (
        response.status === 429 ||
        response.status === 503 ||
        response.status === 500 ||
        response.status === 502
      ) {
        console.log(
          `❌ Key ${currentIndex + 1} gặp mã lỗi ${response.status}. Tiến hành xoay key...`,
        );
        currentIndex = (currentIndex + 1) % API_KEYS.length;
        attempts++;
        continue;
      }

      // In lỗi logic khác nếu có
      console.error(
        `⚠️ Google trả về mã lỗi không thể tự sửa (${response.status}):`,
      );
      console.dir(response.data, { depth: null });
      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Mạng Local lỗi]:`, error.message);
      currentIndex = (currentIndex + 1) % API_KEYS.length;
      attempts++;
    }
  }

  res.status(503).json({
    error: {
      message:
        "Tất cả các Gemini Key đều thất bại. Vui lòng kiểm tra lại cấu hình hoặc thử lại sau.",
      status: "UNAVAILABLE",
    },
  });
});

app.listen(3000, () => {
  console.log(
    "🚀 Proxy xoay tự động đã cập nhật endpoint /v1 tại http://localhost:3000",
  );
});
