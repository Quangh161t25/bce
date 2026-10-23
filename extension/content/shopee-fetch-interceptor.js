/**
 * shopee-fetch-interceptor.js
 * Được inject trực tiếp vào trang Shopee (buyer) dưới dạng <script> tag.
 * Mục đích: Chặn (intercept) các request fetch của trang và lưu lại headers/cookies thật
 * để content script có thể replay lại request với đúng authentication.
 */
(function () {
  const CHANNEL_INTERCEPT = 'SPLQ_FETCH_INTERCEPTED';
  const CHANNEL_FETCH_REQUEST = 'SPLQ_FETCH_REQUEST';
  const CHANNEL_FETCH_REPLY = 'SPLQ_FETCH_REPLY';

  const origFetch = window.fetch;

  // Lắng nghe yêu cầu fetch từ content script
  window.addEventListener('message', async (e) => {
    if (e.source !== window || !e.data || e.data.channel !== CHANNEL_FETCH_REQUEST) return;
    const { messageId, url, headers } = e.data;
    try {
      const finalHeaders = Object.assign({
        'accept': 'application/json, text/plain, */*',
        'x-api-source': 'pc',
        'x-shopee-language': 'vi',
        'x-requested-with': 'XMLHttpRequest'
      }, window.__LAST_SHOPEE_BUYER_HEADERS__ || {}, headers || {});

      const res = await origFetch.call(window, url, {
        method: 'GET',
        headers: finalHeaders,
        credentials: 'include'
      });
      if (!res.ok) {
        window.postMessage({ channel: CHANNEL_FETCH_REPLY, messageId, data: null, error: `HTTP ${res.status}` }, '*');
        return;
      }
      const json = await res.json();
      window.postMessage({ channel: CHANNEL_FETCH_REPLY, messageId, data: json }, '*');
    } catch (err) {
      window.postMessage({ channel: CHANNEL_FETCH_REPLY, messageId, data: null, error: err.message }, '*');
    }
  });

  // Lắng nghe yêu cầu điền input/textarea React từ content script (chạy trong MAIN world)
  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || e.data.channel !== 'SPLQ_SET_REACT_VALUE') return;
    const { text, isSearch, selector } = e.data;
    try {
      let el = null;
      let container = null;
      if (selector) {
        el = document.querySelector(selector);
      }
      if (!el) {
        if (isSearch) {
          // 1. Click vào container div.shopee-react-input._2VVLYzIyBp theo đúng quy trình Shopee Webchat
          container = document.querySelector('div.shopee-react-input._2VVLYzIyBp, div._2VVLYzIyBp, div.shopee-react-input');
          if (container) {
            try {
              container.scrollIntoView({ block: 'center', inline: 'nearest' });
              container.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
              container.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
              container.click();
              const inner = container.querySelector('.shopee-react-input__inner');
              if (inner) inner.click();
            } catch (_) {}
            el = container.querySelector('input.shopee-react-input__input, input[placeholder*="Tìm kiếm"], input');
          }
          if (!el) {
            const allInputs = Array.from(document.querySelectorAll('input'));
            el = allInputs.find(i => {
              const ph = (i.getAttribute('placeholder') || '').toLowerCase();
              return (ph.includes('tìm kiếm') || ph.includes('search') || ph.includes('tìm')) && i.offsetParent !== null;
            }) || allInputs.find(i => {
              const ph = (i.getAttribute('placeholder') || '').toLowerCase();
              return ph.includes('tìm kiếm') || ph.includes('search') || ph.includes('tìm');
            }) || allInputs.find(i => {
              const cls = i.className || '';
              return cls.includes('shopee-react-input__input') && !i.closest('[data-cy="webchat-conversation-detail"]');
            }) || document.querySelector('input.shopee-react-input__input, input[placeholder*="Tìm kiếm"]');
          }
        } else {
          el = document.querySelector('textarea.E2MWg3w8y6, [data-cy="webchat-conversation-detail-input"] textarea, #inputField textarea, textarea[placeholder*="tin nhắn"], textarea');
        }
      }

      if (!el) return;

      // Click nút xóa cũ nếu có trước khi dán
      if (isSearch) {
        const clearBtn = container ? container.querySelector('.shopee-react-input__clear-btn, [class*="clear-btn"]') : document.querySelector('.shopee-react-input__clear-btn');
        if (clearBtn) {
          try { clearBtn.click(); } catch (_) {}
        }
      }

      el.focus();
      el.click();
      el.select();

      // 1. Reset tracker React
      if (el._valueTracker) {
        try { el._valueTracker.setValue(''); } catch (_) {}
      }

      // 2. Giả lập paste event trước (kích hoạt các listener dán của Shopee)
      try {
        const dt = new DataTransfer();
        dt.setData('text/plain', text);
        dt.setData('Text', text);
        el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
      } catch (_) {}

      // 3. Thử execCommand insertText
      let execOk = false;
      try {
        el.select();
        execOk = document.execCommand('insertText', false, text);
      } catch (_) {}

      // 4. Dùng prototype setter của MAIN world
      const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set ||
                     Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value')?.set;
      if (!execOk || el.value !== text) {
        if (setter) {
          setter.call(el, text);
        } else {
          el.value = text;
        }
      }

      // 5. Dispatch sự kiện
      try {
        el.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, cancelable: true, data: text, inputType: 'insertFromPaste' }));
      } catch (_) {}
      el.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      el.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

      // 6. Trực tiếp gọi React Props Handler
      const propKey = Object.keys(el).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
      if (propKey && el[propKey]) {
        const props = el[propKey];
        const syntheticEvent = {
          target: el,
          currentTarget: el,
          bubbles: true,
          defaultPrevented: false,
          persist: () => {},
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        if (typeof props.onInput === 'function') {
          try { props.onInput(syntheticEvent); } catch (_) {}
        }
        if (typeof props.onChange === 'function') {
          try { props.onChange(syntheticEvent); } catch (_) {}
        }
      }

      // 7. Nếu là tìm kiếm, kích hoạt Enter và click icon tìm kiếm
      if (isSearch) {
        setTimeout(() => {
          el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true }));
          el.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true }));
          el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true }));
          const searchIcon = container ? container.querySelector('._3OdQhKfJ0m, .shopee-react-input__prefix, svg.chat-icon') : null;
          if (searchIcon) {
            try { searchIcon.click(); } catch (_) {}
          }
        }, 250);
      }

      window.postMessage({ channel: 'SPLQ_SET_REACT_VALUE_DONE', ok: true, value: el.value }, '*');
    } catch (err) {
      console.warn('[Shopee MAIN Interceptor] Lỗi set react value:', err);
    }
  });

  // Lắng nghe yêu cầu click chọn hội thoại khách hàng trong MAIN world
  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || e.data.channel !== 'SPLQ_CLICK_CONVERSATION_ITEM') return;
    const { buyerName } = e.data;
    try {
      const cleanTarget = String(buyerName || '').toLowerCase().trim();
      let targetEl = null;

      // 1. Tìm span.nFvbiqyLrq hoặc div[title] có chứa tên khách
      const allSpans = Array.from(document.querySelectorAll('span.nFvbiqyLrq, [class*="nFvbiqyLrq"], div.RWr1KSlda2, [class*="RWr1KSlda2"], div.uvqQaOy6aO, [title]'));
      for (const sp of allSpans) {
        const txt = (sp.textContent || sp.getAttribute('title') || '').toLowerCase().trim();
        if (cleanTarget && (txt === cleanTarget || txt.includes(cleanTarget))) {
          targetEl = sp.closest('.SW7LUhQFDH, .AV0w9P7wpj, .flWmPLsUAa, [class*="SW7LUhQFDH"], div[role="listitem"]') || sp;
          break;
        }
      }

      // 2. Nếu chưa thấy, tìm trong các item class SW7LUhQFDH
      if (!targetEl) {
        const items = Array.from(document.querySelectorAll('div.SW7LUhQFDH, div.AV0w9P7wpj, div.flWmPLsUAa, [class*="SW7LUhQFDH"], [data-cy*="conversation-list-item"], div[role="listitem"]'));
        if (items.length > 0) {
          if (cleanTarget) {
            targetEl = items.find(it => (it.textContent || '').toLowerCase().includes(cleanTarget)) || items[0];
          } else {
            targetEl = items[0];
          }
        }
      }

      if (targetEl) {
        try {
          targetEl.scrollIntoView({ block: 'center', inline: 'nearest' });
        } catch (_) {}

        const triggerEvts = (el) => {
          if (!el) return;
          ['mouseenter', 'mouseover', 'pointerdown', 'mousedown', 'focus', 'pointerup', 'mouseup', 'click'].forEach(evtName => {
            try {
              if (evtName.startsWith('pointer')) {
                el.dispatchEvent(new PointerEvent(evtName, { bubbles: true, cancelable: true, view: window }));
              } else if (evtName === 'focus') {
                el.focus();
              } else {
                el.dispatchEvent(new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window }));
              }
            } catch (_) {}
          });
          try { el.click(); } catch (_) {}
        };

        triggerEvts(targetEl);

        const inner = targetEl.querySelector('span.nFvbiqyLrq, .nFvbiqyLrq, div.RWr1KSlda2, div.uR4DA9zSmz, span, div');
        if (inner && inner !== targetEl) {
          triggerEvts(inner);
        }

        // Gọi React props onClick nếu có
        const propKey = Object.keys(targetEl).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
        if (propKey && targetEl[propKey] && typeof targetEl[propKey].onClick === 'function') {
          try {
            targetEl[propKey].onClick({
              target: targetEl,
              currentTarget: targetEl,
              bubbles: true,
              defaultPrevented: false,
              persist: () => {},
              preventDefault: () => {},
              stopPropagation: () => {}
            });
          } catch (_) {}
        }
      }
    } catch (err) {
      console.warn('[Shopee MAIN Interceptor] Lỗi click conversation item:', err);
    }
  });

  // Lắng nghe yêu cầu click nút gửi tin nhắn (theo SVG icon user cung cấp) trong MAIN world
  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || e.data.channel !== 'SPLQ_CLICK_SEND_BUTTON') return;
    try {
      // 1. Tìm theo path d của icon gửi tin nhắn chính xác: M4 14.497v3.724L18.409 12...
      const sendPaths = Array.from(document.querySelectorAll('svg path')).filter(p => {
        const d = p.getAttribute('d') || '';
        return d.includes('M4 14.497') || d.includes('18.409 12') || d.includes('2.698 3.038') || d.includes('18.63 8.044');
      });

      let btn = null;
      if (sendPaths.length > 0) {
        const pathEl = sendPaths[sendPaths.length - 1];
        btn = pathEl.closest('button, [role="button"], i, div._3OdQhKfJ0m, div') || pathEl.closest('svg') || pathEl;
      }

      if (!btn) {
        btn = document.querySelector(
          '.XsR3zIeGOc, .kgP1yPCqxR, [data-cy="webchat-conversation-detail-input"] [class*="send"], button[class*="send"], [data-cy="send-btn"], button[type="submit"]'
        );
      }

      if (btn) {
        ['mouseenter', 'mouseover', 'pointerdown', 'mousedown', 'focus', 'pointerup', 'mouseup', 'click'].forEach(evtName => {
          try {
            if (evtName.startsWith('pointer')) {
              btn.dispatchEvent(new PointerEvent(evtName, { bubbles: true, cancelable: true, view: window }));
            } else if (evtName === 'focus') {
              btn.focus();
            } else {
              btn.dispatchEvent(new MouseEvent(evtName, { bubbles: true, cancelable: true, view: window }));
            }
          } catch (_) {}
        });
        try { btn.click(); } catch (_) {}

        // Kích hoạt React onClick props nếu có
        const propKey = Object.keys(btn).find(k => k.startsWith('__reactProps$') || k.startsWith('__reactEventHandlers$'));
        if (propKey && btn[propKey] && typeof btn[propKey].onClick === 'function') {
          try {
            btn[propKey].onClick({
              target: btn,
              currentTarget: btn,
              bubbles: true,
              defaultPrevented: false,
              persist: () => {},
              preventDefault: () => {},
              stopPropagation: () => {}
            });
          } catch (_) {}
        }
      }
    } catch (err) {
      console.warn('[Shopee MAIN Interceptor] Lỗi click send button:', err);
    }
  });

  // ============================================================
  // Tải Ảnh Shopee PDP Parser
  // ============================================================
  function parsePdpData(f) {
    try {
      const data = f?.data || {};
      const title = data?.item?.title || '';

      let categoryImages = [];
      const variations = data?.product_images?.first_tier_variations;
      if (Array.isArray(variations)) {
        categoryImages = variations.map(k => ({
          sku: k?.name || '',
          name: k?.name || '',
          image: k?.image ? 'https://down-id.img.susercontent.com/file/' + k.image : ''
        })).filter(x => x.image);
      }

      let mainImages = [];
      const images = data?.product_images?.images;
      if (Array.isArray(images)) {
        mainImages = images.map(k => 'https://down-id.img.susercontent.com/file/' + k);
      }

      let descriptionImages = [];
      let pList = data?.rich_text_description?.paragraph_list || data?.item?.rich_text_description?.paragraph_list;
      if (Array.isArray(pList)) {
        descriptionImages = pList.filter(k => k?.img_id).map(k => 'https://down-id.img.susercontent.com/file/' + k.img_id);
      }

      let videos = [];
      const vid = data?.product_images?.video;
      if (vid && vid.video_id) {
        videos = [{
          src: 'https://cvf.shopee.com/file/' + vid.video_id,
          cover: vid.thumb_url ? 'https://down-id.img.susercontent.com/file/' + vid.thumb_url : ''
        }];
      }

      const productData = {
        isProduct: true,
        title: title || document.title || '',
        mainImages,
        categoryImages,
        descriptionImages,
        videos
      };
      window.postMessage({ action: 'sendShopeeProductDataExt', data: productData }, '*');
    } catch (e) {
      console.warn('[Shopee MAIN Interceptor] Pdp parse error:', e);
    }
  }

  // ============================================================
  // Địa chỉ lấy hàng (address_id) cho Order Tool
  // ============================================================
  const CHANNEL_PICKUP = 'SPLQ_PICKUP_ADDRESS';
  const isPickupUrl = (u) => /get_pickup_time_slots|batch_init_orders|init_order|mass_ship|pickup/i.test(u || '');
  const isAddressUrl = (u) => /address|pickup/i.test(u || '');

  const postPickupAddresses = (list) => {
    if (list && list.length) window.postMessage({ channel: CHANNEL_PICKUP, list }, '*');
  };

  function fromBody(url, body) {
    if (!isPickupUrl(url) || typeof body !== 'string') return;
    try {
      const j = JSON.parse(body);
      const id = Number(j.address_id || j.pickup_address_id || 0);
      if (id > 0) postPickupAddresses([{ id: String(id), name: '' }]);
    } catch (_) {}
  }

  function fromResponse(url, text) {
    if (!isAddressUrl(url) || !text) return;
    let json;
    try { json = JSON.parse(text); } catch (_) { return; }
    const found = [];
    (function walk(o, depth) {
      if (!o || typeof o !== 'object' || depth > 8) return;
      if (Array.isArray(o)) { o.forEach((x) => walk(x, depth + 1)); return; }
      const id = Number(o.address_id || o.pickup_address_id || 0);
      const label = [o.name, o.address_name, o.full_address, o.address, o.district, o.city, o.state]
        .filter((v) => typeof v === 'string' && v.trim()).join(', ');
      if (id > 0 && label) found.push({ id: String(id), name: label.slice(0, 120) });
      for (const k of Object.keys(o)) walk(o[k], depth + 1);
    })(json, 0);
    postPickupAddresses(found);
  }

  // ============================================================
  // Header capture helper
  // ============================================================
  function captureHeadersFromOptions(url, options) {
    if (!url || typeof url !== 'string' || !url.includes('/api/')) return;
    let reqHeaders = options?.headers || {};
    let h = {};
    if (reqHeaders instanceof Headers) {
      reqHeaders.forEach((val, key) => { h[key] = val; });
    } else if (Array.isArray(reqHeaders)) {
      reqHeaders.forEach(([key, val]) => { h[key] = val; });
    } else if (reqHeaders && typeof reqHeaders === 'object') {
      Object.assign(h, reqHeaders);
    }
    if (Object.keys(h).length > 0) {
      window.__LAST_SHOPEE_BUYER_HEADERS__ = Object.assign({}, window.__LAST_SHOPEE_BUYER_HEADERS__ || {}, h);
    }
  }

  // ============================================================
  // Intercept window.fetch (Single, Non-recursive, Safe)
  // ============================================================
  if (typeof origFetch === 'function') {
    window.fetch = async function (...args) {
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url || '');
      const init = args[1];

      try {
        captureHeadersFromOptions(url, init);
      } catch (_) {}

      try {
        fromBody(url, init && init.body);
      } catch (_) {}

      // Gọi native fetch gốc - an toàn tuyệt đối, không đệ quy
      const result = await origFetch.apply(this, args);

      try {
        // Bắt Order API của Shopee Seller
        if (url.includes('/api/') && (url.includes('/order') || url.includes('/sale') || url.includes('order_list') || url.includes('search_order'))) {
          let reqHeaders = init?.headers || {};
          let h = {};
          if (reqHeaders instanceof Headers) {
            reqHeaders.forEach((val, key) => { h[key] = val; });
          } else if (Array.isArray(reqHeaders)) {
            reqHeaders.forEach(([key, val]) => { h[key] = val; });
          } else if (reqHeaders && typeof reqHeaders === 'object') {
            Object.assign(h, reqHeaders);
          }
          window.__LAST_SHOPEE_ORDER_API__ = {
            url,
            headers: h,
            timestamp: Date.now()
          };
        }

        // Bắt địa chỉ lấy hàng
        if (isAddressUrl(url)) {
          result.clone().text().then((t) => fromResponse(url, t)).catch(() => {});
        }

        // Bắt thông tin PDP cho tải ảnh & đọc sản phẩm
        if (url.includes('/api/v4/pdp/get_pc')) {
          result.clone().json().then(json => parsePdpData(json)).catch(() => {});
        }

        // Bắt thông tin sản phẩm / shop để lưu cache
        if (url.includes('/api/') && (
          url.includes('item_id') || url.includes('itemid') ||
          url.includes('shop_id') || url.includes('shopid') ||
          url.includes('/pdp/') || url.includes('/shop/') ||
          url.includes('search_items') || url.includes('rcmd_items') ||
          url.includes('recommend')
        )) {
          const mShop = url.match(/[?&](?:shop_?id|match_id)=(\d+)/i) || url.match(/\/shop\/(\d+)/i);
          if (mShop && mShop[1]) {
            window.__LAST_DETECTED_SHOP_ID__ = mShop[1];
          }

          result.clone().json().then(json => {
            let reqHeaders = init?.headers || {};
            let h = {};
            if (reqHeaders instanceof Headers) {
              reqHeaders.forEach((val, key) => { h[key] = val; });
            } else if (Array.isArray(reqHeaders)) {
              reqHeaders.forEach(([key, val]) => { h[key] = val; });
            } else if (reqHeaders && typeof reqHeaders === 'object') {
              Object.assign(h, reqHeaders);
            }

            const sid = json?.data?.shopid || json?.data?.shop_id || json?.shopid || json?.shop_id;
            if (sid) {
              window.__LAST_DETECTED_SHOP_ID__ = String(sid);
            }

            window.postMessage({
              channel: CHANNEL_INTERCEPT,
              url: url,
              headers: h,
              data: json
            }, '*');
          }).catch(() => {});
        }
      } catch (_) {}

      return result;
    };
  }

  // ============================================================
  // Intercept XMLHttpRequest (Prototype-based, Safe)
  // ============================================================
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  const origSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

  XMLHttpRequest.prototype.open = function (method, url) {
    this.__splqUrl = String(url || '');
    this.__splqHeaders = {};
    return origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    if (!this.__splqHeaders) this.__splqHeaders = {};
    this.__splqHeaders[header] = value;
    if (header && typeof header === 'string' && (/^af-ac-enc|^x-sap-|^x-sz-|^x-csrftoken/i.test(header) || header.toLowerCase().includes('af-ac-enc'))) {
      window.__LAST_SHOPEE_BUYER_HEADERS__ = window.__LAST_SHOPEE_BUYER_HEADERS__ || {};
      window.__LAST_SHOPEE_BUYER_HEADERS__[header] = value;
    }
    return origSetRequestHeader.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    try {
      const url = this.__splqUrl || '';
      if (this.__splqHeaders && Object.keys(this.__splqHeaders).length > 0 && url.includes('/api/')) {
        window.__LAST_SHOPEE_BUYER_HEADERS__ = Object.assign({}, window.__LAST_SHOPEE_BUYER_HEADERS__ || {}, this.__splqHeaders);
      }
      fromBody(url, body);
      if (isAddressUrl(url)) {
        this.addEventListener('load', () => {
          try {
            fromResponse(url, (this.responseType === '' || this.responseType === 'text') ? this.responseText : '');
          } catch (_) {}
        });
      }
      if (url.includes('/api/v4/pdp/get_pc')) {
        this.addEventListener('load', () => {
          try {
            parsePdpData(JSON.parse(this.responseText));
          } catch (_) {}
        });
      }
    } catch (_) {}
    return origSend.apply(this, arguments);
  };
})();
