#!/usr/bin/env node
/**
 * Script: .aise/scripts/run-task.mjs
 * Chức năng: VÒNG LẶP TỰ HÀNH KHÉP KÍN 100% (AUTONOMOUS TASK RUNNER)
 * 
 * Luồng hoạt động:
 * 1. Đọc task brief (TASK-XXX.md).
 * 2. Vòng lặp tối đa 3 lần (Hill-climbing loop):
 *    - B1: Chạy verify & gọi Auto-Tester (Gemini Tester).
 *    - B2: Nếu PASS -> Thoát vòng lặp, thông báo thành công!
 *    - B3: Nếu FAIL -> Tự động gọi Gemini Dev Worker để phân tích lỗi trong feedback.json
 *          và tự sửa file code.
 *    - B4: Lặp lại kiểm định.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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
const cmd = args.cmd || 'node .aise/tasks/sandbox/hello.js';
const maxRetries = 3;

const envPath = path.join(aiseDir, '.env');
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
  console.error(`❌ [RUNNER] Chưa cấu hình GEMINI_API_KEY trong .aise/.env`);
  process.exit(1);
}

const feedbackPath = path.join(aiseDir, 'feedback.json');
const captureScript = path.join(aiseDir, 'scripts', 'capture-evidence.mjs');

console.log(`\n============================================================`);
console.log(`🤖 [AISE AUTONOMOUS RUNNER] Bắt đầu tự vận hành cho ${taskId}`);
console.log(`============================================================\n`);

let attempt = 0;
let isPassed = false;

while (attempt < maxRetries && !isPassed) {
  attempt++;
  console.log(`\n────────────────────────────────────────────────────────────`);
  console.log(`📍 [VÒNG LẶP ${attempt}/${maxRetries}] 1. KIỂM THỬ & CHẤM ĐIỂM ĐỘC LẬP...`);
  console.log(`────────────────────────────────────────────────────────────`);

  // B1: Chạy capture & tester
  const testRes = spawnSync('node', [captureScript, `--task=${taskId}`, `--cmd=${cmd}`], {
    stdio: 'inherit',
  });

  // B2: Đọc feedback.json xem kết quả
  let feedback = {};
  try {
    feedback = JSON.parse(fs.readFileSync(feedbackPath, 'utf-8'));
  } catch (err) {
    console.error(`❌ Không đọc được .aise/feedback.json:`, err.message);
    break;
  }

  if (feedback.verdict === 'PASS') {
    isPassed = true;
    console.log(`\n🎯 [THÀNH CÔNG] Task ${taskId} đã PASS sau ${attempt} lượt chạy! Không cần sửa đổi thêm.`);
    break;
  }

  if (attempt >= maxRetries) {
    console.log(`\n🚨 [QUÁ GIỚI HẠN] Đã thử ${maxRetries} lần nhưng vẫn FAIL. Dừng lại báo cáo Chủ dự án!`);
    break;
  }

  // B3: Triệu hồi Worker Agent (Gemini Dev) để TỰ SỬA CODE
  console.log(`\n────────────────────────────────────────────────────────────`);
  console.log(`🔧 [VÒNG LẶP ${attempt}/${maxRetries}] 2. TRIỆU HỒI WORKER AI ĐỂ TỰ SỬA LỖI...`);
  console.log(`────────────────────────────────────────────────────────────`);

  // Tìm file code cần sửa từ danh sách issues (bỏ qua 'N/A')
  let fileToFix = null;
  if (Array.isArray(feedback.issues)) {
    for (const issue of feedback.issues) {
      if (issue.file && issue.file !== 'N/A' && issue.file !== 'none') {
        fileToFix = issue.file;
        break;
      }
    }
  }

  // Fallback về file chính của task nếu tester để 'N/A'
  if (!fileToFix) {
    fileToFix = '.aise/tasks/sandbox/hello.js';
  }

  const fullFilePath = path.resolve(rootDir, fileToFix);

  if (!fs.existsSync(fullFilePath)) {
    console.error(`❌ Không tìm thấy file cần sửa: ${fullFilePath}`);
    break;
  }

  const currentCode = fs.readFileSync(fullFilePath, 'utf-8');
  const workerRules = fs.existsSync(path.join(aiseDir, 'WORKER.md')) 
    ? fs.readFileSync(path.join(aiseDir, 'WORKER.md'), 'utf-8') 
    : '';

  const devPrompt = `
Bạn là Dev Worker trong hệ thống AISE.
Nhiệm vụ của bạn: TỰ ĐỘNG SỬA FILE CODE dựa trên phản hồi từ QA Tester.

QUY TẮC:
${workerRules}

BÁO CÁO LỖI TỪ TESTER (.aise/feedback.json):
${JSON.stringify(feedback, null, 2)}

FILE CẦN SỬA: ${fileToFix}
NỘI DUNG HIỆN TẠI CỦA FILE:
\`\`\`
${currentCode}
\`\`\`

YÊU CẦU:
Chỉ trả về DUY NHẤT nội dung code mới hoàn chỉnh của file trên để ghi đè vào file.
KHÔNG viết lời chào, KHÔNG giải thích, KHÔNG đặt trong markdown block (không viết \`\`\`javascript hay \`\`\`), chỉ trả về plain text code nguyên bản.
`;

  console.log(`🤖 Worker Dev đang phân tích lỗi và viết lại code cho ${fileToFix}...`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  let newCode = null;

  for (let apiTry = 1; apiTry <= 3; apiTry++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: devPrompt }] }],
          generationConfig: { temperature: 0.1 },
        }),
      });

      if (!res.ok) {
        console.warn(`⚠️ Worker API call lần ${apiTry} lỗi (${res.status} ${res.statusText}), đang thử lại sau 2 giây...`);
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }

      const data = await res.json();
      newCode = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (newCode) break;
    } catch (e) {
      console.warn(`⚠️ Worker kết nối lỗi lần ${apiTry}: ${e.message}, đang thử lại...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  if (!newCode) {
    console.error(`❌ Worker không thể tạo code mới sau 3 lần thử!`);
    break;
  }

  // Làm sạch markdown fences nếu model vô tình trả về
  newCode = newCode.replace(/^```[a-zA-Z]*\r?\n/, '').replace(/\r?\n```$/, '').trim();

  fs.writeFileSync(fullFilePath, newCode + '\n', 'utf-8');
  console.log(`✅ [WORKER ĐÃ TỰ SỬA XONG] Đã cập nhật file ${fileToFix}!`);
  console.log(`🔄 Tự động chuyển sang vòng lặp tiếp theo để test lại...`);
}

console.log(`\n============================================================`);
if (isPassed) {
  console.log(`🏆 [PIPELINE HOÀN TẤT 100%] Toàn bộ quy trình đã xanh mà không cần bạn can thiệp!`);
} else {
  console.log(`⚠️ [CẦN BẠN KIỂM TRA] Vui lòng xem file .aise/feedback.json.`);
}
console.log(`============================================================\n`);
