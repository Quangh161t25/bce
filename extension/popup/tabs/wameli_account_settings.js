// =========================================================================
// CÀI ĐẶT: TÀI KHOẢN WAMELI
// Lưu vào chrome.storage (wameliUser / wameliPass — Order Tool dùng để tự đăng nhập)
// và Google Sheet cai_dat (cột wameli_user / wameli_pass, dòng 2).
// =========================================================================

(function() {
  const userInput = document.getElementById("wameli-account-user");
  const passInput = document.getElementById("wameli-account-pass");
  const btnSave = document.getElementById("btn-save-wameli-account");
  const btnToggle = document.getElementById("btn-toggle-wameli-pass");
  const statusEl = document.getElementById("wameli-account-status");
  if (!userInput || !passInput || !btnSave) return;

  function setStatus(text, color = "#64748b") {
    if (!statusEl) return;
    statusEl.textContent = text;
    statusEl.style.color = color;
  }

  // Đọc từ sheet cai_dat (cột wameli_user / wameli_pass)
  async function loadAccount(forceFromSheet = false) {
    if (!forceFromSheet) {
      const { wameliUser, wameliPass } = await chrome.storage.local.get(["wameliUser", "wameliPass"]);
      if (wameliUser || wameliPass) {
        userInput.value = wameliUser || "";
        passInput.value = wameliPass || "";
        return;
      }
    }
    setStatus("Đang đọc từ Sheet...");
    try {
      const res = await chrome.runtime.sendMessage({ type: "FETCH_CAI_DAT" });
      const rows = (res && res.ok && res.values) || [];
      const header = (rows[0] || []).map(h => String(h || "").trim().toLowerCase());
      const get = (k) => (header.indexOf(k) >= 0 ? String((rows[1] || [])[header.indexOf(k)] || "").trim() : "");
      const user = get("wameli_user");
      const pass = get("wameli_pass");
      if (user || pass) {
        userInput.value = user;
        passInput.value = pass;
        await chrome.storage.local.set({ wameliUser: user, wameliPass: pass });
        setStatus("Đã lấy từ Sheet", "#16a34a");
      } else {
        if (forceFromSheet) {
          setStatus("Sheet chưa có wameli_user / wameli_pass", "#f59e0b");
        } else {
          setStatus("Chưa có tài khoản");
        }
      }
    } catch (err) {
      setStatus("Lỗi đọc: " + err.message, "#dc2626");
    }
  }

  async function saveAccount() {
    const user = userInput.value.trim();
    const pass = passInput.value;
    if (!user || !pass) {
      setStatus("Nhập đủ tên đăng nhập và mật khẩu", "#dc2626");
      return;
    }
    btnSave.disabled = true;
    setStatus("Đang lưu...", "#f59e0b");
    try {
      await chrome.storage.local.set({ wameliUser: user, wameliPass: pass });
      const res = await chrome.runtime.sendMessage({
        type: "SAVE_CAI_DAT_VALUES",
        values: { wameli_user: user, wameli_pass: pass }
      });
      if (res && res.ok) {
        setStatus("Đã lưu (máy + Sheet)", "#16a34a");
      } else {
        setStatus("Đã lưu trên máy, lỗi Sheet: " + (res?.error || "không rõ"), "#dc2626");
      }
    } catch (err) {
      setStatus("Lỗi: " + err.message, "#dc2626");
    } finally {
      btnSave.disabled = false;
    }
  }

  btnSave.addEventListener("click", saveAccount);
  btnToggle?.addEventListener("click", () => {
    const show = passInput.type === "password";
    passInput.type = show ? "text" : "password";
    btnToggle.textContent = show ? "Ẩn" : "Hiện";
  });

  // Expose global sync function
  window.syncWameliAccountFromSheet = function(force = true) {
    return loadAccount(force);
  };

  // Tự động đồng bộ lại khi ID sheet thay đổi
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.customSpreadsheetId) {
      loadAccount(true).catch(() => {});
    }
  });

  loadAccount().catch(err => setStatus("Lỗi đọc: " + err.message, "#dc2626"));
})();
