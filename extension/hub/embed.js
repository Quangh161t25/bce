// Trang tool đang nằm trong trang chung Seller Hub (extension/hub/) thì gắn class "embedded"
// vào <html> để ẩn thanh tab cũ (thanh bên trái của hub thay thế).
// Nhúng ở nơi khác (VD side panel) thì giữ nguyên thanh tab.
try {
  if (window.parent !== window && window.parent.location.pathname.includes('/extension/hub/')) {
    document.documentElement.classList.add('embedded');
  }
} catch (e) { /* khác nguồn: không phải hub */ }
