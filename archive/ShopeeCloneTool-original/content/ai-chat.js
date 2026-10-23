(function() {
  "use strict";

  function dataUrlToFile(dataUrl, filename) {
    try {
      const arr = dataUrl.split(",");
      const mimeMatch = arr[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    } catch (e) {
      console.error("[Shopee Clone AI] dataUrlToFile error:", e);
      return null;
    }
  }

  // Báo tiến độ về Side Panel (hiện trong nhật ký)
  function reportStatus(msg, color) {
    try {
      chrome.storage.local.set({ aiStatus: { text: String(msg).replace(/^Shopee Clone: /, ""), error: color === "#ed4014", ts: Date.now() } });
    } catch (e) {}
  }

  function showSuccessBadge(msg, color) {
    reportStatus(msg, color);
    try {
      const existing = document.getElementById("scl-ai-badge");
      if (existing) existing.remove();

      const badge = document.createElement("div");
      badge.id = "scl-ai-badge";
      badge.style.position = "fixed";
      badge.style.top = "18px";
      badge.style.left = "50%";
      badge.style.transform = "translateX(-50%)";
      badge.style.backgroundColor = color || "#19be6b";
      badge.style.color = "#ffffff";
      badge.style.padding = "10px 22px";
      badge.style.borderRadius = "24px";
      badge.style.boxShadow = "0 6px 16px rgba(0,0,0,0.25)";
      badge.style.zIndex = "2147483647";
      badge.style.fontSize = "14px";
      badge.style.fontWeight = "600";
      badge.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      badge.style.pointerEvents = "none";
      badge.innerText = msg;
      document.body.appendChild(badge);

      setTimeout(() => {
        badge.style.transition = "opacity 0.6s ease";
        badge.style.opacity = "0";
        setTimeout(() => badge.remove(), 700);
      }, 5000);
    } catch (e) {}
  }

  function waitForElement(selectorFn, timeout = 25000) {
    return new Promise((resolve) => {
      const el = selectorFn();
      if (el) return resolve(el);

      const observer = new MutationObserver(() => {
        const found = selectorFn();
        if (found) {
          observer.disconnect();
          resolve(found);
        }
      });

      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        document.addEventListener("DOMContentLoaded", () => {
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }

      setTimeout(() => {
        observer.disconnect();
        resolve(selectorFn());
      }, timeout);
    });
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Count attached-image previews currently shown by Gemini's composer
  function countGeminiAttachments() {
    const root =
      document.querySelector("input-area-v2") ||
      document.querySelector(".input-area-container") ||
      document.querySelector("rich-textarea")?.closest("form, fieldset, div[class*='input-area']") ||
      document;
    return root.querySelectorAll('img[src^="blob:"], uploader-file-preview, [data-test-id*="file-preview"]').length;
  }

  function pasteFiles(target, files) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    target.focus();
    const evt = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: dt });
    target.dispatchEvent(evt);
    return evt.defaultPrevented;
  }

  function dropFiles(target, files) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    ["dragenter", "dragover", "drop"].forEach((evType) => {
      target.dispatchEvent(new DragEvent(evType, { bubbles: true, cancelable: true, dataTransfer: dt }));
    });
  }

  function insertText(editor, text) {
    editor.focus();
    document.execCommand("selectAll", false, null);
    document.execCommand("insertText", false, text);
    if (!editor.textContent.includes(text.slice(0, 20))) {
      editor.innerText = text;
      editor.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: text }));
    }
  }

  // --- GEMINI HANDLER ---
  async function handleGemini(payload) {
    console.log("[Shopee Clone AI] Handling Gemini upload...", payload);

    const getGeminiEditor = () =>
      document.querySelector('rich-textarea .ql-editor[contenteditable="true"]') ||
      document.querySelector('rich-textarea [contenteditable="true"]') ||
      document.querySelector('div[role="textbox"][contenteditable="true"]');

    let editor = await waitForElement(getGeminiEditor, 30000);
    if (!editor) {
      console.warn("[Shopee Clone AI] Gemini editor not found within timeout.");
      showSuccessBadge("Shopee Clone: Không tìm thấy ô nhập của Gemini (bạn đã đăng nhập chưa?)");
      return;
    }

    showSuccessBadge("Shopee Clone: Đã nhận lệnh, đang dán ảnh và prompt vào Gemini...");

    // Gemini renders the editor before its paste/upload handlers are attached.
    // Acting too early makes the paste get ignored and the text get wiped.
    await sleep(2500);
    editor = getGeminiEditor() || editor;

    const files = [];
    for (const img of payload.images || []) {
      if (img && img.dataUrl) {
        const f = dataUrlToFile(img.dataUrl, img.name || "image.jpg");
        if (f) files.push(f);
      }
    }
    console.log("[Shopee Clone AI] Files prepared:", files.length);

    // 1. Attach images (one by one keeps their order: ảnh 1, ảnh 2)
    let attached = 0;
    for (const file of files) {
      let ok = false;
      for (let attempt = 0; attempt < 5 && !ok; attempt++) {
        editor = getGeminiEditor() || editor;
        const before = countGeminiAttachments();
        const handled = pasteFiles(editor, [file]);
        if (!handled && attempt >= 2) dropFiles(editor, [file]);
        for (let i = 0; i < 10; i++) {
          await sleep(300);
          if (countGeminiAttachments() > before) { ok = true; break; }
        }
        // Paste was accepted but preview selector didn't match — don't paste again
        if (!ok && handled) ok = true;
        if (!ok) await sleep(1000);
      }
      if (ok) attached++;
      else console.warn("[Shopee Clone AI] Could not attach", file.name);
      await sleep(500);
    }

    // 2. Insert prompt text (re-check, Gemini may re-render the editor)
    let textOk = !payload.prompt;
    if (payload.prompt) {
      for (let attempt = 0; attempt < 5 && !textOk; attempt++) {
        editor = getGeminiEditor() || editor;
        try {
          insertText(editor, payload.prompt);
        } catch (e) {
          console.error("[Shopee Clone AI] Error inserting text:", e);
        }
        await sleep(800);
        const cur = getGeminiEditor();
        textOk = !!cur && cur.textContent.includes(payload.prompt.slice(0, 20));
      }
    }

    if (attached === files.length && textOk) {
      showSuccessBadge(`Shopee Clone: Đã thêm ${attached} ảnh + prompt vào Gemini!`);
    } else {
      showSuccessBadge(
        `Shopee Clone: Đã thêm ${attached}/${files.length} ảnh${textOk ? " + prompt" : ", chưa điền được prompt (đã copy sẵn, nhấn Ctrl+V)"}`
      );
    }

    if (payload.autoSend) {
      if (!textOk || attached !== files.length) {
        showSuccessBadge("Shopee Clone: Chưa đủ ảnh/prompt nên không tự gửi. Hãy kiểm tra rồi tự bấm gửi.", "#ed4014");
        return;
      }
      await geminiAutoSendAndCollect();
    }
  }

  const GEMINI_GEN_IMG_SELECTOR = "generated-image img.image, single-image.generated-image img";

  const getGeminiSendButton = () => {
    const btns = [
      ...document.querySelectorAll(".send-button button"),
      ...document.querySelectorAll('button[aria-label="Gửi tin nhắn"], button[aria-label="Send message"]'),
    ];
    return btns.find((b) => !b.disabled && b.getAttribute("aria-disabled") !== "true" && b.offsetParent !== null) || null;
  };

  // Ask the background to download a Gemini image and store it as the new cover
  function sendCoverToExtension(url) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage({ type: "sclFetchImage", url }, (res) => {
          if (chrome.runtime.lastError || !res || !res.ok) {
            resolve({ ok: false, error: (chrome.runtime.lastError && chrome.runtime.lastError.message) || (res && res.error) || "tiện ích không phản hồi – hãy Reload tiện ích rồi F5 trang Gemini" });
          } else {
            resolve(res);
          }
        });
      } catch (e) {
        resolve({ ok: false, error: "Tiện ích vừa được tải lại, hãy F5 trang Gemini" });
      }
    });
  }

  const readBlobAsDataUrl = (blob) => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });

  // Vẽ ảnh đang hiển thị ra canvas (chỉ được khi ảnh cùng nguồn, ví dụ blob:)
  function imageToDataUrlViaCanvas(img) {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext("2d").drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  }

  async function saveCoverDataUrl(dataUrl) {
    const { aiLastProductId } = await chrome.storage.local.get("aiLastProductId");
    await chrome.storage.local.set({
      aiCoverImage: { dataUrl, timestamp: Date.now(), source: "gemini", productId: aiLastProductId || "" },
    });
  }

  // Lấy ảnh Gemini đã tạo làm ảnh bìa. Ảnh mới tạo thường là blob: (đọc ngay trong trang),
  // ảnh cũ là link https (cần cookie Google -> nhờ background tải).
  async function sendCoverFromImage(img) {
    const src = img.currentSrc || img.src || "";
    try {
      if (/^(blob|data):/.test(src)) {
        // Gemini chặn fetch(blob:) bằng CSP nên vẽ ra canvas trước, fetch chỉ là dự phòng
        let dataUrl;
        try {
          dataUrl = imageToDataUrlViaCanvas(img);
        } catch (e) {
          dataUrl = await readBlobAsDataUrl(await (await fetch(src)).blob());
        }
        await saveCoverDataUrl(dataUrl);
        return { ok: true };
      }
    } catch (e) {
      return { ok: false, error: "Không đọc được ảnh: " + ((e && e.message) || e) };
    }

    const res = await sendCoverToExtension(src);
    if (res.ok) return res;
    try {
      await saveCoverDataUrl(imageToDataUrlViaCanvas(img));
      return { ok: true };
    } catch (e) {
      return res;
    }
  }

  async function geminiAutoSendAndCollect() {
    const before = document.querySelectorAll(GEMINI_GEN_IMG_SELECTOR).length;

    // Wait until the send button is usable (images may still be uploading)
    let btn = null;
    for (let i = 0; i < 120 && !btn; i++) {
      btn = getGeminiSendButton();
      if (!btn) await sleep(500);
    }
    if (!btn) {
      showSuccessBadge("Shopee Clone: Không bấm được nút gửi của Gemini, hãy tự bấm gửi.", "#ed4014");
      return;
    }
    await sleep(1500);
    (getGeminiSendButton() || btn).click();
    showSuccessBadge("Shopee Clone: Đã gửi, đang chờ Gemini tạo ảnh...");

    // Wait for a new generated image (up to 5 minutes)
    let img = null;
    for (let i = 0; i < 600 && !img; i++) {
      await sleep(500);
      const list = document.querySelectorAll(GEMINI_GEN_IMG_SELECTOR);
      if (list.length > before) {
        const last = list[list.length - 1];
        if (last.complete && last.naturalWidth > 0 && /^(https?|blob|data):/.test(last.currentSrc || last.src)) img = last;
      }
    }
    if (!img) {
      showSuccessBadge("Shopee Clone: Hết thời gian chờ mà Gemini chưa tạo ảnh. Hãy thử lại hoặc bấm nút 📥 trên ảnh.", "#ed4014");
      return;
    }
    await sleep(2000);
    const list = document.querySelectorAll(GEMINI_GEN_IMG_SELECTOR);
    img = list[list.length - 1] || img;

    showSuccessBadge("Shopee Clone: Gemini đã tạo ảnh, đang lấy ảnh về tiện ích...");
    const res = await sendCoverFromImage(img);
    if (!res.ok) {
      showSuccessBadge("Shopee Clone: Không lấy được ảnh (" + res.error + "). Hãy tải ảnh về rồi bấm 'Chọn ảnh từ máy'.", "#ed4014");
      return;
    }
    const box = img.closest("single-image") || img.closest("generated-image");
    const b = box && box.querySelector(".scl-cover-btn");
    if (b) b.textContent = "✔ Đã dùng làm ảnh bìa";
    showSuccessBadge("Shopee Clone: Đã lấy ảnh bìa! Tiện ích đang tự động sao chép sang Shopee...");
  }

  // --- CHATGPT HANDLER ---
  async function handleChatGpt(payload) {
    console.log("[Shopee Clone AI] Handling ChatGPT upload...", payload);

    const getChatGptInput = () => {
      return (
        document.querySelector("#prompt-textarea") ||
        document.querySelector('textarea[tabindex="0"]') ||
        document.querySelector('div[contenteditable="true"]') ||
        document.querySelector("textarea")
      );
    };

    const textarea = await waitForElement(getChatGptInput, 25000);
    if (!textarea) {
      console.warn("[Shopee Clone AI] ChatGPT textarea not found within timeout.");
      return;
    }

    const files = [];
    if (payload.images && payload.images.length) {
      for (const img of payload.images) {
        if (img && img.dataUrl) {
          const f = dataUrlToFile(img.dataUrl, img.name || "image.jpg");
          if (f) files.push(f);
        }
      }
    }

    // 1. Upload images
    if (files.length > 0) {
      console.log("[Shopee Clone AI] Attaching", files.length, "images to ChatGPT...");
      const dt = new DataTransfer();
      files.forEach((f) => dt.items.add(f));

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        try {
          fileInput.files = dt.files;
          fileInput.dispatchEvent(new Event("input", { bubbles: true }));
          fileInput.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) {}
      }

      try {
        textarea.focus();
        const pasteEvt = new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: dt,
        });
        textarea.dispatchEvent(pasteEvt);
      } catch (e) {}

      try {
        const dropTargets = [
          textarea,
          document.querySelector('div[role="presentation"]'),
          document.querySelector("main"),
          document.body,
        ].filter(Boolean);

        for (const target of dropTargets) {
          ["dragenter", "dragover", "drop"].forEach((evType) => {
            target.dispatchEvent(
              new DragEvent(evType, {
                bubbles: true,
                cancelable: true,
                dataTransfer: dt,
              })
            );
          });
        }
      } catch (e) {}

      await new Promise((r) => setTimeout(r, 1200));
    }

    // 2. Insert prompt text
    if (payload.prompt) {
      console.log("[Shopee Clone AI] Inserting prompt into ChatGPT...");
      try {
        textarea.focus();
        if (textarea.tagName === "TEXTAREA") {
          textarea.value = payload.prompt;
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          textarea.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
          document.execCommand("selectAll", false, null);
          const ok = document.execCommand("insertText", false, payload.prompt);
          if (!ok || !textarea.textContent.includes(payload.prompt)) {
            textarea.innerText = payload.prompt;
          }
          textarea.dispatchEvent(new Event("input", { bubbles: true }));
          textarea.dispatchEvent(new Event("change", { bubbles: true }));
        }
      } catch (e) {
        console.error("[Shopee Clone AI] Error inserting ChatGPT text:", e);
      }
    }

    showSuccessBadge("Shopee Clone: Đã tự động tải ảnh và điền prompt vào ChatGPT!");
  }

  // --- GEMINI: "use generated image as cover" button ---
  function setupGeminiCoverButtons() {
    const addButtons = () => {
      document.querySelectorAll("generated-image img.image, single-image.generated-image img").forEach((img) => {
        const box = img.closest("single-image") || img.closest("generated-image") || img.parentElement;
        if (!box || box.querySelector(".scl-cover-btn")) return;
        if (getComputedStyle(box).position === "static") box.style.position = "relative";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "scl-cover-btn";
        btn.textContent = "📥 Dùng làm ảnh bìa";
        Object.assign(btn.style, {
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: "5",
          padding: "6px 12px",
          border: "none",
          borderRadius: "16px",
          background: "#ee4d2d",
          color: "#fff",
          fontSize: "13px",
          fontWeight: "600",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        });
        btn.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const im = box.querySelector("img.image") || img;
          btn.disabled = true;
          btn.textContent = "Đang lấy ảnh...";
          sendCoverFromImage(im).then((res) => {
            btn.disabled = false;
            if (!res.ok) {
              console.warn("[Shopee Clone AI] Fetch cover failed:", res.error);
              btn.textContent = "📥 Dùng làm ảnh bìa";
              showSuccessBadge("Shopee Clone: Không lấy được ảnh (" + res.error + "). Hãy tải ảnh về rồi bấm 'Chọn ảnh từ máy' trong tiện ích.", "#ed4014");
              return;
            }
            btn.textContent = "✔ Đã dùng làm ảnh bìa";
            showSuccessBadge("Shopee Clone: Đã lấy ảnh làm ảnh bìa! Quay lại tiện ích và bấm 'Sao chép sang Shopee'.");
          });
        });
        box.appendChild(btn);
      });
    };

    let timer = null;
    const start = () => {
      addButtons();
      new MutationObserver(() => {
        clearTimeout(timer);
        timer = setTimeout(addButtons, 400);
      }).observe(document.body, { childList: true, subtree: true });
    };
    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start);
  }

  if (window.location.hostname.toLowerCase().includes("gemini.google.com")) {
    setupGeminiCoverButtons();
  }

  // --- CHECK AND DISPATCH ---
  let myTabIdPromise = null;
  const getMyTabId = () => {
    if (!myTabIdPromise) {
      myTabIdPromise = new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage({ type: "sclWhoAmI" }, (res) => {
            resolve(chrome.runtime.lastError || !res ? null : res.tabId);
          });
        } catch (e) {
          resolve(null);
        }
      });
    }
    return myTabIdPromise;
  };

  function checkAndProcessPayload() {
    if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) return;

    chrome.storage.local.get("pendingAiPayload", async (res) => {
      const payload = res ? res.pendingAiPayload : null;
      if (!payload || !payload.timestamp) return;

      // Lệnh chỉ dành cho đúng tab mà Side Panel vừa mở
      if (payload.tabId) {
        const myTabId = await getMyTabId();
        if (myTabId !== payload.tabId) return;
      }

      // Only process payloads created in the last 2 minutes
      if (Date.now() - payload.timestamp > 120000) {
        chrome.storage.local.remove("pendingAiPayload");
        return;
      }

      const host = window.location.hostname.toLowerCase();
      const isGemini = host.includes("gemini.google.com");
      const isChatGpt = host.includes("chatgpt.com") || host.includes("openai.com");

      if (window.__sclAiHandled === payload.timestamp) return;
      if ((payload.target === "gemini" && isGemini) || (payload.target === "chatgpt" && isChatGpt)) {
        window.__sclAiHandled = payload.timestamp;
      }

      if (payload.target === "gemini" && isGemini) {
        chrome.storage.local.remove("pendingAiPayload");
        handleGemini(payload);
      } else if (payload.target === "chatgpt" && isChatGpt) {
        chrome.storage.local.remove("pendingAiPayload");
        handleChatGpt(payload);
      }
    });
  }

  // Run on initial load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkAndProcessPayload);
  } else {
    checkAndProcessPayload();
  }

  // Also listen for storage changes in case the tab is already opened
  try {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.pendingAiPayload && changes.pendingAiPayload.newValue) {
          checkAndProcessPayload();
        }
      });
    }
  } catch (e) {}

})();
