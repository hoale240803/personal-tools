#!/usr/bin/env node
/**
 * Script: .aise/scripts/capture-evidence.mjs
 * Chức năng (Giai đoạn 1 - Bán tự động):
 * 1. Chạy lệnh verify/test của Task và thu thập toàn bộ stdout/stderr vào .aise/storage/evidence/execution.log
 * 2. (Tùy chọn) Chụp ảnh màn hình UI nếu truyền vào --url=<http://localhost:...>
 * 3. Tự động ghép Brief + Log + Tester Prompt thành file .aise/storage/evidence/PASTE_TO_WEB_AI.md
 * 4. Tự động copy nội dung PASTE_TO_WEB_AI.md vào Clipboard (Windows) để bạn chỉ cần Ctrl+V lên Web AI.
 *
 * Cách dùng:
 *   node .aise/scripts/capture-evidence.mjs --task=TASK-001 --cmd="node .aise/tasks/sandbox/hello.js"
 *   node .aise/scripts/capture-evidence.mjs --task=TASK-001 --cmd="npm test" --url="http://localhost:3000"
 */

import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const aiseDir = path.resolve(__dirname, '..');
const rootDir = path.resolve(aiseDir, '..');
process.chdir(rootDir);

// Parse CLI arguments
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.replace(/^--/, '').split('=');
    return [key, rest.join('=') || true];
  })
);

const taskId = args.task || 'TASK-001';
const verifyCmd = args.cmd || 'echo "No verify command specified"';
const targetUrl = args.url || null;

const evidenceDir = path.join(aiseDir, 'storage', 'evidence');
const taskBriefPath = path.join(aiseDir, 'tasks', `${taskId}.md`);
const testerPromptTemplatePath = path.join(aiseDir, 'TESTER-PROMPT.md');

// Đảm bảo thư mục .aise/storage/evidence tồn tại
fs.mkdirSync(evidenceDir, { recursive: true });

console.log(`====================================================`);
console.log(`🚀 [AISE EVIDENCE CAPTURE] Đang thu thập bằng chứng cho ${taskId}`);
console.log(`====================================================`);

// Bước 1: Chạy lệnh test/verify và ghi log
console.log(`\n▶ Bước 1: Chạy lệnh kiểm thử: ${verifyCmd}`);
const timestamp = new Date().toISOString();
let executionLog = `Task: ${taskId}\nTimestamp: ${timestamp}\nCommand: ${verifyCmd}\n----------------------------------------\n`;

try {
  const output = execSync(verifyCmd, {
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  executionLog += `EXIT CODE: 0 (SUCCESS)\n\nSTDOUT:\n${output}`;
  console.log(`✅ Lệnh chạy thành công (Exit code 0).`);
} catch (err) {
  const stdout = err.stdout ? err.stdout.toString() : '';
  const stderr = err.stderr ? err.stderr.toString() : err.message;
  executionLog += `EXIT CODE: ${err.status || 1} (FAILED)\n\nSTDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
  console.log(`⚠️ Lệnh trả về lỗi (Exit code ${err.status || 1}) — Đã ghi nhận vào log.`);
}

const logFilePath = path.join(evidenceDir, 'execution.log');
fs.writeFileSync(logFilePath, executionLog, 'utf-8');
console.log(`📄 Đã lưu log tại: .aise/storage/evidence/execution.log`);

// Bước 2: Chụp ảnh màn hình nếu có --url (sử dụng npx playwright screenshot nếu có)
if (targetUrl) {
  const screenshotPath = path.join(evidenceDir, `${taskId}-ui.png`);
  console.log(`\n▶ Bước 2: Chụp ảnh màn hình UI từ ${targetUrl}...`);
  try {
    execSync(`npx playwright screenshot "${targetUrl}" "${screenshotPath}"`, {
      stdio: 'inherit',
    });
    console.log(`📸 Đã lưu ảnh chụp màn hình tại: .aise/storage/evidence/${taskId}-ui.png`);
  } catch {
    console.log(`⚠️ Không thể chụp ảnh tự động qua Playwright (có thể chưa cài playwright hoặc server chưa bật).`);
  }
} else {
  console.log(`\n▶ Bước 2: Bỏ qua chụp ảnh UI (không có tham số --url).`);
}

// Bước 3: Tạo gói PASTE_TO_WEB_AI.md
console.log(`\n▶ Bước 3: Đóng gói Prompt cho Web AI (Tester)...`);
const briefContent = fs.existsSync(taskBriefPath)
  ? fs.readFileSync(taskBriefPath, 'utf-8')
  : `(Không tìm thấy file ${taskBriefPath})`;

const templateContent = fs.existsSync(testerPromptTemplatePath)
  ? fs.readFileSync(testerPromptTemplatePath, 'utf-8')
  : `Hãy kiểm tra task ${taskId}:\n{{TASK_BRIEF}}\n\nLog:\n{{EXECUTION_LOG}}`;

const finalPrompt = templateContent
  .replace('{{TASK_BRIEF}}', briefContent)
  .replace('{{EXECUTION_LOG}}', executionLog);

const pasteFilePath = path.join(evidenceDir, 'PASTE_TO_WEB_AI.md');
fs.writeFileSync(pasteFilePath, finalPrompt, 'utf-8');
console.log(`📦 Đã tạo file sẵn sàng gửi cho Web AI: .aise/storage/evidence/PASTE_TO_WEB_AI.md`);

// Bước 4: Tự động copy vào Clipboard trên Windows
try {
  spawnSync('clip', { input: finalPrompt, encoding: 'utf-8' });
  console.log(`📋 ĐÃ COPY SẴN VÀO CLIPBOARD! (Phục vụ Giai đoạn 1 dự phòng)`);
} catch {
  console.log(`ℹ️ Bạn có thể mở file .aise/storage/evidence/PASTE_TO_WEB_AI.md để copy thủ công.`);
}

// Bước 5 (Giai đoạn 2): Tự động gọi Gemini API Tester nếu đã cấu hình GEMINI_API_KEY trong .aise/.env
const envPath = path.join(aiseDir, '.env');
let hasApiKey = Boolean(process.env.GEMINI_API_KEY);
if (!hasApiKey && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^GEMINI_API_KEY=(.+)$/m);
  if (match && match[1].trim() && match[1].trim() !== 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
    hasApiKey = true;
  }
}

if (hasApiKey && !args['no-auto-test']) {
  console.log(`\n▶ Bước 5 (Giai đoạn 2): Phát hiện GEMINI_API_KEY — Đang kích hoạt Auto-Tester...`);
  const autoTesterPath = path.join(aiseDir, 'scripts', 'auto-tester.mjs');
  const testerRes = spawnSync('node', [autoTesterPath, `--task=${taskId}`], {
    stdio: 'inherit',
  });
  console.log(`====================================================\n`);
  process.exitCode = testerRes.status ?? 0;
} else {
  console.log(`\nℹ️ [Giai đoạn 2 chưa kích hoạt]: Để tự động gọi Gemini API test luôn mà không cần copy-paste,`);
  console.log(`   hãy dán API Key của bạn vào file .aise/.env (dòng GEMINI_API_KEY=...).`);
  console.log(`====================================================\n`);
}

