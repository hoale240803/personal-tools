(function () {
  /**
   * Tìm kiếm giá trị bên phải dựa vào từ khóa (Label) ở bên trái.
   * Chấp nhận nhiều từ khóa để tăng độ chính xác (ví dụ: "Số tiền", "Bạn thanh toán").
   */
  function getValueByLabel(searches, strictMatch = false) {
    const allElements = document.querySelectorAll("*");
    
    for (const search of searches) {
      const lowerSearch = search.toLowerCase().trim();
      
      for (const el of allElements) {
        // Chỉ xử lý các phần tử có chứa text trực tiếp (Text Node) để tránh lấy trùng ở các block cha lớn
        if (el.children.length > 0 && Array.from(el.childNodes).every(node => node.nodeType !== Node.TEXT_NODE)) {
          continue;
        }
        
        const text = (el.innerText || "").trim().toLowerCase();
        if (!text) continue;

        // Kiểm tra khớp từ khóa (Khớp tuyệt đối hoặc khớp một phần tùy cấu hình)
        const isMatched = strictMatch ? (text === lowerSearch) : text.includes(lowerSearch);
        
        if (isMatched) {
          // Leo ngược lên tối đa 5 tầng để tìm row chứa cả Label và Value (thường là các class chứa 'flex' hoặc 'justify-between')
          let row = el.parentElement;
          for (let i = 0; i < 5; i++) {
            if (!row) break;
            
            // Nếu tìm thấy một cấu trúc hàng có từ 2 phần tử con trở lên
            if (row.children.length >= 2) {
              // Phần tử chứa giá trị thực tế thường nằm ở phía cuối của hàng (bên phải)
              const valueSide = row.children[row.children.length - 1];
              if (valueSide && valueSide !== el) {
                const valText = (valueSide.innerText || "").trim();
                
                // Đảm bảo giá trị lấy ra không bị trùng ngược lại với chính từ khóa tìm kiếm
                if (valText && valText.toLowerCase() !== text) {
                  console.log(`[QR Match] "${search}" → Found Value: "${valText}"`);
                  return valText;
                }
              }
            }
            row = row.parentElement;
          }
        }
      }
    }
    return "";
  }

// ===== 1. TRÍCH XUẤT SỐ TIỀN (ĐÃ CẬP NHẬT KEYWORD CHÍNH XÁC) =====
  // Ưu tiên từ khóa chính xác trên giao diện mới: "Mua Tổng số lượng"
  const rawAmount = getValueByLabel(["mua tổng số lượng", "bạn thanh toán", "số tiền", "amount"]) || "";
  let amount = "";
  if (rawAmount) {
    // Xử lý chuỗi: xóa sạch ký tự ₫, $, VND, khoảng trắng, dấu chấm/phẩy phân tách hàng nghìn/thập phân
    let cleanAmount = rawAmount.replace(/[₫$\s]/g, "").replace(/VND/gi, "");
    if (/\.\d{1,2}$/.test(cleanAmount)) {
      cleanAmount = cleanAmount.replace(/,/g, "").replace(/\.\d+$/, "");
    } else if (/,\d{1,2}$/.test(cleanAmount)) {
      cleanAmount = cleanAmount.replace(/\./g, "").replace(/,\d+$/, "");
    } else {
      cleanAmount = cleanAmount.replace(/[,\.]/g, "");
    }
    amount = cleanAmount.replace(/\D/g, ""); // Giữ lại duy nhất các chữ số
  }

  // ===== 2. TRÍCH XUẤT SỐ TÀI KHOẢN =====
  const rawAccountNo = getValueByLabel(["số tài khoản", "số tài khoản/số thẻ", "account number", "accountno"]) || "";
  const accountNo = rawAccountNo.replace(/\s/g, ""); // Loại bỏ khoảng trắng nếu có

  // ===== 3. TRÍCH XUẤT HỌ VÀ TÊN =====
  const accountName = getValueByLabel(["họ và tên", "tên người nhận", "account name"]) || "";

  // ===== 4. TRÍCH XUẤT TÊN NGÂN HÀNG =====
  const rawBank = getValueByLabel(["tên ngân hàng", "ngân hàng", "bank name"]) || "";
  const bankDisplayName = rawBank.replace(/Ngân hàng\s+/gi, "").trim();

  // ===== 5. TRÍCH XUẤT NỘI DUNG CHUYỂN KHOẢN =====
  // Đặt strictMatch = true cho "nội dung chuyển khoản" để tránh ăn nhầm vào dòng "nội dung chuyển khoản đề xuất"
  let addInfo = getValueByLabel(["nội dung chuyển khoản"], true);
  if (!addInfo) {
    // Nếu tìm tuyệt đối không ra, quét tập từ khóa mở rộng
    addInfo = getValueByLabel(["nội dung chuyển khoản", "nội dung", "transfer content", "remarks"]) || "";
  }

  // Bảng mapping VietQR API (Giữ nguyên từ code gốc của bạn)
  const BANK_MAP = {
    "vietinbank": "ICB", "icb": "ICB", "công thương": "ICB",
    "vietcombank": "VCB", "vcb": "VCB", "ngoại thương": "VCB",
    "bidv": "BIDV", "đầu tư và phát triển": "BIDV",
    "agribank": "VBA", "vba": "VBA", "nông nghiệp": "VBA",
    "ocb": "OCB", "phương đông": "OCB",
    "mb bank": "MB", "mbbank": "MB", "mb": "MB", "quân đội": "MB",
    "techcombank": "TCB", "tcb": "TCB", "kỹ thương": "TCB",
    "acb": "ACB", "á châu": "ACB",
    "vpbank": "VPB", "vpb": "VPB", "việt nam thịnh vượng": "VPB",
    "tpbank": "TPB", "tpb": "TPB", "tiên phong": "TPB",
    "sacombank": "STB", "stb": "STB", "sài gòn thương tín": "STB",
    "hdbank": "HDB", "hdb": "HDB", "phát triển tp hcm": "HDB",
    "vietcapitalbank": "VCCB", "vccb": "VCCB", "bản việt": "VCCB",
    "scb": "SCB", "sài gòn": "SCB",
    "vib": "VIB", "quốc tế việt nam": "VIB",
    "shb": "SHB", "sài gòn - hà nội": "SHB", "sài gòn hà nội": "SHB",
    "eximbank": "EIB", "eib": "EIB", "xuất nhập khẩu": "EIB",
    "msb": "MSB", "hàng hải": "MSB",
    "cake": "CAKE", "ubank": "Ubank", "timo": "TIMO",
    "viettelmoney": "VTLMONEY", "viettel money": "VTLMONEY",
    "vnptmoney": "VNPTMONEY", "vnpt money": "VNPTMONEY",
    "saigonbank": "SGICB", "sài gòn công thương": "SGICB",
    "bac a bank": "BAB", "bacabank": "BAB", "bab": "BAB", "bắc á": "BAB",
    "momo": "momo", "pvcombank pay": "PVDB", "pvdb": "PVDB",
    "pvcombank": "PVCB", "pvcb": "PVCB", "đại chúng": "PVCB",
    "mbv": "MBV", "việt nam hiện đại": "MBV", "ncb": "NCB", "quốc dân": "NCB",
    "shinhanbank": "SHBVN", "shinhan": "SHBVN", "shbvn": "SHBVN",
    "abbank": "ABB", "abb": "ABB", "an bình": "ABB",
    "vietabank": "VAB", "vab": "VAB", "việt á": "VAB",
    "namabank": "NAB", "nam a bank": "NAB", "nab": "NAB", "nam á": "NAB",
    "pgbank": "PGB", "pgb": "PGB", "vietbank": "VIETBANK", "việt nam thương tín": "VIETBANK",
    "baovietbank": "BVB", "bvb": "BVB", "bảo việt": "BVB",
    "seabank": "SEAB", "seab": "SEAB", "đông nam á": "SEAB",
    "coopbank": "COOPBANK", "hợp tác xã": "COOPBANK",
    "lpbank": "LPB", "lpb": "LPB", "lienvietpostbank": "LPB", "lộc phát": "LPB", "bưu điện liên việt": "LPB",
    "kienlongbank": "KLB", "klb": "KLB", "kiên long": "KLB",
    "kbank": "KBank", "kasikornbank": "KBank",
    "hongleong": "HLBVN", "hlbvn": "HLBVN", "hong leong": "HLBVN",
    "woori": "WVN", "wvn": "WVN", "hsbc": "HSBC", "cimb": "CIMB",
    "standardchartered": "SCVN", "scvn": "SCVN", "standard chartered": "SCVN",
    "publicbank": "PBVN", "pbvn": "PBVN", "public": "PBVN"
  };

  function toBankCode(displayName) {
    const key = displayName.toLowerCase().trim();
    if (BANK_MAP[key]) return BANK_MAP[key];
    for (const [k, v] of Object.entries(BANK_MAP)) {
      if (key.includes(k) || k.includes(key)) return v;
    }
    return displayName.replace(/\s+/g, "");
  }

  const bankName = toBankCode(bankDisplayName);

  // ===== DEBUG CONSOLE LOG =====
  console.log("[QR Extension] Dữ liệu trích xuất thành công:", {
    accountName,
    accountNo,
    bankName,
    addInfo,
    amount,
  });

  // ===== KIỂM TRA ĐIỀU KIỆN BẮT BUỘC =====
  if (!accountNo || !amount) {
    const missing = [];
    if (!accountNo) missing.push("Số tài khoản");
    if (!amount) missing.push("Số tiền");
    alert(`❌ Không trích xuất được: ${missing.join(", ")}.\nVui lòng kiểm tra lại trạng thái trang web.`);
    return;
  }

  // ===== TẠO URL VIETQR & HIỂN THỊ OVERLAY =====
  const qrUrl = `https://img.vietqr.io/image/${bankName}-${accountNo}-print.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;

  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999999",
    cursor: "pointer",
  });

  overlay.innerHTML = `
    <div style="background:#fff; padding:20px; border-radius:16px; text-align:center; width:340px; box-shadow: 0 20px 60px rgba(0,0,0,0.5); font-family: sans-serif; cursor: default;">
      <p style="margin: 0 0 12px 0; font-weight: bold; font-size: 15px; color: #d32f2f; letter-spacing: 0.5px;">
        📱 QUÉT MÃ ĐỂ THANH TOÁN
      </p>
      <img src="${qrUrl}" style="width:100%; border:1px solid #eee; border-radius:12px;"
           onerror="this.style.display='none'; this.nextElementSibling.style.display='block'">
      <p style="display:none; color:red; font-size:12px; padding:8px;">
        ❌ Không tải được QR.<br>Mã ngân hàng: <b>${bankName}</b><br>
      </p>
      <div style="margin-top:12px; font-size:13px; text-align:left; background:#f5f5f5; padding:12px; border-radius:10px; line-height:1.9;">
        <p style="margin:2px 0;"><b>👤 Tên:</b> <span style="color:#1565c0; font-weight:bold;">${accountName || "—"}</span></p>
        <p style="margin:2px 0;"><b>🏦 Ngân hàng:</b> ${bankName || "—"} (${bankDisplayName})</p>
        <p style="margin:2px 0;"><b>🔢 Số TK:</b> ${accountNo || "—"}</p>
        <p style="margin:2px 0;"><b>💰 Số tiền:</b> ${parseInt(amount).toLocaleString("vi-VN")} VNĐ</p>
        <p style="margin:2px 0;"><b>📝 Nội dung:</b> <span style="color:#e65100; font-weight:bold;">${addInfo || "—"}</span></p>
      </div>
      <p style="font-size:11px; color:#aaa; margin-top:10px;">Click ra ngoài vùng màu đen để đóng</p>
    </div>
  `;

  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };

  document.body.appendChild(overlay);
})();