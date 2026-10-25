import json
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

USER_DATA_DIR = "./fb_profile"

# Đặt True để chạy thử: điền chữ + ảnh nhưng KHÔNG bấm nút Đăng
DRY_RUN = False

DIALOG = 'div[role="dialog"]'
EDITOR_SELECTOR = f'{DIALOG} div[role="textbox"][contenteditable="true"]'
POST_BUTTON_SELECTOR = (
    f'{DIALOG} div[aria-label="Post"][role="button"], '
    f'{DIALOG} div[aria-label="Đăng"][role="button"]'
)


def load_content():
  """Đọc nội dung từ file content.json."""
  with open("content.json", "r", encoding="utf-8") as f:
    return json.load(f)


def type_message(page, message):
  """Nhập văn bản bằng bàn phím thật để trình soạn thảo Lexical nhận được."""
  editor = page.locator(EDITOR_SELECTOR).first
  editor.wait_for(state="visible", timeout=10000)
  editor.click()

  lines = message.split("\n")
  for i, line in enumerate(lines):
    if line:
      page.keyboard.insert_text(line)
    if i < len(lines) - 1:
      page.keyboard.press("Shift+Enter")  # xuống dòng, không đăng
  time.sleep(1)
  return editor


def upload_images(page, image_paths):
  """Đính kèm ảnh vào bài viết."""
  absolute_image_paths = [str(Path(img).resolve()) for img in image_paths]

  file_input = page.locator(f'{DIALOG} input[type="file"]')
  try:
    file_input.first.wait_for(state="attached", timeout=3000)
    file_input.first.set_input_files(absolute_image_paths)
  except Exception:
    # Dự phòng: bấm icon Ảnh/Video để mở file chooser
    print("ℹ️ Không thấy input file, thử mở file chooser...")
    with page.expect_file_chooser(timeout=10000) as fc_info:
      page.locator(
          f'{DIALOG} [aria-label="Photo/video"], '
          f'{DIALOG} [aria-label="Ảnh/video"]'
      ).first.click()
    fc_info.value.set_files(absolute_image_paths)

  # Chờ ảnh preview hiện ra, rồi cho modal re-render xong hẳn
  page.wait_for_selector(f'{DIALOG} img', timeout=20000)
  time.sleep(3)


def main():
  data = load_content()
  message = data.get("message", "")
  image_paths = data.get("images", [])

  with sync_playwright() as p:
    browser = p.chromium.launch_persistent_context(
        user_data_dir=USER_DATA_DIR,
        headless=False,
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            " (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        ),
        args=[
            "--start-maximized",
            "--disable-blink-features=AutomationControlled",
            "--disable-infobars",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
        ],
        ignore_default_args=["--enable-automation"],
    )

    try:
      page = browser.pages[0]
      print("🌐 Đang mở Facebook...")
      page.goto("https://www.facebook.com/")
      time.sleep(3)

      # Xử lý popup lưu mật khẩu nếu xuất hiện
      try:
        not_now_btn = page.locator('text="Not Now", text="Không phải bây giờ"')
        if not_now_btn.first.is_visible(timeout=2000):
          not_now_btn.first.click()
          time.sleep(1)
      except Exception:
        pass

      print("✍️ Đang mở khung tạo bài viết...")
      try:
        page.click('span:has-text("What\'s on your mind")', timeout=5000)
      except Exception:
        page.click('div[role="button"]:has-text("What\'s on your mind")')

      page.wait_for_selector(DIALOG, timeout=10000)
      time.sleep(2)

      # 1. UPLOAD ẢNH
      if image_paths:
        print("🖼️ Đang đính kèm hình ảnh...")
        upload_images(page, image_paths)

      # 2. NHẬP VĂN BẢN BẰNG BÀN PHÍM THẬT
      print("⌨️ Đang nhập nội dung...")
      editor = type_message(page, message)

      # Nếu chữ bị mất do modal re-render thì nhập lại một lần
      if message.strip() and not editor.inner_text().strip():
        print("⚠️ Chữ bị mất, nhập lại...")
        time.sleep(2)
        editor = type_message(page, message)

      if message.strip() and not editor.inner_text().strip():
        raise RuntimeError("Nội dung bị mất, dừng lại không đăng!")

      # 3. ĐĂNG BÀI
      if DRY_RUN:
        print("🧪 DRY_RUN: đã điền xong, không bấm Đăng. Kiểm tra trên màn hình.")
        time.sleep(15)
        return

      print("🚀 Đang bấm nút Đăng (Post)...")
      try:
        page.click(POST_BUTTON_SELECTOR, timeout=5000)
      except Exception:
        print("⚠️ Dùng JavaScript click để ép đăng bài...")
        page.eval_on_selector(POST_BUTTON_SELECTOR, "el => el.click()")

      # Dialog đóng = bài đã được gửi đi
      try:
        page.wait_for_selector(DIALOG, state="detached", timeout=60000)
        print("🎉 Hoàn tất! Bài viết đã được đăng.")
      except Exception:
        print("⚠️ Dialog vẫn còn mở, hãy kiểm tra thủ công xem bài đã đăng chưa.")

      time.sleep(3)
    finally:
      browser.close()


if __name__ == "__main__":
  main()