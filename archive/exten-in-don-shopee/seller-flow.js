(function () {
  if (window.__shopeePrintFlowLoaded) {
    return;
  }

  window.__shopeePrintFlowLoaded = true;

  const SCROLL_BUTTONS_ID = "shopee-helper-scroll-buttons";
  const SCROLL_BUTTONS_STYLE_ID = "shopee-helper-scroll-buttons-style";
  const AWB_DOWNLOAD_BUTTON_ID = "shopee-helper-awb-download";
  const AWB_DOWNLOAD_STYLE_ID = "shopee-helper-awb-download-style";

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function normalizeText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
  }

  function normalizeSearchText(text) {
    return normalizeText(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\u0111/g, "d");
  }

  function isVisible(element) {
    if (!element) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    return rect.width > 0
      && rect.height > 0
      && style.visibility !== "hidden"
      && style.display !== "none";
  }

  function emitRealClick(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + Math.min(rect.width / 2, Math.max(1, rect.width - 1));
    const y = rect.top + Math.min(rect.height / 2, Math.max(1, rect.height - 1));
    const options = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: x,
      clientY: y,
      button: 0,
      buttons: 1
    };

    element.dispatchEvent(new PointerEvent("pointerdown", { ...options, pointerId: 1, pointerType: "mouse", isPrimary: true }));
    element.dispatchEvent(new MouseEvent("mousedown", options));
    element.dispatchEvent(new PointerEvent("pointerup", { ...options, pointerId: 1, pointerType: "mouse", isPrimary: true, buttons: 0 }));
    element.dispatchEvent(new MouseEvent("mouseup", { ...options, buttons: 0 }));
    element.dispatchEvent(new MouseEvent("click", { ...options, buttons: 0 }));
  }

  function emitRealHover(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const options = {
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
      clientX: rect.left + rect.width / 2,
      clientY: rect.top + rect.height / 2,
      relatedTarget: document.body
    };

    const targets = [element, element.parentElement, element.closest("div, span")].filter(Boolean);
    const uniqueTargets = [...new Set(targets)];

    for (const target of uniqueTargets) {
      target.dispatchEvent(new PointerEvent("pointerenter", { ...options, pointerId: 1, pointerType: "mouse", isPrimary: true }));
      target.dispatchEvent(new MouseEvent("mouseenter", options));
      target.dispatchEvent(new PointerEvent("pointerover", { ...options, pointerId: 1, pointerType: "mouse", isPrimary: true }));
      target.dispatchEvent(new MouseEvent("mouseover", options));
      target.dispatchEvent(new PointerEvent("pointermove", { ...options, pointerId: 1, pointerType: "mouse", isPrimary: true }));
      target.dispatchEvent(new MouseEvent("mousemove", options));
    }
  }

  function injectScrollButtonsStyle() {
    if (document.getElementById(SCROLL_BUTTONS_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");

    style.id = SCROLL_BUTTONS_STYLE_ID;
    style.textContent = `
      #${SCROLL_BUTTONS_ID} {
        position: fixed !important;
        right: 18px !important;
        bottom: 92px !important;
        z-index: 2147483647 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        pointer-events: auto !important;
      }

      #${SCROLL_BUTTONS_ID} button {
        width: 42px !important;
        height: 42px !important;
        border: 0 !important;
        border-radius: 50% !important;
        color: #fff !important;
        background: #2673dd !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.24) !important;
        font: 700 22px/1 Arial, sans-serif !important;
        cursor: pointer !important;
      }

      #${SCROLL_BUTTONS_ID} button:hover {
        background: #1e5fb8 !important;
      }
    `;
    document.documentElement.append(style);
  }

  const HIDE_MODAL_STYLE_ID = "shopee-helper-hide-modal-style";

  function setModalHidden(hidden) {
    let style = document.getElementById(HIDE_MODAL_STYLE_ID);
    
    if (hidden) {
      if (!style) {
        style = document.createElement("style");
        style.id = HIDE_MODAL_STYLE_ID;
        style.textContent = `
          .eds-modal, .eds-modal__mask {
            opacity: 0.001 !important;
            pointer-events: none !important;
          }
        `;
        document.documentElement.append(style);
      }
    } else {
      style?.remove();
    }
  }

  function findBestScrollableElement() {
    const candidates = Array.from(document.querySelectorAll("main, [class*='scroll'], [class*='container'], [class*='content'], div"))
      .filter((element) => {
        const style = window.getComputedStyle(element);
        return ["auto", "scroll"].includes(style.overflowY)
          && element.scrollHeight > element.clientHeight + 80
          && isVisible(element);
      })
      .sort((left, right) => {
        const leftRect = left.getBoundingClientRect();
        const rightRect = right.getBoundingClientRect();
        return (rightRect.width * rightRect.height) - (leftRect.width * leftRect.height);
      });

    return candidates[0] || document.scrollingElement || document.documentElement;
  }

  function scrollPageBy(direction) {
    const distance = Math.max(360, Math.round(window.innerHeight * 0.82)) * direction;

    if (document.documentElement.scrollHeight > window.innerHeight + 10) {
      window.scrollBy({ top: distance, behavior: "smooth" });
      return;
    }

    const target = findBestScrollableElement();

    if (target === document.scrollingElement || target === document.documentElement || target === document.body) {
      window.scrollBy({ top: distance, behavior: "smooth" });
      return;
    }

    target.scrollBy({ top: distance, behavior: "smooth" });
  }

  function injectScrollButtons() {
    if (document.getElementById(SCROLL_BUTTONS_ID)) {
      return;
    }

    injectScrollButtonsStyle();

    const wrap = document.createElement("div");
    const upButton = document.createElement("button");
    const downButton = document.createElement("button");

    wrap.id = SCROLL_BUTTONS_ID;
    upButton.type = "button";
    upButton.title = "Cuon len";
    upButton.textContent = "\u2191";
    downButton.type = "button";
    downButton.title = "Cuon xuong";
    downButton.textContent = "\u2193";
    upButton.addEventListener("click", () => scrollPageBy(-1));
    downButton.addEventListener("click", () => scrollPageBy(1));
    wrap.append(upButton, downButton);
    document.documentElement.append(wrap);
  }

  function isAwbPrintPage() {
    const href = window.location.href.toLowerCase();
    if (href.includes("/portal/sale/mass/ship") || href.includes("/portal/sale/mass-shipping")) {
      return false;
    }
    return href.includes("awbprint") || 
           href.includes("/waybill") || 
           href.includes("/receipt") ||
           href.includes("/mass/doc") ||
           href.includes("/sale/order/print") ||
           href.includes("doc/download");
  }

  function injectAwbDownloadStyle() {
    if (document.getElementById(AWB_DOWNLOAD_STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");

    style.id = AWB_DOWNLOAD_STYLE_ID;
    style.textContent = `
      #${AWB_DOWNLOAD_BUTTON_ID} {
        position: fixed !important;
        top: 30px !important;
        right: 160px !important;
        z-index: 2147483647 !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: 104px !important;
        height: 34px !important;
        padding: 0 14px !important;
        border: 0 !important;
        border-radius: 4px !important;
        color: #fff !important;
        background: #2673dd !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2) !important;
        font: 700 13px/1 Arial, sans-serif !important;
        cursor: pointer !important;
      }

      #${AWB_DOWNLOAD_BUTTON_ID}:hover {
        background: #1e5fb8 !important;
      }
    `;
    document.documentElement.append(style);
  }

  function sanitizeDownloadName(value) {
    return String(value || "shopee-awb")
      .replace(/[\\/:*?"<>|]/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 120) || "shopee-awb";
  }

  function getAwbDownloadUrl() {
    const embeddedPdf = Array.from(document.querySelectorAll("iframe[src], embed[src], object[data], a[href]"))
      .map((element) => element.getAttribute("src") || element.getAttribute("data") || element.getAttribute("href"))
      .find((url) => url && (/\.pdf(?:[?#]|$)/i.test(url) || url.startsWith("blob:")));

    return embeddedPdf ? new URL(embeddedPdf, window.location.href).href : window.location.href;
  }

  async function getAwbFileName() {
    const { autoRunConfigs = {} } = await chrome.storage.local.get("autoRunConfigs");
    let shopCode = "";
    
    // Thu lay ma gian tu cau hinh "mac-dinh" hoac luu tru
    if (autoRunConfigs["mac-dinh"] && autoRunConfigs["mac-dinh"].shopCode) {
      shopCode = autoRunConfigs["mac-dinh"].shopCode;
    }
    
    // Neu van khong co, thu lay tu tat ca cac config, uu tien config co ma gian
    if (!shopCode) {
      for (const key in autoRunConfigs) {
        if (autoRunConfigs[key].shopCode) {
          shopCode = autoRunConfigs[key].shopCode;
          break;
        }
      }
    }

    if (!shopCode) {
      const params = new URLSearchParams(window.location.search);
      const jobId = params.get("job_id");
      const orderText = Array.from(document.querySelectorAll("body *"))
        .map((element) => normalizeText(element.textContent))
        .find((text) => /OrderSN:\s*[A-Z0-9]+/i.test(text));
      const orderMatch = orderText?.match(/OrderSN:\s*([A-Z0-9]+)/i);
      const baseName = sanitizeDownloadName(orderMatch?.[1] || jobId || `shopee-awb-${Date.now()}`);

      return `Shopee-${baseName}.pdf`;
    }

    const { shopeePdfSequence = 0, shopeePdfSequenceDate = "" } = await chrome.storage.local.get(["shopeePdfSequence", "shopeePdfSequenceDate"]);
    
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    
    const currentDateStr = `${dd}${mm}`;
    let nextSeq = 1;
    
    if (shopeePdfSequenceDate === currentDateStr) {
      nextSeq = shopeePdfSequence + 1;
    }

    await chrome.storage.local.set({
      shopeePdfSequence: nextSeq,
      shopeePdfSequenceDate: currentDateStr
    });

    const safeShopCode = sanitizeDownloadName(shopCode);
    const timeStr = `${hh}${min}`;

    return `${currentDateStr}-${safeShopCode}-${timeStr}-${nextSeq}.pdf`;
  }

  function setAwbDownloadStatus(button, text) {
    button.textContent = text;
    window.setTimeout(() => {
      if (document.contains(button)) {
        button.textContent = "Tai PDF";
      }
    }, 1800);
  }

  function downloadAwbInPage(url, filename) {
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.documentElement.append(link);
    link.click();
    link.remove();

    return {
      ok: true,
      method: "page-link"
    };
  }

  async function downloadAwbPdf() {
    const url = getAwbDownloadUrl();
    const filename = await getAwbFileName();

    if (url.startsWith("blob:")) {
      return downloadAwbInPage(url, filename);
    }

    const response = await Promise.race([
      chrome.runtime.sendMessage({
        type: "DOWNLOAD_AWB_PDF",
        url,
        filename
      }),
      new Promise((resolve) => {
        window.setTimeout(() => {
          resolve({
            ok: false,
            message: "Qua thoi gian cho tai PDF."
          });
        }, 10000);
      })
    ]);

    if (response?.ok) {
      return response;
    }

    return downloadAwbInPage(url, filename);
  }

  function injectAwbDownloadButton() {
    if (!isAwbPrintPage() || document.getElementById(AWB_DOWNLOAD_BUTTON_ID)) {
      return;
    }

    injectAwbDownloadStyle();

    const button = document.createElement("button");

    button.id = AWB_DOWNLOAD_BUTTON_ID;
    button.type = "button";
    button.title = "Tai PDF ve thu muc Downloads";
    button.textContent = "Tai PDF";
    button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Dang tai...";

      try {
        const response = await downloadAwbPdf();
        setAwbDownloadStatus(button, response?.ok ? "Da tai" : "Loi tai");
      } catch (_) {
        setAwbDownloadStatus(button, "Loi tai");
      } finally {
        window.setTimeout(() => {
          if (document.contains(button)) {
            button.disabled = false;
          }
        }, 500);
      }
    });

    document.documentElement.append(button);
  }

  function isDisabledControl(element) {
    const control = element.closest("button, [aria-disabled='true'], .disabled, .is-disabled, .eds-checkbox--disabled");

    return Boolean(control?.disabled
      || control?.getAttribute?.("aria-disabled") === "true"
      || control?.classList?.contains("disabled")
      || control?.classList?.contains("is-disabled"));
  }

  function findPrintFlowCheckboxIndicator() {
    const indicators = Array.from(document.querySelectorAll("span.eds-checkbox__indicator"));
    const visibleIndicators = indicators
      .filter((indicator) => isVisible(indicator) && !isDisabledControl(indicator))
      .sort((left, right) => {
        const leftRect = left.getBoundingClientRect();
        const rightRect = right.getBoundingClientRect();
        return leftRect.top - rightRect.top || leftRect.left - rightRect.left;
      });

    return visibleIndicators[0] || null;
  }

  async function selectPrintFlowCheckbox() {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      const indicator = findPrintFlowCheckboxIndicator();

      if (indicator) {
        const target = indicator.closest("label, .eds-checkbox, [role='checkbox']") || indicator;

        target.scrollIntoView({ block: "center", inline: "nearest" });
        await sleep(100);
        emitRealClick(target);

        return {
          ok: true,
          message: "Da bam hop kiem."
        };
      }

      await sleep(200);
    }

    return {
      ok: false,
      message: "Khong thay hop kiem tren trang in don."
    };
  }

  function findPrintWarehouseSelect() {
    const directSelect = document.querySelector("[data-testid='warehouse-filter']");

    if (directSelect && isVisible(directSelect)) {
      return directSelect;
    }

    return Array.from(document.querySelectorAll(".eds-select")).find((select) => {
      return select.querySelector(".eds-selector__inner") && isVisible(select);
    }) || null;
  }

  function getPrintWarehouseSelectTarget(select) {
    return select?.querySelector(".eds-selector") || select;
  }

  function findVisibleWarehouseOptions() {
    return Array.from(document.querySelectorAll(".eds-select__options .eds-option, .eds-option"))
      .filter((option) => isVisible(option))
      .map((option) => ({
        element: option,
        name: normalizeText(option.textContent),
        selected: option.classList.contains("selected")
      }))
      .filter((option) => option.name);
  }

  async function openPrintWarehouseMenu() {
    const select = findPrintWarehouseSelect();

    if (!select) {
      return null;
    }

    const target = getPrintWarehouseSelectTarget(select);

    target.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(100);
    emitRealClick(target);
    await sleep(250);

    return select;
  }

  async function getPrintWarehouses() {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await openPrintWarehouseMenu();

      const options = findVisibleWarehouseOptions();

      if (options.length) {
        return {
          ok: true,
          warehouses: options.map((option) => ({
            name: option.name,
            selected: option.selected
          })),
          message: `Da tim ${options.length} kho.`
        };
      }

      await sleep(200);
    }

    return {
      ok: false,
      warehouses: [],
      message: "Khong thay danh sach kho."
    };
  }

  async function selectPrintWarehouse(name) {
    const wantedName = normalizeSearchText(name);

    if (!wantedName) {
      return {
        ok: false,
        message: "Chua co ten kho de chon."
      };
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await openPrintWarehouseMenu();

      const option = findVisibleWarehouseOptions().find((item) => normalizeSearchText(item.name) === wantedName);

      if (option?.element) {
        option.element.scrollIntoView({ block: "nearest", inline: "nearest" });
        await sleep(80);
        emitRealClick(option.element);

        return {
          ok: true,
          message: `Da chon kho ${option.name}.`
        };
      }

      await sleep(200);
    }

    return {
      ok: false,
      message: `Khong thay kho ${wantedName}.`
    };
  }

  function findChangePickupAddressButton() {
    const directButton = document.querySelector("[data-testid='change-pickup-address-button']");

    if (directButton && isVisible(directButton)) {
      return directButton;
    }

    return Array.from(document.querySelectorAll("button, [role='button'], .action, div, span")).find((element) => {
      const text = normalizeSearchText(element.textContent);
      return (text === "doi" || text === "doi dia chi" || text.includes("doi dia chi")) && isVisible(element);
    }) || null;
  }

  function findPickupAddressModal() {
    return Array.from(document.querySelectorAll(".eds-modal__content")).find((modal) => {
      const title = normalizeSearchText(modal.querySelector(".eds-modal__title")?.textContent);

      return title === "chon dia chi lay hang" && isVisible(modal);
    }) || null;
  }

  async function openPickupAddressModal() {
    let modal = findPickupAddressModal();

    if (modal) {
      return modal;
    }

    const changeButton = findChangePickupAddressButton();

    if (!changeButton) {
      return null;
    }

    setModalHidden(true);

    changeButton.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(100);
    emitRealClick(changeButton);

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await sleep(200);
      modal = findPickupAddressModal();

      if (modal) {
        return modal;
      }
    }

    setModalHidden(false);
    return null;
  }

  function getPickupAddressItems(modal) {
    return Array.from(modal.querySelectorAll(".pickup-address-select-item"))
      .map((item, index) => {
        const input = item.querySelector("input[type='radio'][name='address-item']");
        const name = normalizeText(item.querySelector(".name")?.textContent);
        const addr = normalizeText(item.querySelector(".addr")?.innerText || item.querySelector(".addr")?.textContent);
        const selected = Boolean(input?.checked || item.querySelector(".eds-radio__input:checked"));
        const normalizedAddr = normalizeSearchText(addr);
        const shortText = normalizedAddr.includes("ha noi")
          ? "Ha Noi"
          : normalizedAddr.includes("ho chi minh") || normalizedAddr.includes("hcm")
            ? "Ho Chi Minh"
            : `Dia chi ${index + 1}`;

        return {
          element: item,
          input,
          id: input?.value || String(index),
          name,
          addr,
          shortText,
          selected,
          fullText: [name, addr].filter(Boolean).join(" - ")
        };
      })
      .filter((address) => address.input && address.fullText);
  }

  async function getPickupAddresses() {
    const modal = await openPickupAddressModal();

    if (!modal) {
      return {
        ok: false,
        addresses: [],
        message: "Khong thay nut Doi dia chi lay hang."
      };
    }

    const addresses = getPickupAddressItems(modal);

    const cancelButton = findCancelPickupAddressButton(modal);
    if (cancelButton) {
      emitRealClick(cancelButton);
      await sleep(300);
    }
    setModalHidden(false);

    return {
      ok: addresses.length > 0,
      addresses: addresses.map((address) => ({
        id: address.id,
        name: address.name,
        addr: address.addr,
        shortText: address.shortText,
        selected: address.selected,
        fullText: address.fullText
      })),
      message: addresses.length ? `Da tim ${addresses.length} dia chi.` : "Khong thay dia chi trong popup."
    };
  }

  function findConfirmPickupAddressButton(modal) {
    return Array.from(modal.querySelectorAll("button")).find((button) => {
      return normalizeText(button.textContent) === "Confirm" && isVisible(button);
    }) || null;
  }

  function findCancelPickupAddressButton(modal) {
    return Array.from(modal.querySelectorAll("button")).find((button) => {
      return normalizeText(button.textContent) === "Cancel" && isVisible(button);
    }) || null;
  }

  async function selectPickupAddress(id) {
    const modal = await openPickupAddressModal();

    if (!modal) {
      return {
        ok: false,
        message: "Khong thay popup chon dia chi lay hang."
      };
    }

    const address = getPickupAddressItems(modal).find((item) => item.id === String(id));

    if (!address) {
      setModalHidden(false);
      return {
        ok: false,
        message: "Khong thay dia chi can chon."
      };
    }

    const target = address.input.closest("label") || address.element;

    target.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(80);
    emitRealClick(target);
    await sleep(150);

    const confirmButton = findConfirmPickupAddressButton(modal);

    if (confirmButton) {
      emitRealClick(confirmButton);
      await sleep(300);
      setModalHidden(false);
      return {
        ok: true,
        message: `Da chon ${address.shortText} va bam Confirm.`
      };
    }

    setModalHidden(false);
    return {
      ok: true,
      message: `Da chon ${address.shortText}, nhung khong thay nut Confirm.`
    };
  }

  async function selectPickupAddressLocation(location) {
    const modal = await openPickupAddressModal();

    if (!modal) {
      return {
        ok: false,
        message: "Khong thay popup chon dia chi lay hang."
      };
    }

    const normalizedLocation = normalizeSearchText(location);
    const address = getPickupAddressItems(modal).find((item) => {
      const normalizedAddr = normalizeSearchText(item.addr);

      if (normalizedLocation.includes("ha noi")) {
        return normalizedAddr.includes("ha noi");
      }

      if (normalizedLocation.includes("ho chi minh") || normalizedLocation.includes("hcm")) {
        return normalizedAddr.includes("ho chi minh") || normalizedAddr.includes("hcm");
      }

      return normalizedAddr.includes(normalizedLocation);
    });

    if (!address) {
      setModalHidden(false);
      return {
        ok: false,
        message: `Khong thay dia chi ${location}.`
      };
    }

    const target = address.input.closest("label") || address.element;

    target.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(80);
    emitRealClick(target);
    await sleep(150);

    const confirmButton = findConfirmPickupAddressButton(modal);

    if (confirmButton) {
      emitRealClick(confirmButton);
      await sleep(300);
      setModalHidden(false);
      return {
        ok: true,
        message: `Da chon dia chi ${address.shortText} va bam Confirm.`
      };
    }

    setModalHidden(false);
    return {
      ok: true,
      message: `Da chon dia chi ${address.shortText}, nhung khong thay nut Confirm.`
    };
  }

  function findArrangePickupConfirmButton() {
    const directButton = document.querySelector("[data-testid='arrange-pickup-confirm-button']");

    if (directButton && isVisible(directButton)) {
      return directButton;
    }

    return Array.from(document.querySelectorAll("button")).find((button) => {
      return normalizeSearchText(button.textContent).includes("yeu cau don vi van chuyen den lay hang") && isVisible(button);
    }) || null;
  }

  async function arrangePickupConfirm() {
    let clickedInitialButton = false;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const confirmButton = findArrangePickupConfirmButton();

      if (confirmButton) {
        confirmButton.scrollIntoView({ block: "center", inline: "nearest" });
        await sleep(100);
        emitRealClick(confirmButton);
        clickedInitialButton = true;
        break;
      }

      await sleep(200);
    }

    if (!clickedInitialButton) {
      return {
        ok: false,
        message: "Khong thay nut Yeu cau don vi van chuyen den lay hang ban dau."
      };
    }

    // Sau khi bam "Yeu cau don vi van chuyen den lay hang", co the Shopee se hien popup chon thoi gian lay hang.
    // Chung ta can tim va bam nut "Xac nhan" trong popup nay neu no xuat hien.
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await sleep(200);
      const modal = document.querySelector(".eds-modal__content");
      if (modal && isVisible(modal)) {
        // Tim nut xac nhan trong modal
        const modalConfirmButton = Array.from(modal.querySelectorAll("button")).find((button) => {
          const text = normalizeSearchText(button.textContent);
          return (text === "xac nhan" || text === "dong y" || text === "ok") && isVisible(button) && !button.disabled;
        });

        if (modalConfirmButton) {
          modalConfirmButton.scrollIntoView({ block: "center", inline: "nearest" });
          await sleep(100);
          emitRealClick(modalConfirmButton);
          return {
            ok: true,
            message: "Da bam Yeu cau va Xac nhan trong popup thoi gian lay hang."
          };
        }
      }
    }

    return {
      ok: true,
      message: "Da bam Yeu cau don vi van chuyen den lay hang (khong co popup xac nhan)."
    };
  }

  function findGenerateDocButton() {
    // 1. Tìm trực diện theo data-testid của Shopee trên toàn document
    const directButton = document.querySelector("[data-testid='generate-doc-for-arranged-shipment-orders']");
    if (directButton && isVisible(directButton) && !directButton.disabled && !directButton.classList.contains("eds-button--disabled")) {
      return directButton;
    }

    let container = document;
    const modals = Array.from(document.querySelectorAll(".eds-modal__content")).filter(isVisible);
    if (modals.length > 0) {
      container = modals[modals.length - 1];
      const modalBtn = container.querySelector("[data-testid='generate-doc-for-arranged-shipment-orders']");
      if (modalBtn && isVisible(modalBtn) && !modalBtn.disabled && !modalBtn.classList.contains("eds-button--disabled")) {
        return modalBtn;
      }
    }

    return Array.from(document.querySelectorAll("button, [role='button'], .eds-button, .eds-dropdown")).find((button) => {
      const text = normalizeSearchText(button.textContent);
      const isDisabled = button.disabled || button.classList.contains("eds-button--disabled") || button.getAttribute("aria-disabled") === "true";
      return (text === "tao" || text.startsWith("tao ") || text.includes("tao phieu") || text.includes("in phieu") || text.includes("in don") || text.includes("tao tai lieu") || text.includes("generate")) && isVisible(button) && !isDisabled;
    }) || null;
  }

  function findNormalPdfDocOption() {
    // 1. Nhắm trực diện vào data-testid của Shopee (kể cả khi popper đang display: none)
    const directOptions = Array.from(document.querySelectorAll("[data-testid='doc-type-NORMAL_PDF'], [data-testid*='NORMAL_PDF']"));
    const visibleDirect = directOptions.find(isVisible);
    if (visibleDirect) {
      return visibleDirect;
    }
    if (directOptions.length > 0) {
      return directOptions[0];
    }

    // 2. Tìm trong dropdown menu / popper
    const dropdownItems = Array.from(document.querySelectorAll(".eds-popper li, .eds-dropdown-menu li, .eds-dropdown-item, .eds-popover li, .eds-option, li, div[role='menuitem'], [data-testid]"));

    return dropdownItems.find((element) => {
      const text = normalizeSearchText(element.textContent);
      return (text.includes("pdf") || (text.includes("phieu gui hang") && text.includes("phieu dong goi")) || text.includes("phieu gui hang") || text.includes("phieu dong goi") || text.includes("phieu van don"));
    }) || null;
  }

  function findDocGenerationModal() {
    const modals = Array.from(document.querySelectorAll(".eds-modal__box, .eds-modal__content, .eds-modal, .eds-dialog, div[role='dialog']")).filter(isVisible);
    return modals.find((modal) => {
      const text = normalizeSearchText(modal.textContent);
      return text.includes("tao chung tu") || 
             text.includes("chung tu van chuyen") || 
             text.includes("tao phieu") || 
             text.includes("phieu gui hang") || 
             text.includes("phieu dong goi") || 
             text.includes("dang tao") || 
             text.includes("dang xu ly") ||
             text.includes("tai ve") ||
             text.includes("tai tai lieu") ||
             text.includes("tai pdf");
    }) || (modals.length > 0 ? modals[modals.length - 1] : null);
  }

  function isModalGenerating(modal) {
    if (!modal) return false;

    // 1. Kiểm tra spinner loading
    const spinner = modal.querySelector(".eds-loading, .eds-loading-mask, .is-loading, .eds-icon-loading, [class*='loading'], [class*='spinner']");
    if (spinner && isVisible(spinner)) {
      return true;
    }

    // 2. Kiểm tra text tiến trình
    const text = normalizeSearchText(modal.textContent);
    if (text.includes("dang tao") || text.includes("dang xu ly") || text.includes("vui long cho") || text.includes("dang tai")) {
      if (text.includes("hoan thanh") || text.includes("thanh cong") || text.includes("100%")) {
        return false;
      }
      return true;
    }

    // 3. Kiểm tra xem các nút tải có đang bị disabled không
    const buttons = Array.from(modal.querySelectorAll("button, .eds-button"));
    const downloadCandidates = buttons.filter(btn => {
      const t = normalizeSearchText(btn.textContent);
      return t.includes("tai") || t.includes("in") || t.includes("download");
    });
    if (downloadCandidates.length > 0) {
      const allDisabled = downloadCandidates.every(btn => 
        btn.disabled || btn.classList.contains("eds-button--disabled") || btn.classList.contains("is-disabled") || btn.getAttribute("aria-disabled") === "true"
      );
      if (allDisabled) return true;
    }

    return false;
  }

  function findDocDownloadButton(container) {
    if (!container) return null;
    const candidates = Array.from(container.querySelectorAll("button, a, [role='button'], .eds-button, .download-link"));

    // 1. Ưu tiên nút có text rõ ràng về tải file
    const downloadBtn = candidates.find((btn) => {
      const text = normalizeSearchText(btn.textContent);
      const isDownText = text.includes("tai ve") || 
                         text.includes("tai tai lieu") || 
                         text.includes("tai tap tin") || 
                         text.includes("tai pdf") || 
                         text.includes("tai xuong") || 
                         text.includes("in phieu") || 
                         text.includes("in tai lieu") || 
                         text === "tai" || 
                         text.includes("download");
      const isVisibleBtn = isVisible(btn);
      const isDisabled = btn.disabled || btn.classList.contains("eds-button--disabled") || btn.classList.contains("is-disabled") || btn.getAttribute("aria-disabled") === "true";
      return isDownText && isVisibleBtn && !isDisabled;
    });

    if (downloadBtn) return downloadBtn;

    // 2. Nút primary trong footer modal nếu đã kích hoạt
    const footerPrimary = container.querySelector(".eds-modal__footer button.eds-button--primary, .eds-modal__footer-buttons button.eds-button--primary");
    if (footerPrimary && isVisible(footerPrimary)) {
      const isDisabled = footerPrimary.disabled || footerPrimary.classList.contains("eds-button--disabled") || footerPrimary.classList.contains("is-disabled") || footerPrimary.getAttribute("aria-disabled") === "true";
      const text = normalizeSearchText(footerPrimary.textContent);
      if (!isDisabled && !text.includes("huy") && !text.includes("dong") && !text.includes("cancel")) {
        return footerPrimary;
      }
    }

    return null;
  }

  async function generateNormalPdfDoc() {
    let generateButton = null;

    // 1. Tìm nút Tạo phiếu (chờ tối đa 8 giây nếu Shopee đang xử lý)
    for (let attempt = 0; attempt < 40; attempt += 1) {
      generateButton = findGenerateDocButton();
      if (generateButton) break;
      await sleep(200);
    }

    if (!generateButton) {
      return {
        ok: false,
        message: "Không tìm thấy nút Tạo phiếu."
      };
    }

    // Cuộn đến nút Tạo phiếu
    generateButton.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(100);

    // Đặt cờ chờ tải PDF trước khi kích hoạt tạo phiếu
    try {
      chrome.storage.local.remove(["autoDownloadPrintDocCompleted"]);
      chrome.storage.local.set({ autoDownloadPrintDocPending: Date.now() });
    } catch (_) {}

    // 2. Di chuyển chuột vào ô nút Tạo phiếu để Shopee bung menu popper
    let pdfOption = null;
    for (let attempt = 0; attempt < 35; attempt += 1) {
      const currentGenBtn = findGenerateDocButton() || generateButton;
      emitRealHover(currentGenBtn);

      const spanChild = currentGenBtn.querySelector("span") || currentGenBtn.firstElementChild;
      if (spanChild) emitRealHover(spanChild);
      if (currentGenBtn.parentElement) emitRealHover(currentGenBtn.parentElement);

      // Kiểm tra xem menu popup chứa Phiếu PDF đã hiện ra chưa
      pdfOption = findNormalPdfDocOption();
      if (pdfOption) {
        // Nếu popper đang bị style display: none, cưỡng chế hiển thị
        const popper = pdfOption.closest(".eds-popper");
        if (popper && (popper.style.display === "none" || window.getComputedStyle(popper).display === "none")) {
          popper.style.setProperty("display", "block", "important");
          popper.style.setProperty("visibility", "visible", "important");
          popper.style.setProperty("opacity", "1", "important");
        }
        break;
      }

      await sleep(150);
    }

    if (!pdfOption) {
      return {
        ok: false,
        message: "Không tìm thấy mục Phiếu gửi hàng / Phiếu đóng gói PDF trong menu Tạo."
      };
    }

    // 3. Di chuyển chuột vào mục Phiếu PDF và click chọn để tạo PDF
    const itemLi = pdfOption.closest(".eds-dropdown-item, li") || pdfOption;
    itemLi.scrollIntoView({ block: "nearest", inline: "nearest" });
    emitRealHover(itemLi);
    emitRealHover(pdfOption);
    await sleep(200);

    if (typeof itemLi.click === "function") itemLi.click();
    emitRealClick(itemLi);
    if (pdfOption !== itemLi) {
      if (typeof pdfOption.click === "function") pdfOption.click();
      emitRealClick(pdfOption);
    }

    // 4. Đợi khi load xong và ấn tải PDF về cho user
    const startTime = Date.now();
    const maxWaitMs = 60000; // Đợi tối đa 60 giây

    while (Date.now() - startTime < maxWaitMs) {
      await sleep(400);

      // Kiểm tra nếu tab in mới đã tải xong PDF
      try {
        const completedRes = await new Promise(r => chrome.storage.local.get(["autoDownloadPrintDocCompleted"], r));
        if (completedRes?.autoDownloadPrintDocCompleted && completedRes.autoDownloadPrintDocCompleted >= startTime) {
          return {
            ok: true,
            message: "Đã tạo phiếu và tự động tải file PDF thành công."
          };
        }
      } catch (_) {}

      // Kiểm tra modal trên trang hiện tại
      const modal = findDocGenerationModal();
      if (modal) {
        const isGenerating = isModalGenerating(modal);
        if (!isGenerating) {
          const downloadBtn = findDocDownloadButton(modal);
          if (downloadBtn) {
            downloadBtn.scrollIntoView({ block: "center", inline: "nearest" });
            await sleep(150);
            emitRealHover(downloadBtn);
            await sleep(100);
            if (typeof downloadBtn.click === "function") downloadBtn.click();
            emitRealClick(downloadBtn);
            await sleep(800);

            return {
              ok: true,
              message: "Đã tạo phiếu và bấm Tải PDF về máy thành công."
            };
          }
        }
      } else {
        // Kiểm tra nút tải trên toàn document (nếu hiển thị trực tiếp ngoài modal)
        const downloadBtn = findDocDownloadButton(document);
        if (downloadBtn && downloadBtn !== generateButton) {
          downloadBtn.scrollIntoView({ block: "center", inline: "nearest" });
          await sleep(150);
          emitRealHover(downloadBtn);
          await sleep(100);
          if (typeof downloadBtn.click === "function") downloadBtn.click();
          emitRealClick(downloadBtn);
          await sleep(800);

          return {
            ok: true,
            message: "Đã tạo phiếu và bấm Tải PDF về máy thành công."
          };
        }
      }
    }

    return {
      ok: true,
      message: "Đã chọn Tạo phiếu PDF. Đang xử lý tải file PDF."
    };
  }

  function findExportWaitingOrdersButton() {
    const directButton = document.querySelector("button.export-with-modal");

    if (directButton && isVisible(directButton) && normalizeSearchText(directButton.textContent).includes("xuat")) {
      return directButton;
    }

    return Array.from(document.querySelectorAll("button")).find((button) => {
      const text = normalizeSearchText(button.textContent);
      return (text === "xuat" || text === "xuat file" || text.includes("xuat don") || text.includes("xuat bao")) && isVisible(button) && !button.closest(".eds-modal__content");
    }) || null;
  }

  function findExportWaitingOrdersModal() {
    return Array.from(document.querySelectorAll(".eds-modal__content")).find((modal) => {
      const title = normalizeSearchText(modal.querySelector(".eds-modal__title")?.textContent);

      return title.includes("xuat") && title.includes("don hang") && isVisible(modal);
    }) || null;
  }

  function findExportWaitingOrdersModalButton(modal) {
    return Array.from(modal.querySelectorAll(".eds-modal__footer-buttons button, button")).find((button) => {
      return normalizeSearchText(button.textContent) === "xuat" && isVisible(button) && !button.disabled;
    }) || null;
  }

  function findExportDownloadButton() {
    return Array.from(document.querySelectorAll(".eds-modal__content button, button")).find((button) => {
      return normalizeSearchText(button.textContent) === "tai ve" && isVisible(button) && !button.disabled;
    }) || null;
  }

  async function clickExportDownloadButton() {
    const downloadButton = findExportDownloadButton();

    if (!downloadButton) {
      return null;
    }

    downloadButton.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(100);
    emitRealClick(downloadButton);

    return {
      ok: true,
      message: "Da bam Tai ve."
    };
  }

  async function exportWaitingOrders() {
    const readyDownload = await clickExportDownloadButton();

    if (readyDownload) {
      return readyDownload;
    }

    let exportButton = null;

    for (let attempt = 0; attempt < 30; attempt += 1) {
      exportButton = findExportWaitingOrdersButton();
      if (exportButton) {
        break;
      }
      await sleep(500);
    }

    if (!exportButton) {
      return {
        ok: false,
        message: "Khong thay nut Xuat tren trang. Co the trang chua tai xong."
      };
    }

    exportButton.scrollIntoView({ block: "center", inline: "nearest" });
    await sleep(100);
    emitRealClick(exportButton);

    let modal = null;

    // Wait for either the modal to appear or the "Tai ve" button to appear
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await sleep(200);
      modal = findExportWaitingOrdersModal();
      if (modal) {
        break;
      }
      if (findExportDownloadButton()) {
        break;
      }
    }

    if (modal) {
      const modalExportButton = findExportWaitingOrdersModalButton(modal);

      if (modalExportButton) {
        modalExportButton.scrollIntoView({ block: "center", inline: "nearest" });
        await sleep(100);
        emitRealClick(modalExportButton);
      }
    }

    // Wait for the report to be generated and click Download
    for (let attempt = 0; attempt < 60; attempt += 1) {
      await sleep(500);

      if (await clickExportDownloadButton()) {
        return {
          ok: true,
          message: "Da bam Xuat va Tai ve thanh cong."
        };
      }
    }

    return {
      ok: true,
      message: "Da bam Xuat, nhung chua thay nut Tai ve sau 30s. Ban co the can tai thu cong."
    };
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "PRINT_FLOW_SELECT_CHECKBOX") {
      selectPrintFlowCheckbox().then(sendResponse);
      return true;
    }

    if (message?.type === "PRINT_FLOW_GET_WAREHOUSES") {
      getPrintWarehouses().then(sendResponse);
      return true;
    }

    if (message?.type === "PRINT_FLOW_SELECT_WAREHOUSE") {
      selectPrintWarehouse(message.name).then(sendResponse);
      return true;
    }

    if (message?.type === "PRINT_FLOW_GET_ADDRESSES") {
      getPickupAddresses().then(sendResponse);
      return true;
    }

    if (message?.type === "PRINT_FLOW_SELECT_ADDRESS") {
      selectPickupAddress(message.id).then(sendResponse);
      return true;
    }

    if (message?.type === "PRINT_FLOW_SELECT_ADDRESS_LOCATION") {
      selectPickupAddressLocation(message.location).then(sendResponse);
      return true;
    }

    if (message?.type === "PRINT_FLOW_ARRANGE_PICKUP") {
      arrangePickupConfirm().then(sendResponse);
      return true;
    }

    if (message?.type === "PRINT_FLOW_GENERATE_DOC") {
      generateNormalPdfDoc().then(sendResponse);
      return true;
    }

    if (message?.type === "PRINT_FLOW_EXPORT_WAITING_ORDERS") {
      exportWaitingOrders().then(sendResponse);
      return true;
    }

    return false;
  });

  injectScrollButtons();
  injectAwbDownloadButton();
  window.setInterval(injectAwbDownloadButton, 1500);
})();
