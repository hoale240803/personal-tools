const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json({ limit: "50mb" }));

// Điền danh sách các key free của bạn vào đây
const API_KEYS = [];
let currentIndex = 0;

app.post("/v1/chat/completions", async (req, res) => {
  let attempts = 0;

  // Chuẩn hóa payload sạch sẽ nhất cho Gemini Endpoint
  const sanitizedBody = {
    model: req.body.model, // Sẽ là gemini-1.5-flash-latest từ VS Code truyền sang
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
        `[Proxy] Thử kết nối Key số ${currentIndex + 1}/${API_KEYS.length} (Model: ${sanitizedBody.model})...`,
      );

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/chat/completions`,
        sanitizedBody,
        {
          headers: {
            Authorization: `Bearer ${currentKey}`,
            "api-key": currentKey, // Truyền song song cả api-key để đảm bảo vượt qua gateway Google
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status >= 200 && status < 600,
        },
      );

      // Thành công
      if (response.status === 200) {
        console.log(
          `✅ Key số ${currentIndex + 1} phản hồi thành công rực rỡ!`,
        );
        return res.json(response.data);
      }

      // Xoay key nếu gặp lỗi nghẽn (429, 503, 500, 502)
      if (
        response.status === 429 ||
        response.status === 503 ||
        response.status === 500 ||
        response.status === 502
      ) {
        console.log(
          `❌ Key ${currentIndex + 1} báo mã lỗi ${response.status}. Đang tự động đổi sang key tiếp theo...`,
        );
        currentIndex = (currentIndex + 1) % API_KEYS.length;
        attempts++;
        continue;
      }

      // In lỗi chi tiết nếu vẫn dính 404 hoặc 400
      console.error(`⚠️ Google trả về mã lỗi (${response.status}):`);
      console.dir(response.data, { depth: null });
      return res.status(response.status).json(response.data);
    } catch (error) {
      console.error(`[Mạng lỗi]:`, error.message);
      currentIndex = (currentIndex + 1) % API_KEYS.length;
      attempts++;
    }
  }

  res.status(503).json({
    error: {
      message: "Tất cả các key đều thất bại hoặc chạm giới hạn.",
      status: "UNAVAILABLE",
    },
  });
});

app.listen(3000, () => {
  console.log(
    "🚀 Proxy xoay key chuẩn v1 đang hoạt động tại http://localhost:3000",
  );
});
