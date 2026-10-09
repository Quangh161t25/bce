(function() {
    const btnRead = document.getElementById('btn-read-hang-hoan');
    const tbody = document.getElementById('hang-hoan-tbody');
    
    // Filters state
    let activeInfoFilter = 'ALL'; // 'ALL', 'NO', 'YES'
    let activeReturnFilter = 'ALL'; // 'ALL', 'YES', 'NO'
    let allHangHoanData = [];

    // ==========================================
    // 1. STATE & STORAGE CHO ẢNH HÀNG HOÀN
    // ==========================================
    let hangHoanPhotos = [];
    let currentCameraStream = null;
    let isCameraMirrored = false;
    let activeTargetOrderId = '';
    let activeTargetTracking = '';

    // Load ảnh từ chrome.storage.local
    async function loadHangHoanPhotos() {
        try {
            const res = await chrome.storage.local.get(['hangHoanPhotos']);
            hangHoanPhotos = Array.isArray(res?.hangHoanPhotos) ? res.hangHoanPhotos : [];
            updatePhotoBadges();
            renderGalleryGrid();
            renderHangHoanTable();
        } catch (e) {
            console.error('Lỗi tải ảnh hàng hoàn:', e);
        }
    }

    // Lưu ảnh vào storage
    async function saveHangHoanPhoto(photoObj) {
        hangHoanPhotos.unshift(photoObj);
        try {
            await chrome.storage.local.set({ hangHoanPhotos: hangHoanPhotos });
        } catch (e) {
            console.error('Lỗi lưu ảnh vào storage:', e);
        }
        updatePhotoBadges();
        renderGalleryGrid();
        renderHangHoanTable();
        appendRecentSnap(photoObj);
    }

    // Xóa 1 ảnh
    async function deleteHangHoanPhoto(photoId) {
        hangHoanPhotos = hangHoanPhotos.filter(p => p.id !== photoId);
        try {
            await chrome.storage.local.set({ hangHoanPhotos: hangHoanPhotos });
        } catch (e) {
            console.error('Lỗi cập nhật storage sau khi xóa:', e);
        }
        updatePhotoBadges();
        renderGalleryGrid();
        renderHangHoanTable();
        showHhToast('🗑️ Đã xóa ảnh.');
    }

    // Xóa tất cả ảnh
    async function clearAllHangHoanPhotos() {
        if (!confirm('Bạn có chắc chắn muốn xóa TẤT CẢ ảnh hàng hoàn đã lưu không?')) return;
        hangHoanPhotos = [];
        try {
            await chrome.storage.local.set({ hangHoanPhotos: [] });
        } catch (e) {}
        updatePhotoBadges();
        renderGalleryGrid();
        renderHangHoanTable();
        showHhToast('🗑️ Đã xóa toàn bộ thư viện ảnh.');
    }

    // Lắng nghe thay đổi storage từ camera.html hoặc tab khác
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.hangHoanPhotos) {
            hangHoanPhotos = Array.isArray(changes.hangHoanPhotos.newValue) ? changes.hangHoanPhotos.newValue : [];
            updatePhotoBadges();
            renderGalleryGrid();
            renderHangHoanTable();
        }
    });

    // Cập nhật số lượng ảnh trên badge
    function updatePhotoBadges() {
        const totalBadge = document.getElementById('hh-total-photo-badge');
        if (totalBadge) totalBadge.textContent = hangHoanPhotos.length;
        const galleryCountBadge = document.getElementById('hh-gallery-count-badge');
        if (galleryCountBadge) galleryCountBadge.textContent = `(${hangHoanPhotos.length} ảnh)`;
    }

    // Lọc ảnh theo mã đơn / mã vận đơn
    function getPhotosForOrder(orderId, trackingNum) {
        const oId = (orderId || '').trim().toLowerCase();
        const trk = (trackingNum || '').trim().toLowerCase();
        if (!oId && !trk) return [];
        return hangHoanPhotos.filter(p => {
            const pOrder = (p.orderId || '').trim().toLowerCase();
            const pTrk = (p.trackingNum || '').trim().toLowerCase();
            return (oId && pOrder === oId) || (trk && pTrk === trk) || (oId && pTrk === oId) || (trk && pOrder === trk);
        });
    }

    // Nén và chuẩn hóa ảnh (max 1280px, jpeg 0.85) để tiết kiệm bộ nhớ và lưu nhanh
    function compressAndResizeImage(source, maxWidth = 1280, maxHeight = 1280, quality = 0.85) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            if (typeof source === 'string') {
                img.src = source;
            } else if (source instanceof Blob || source instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => { img.src = e.target.result; };
                reader.onerror = reject;
                reader.readAsDataURL(source);
            }
        });
    }

    // Xử lý nạp file ảnh
    async function processAndSaveImageFile(file, orderId = '', trackingNum = '') {
        try {
            const compressed = await compressAndResizeImage(file, 1280, 1280, 0.85);
            const photoObj = {
                id: 'hh_img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                orderId: (orderId || '').trim(),
                trackingNum: (trackingNum || '').trim(),
                dataUrl: compressed,
                fileName: file.name || `photo_${Date.now()}.jpg`,
                createdAt: Date.now(),
                source: 'file'
            };
            await saveHangHoanPhoto(photoObj);
            return photoObj;
        } catch (err) {
            console.error('Lỗi nén ảnh file:', err);
            return null;
        }
    }

    // Toast hiển thị thông báo nhẹ nhàng
    function showHhToast(msg) {
        let toast = document.getElementById('hh-toast-notice');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'hh-toast-notice';
            toast.style.cssText = 'position: fixed; bottom: 16px; right: 16px; background: #0f172a; color: white; padding: 8px 14px; border-radius: 6px; font-size: 11px; font-weight: 600; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 9999999; display: flex; align-items: center; gap: 6px; transition: all 0.2s ease; border-left: 4px solid #38bdf8;';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
        }, 2500);
    }

    // ==========================================
    // 2. CAMERA LIVE STUDIO (TỰ CHỤP ẢNH RIÊNG)
    // ==========================================
    const cameraStudio = document.getElementById('hh-camera-studio');
    const videoStream = document.getElementById('hh-video-stream');
    const btnCameraToggle = document.getElementById('btn-hh-camera');
    const btnCameraClose = document.getElementById('btn-hh-camera-close');
    const btnCameraMirror = document.getElementById('btn-hh-camera-mirror');
    const deviceSelect = document.getElementById('hh-camera-device-select');
    const cameraOrderInput = document.getElementById('hh-camera-order-input');
    const cameraTargetLabel = document.getElementById('hh-camera-target-label');
    const btnSnap = document.getElementById('btn-hh-snap');
    const cameraFlash = document.getElementById('hh-camera-flash');
    const cameraStatusMsg = document.getElementById('hh-camera-status-msg');
    const recentSnapsStrip = document.getElementById('hh-recent-snaps');
    const btnOpenCamWindow = document.getElementById('btn-hh-open-cam-window');

    async function startCameraStream(deviceId = null) {
        stopCameraStream();
        showCameraStatus('Đang kết nối camera...');

        const constraints = {
            video: deviceId 
                ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                : { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        };

        try {
            currentCameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoStream) {
                videoStream.srcObject = currentCameraStream;
                videoStream.play();
            }
            hideCameraStatus();
            await loadCameraDevices();
            return true;
        } catch (err) {
            console.warn('Fallback standard camera constraints:', err);
            try {
                currentCameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoStream) {
                    videoStream.srcObject = currentCameraStream;
                    videoStream.play();
                }
                hideCameraStatus();
                await loadCameraDevices();
                return true;
            } catch (err2) {
                console.error('Lỗi camera:', err2);
                let errText = 'Không thể mở Camera.';
                if (err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError') {
                    errText = '⚠️ Trình duyệt chưa cấp quyền Camera. Hãy mở cửa sổ riêng hoặc kiểm tra cài đặt Chrome!';
                } else if (err2.name === 'NotFoundError' || err2.name === 'DevicesNotFoundError') {
                    errText = '⚠️ Không tìm thấy thiết bị Camera trên máy này. Hãy bấm "Chọn từ file"!';
                }
                showCameraStatus(errText);
                return false;
            }
        }
    }

    function stopCameraStream() {
        if (currentCameraStream) {
            currentCameraStream.getTracks().forEach(t => t.stop());
            currentCameraStream = null;
        }
        if (videoStream) videoStream.srcObject = null;
    }

    function showCameraStatus(msg) {
        if (!cameraStatusMsg) return;
        cameraStatusMsg.textContent = msg;
        cameraStatusMsg.style.display = 'block';
    }

    function hideCameraStatus() {
        if (cameraStatusMsg) cameraStatusMsg.style.display = 'none';
    }

    async function loadCameraDevices() {
        if (!deviceSelect) return;
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            deviceSelect.innerHTML = '';
            videoDevices.forEach((dev, idx) => {
                const opt = document.createElement('option');
                opt.value = dev.deviceId;
                opt.textContent = dev.label || `Camera ${idx + 1}`;
                deviceSelect.appendChild(opt);
            });
            deviceSelect.style.display = videoDevices.length > 1 ? 'inline-block' : 'none';
        } catch (e) {
            deviceSelect.style.display = 'none';
        }
    }

    function openCameraStudio(orderId = '', trackingNum = '') {
        activeTargetOrderId = (orderId || '').trim();
        activeTargetTracking = (trackingNum || '').trim();

        if (cameraStudio) cameraStudio.style.display = 'block';
        if (cameraOrderInput) cameraOrderInput.value = activeTargetOrderId || activeTargetTracking || '';

        if (cameraTargetLabel) {
            if (activeTargetOrderId || activeTargetTracking) {
                cameraTargetLabel.textContent = `Đơn: ${activeTargetOrderId || activeTargetTracking}`;
                cameraTargetLabel.style.display = 'inline-block';
            } else {
                cameraTargetLabel.style.display = 'none';
            }
        }

        startCameraStream();
        cameraStudio?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function closeCameraStudio() {
        stopCameraStream();
        if (cameraStudio) cameraStudio.style.display = 'none';
        activeTargetOrderId = '';
        activeTargetTracking = '';
    }

    function appendRecentSnap(photoObj) {
        if (!recentSnapsStrip) return;
        const imgEl = document.createElement('img');
        imgEl.src = photoObj.dataUrl;
        imgEl.style.cssText = 'width: 36px; height: 36px; border-radius: 4px; border: 1.5px solid #38bdf8; object-fit: cover; cursor: pointer; flex-shrink: 0;';
        imgEl.title = `Xem ảnh: ${photoObj.orderId || 'Tự do'} (${new Date(photoObj.createdAt).toLocaleTimeString()})`;
        imgEl.addEventListener('click', () => openLightbox(photoObj));
        recentSnapsStrip.appendChild(imgEl);
    }

    // Bắt sự kiện nút bật camera
    btnCameraToggle?.addEventListener('click', () => {
        if (cameraStudio?.style.display === 'block') {
            closeCameraStudio();
        } else {
            openCameraStudio();
        }
    });

    btnCameraClose?.addEventListener('click', () => closeCameraStudio());

    btnCameraMirror?.addEventListener('click', () => {
        isCameraMirrored = !isCameraMirrored;
        if (videoStream) {
            videoStream.style.transform = isCameraMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        }
    });

    deviceSelect?.addEventListener('change', () => {
        startCameraStream(deviceSelect.value);
    });

    // Mở cửa sổ riêng biệt camera.html
    btnOpenCamWindow?.addEventListener('click', () => {
        const orderVal = (cameraOrderInput?.value || activeTargetOrderId || '').trim();
        const url = `camera.html${orderVal ? `?orderId=${encodeURIComponent(orderVal)}` : ''}`;
        chrome.windows.create({
            url: url,
            type: 'popup',
            width: 520,
            height: 640
        });
    });

    // Bấm nút CHỤP ẢNH
    btnSnap?.addEventListener('click', async () => {
        if (!videoStream || !videoStream.videoWidth) {
            alert('Camera chưa sẵn sàng hoặc chưa bật!');
            return;
        }

        // Hiệu ứng flash chớp sáng
        if (cameraFlash) {
            cameraFlash.style.opacity = '0.8';
            setTimeout(() => { cameraFlash.style.opacity = '0'; }, 120);
        }

        const canvas = document.createElement('canvas');
        canvas.width = videoStream.videoWidth;
        canvas.height = videoStream.videoHeight;
        const ctx = canvas.getContext('2d');

        if (isCameraMirrored) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(videoStream, 0, 0, canvas.width, canvas.height);

        const rawUrl = canvas.toDataURL('image/jpeg', 0.88);
        const compressed = await compressAndResizeImage(rawUrl, 1280, 1280, 0.85);

        const targetOrder = (cameraOrderInput?.value || activeTargetOrderId || '').trim();
        const targetTracking = activeTargetTracking || '';

        const photoObj = {
            id: 'hh_img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            orderId: targetOrder,
            trackingNum: targetTracking,
            dataUrl: compressed,
            fileName: `snap_${targetOrder ? targetOrder + '_' : ''}${Date.now()}.jpg`,
            createdAt: Date.now(),
            source: 'camera'
        };

        await saveHangHoanPhoto(photoObj);
        showHhToast(`📸 Đã chụp và lưu ảnh${targetOrder ? ` (Đơn: ${targetOrder})` : ''}!`);
    });

    // ==========================================
    // 3. CHỌN ẢNH TỪ FILE (MÁY TÍNH / THƯ MỤC)
    // ==========================================
    const btnPickFile = document.getElementById('btn-hh-pick-file');
    const inputFiles = document.getElementById('input-hh-files');

    btnPickFile?.addEventListener('click', () => {
        activeTargetOrderId = (cameraOrderInput?.value || '').trim();
        inputFiles?.click();
    });

    inputFiles?.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const targetOrder = activeTargetOrderId || (cameraOrderInput?.value || '').trim();
        const targetTracking = activeTargetTracking || '';

        let savedCount = 0;
        for (const file of files) {
            const photoObj = await processAndSaveImageFile(file, targetOrder, targetTracking);
            if (photoObj) savedCount++;
        }

        inputFiles.value = '';
        activeTargetOrderId = '';
        activeTargetTracking = '';

        if (savedCount > 0) {
            showHhToast(`📁 Đã nạp ${savedCount} ảnh từ file máy tính!`);
        }
    });

    // ==========================================
    // 4. DÁN ẢNH (CTRL + V) VÀ KÉO THẢ (DRAG & DROP)
    // ==========================================
    document.addEventListener('paste', async (e) => {
        const tabHangHoan = document.getElementById('tab-hang-hoan');
        if (!tabHangHoan || tabHangHoan.hidden) return;

        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                e.preventDefault();
                const file = items[i].getAsFile();
                if (file) {
                    const targetOrder = (cameraOrderInput?.value || activeTargetOrderId || '').trim();
                    const photoObj = await processAndSaveImageFile(file, targetOrder, activeTargetTracking);
                    if (photoObj) {
                        photoObj.source = 'paste';
                        showHhToast(`📋 Đã dán 1 ảnh từ clipboard${targetOrder ? ` (Đơn: ${targetOrder})` : ''}!`);
                    }
                }
            }
        }
    });

    const dropZone = document.getElementById('tab-hang-hoan');
    if (dropZone) {
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.boxShadow = 'inset 0 0 0 2px #0284c7';
        });
        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.style.boxShadow = '';
        });
        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.style.boxShadow = '';
            const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
            if (!files.length) return;

            const targetOrder = (cameraOrderInput?.value || activeTargetOrderId || '').trim();
            let count = 0;
            for (const f of files) {
                const photoObj = await processAndSaveImageFile(f, targetOrder, activeTargetTracking);
                if (photoObj) count++;
            }
            if (count > 0) {
                showHhToast(`📥 Đã thêm ${count} ảnh từ file kéo thả!`);
            }
        });
    }

    // ==========================================
    // 5. THƯ VIỆN ẢNH (GALLERY DRAWER)
    // ==========================================
    const btnToggleGallery = document.getElementById('btn-hh-toggle-gallery');
    const galleryPanel = document.getElementById('hh-gallery-panel');
    const galleryGrid = document.getElementById('hh-gallery-grid');
    const gallerySearch = document.getElementById('hh-gallery-search');
    const btnGalleryClose = document.getElementById('btn-hh-gallery-close');
    const btnGalleryClearAll = document.getElementById('btn-hh-gallery-clear-all');

    btnToggleGallery?.addEventListener('click', () => {
        if (!galleryPanel) return;
        const isHidden = galleryPanel.style.display === 'none';
        galleryPanel.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            renderGalleryGrid();
            galleryPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });

    btnGalleryClose?.addEventListener('click', () => {
        if (galleryPanel) galleryPanel.style.display = 'none';
    });

    btnGalleryClearAll?.addEventListener('click', () => clearAllHangHoanPhotos());

    gallerySearch?.addEventListener('input', () => renderGalleryGrid());

    function renderGalleryGrid() {
        if (!galleryGrid) return;
        const query = (gallerySearch?.value || '').trim().toLowerCase();

        let filtered = hangHoanPhotos;
        if (query) {
            filtered = filtered.filter(p => 
                (p.orderId && p.orderId.toLowerCase().includes(query)) ||
                (p.trackingNum && p.trackingNum.toLowerCase().includes(query)) ||
                (p.fileName && p.fileName.toLowerCase().includes(query))
            );
        }

        if (filtered.length === 0) {
            galleryGrid.innerHTML = `
                <div style="grid-column: 1 / -1; padding: 20px; text-align: center; color: #94a3b8; font-size: 11px;">
                    ${query ? 'Không tìm thấy ảnh phù hợp với từ khóa.' : 'Chưa có ảnh nào. Bấm [📸 Tự chụp ảnh] hoặc [📁 Chọn từ file] để thêm ảnh!'}
                </div>
            `;
            return;
        }

        galleryGrid.innerHTML = '';
        filtered.forEach(photo => {
            const card = document.createElement('div');
            card.style.cssText = 'position: relative; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; background: #f8fafc; display: flex; flex-direction: column;';

            card.innerHTML = `
                <img src="${photo.dataUrl}" style="width: 100%; height: 75px; object-fit: cover; cursor: pointer;" title="Bấm để xem ảnh phóng to">
                <div style="padding: 3px 5px; font-size: 10px; line-height: 1.2; border-top: 1px solid #f1f5f9;">
                    <div style="font-weight: 700; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${photo.orderId || 'Ảnh tự do'}">
                        ${photo.orderId || 'Ảnh tự do'}
                    </div>
                    <div style="font-size: 9px; color: #64748b;">${new Date(photo.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div style="display: flex; gap: 2px; padding: 2px 4px; border-top: 1px solid #f1f5f9; background: #fff;">
                    <button type="button" class="btn-thumb-view" style="flex: 1; padding: 2px 0; font-size: 9.5px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 3px; cursor: pointer;" title="Xem to">👁️</button>
                    <button type="button" class="btn-thumb-download" style="flex: 1; padding: 2px 0; font-size: 9.5px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 3px; cursor: pointer;" title="Tải về máy">⬇️</button>
                    <button type="button" class="btn-thumb-del" style="flex: 1; padding: 2px 0; font-size: 9.5px; background: #fee2e2; border: 1px solid #fca5a5; color: #dc2626; border-radius: 3px; cursor: pointer;" title="Xóa">🗑️</button>
                </div>
            `;

            card.querySelector('img').addEventListener('click', () => openLightbox(photo));
            card.querySelector('.btn-thumb-view').addEventListener('click', () => openLightbox(photo));
            card.querySelector('.btn-thumb-download').addEventListener('click', () => downloadPhoto(photo));
            card.querySelector('.btn-thumb-del').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Xóa ảnh này?')) deleteHangHoanPhoto(photo.id);
            });

            galleryGrid.appendChild(card);
        });
    }

    // ==========================================
    // 6. LIGHTBOX PHÓNG TO ẢNH & CATBOX UPLOAD
    // ==========================================
    const lightboxModal = document.getElementById('hh-lightbox-modal');
    const lightboxImg = document.getElementById('hh-lightbox-img');
    const lightboxInfo = document.getElementById('hh-lightbox-info');
    const lightboxLink = document.getElementById('hh-lightbox-link');
    const btnLightboxClose = document.getElementById('btn-hh-lightbox-close');
    const btnLightboxDownload = document.getElementById('btn-hh-lightbox-download');
    const btnLightboxCopy = document.getElementById('btn-hh-lightbox-copy');
    const btnLightboxCatbox = document.getElementById('btn-hh-lightbox-catbox');
    const btnLightboxDelete = document.getElementById('btn-hh-lightbox-delete');

    let currentLightboxPhoto = null;

    function openLightbox(photo) {
        if (!lightboxModal) return;
        currentLightboxPhoto = photo;
        if (lightboxImg) lightboxImg.src = photo.dataUrl;
        if (lightboxInfo) {
            const timeStr = new Date(photo.createdAt).toLocaleString('vi-VN');
            const srcStr = photo.source === 'camera' ? '📸 Camera' : (photo.source === 'paste' ? '📋 Dán Ctrl+V' : '📁 File');
            lightboxInfo.textContent = `Đơn: ${photo.orderId || 'Không có mã'} | Nguồn: ${srcStr} | ${timeStr}`;
        }
        if (lightboxLink) {
            if (photo.catboxUrl) {
                lightboxLink.style.display = 'block';
                lightboxLink.innerHTML = `Link Catbox: <a href="${photo.catboxUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${photo.catboxUrl}</a>`;
            } else {
                lightboxLink.style.display = 'none';
            }
        }
        lightboxModal.style.display = 'flex';
    }

    function closeLightbox() {
        if (lightboxModal) lightboxModal.style.display = 'none';
        currentLightboxPhoto = null;
    }

    btnLightboxClose?.addEventListener('click', closeLightbox);
    lightboxModal?.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeLightbox();
    });

    function downloadPhoto(photo) {
        const a = document.createElement('a');
        a.href = photo.dataUrl;
        a.download = photo.fileName || `anh_hoan_${photo.orderId || 'don'}_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showHhToast('⬇️ Đang tải ảnh về máy...');
    }

    btnLightboxDownload?.addEventListener('click', () => {
        if (currentLightboxPhoto) downloadPhoto(currentLightboxPhoto);
    });

    btnLightboxCopy?.addEventListener('click', async () => {
        if (!currentLightboxPhoto) return;
        try {
            const res = await fetch(currentLightboxPhoto.dataUrl);
            const blob = await res.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            showHhToast('📋 Đã sao chép ảnh vào Clipboard!');
        } catch (e) {
            showHhToast('❌ Không thể sao chép trực tiếp ảnh.');
        }
    });

    btnLightboxDelete?.addEventListener('click', () => {
        if (!currentLightboxPhoto) return;
        if (confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
            const pId = currentLightboxPhoto.id;
            closeLightbox();
            deleteHangHoanPhoto(pId);
        }
    });

    // Tải ảnh lên Catbox
    btnLightboxCatbox?.addEventListener('click', async () => {
        if (!currentLightboxPhoto) return;
        btnLightboxCatbox.disabled = true;
        btnLightboxCatbox.textContent = '⏳ Đang tải...';

        try {
            let catboxUrl = '';
            if (typeof window.uploadFileToCatbox === 'function') {
                catboxUrl = await window.uploadFileToCatbox(currentLightboxPhoto.dataUrl);
            } else {
                // Standalone fallback upload to Catbox API
                const fd = new FormData();
                fd.append('reqtype', 'fileupload');
                const store = await chrome.storage.local.get(['catboxUserhash']);
                if (store?.catboxUserhash) fd.append('userhash', store.catboxUserhash.trim());
                
                // Chuyển base64 sang blob
                const blobRes = await fetch(currentLightboxPhoto.dataUrl);
                const blob = await blobRes.blob();
                fd.append('fileToUpload', blob, currentLightboxPhoto.fileName || 'image.jpg');

                const upRes = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: fd });
                catboxUrl = (await upRes.text() || '').trim();
            }

            if (catboxUrl && catboxUrl.startsWith('http')) {
                currentLightboxPhoto.catboxUrl = catboxUrl;
                // Cập nhật lại trong mảng và storage
                const idx = hangHoanPhotos.findIndex(p => p.id === currentLightboxPhoto.id);
                if (idx !== -1) {
                    hangHoanPhotos[idx].catboxUrl = catboxUrl;
                    await chrome.storage.local.set({ hangHoanPhotos: hangHoanPhotos });
                }

                if (lightboxLink) {
                    lightboxLink.style.display = 'block';
                    lightboxLink.innerHTML = `Link Catbox: <a href="${catboxUrl}" target="_blank" style="color: #38bdf8; text-decoration: underline;">${catboxUrl}</a>`;
                }

                // Copy link vào clipboard
                await navigator.clipboard.writeText(catboxUrl);
                showHhToast(`☁️ Đã tải lên Catbox và sao chép link: ${catboxUrl}`);
            } else {
                throw new Error(catboxUrl || 'Không nhận được link Catbox');
            }
        } catch (err) {
            console.error('Lỗi Catbox:', err);
            alert('Lỗi tải ảnh lên Catbox: ' + (err.message || 'Không thành công'));
        } finally {
            btnLightboxCatbox.disabled = false;
            btnLightboxCatbox.textContent = '☁️ Tải lên Catbox';
        }
    });

    // ==========================================
    // 7. RENDER BẢNG HÀNG HOÀN KÈM CỘT ẢNH
    // ==========================================
    function ensureContentScriptInjected(tabId, callback) {
        chrome.tabs.sendMessage(tabId, { type: "PING" }, (res) => {
            if (chrome.runtime.lastError || !res || !res.ok) {
                chrome.scripting.executeScript({
                    target: { tabId: tabId },
                    files: ["xlsx.full.min.js", "content.js"]
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Lỗi inject script:", chrome.runtime.lastError);
                        callback(false);
                    } else {
                        setTimeout(() => callback(true), 150);
                    }
                });
            } else {
                callback(true);
            }
        });
    }

    function renderHangHoanTable() {
        if (!tbody) return;
        
        let filtered = allHangHoanData;

        // 1. Filter by hhBhInfo (Thẻ thông tin)
        if (activeInfoFilter === 'NO') {
            filtered = filtered.filter(item => !item.hhBhInfo || item.hhBhInfo === 'Chưa có');
        } else if (activeInfoFilter === 'YES') {
            filtered = filtered.filter(item => item.hhBhInfo && item.hhBhInfo !== 'Chưa có');
        }

        // 2. Filter by returnId (Mã YC trả hàng)
        if (activeReturnFilter === 'YES') {
            filtered = filtered.filter(item => item.returnId && item.returnId !== '-');
        } else if (activeReturnFilter === 'NO') {
            filtered = filtered.filter(item => !item.returnId || item.returnId === '-');
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="padding: 10px; text-align: center; color: #64748b;">Không tìm thấy dữ liệu phù hợp.</td></tr>';
            return;
        }

        tbody.innerHTML = '';
        filtered.forEach(item => {
            const tr = document.createElement('tr');
            
            // hhBhStyle formatting
            let hhBhStyle = "";
            let hhBhContent = item.hhBhInfo || 'Chưa có';
            if (hhBhContent !== 'Chưa có') {
                hhBhStyle = "background-color: #e2f0d9; color: #155724; font-weight: bold; border: 1px solid #c3e6cb; padding: 2px 6px; border-radius: 4px; display: inline-block; font-size: 10px;";
            } else {
                hhBhStyle = "color: #7f8c8d; font-style: italic;";
            }

            // Render product images and names
            let productsHtml = '';
            if (item.products && item.products.length > 0) {
                item.products.forEach(p => {
                    productsHtml += `
                        <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 4px;">
                            ${p.imgUrl ? `<img src="${p.imgUrl}" style="width: 40px; height: 40px; border-radius: 4px; border: 1px solid #cbd5e1; object-fit: cover; flex: 0 0 auto;">` : ''}
                            <div style="font-weight: 500; font-size: 11px; line-height: 1.3; color: #1e293b; word-break: break-word;">${p.pName || '-'}</div>
                        </div>
                    `;
                });
            } else {
                productsHtml = '-';
            }

            // Lấy ảnh gắn với đơn hàng này
            const orderPhotos = getPhotosForOrder(item.orderId, item.trackingNum);

            let photosHtml = `
                <div style="display: flex; gap: 4px; align-items: center; margin-bottom: 4px; flex-wrap: wrap;">
                    <button type="button" class="btn-row-snap-cam" data-order-id="${item.orderId || ''}" data-tracking="${item.trackingNum || ''}" style="padding: 2px 6px; font-size: 10px; font-weight: 600; background: #059669; color: white; border: none; border-radius: 3px; cursor: pointer;" title="Chụp ảnh bằng Camera cho đơn này">📸 Chụp</button>
                    <button type="button" class="btn-row-pick-file" data-order-id="${item.orderId || ''}" data-tracking="${item.trackingNum || ''}" style="padding: 2px 6px; font-size: 10px; font-weight: 600; background: #0284c7; color: white; border: none; border-radius: 3px; cursor: pointer;" title="Chọn file ảnh từ máy tính cho đơn này">📁 File</button>
                    ${orderPhotos.length > 0 ? `<span style="font-size: 10px; font-weight: bold; color: #0284c7; margin-left: auto;">${orderPhotos.length} ảnh</span>` : ''}
                </div>
                <div class="row-photos-container" style="display: flex; gap: 4px; flex-wrap: wrap;">
            `;

            if (orderPhotos.length > 0) {
                orderPhotos.forEach(p => {
                    photosHtml += `
                        <img src="${p.dataUrl}" class="row-photo-thumb" data-photo-id="${p.id}" style="width: 28px; height: 28px; border-radius: 3px; border: 1px solid #cbd5e1; object-fit: cover; cursor: pointer;" title="Bấm để xem ảnh phóng to (${new Date(p.createdAt).toLocaleTimeString()})">
                    `;
                });
            } else {
                photosHtml += `<span style="font-size: 9.5px; color: #94a3b8; font-style: italic;">Chưa có ảnh</span>`;
            }
            photosHtml += `</div>`;

            tr.innerHTML = `
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; width: 200px; min-width: 200px;">${productsHtml}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 500; width: 110px; min-width: 110px; vertical-align: top;">${item.orderId || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569; width: 110px; min-width: 110px; vertical-align: top;">${item.returnId || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569; width: 130px; min-width: 130px; vertical-align: top;">${item.trackingNum || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; color: #475569; font-size: 10px; line-height: 1.3; width: 170px; min-width: 170px; vertical-align: top;">${item.returnLogistics || '-'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; width: 150px; min-width: 150px; vertical-align: top;"><span style="${hhBhStyle}">${hhBhContent}</span></td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; width: 150px; min-width: 150px; vertical-align: top;">${photosHtml}</td>
            `;

            // Bắt sự kiện nút chụp trên dòng
            tr.querySelector('.btn-row-snap-cam')?.addEventListener('click', (e) => {
                e.stopPropagation();
                openCameraStudio(item.orderId, item.trackingNum);
            });

            // Bắt sự kiện nút chọn file trên dòng
            tr.querySelector('.btn-row-pick-file')?.addEventListener('click', (e) => {
                e.stopPropagation();
                activeTargetOrderId = item.orderId || '';
                activeTargetTracking = item.trackingNum || '';
                inputFiles?.click();
            });

            // Bắt sự kiện click vào ảnh thumbnail
            tr.querySelectorAll('.row-photo-thumb').forEach(thumb => {
                thumb.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const photoId = thumb.getAttribute('data-photo-id');
                    const photo = hangHoanPhotos.find(p => p.id === photoId);
                    if (photo) openLightbox(photo);
                });
            });

            tbody.appendChild(tr);
        });
    }

    // Set up filter buttons click handlers
    function setupFilterButtons() {
        const infoBtns = document.querySelectorAll('.filter-info-btn');
        const returnBtns = document.querySelectorAll('.filter-return-btn');

        infoBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                infoBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'white';
                    b.style.color = '#475569';
                });
                btn.classList.add('active');
                btn.style.background = '#6366f1';
                btn.style.color = 'white';

                activeInfoFilter = btn.getAttribute('data-val');
                renderHangHoanTable();
            });
        });

        returnBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                returnBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.background = 'white';
                    b.style.color = '#475569';
                });
                btn.classList.add('active');
                btn.style.background = '#6366f1';
                btn.style.color = 'white';

                activeReturnFilter = btn.getAttribute('data-val');
                renderHangHoanTable();
            });
        });
    }

    // Initialize button listeners & storage
    setupFilterButtons();
    loadHangHoanPhotos();

    if (btnRead) {
        btnRead.addEventListener('click', () => {
            if (!tbody) return;
            tbody.innerHTML = '<tr><td colspan="7" style="padding: 10px; text-align: center; color: #64748b;">Đang đọc dữ liệu từ trang Shopee...</td></tr>';

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                const activeTab = tabs[0];
                if (!activeTab) {
                    tbody.innerHTML = '<tr><td colspan="7" style="padding: 10px; text-align: center; color: red;">Không tìm thấy tab hoạt động.</td></tr>';
                    return;
                }

                // Check URL
                const url = activeTab.url || "";
                const isReturnPage = url.includes("banhang.shopee.vn/portal/sale/return") || url.includes("banhang.shopee.vn/portal/sale/order");

                if (!isReturnPage) {
                    tbody.innerHTML = `<tr><td colspan="7" style="padding: 10px; text-align: center; color: red;">
                        Bạn chưa ở đúng trang Hàng hoàn của Shopee.<br>
                        <button id="btn-open-return-page" type="button" style="margin-top: 8px; padding: 6px 12px; background: #ee4d2d; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">Mở trang Hàng Hoàn Shopee</button>
                    </td></tr>`;

                    const btnOpen = document.getElementById('btn-open-return-page');
                    if (btnOpen) {
                        btnOpen.addEventListener('click', () => {
                            chrome.tabs.create({ url: 'https://banhang.shopee.vn/portal/sale/returnrefundcancel', active: true });
                        });
                    }
                    return;
                }

                ensureContentScriptInjected(activeTab.id, (injected) => {
                    if (!injected) {
                        tbody.innerHTML = '<tr><td colspan="7" style="padding: 10px; text-align: center; color: red;">Không thể kết nối tới trang Shopee (Lỗi tự động tiêm script). Vui lòng F5 tải lại trang Shopee và thử lại.</td></tr>';
                        return;
                    }

                    chrome.tabs.sendMessage(activeTab.id, { type: "READ_HANG_HOAN_LIST" }, (res) => {
                        if (chrome.runtime.lastError) {
                            tbody.innerHTML = '<tr><td colspan="7" style="padding: 10px; text-align: center; color: red;">Không thể kết nối tới trang Shopee. Hãy tải lại trang Shopee Trả hàng/Hoàn tiền và thử lại.</td></tr>';
                            return;
                        }

                        if (res && res.ok && res.data) {
                            allHangHoanData = res.data;
                            renderHangHoanTable();
                        } else {
                            tbody.innerHTML = `<tr><td colspan="7" style="padding: 10px; text-align: center; color: red;">Lỗi đọc dữ liệu: ${res && res.error ? res.error : 'Không phản hồi'}</td></tr>`;
                        }
                    });
                });
            });
        });
    }
})();
