"""
FB Post Scheduler - GUI lên lịch đăng bài Facebook bằng Playwright.

Cài đặt:  pip install playwright
          playwright install chromium
Chạy:     python fb_gui.py

Lưu ý: ứng dụng phải đang mở (và máy không ngủ) thì bài mới được đăng đúng giờ.
"""
import json
import queue
import random
import threading
import time
import uuid
import tkinter as tk
from datetime import datetime, timedelta
from pathlib import Path
from tkinter import filedialog, messagebox, ttk
from tkinter.scrolledtext import ScrolledText

from playwright.sync_api import sync_playwright

USER_DATA_DIR = "./fb_profile"
DATA_FILE = Path("posts.json")
DT_FORMAT = "%Y-%m-%d %H:%M"
GRACE_MIN = 30  # bài trễ quá số phút này (do tắt app) sẽ bị đánh dấu "Bỏ lỡ"
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}

ST_PENDING = "Chờ đăng"
ST_RUNNING = "Đang đăng"
ST_DONE = "Đã đăng"
ST_ERROR = "Lỗi"
ST_MISSED = "Bỏ lỡ"
ST_DRY = "Đã chạy thử"

DIALOG = 'div[role="dialog"]'
EDITOR_SELECTOR = f'{DIALOG} div[role="textbox"][contenteditable="true"]'
POST_BUTTON_SELECTOR = (
    f'{DIALOG} div[aria-label="Post"][role="button"], '
    f'{DIALOG} div[aria-label="Đăng"][role="button"]'
)
BROWSER_ARGS = [
    "--start-maximized",
    "--disable-blink-features=AutomationControlled",
    "--disable-infobars",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
]
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    " (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
)


# ----------------------------------------------------------------------
# Phần Playwright
# ----------------------------------------------------------------------
def launch(p):
    return p.chromium.launch_persistent_context(
        user_data_dir=USER_DATA_DIR,
        headless=False,
        user_agent=USER_AGENT,
        args=BROWSER_ARGS,
        ignore_default_args=["--enable-automation"],
    )


def type_human(page, text, min_ms, max_ms):
    """Gõ từng ký tự với độ trễ ngẫu nhiên, thỉnh thoảng dừng lại như người."""
    for ch in text:
        if ch == "\n":
            page.keyboard.press("Shift+Enter")
        else:
            page.keyboard.type(ch)
        delay = random.uniform(min_ms, max_ms) / 1000
        if ch in " ,.;:!?\n":
            delay += random.uniform(0.05, 0.25)  # ngắt nghỉ sau dấu câu / từ
        if random.random() < 0.03:
            delay += random.uniform(0.4, 1.2)  # thỉnh thoảng "suy nghĩ"
        time.sleep(delay)


def type_message(page, message, cfg):
    editor = page.locator(EDITOR_SELECTOR).first
    editor.wait_for(state="visible", timeout=10000)
    editor.click()
    time.sleep(random.uniform(0.5, 1.2))
    if cfg["human_typing"]:
        type_human(page, message, cfg["min_ms"], cfg["max_ms"])
    else:
        lines = message.split("\n")
        for i, line in enumerate(lines):
            if line:
                page.keyboard.insert_text(line)
            if i < len(lines) - 1:
                page.keyboard.press("Shift+Enter")
    time.sleep(1)
    return editor


def upload_images(page, image_paths, log):
    absolute = [str(Path(img).resolve()) for img in image_paths]
    file_input = page.locator(f'{DIALOG} input[type="file"]')
    try:
        file_input.first.wait_for(state="attached", timeout=3000)
        file_input.first.set_input_files(absolute)
    except Exception:
        log("Không thấy input file, thử mở file chooser...")
        with page.expect_file_chooser(timeout=10000) as fc_info:
            page.locator(
                f'{DIALOG} [aria-label="Photo/video"], '
                f'{DIALOG} [aria-label="Ảnh/video"]'
            ).first.click()
        fc_info.value.set_files(absolute)
    page.wait_for_selector(f"{DIALOG} img", timeout=30000)
    time.sleep(3)


def publish(post, cfg, log):
    """Đăng một bài. Trả về 'dry' nếu chỉ chạy thử, 'ok' nếu đã đăng."""
    message = post.get("message", "")
    images = post.get("images", [])
    missing = [i for i in images if not Path(i).exists()]
    if missing:
        raise RuntimeError("Không tìm thấy ảnh: " + ", ".join(missing))

    with sync_playwright() as p:
        browser = launch(p)
        try:
            page = browser.pages[0] if browser.pages else browser.new_page()
            log("Đang mở Facebook...")
            page.goto("https://www.facebook.com/")
            time.sleep(3)

            try:
                not_now = page.locator('text="Not Now", text="Không phải bây giờ"')
                if not_now.first.is_visible(timeout=2000):
                    not_now.first.click()
                    time.sleep(1)
            except Exception:
                pass

            log("Đang mở khung tạo bài viết...")
            try:
                page.locator(
                    'span:has-text("What\'s on your mind"), '
                    'span:has-text("Bạn đang nghĩ gì")'
                ).first.click(timeout=10000)
            except Exception:
                raise RuntimeError(
                    "Không tìm thấy khung tạo bài. Có thể chưa đăng nhập: "
                    "hãy bấm 'Đăng nhập Facebook' rồi thử lại."
                )
            page.wait_for_selector(DIALOG, timeout=10000)
            time.sleep(2)

            if images:
                log(f"Đang đính kèm {len(images)} ảnh...")
                upload_images(page, images, log)

            if message.strip():
                log("Đang nhập nội dung...")
                editor = type_message(page, message, cfg)
                if not editor.inner_text().strip():
                    log("Chữ bị mất, nhập lại...")
                    time.sleep(2)
                    editor = type_message(page, message, cfg)
                if not editor.inner_text().strip():
                    raise RuntimeError("Nội dung bị mất, dừng lại không đăng.")

            if cfg["dry_run"]:
                log("Chạy thử: đã điền xong, KHÔNG bấm Đăng (giữ 15 giây để xem).")
                time.sleep(15)
                return "dry"

            time.sleep(random.uniform(1, 2.5))
            log("Đang bấm nút Đăng...")
            try:
                page.click(POST_BUTTON_SELECTOR, timeout=5000)
            except Exception:
                page.eval_on_selector(POST_BUTTON_SELECTOR, "el => el.click()")

            try:
                page.wait_for_selector(DIALOG, state="detached", timeout=60000)
            except Exception:
                raise RuntimeError("Dialog vẫn mở sau 60s, hãy kiểm tra thủ công.")
            time.sleep(3)
            return "ok"
        finally:
            browser.close()


def login_session(log):
    """Mở trình duyệt với profile để đăng nhập tay; đóng cửa sổ khi xong."""
    with sync_playwright() as p:
        browser = launch(p)
        page = browser.pages[0] if browser.pages else browser.new_page()
        page.goto("https://www.facebook.com/")
        log("Hãy đăng nhập Facebook, xong thì ĐÓNG cửa sổ trình duyệt.")
        try:
            browser.wait_for_event("close", timeout=0)
        except Exception:
            pass
    log("Đã lưu phiên đăng nhập.")


# ----------------------------------------------------------------------
# Dữ liệu
# ----------------------------------------------------------------------
def load_posts():
    data = []
    if DATA_FILE.exists():
        try:
            data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
        except Exception:
            data = []
    for p in data:
        if p.get("status") == ST_RUNNING:
            p["status"] = ST_ERROR
            p["note"] = "Bị gián đoạn"
    return data


def parse_dt(s):
    try:
        return datetime.strptime(s, DT_FORMAT)
    except Exception:
        return None


# ----------------------------------------------------------------------
# GUI
# ----------------------------------------------------------------------
class App:
    def __init__(self, root):
        self.root = root
        root.title("FB Post Scheduler")
        root.geometry("1180x760")

        self.posts = load_posts()
        self.data_lock = threading.Lock()
        self.run_lock = threading.Lock()
        self.q = queue.Queue()
        self.selected_id = None
        self.images = []

        self.auto_var = tk.BooleanVar(value=True)
        self.dry_var = tk.BooleanVar(value=False)
        self.human_var = tk.BooleanVar(value=True)
        self.min_var = tk.IntVar(value=40)
        self.max_var = tk.IntVar(value=140)
        self.cfg = {}
        for v in (self.auto_var, self.dry_var, self.human_var, self.min_var, self.max_var):
            v.trace_add("write", lambda *a: self.sync_cfg())
        self.sync_cfg()

        self.build_ui()
        self.refresh_tree()
        self.clear_form()
        self.root.after(200, self.poll_queue)
        threading.Thread(target=self.scheduler_loop, daemon=True).start()
        self.log("Sẵn sàng. Giữ ứng dụng mở để bài được đăng đúng lịch.")

    # ---------- cấu hình dùng chung với thread nền ----------
    def sync_cfg(self):
        try:
            mn, mx = int(self.min_var.get()), int(self.max_var.get())
        except Exception:
            mn, mx = 40, 140
        if mx < mn:
            mx = mn
        self.cfg = {
            "auto": self.auto_var.get(),
            "dry_run": self.dry_var.get(),
            "human_typing": self.human_var.get(),
            "min_ms": mn,
            "max_ms": mx,
        }

    # ---------- dựng giao diện ----------
    def build_ui(self):
        main = ttk.PanedWindow(self.root, orient="horizontal")
        main.pack(fill="both", expand=True, padx=8, pady=8)

        # Trái: danh sách bài
        left = ttk.Frame(main)
        main.add(left, weight=3)
        cols = ("time", "title", "imgs", "status")
        self.tree = ttk.Treeview(left, columns=cols, show="headings", selectmode="browse")
        for c, t, w in (
            ("time", "Thời gian", 130),
            ("title", "Bài đăng", 230),
            ("imgs", "Ảnh", 45),
            ("status", "Trạng thái", 160),
        ):
            self.tree.heading(c, text=t)
            self.tree.column(c, width=w, anchor="w")
        self.tree.pack(fill="both", expand=True)
        self.tree.tag_configure("done", foreground="#1a7f37")
        self.tree.tag_configure("error", foreground="#cf222e")
        self.tree.tag_configure("running", foreground="#0969da")
        self.tree.tag_configure("missed", foreground="#9a6700")
        self.tree.bind("<<TreeviewSelect>>", self.on_select)

        lb = ttk.Frame(left)
        lb.pack(fill="x", pady=6)
        ttk.Button(lb, text="Bài mới", command=self.new_post).pack(side="left")
        ttk.Button(lb, text="Xóa", command=self.delete_post).pack(side="left", padx=6)
        ttk.Button(lb, text="Đăng ngay", command=self.post_now).pack(side="left")

        # Phải: form
        right = ttk.Frame(main, padding=(10, 0, 0, 0))
        main.add(right, weight=4)
        right.columnconfigure(1, weight=1)

        ttk.Label(right, text="Tiêu đề (ghi chú)").grid(row=0, column=0, sticky="w")
        self.title_var = tk.StringVar()
        ttk.Entry(right, textvariable=self.title_var).grid(row=0, column=1, sticky="ew", pady=3)

        ttk.Label(right, text="Nội dung").grid(row=1, column=0, sticky="nw")
        self.msg_text = tk.Text(right, height=10, wrap="word", undo=True)
        self.msg_text.grid(row=1, column=1, sticky="ew", pady=3)

        ttk.Label(right, text="Nhóm ảnh").grid(row=2, column=0, sticky="nw")
        img_frame = ttk.Frame(right)
        img_frame.grid(row=2, column=1, sticky="ew", pady=3)
        img_frame.columnconfigure(0, weight=1)
        self.img_list = tk.Listbox(img_frame, height=8, selectmode="extended")
        self.img_list.grid(row=0, column=0, sticky="ew")
        sb = ttk.Scrollbar(img_frame, command=self.img_list.yview)
        sb.grid(row=0, column=1, sticky="ns")
        self.img_list.config(yscrollcommand=sb.set)
        ib = ttk.Frame(img_frame)
        ib.grid(row=1, column=0, sticky="w", pady=4)
        ttk.Button(ib, text="Thêm ảnh...", command=self.add_images).pack(side="left")
        ttk.Button(ib, text="Thêm cả thư mục...", command=self.add_folder).pack(side="left", padx=4)
        ttk.Button(ib, text="Lên", width=5, command=lambda: self.move_image(-1)).pack(side="left")
        ttk.Button(ib, text="Xuống", width=6, command=lambda: self.move_image(1)).pack(side="left", padx=4)
        ttk.Button(ib, text="Bỏ ảnh chọn", command=self.remove_images).pack(side="left")

        ttk.Label(right, text="Ngày đăng").grid(row=3, column=0, sticky="w")
        tf = ttk.Frame(right)
        tf.grid(row=3, column=1, sticky="w", pady=3)
        self.date_var = tk.StringVar()
        self.time_var = tk.StringVar()
        ttk.Entry(tf, textvariable=self.date_var, width=12).pack(side="left")
        ttk.Label(tf, text="(YYYY-MM-DD)").pack(side="left", padx=(4, 12))
        ttk.Entry(tf, textvariable=self.time_var, width=7).pack(side="left")
        ttk.Label(tf, text="(HH:MM)").pack(side="left", padx=4)

        ttk.Button(right, text="Lưu bài đăng", command=self.save_post).grid(
            row=4, column=1, sticky="w", pady=8
        )

        # Cài đặt
        st = ttk.LabelFrame(right, text="Cài đặt", padding=8)
        st.grid(row=5, column=0, columnspan=2, sticky="ew", pady=4)
        ttk.Checkbutton(st, text="Bật đăng tự động theo lịch", variable=self.auto_var).grid(
            row=0, column=0, sticky="w", columnspan=3
        )
        ttk.Checkbutton(st, text="Chạy thử (không bấm Đăng)", variable=self.dry_var).grid(
            row=1, column=0, sticky="w", columnspan=3
        )
        ttk.Checkbutton(st, text="Gõ chữ giống người", variable=self.human_var).grid(
            row=2, column=0, sticky="w"
        )
        ttk.Label(st, text="Độ trễ mỗi ký tự (ms):").grid(row=3, column=0, sticky="w", pady=(4, 0))
        sf = ttk.Frame(st)
        sf.grid(row=3, column=1, sticky="w", pady=(4, 0))
        ttk.Spinbox(sf, from_=10, to=1000, width=5, textvariable=self.min_var).pack(side="left")
        ttk.Label(sf, text=" đến ").pack(side="left")
        ttk.Spinbox(sf, from_=10, to=2000, width=5, textvariable=self.max_var).pack(side="left")
        ttk.Button(st, text="Đăng nhập Facebook", command=self.do_login).grid(
            row=4, column=0, sticky="w", pady=(8, 0)
        )

        # Log
        self.log_box = ScrolledText(self.root, height=9, state="disabled")
        self.log_box.pack(fill="x", padx=8, pady=(0, 8))

    # ---------- log + queue ----------
    def log(self, msg):
        self.q.put(("log", f"[{datetime.now():%H:%M:%S}] {msg}"))

    def poll_queue(self):
        try:
            while True:
                kind, payload = self.q.get_nowait()
                if kind == "log":
                    self.log_box.config(state="normal")
                    self.log_box.insert("end", payload + "\n")
                    self.log_box.see("end")
                    self.log_box.config(state="disabled")
                elif kind == "refresh":
                    self.refresh_tree()
        except queue.Empty:
            pass
        self.root.after(200, self.poll_queue)

    # ---------- dữ liệu ----------
    def save(self):
        DATA_FILE.write_text(
            json.dumps(self.posts, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    def find(self, pid):
        return next((p for p in self.posts if p["id"] == pid), None)

    def refresh_tree(self):
        sel = self.selected_id
        self.tree.delete(*self.tree.get_children())
        with self.data_lock:
            rows = sorted(self.posts, key=lambda x: x.get("scheduled", ""))
            for p in rows:
                title = p.get("title") or p.get("message", "").replace("\n", " ")[:40] or "(chỉ có ảnh)"
                status = p["status"] + (f" - {p['note']}" if p.get("note") else "")
                tag = {
                    ST_DONE: "done",
                    ST_ERROR: "error",
                    ST_RUNNING: "running",
                    ST_MISSED: "missed",
                }.get(p["status"], "")
                self.tree.insert(
                    "", "end", iid=p["id"],
                    values=(p.get("scheduled", ""), title, len(p.get("images", [])), status),
                    tags=(tag,),
                )
        if sel and self.tree.exists(sel):
            self.tree.selection_set(sel)

    # ---------- form ----------
    def clear_form(self):
        self.selected_id = None
        self.title_var.set("")
        self.msg_text.delete("1.0", "end")
        self.images = []
        self.refresh_images()
        t = (datetime.now() + timedelta(hours=1)).replace(minute=0)
        self.date_var.set(t.strftime("%Y-%m-%d"))
        self.time_var.set(t.strftime("%H:%M"))

    def new_post(self):
        self.tree.selection_remove(self.tree.selection())
        self.clear_form()

    def on_select(self, _):
        sel = self.tree.selection()
        if not sel:
            return
        p = self.find(sel[0])
        if not p:
            return
        self.selected_id = p["id"]
        self.title_var.set(p.get("title", ""))
        self.msg_text.delete("1.0", "end")
        self.msg_text.insert("1.0", p.get("message", ""))
        self.images = list(p.get("images", []))
        self.refresh_images()
        dt = parse_dt(p.get("scheduled", ""))
        if dt:
            self.date_var.set(dt.strftime("%Y-%m-%d"))
            self.time_var.set(dt.strftime("%H:%M"))

    def refresh_images(self):
        self.img_list.delete(0, "end")
        for img in self.images:
            self.img_list.insert("end", img)

    def add_images(self):
        files = filedialog.askopenfilenames(
            title="Chọn ảnh",
            filetypes=[("Ảnh", "*.jpg *.jpeg *.png *.webp *.gif *.bmp"), ("Tất cả", "*.*")],
        )
        for f in files:
            if f not in self.images:
                self.images.append(f)
        self.refresh_images()

    def add_folder(self):
        folder = filedialog.askdirectory(title="Chọn thư mục ảnh")
        if not folder:
            return
        files = sorted(
            str(f) for f in Path(folder).iterdir() if f.suffix.lower() in IMAGE_EXT
        )
        for f in files:
            if f not in self.images:
                self.images.append(f)
        self.refresh_images()
        self.log(f"Đã thêm {len(files)} ảnh từ thư mục.")

    def remove_images(self):
        for i in reversed(self.img_list.curselection()):
            del self.images[i]
        self.refresh_images()

    def move_image(self, step):
        sel = self.img_list.curselection()
        if len(sel) != 1:
            return
        i, j = sel[0], sel[0] + step
        if 0 <= j < len(self.images):
            self.images[i], self.images[j] = self.images[j], self.images[i]
            self.refresh_images()
            self.img_list.selection_set(j)

    def save_post(self):
        message = self.msg_text.get("1.0", "end").strip()
        if not message and not self.images:
            messagebox.showwarning("Thiếu nội dung", "Cần có nội dung hoặc ít nhất một ảnh.")
            return
        dt = parse_dt(f"{self.date_var.get().strip()} {self.time_var.get().strip()}")
        if not dt:
            messagebox.showwarning("Sai định dạng", "Ngày: YYYY-MM-DD, giờ: HH:MM (24h).")
            return
        with self.data_lock:
            post = self.find(self.selected_id) if self.selected_id else None
            if post and post["status"] == ST_RUNNING:
                messagebox.showinfo("Đang đăng", "Bài này đang được đăng, chưa thể sửa.")
                return
            if not post:
                post = {"id": uuid.uuid4().hex[:8]}
                self.posts.append(post)
            post.update(
                title=self.title_var.get().strip(),
                message=message,
                images=list(self.images),
                scheduled=dt.strftime(DT_FORMAT),
                status=ST_PENDING,
                note="",
            )
            self.selected_id = post["id"]
            self.save()
        self.refresh_tree()
        self.log(f"Đã lưu bài, lịch đăng {post['scheduled']}.")

    def delete_post(self):
        if not self.selected_id:
            return
        if not messagebox.askyesno("Xóa", "Xóa bài đăng đã chọn?"):
            return
        with self.data_lock:
            self.posts = [p for p in self.posts if p["id"] != self.selected_id]
            self.save()
        self.new_post()
        self.refresh_tree()

    # ---------- đăng bài ----------
    def post_now(self):
        if not self.selected_id:
            messagebox.showinfo("Chọn bài", "Hãy chọn một bài trong danh sách (hoặc lưu bài trước).")
            return
        pid = self.selected_id
        threading.Thread(target=self.run_post, args=(pid,), daemon=True).start()

    def do_login(self):
        if not self.run_lock.acquire(blocking=False):
            messagebox.showinfo("Bận", "Đang có tác vụ khác chạy.")
            return

        def work():
            try:
                login_session(self.log)
            except Exception as e:
                self.log(f"Lỗi đăng nhập: {e}")
            finally:
                self.run_lock.release()

        threading.Thread(target=work, daemon=True).start()

    def run_post(self, pid):
        if not self.run_lock.acquire(blocking=False):
            self.log("Đang có tác vụ khác chạy, thử lại sau.")
            return
        try:
            with self.data_lock:
                post = self.find(pid)
                if not post:
                    return
                post["status"] = ST_RUNNING
                post["note"] = ""
                snapshot = dict(post)
                self.save()
            self.q.put(("refresh", None))
            self.log(f"Bắt đầu đăng bài {pid}...")
            cfg = dict(self.cfg)
            try:
                result = publish(snapshot, cfg, self.log)
                if result == "dry":
                    status, note = ST_DRY, ""
                else:
                    status, note = ST_DONE, datetime.now().strftime("%H:%M %d/%m")
                self.log("Xong." if result == "ok" else "Chạy thử xong.")
            except Exception as e:
                status, note = ST_ERROR, str(e)[:150]
                self.log(f"LỖI: {e}")
            with self.data_lock:
                post = self.find(pid)
                if post:
                    post["status"], post["note"] = status, note
                    self.save()
        finally:
            self.run_lock.release()
            self.q.put(("refresh", None))

    def scheduler_loop(self):
        while True:
            time.sleep(10)
            if not self.cfg.get("auto"):
                continue
            now = datetime.now()
            due, changed = None, False
            with self.data_lock:
                for p in sorted(self.posts, key=lambda x: x.get("scheduled", "")):
                    if p["status"] != ST_PENDING:
                        continue
                    t = parse_dt(p.get("scheduled", ""))
                    if not t or t > now:
                        continue
                    if now - t > timedelta(minutes=GRACE_MIN):
                        p["status"], p["note"] = ST_MISSED, "Trễ giờ, bấm 'Đăng ngay' nếu vẫn muốn đăng"
                        changed = True
                    else:
                        due = p["id"]
                        break
                if changed:
                    self.save()
            if changed:
                self.q.put(("refresh", None))
            if due:
                self.run_post(due)


def main():
    root = tk.Tk()
    App(root)
    root.mainloop()


if __name__ == "__main__":
    main()