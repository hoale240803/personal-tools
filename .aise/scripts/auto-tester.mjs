#!/usr/bin/env node
/**
 * Script: .aise/scripts/auto-tester.mjs
 * Chức năng (Giai đoạn 2 - Tự động hoàn toàn):
 * 1. Đọc gói bằng chứng `.aise/storage/evidence/PASTE_TO_WEB_AI.md` và ảnh chụp màn hình (nếu có).
 * 2. Tự động gọi Gemini API (hoặc Claude/OpenAI sau này) với Structured JSON Output.
 * 3. Tự động ghi đè kết quả đánh giá vào `.aise/feedback.json` (tự động tăng retryCount nếu vẫn FAIL).
 * 4. Trả về Exit Code 0 nếu PASS, Exit Code 2 nếu FAIL (để Worker/Pipeline biết mà tự lặp vòng sửa lỗi).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const aiseDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(aiseDir, '..');
process.chdir(rootDir);

const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=') || true];
  })
);

const taskId = args.task || 'TASK-001';
const evidenceDir = path.join(aiseDir, 'storage', 'evidence');
const feedbackPath = path.join(aiseDir, 'feedback.json');
const envPath = path.join(aiseDir, '.env');

// Hàm đọc file .env đơn giản không cần thư viện ngoài
function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
      env[k] = v;
    }
  }
  return env;
}

const fileEnv = loadEnv(envPath);
const apiKey = process.env.GEMINI_API_KEY || fileEnv.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || fileEnv.GEMINI_MODEL || 'gemini-2.5-flash';

if (!apiKey || apiKey === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
  console.error(`❌ [AUTO-TESTER] Chưa cấu hình GEMINI_API_KEY!`);
  console.error(`👉 Hãy mở file .aise/.env và dán Gemini API Key của bạn vào dòng GEMINI_API_KEY=...`);
  process.exit(1);
}

const pasteFilePath = path.join(evidenceDir, 'PASTE_TO_WEB_AI.md');
if (!fs.existsSync(pasteFilePath)) {
  console.error(`❌ [AUTO-TESTER] Không tìm thấy file bằng chứng: ${pasteFilePath}`);
  process.exit(1);
}

const promptText = fs.readFileSync(pasteFilePath, 'utf-8');
const screenshotPath = path.join(evidenceDir, `${taskId}-ui.png`);

// Tính toán retryCount dựa trên feedback.json trước đó
let previousRetryCount = 0;
if (fs.existsSync(feedbackPath)) {
  try {
    const prev = JSON.parse(fs.readFileSync(feedbackPath, 'utf-8'));
    if (prev.taskId === taskId && prev.verdict === 'FAIL') {
      previousRetryCount = Number(prev.retryCount) || 0;
    }
  } catch {
    // Bỏ qua nếu file cũ lỗi
  }
}

// Chuẩn bị payload cho Gemini API (hỗ trợ cả text + ảnh chụp màn hình nếu có)
const parts = [{ text: promptText }];

if (fs.existsSync(screenshotPath)) {
  const imgBase64 = fs.readFileSync(screenshotPath).toString('base64');
  parts.push({
    inline_data: {
      mime_type: 'image/png',
      data: imgBase64,
    },
  });
  console.log(`🖼️ [AUTO-TESTER] Đã đính kèm ảnh chụp UI (${taskId}-ui.png) gửi lên Gemini.`);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

console.log(`🤖 [AUTO-TESTER] Đang gọi Gemini API (${modelName}) để kiểm định độc lập ${taskId}...`);

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`❌ [AUTO-TESTER] Gemini API trả về lỗi HTTP ${response.status}:\n${errText}`);
    process.exit(1);
  }

  const data = await response.json();
  const rawJsonText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawJsonText) {
    console.error(`❌ [AUTO-TESTER] Phản hồi từ Gemini không có nội dung JSON hợp lệ:`, JSON.stringify(data, null, 2));
    process.exit(1);
  }

  const parsedFeedback = JSON.parse(rawJsonText);
  parsedFeedback.taskId = taskId;
  parsedFeedback.retryCount = parsedFeedback.verdict === 'FAIL' ? previousRetryCount + 1 : 0;

  fs.writeFileSync(feedbackPath, JSON.stringify(parsedFeedback, null, 2) + '\n', 'utf-8');
  console.log(`💾 [AUTO-TESTER] Đã lưu kết quả kiểm định vào: .aise/feedback.json`);
  console.log(`📊 KẾT QUẢ KIỂM ĐỊNH (VERDICT): ${parsedFeedback.verdict} (Retry: ${parsedFeedback.retryCount})`);
  console.log(`📝 Tóm tắt: ${parsedFeedback.summary}`);

  if (parsedFeedback.verdict === 'FAIL') {
    console.log(`🚨 Phát hiện ${parsedFeedback.issues?.length || 0} lỗi cần sửa! Xem chi tiết trong .aise/feedback.json`);
    process.exitCode = 2; // Exit code 2 báo hiệu FAIL từ Tester (dùng exitCode thay vì exit() để tránh lỗi libuv trên Node 24 Windows)
  } else {
    console.log(`🎉 CHÚC MỪNG! Task ${taskId} đã vượt qua vòng kiểm định độc lập của Gemini!`);
    process.exitCode = 0;
  }
} catch (err) {
  console.error(`❌ [AUTO-TESTER] Lỗi khi gọi Gemini API:`, err.message);
  process.exit(1);
}

