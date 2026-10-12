export const CONFIG = {
    spreadsheetId: "19gZ6mR4UnKjZiWQc-W5CrCBKD7xz02Szd4Amlqvu99Y",
    serviceAccountEmail: "ca-nhan@h161-508101.iam.gserviceaccount.com",
    privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC1XkzwY+oHzPmN
YnJ+sMKxe5TRTp8Md0Jb+PFApojE72HcVnXj14zFxFocyCPX1+dtwXJGJ/sSCyAh
iV3OtLEpxRU5QJponFszl9X6vmdLzDbzQS7VQTqMPv0JB+lHEYMU2B37hcIfpfJO
+l6EMprUA7NJtmeJpqmXKjsov6Rdt61sjyH/LKaYj0T2sLGazgZesp96sEOu83HM
nl+KPk9xafPOlKaE34Bk6zl4D8lFUK3v7opndvt/7IOBQ/RdI7p0v+HeOORGUuZW
kW3GH1vo6xY/uyrtmjD7+18w5vmAIRm24Satu0MJYz+j1JtqV4U5wwDkNelXBAWz
hKkfl5yxAgMBAAECggEAA9pDk+Epc943qFhQoo6Oai77+ai8AeuoHBRJCqSm99j2
aRPol+0Im1xZBi69rSxzyO3wp5sajxbvqSq19Im70C10rpVH2mRE3y8Q321LPC3T
tn3aWPMUY22Emjwh6U2uzULsex7roVi48ZLJrnD1Pz7vYGfYofDJfjGqVUqh2xA+
OSiz/U2JFTmePtrhxQGwaS8PHWyyUd+aiHz7pBg+tNzX0L+rMirPsN6i/ph+QolS
4YXubv94O/WL92helDjQuUyWbisYdkuLp2XxnB+5Oa/2fQY7+rhju4pcIm+zA+Wc
GdSzvLtL5hY9vLrZ8e4n0E/saILqViHSkRFksV1PaQKBgQDmEDaYQxmBeQsDbRJN
BLg5lNBCgEWWkW/GNcL9cT+IcmNSyiPAnk2jofQpvmbbBh1lYeCbOhE4HDotN8a8
hc1uRLb4K17fofhGV/znXW9Y12NcwZTkL5u4kKwDy8Qfx3PfckeLxA1s/3oS01tF
wrybv1aB3Vxain5axUps5v0x6QKBgQDJ0Ld9nqXGBrknORjF1uQ7vpp5wp4Haohy
FVNNfMzjKGRzKl8d4TxPVrUpShYBQE+v1pCwahOXCefovff32mQHzg4oVeml3bQq
otLFVVcydb1L8RY1R+QLbiqRy6Pnv5h4pB82eWg1i7xKuZvxZ68v6iPpEz+8zx0F
FJ9IGolPiQKBgBRF03nBV+sHzoejwdwVkWJJkbx6bydgc3gE3sTUiOOuKMBv3Yyo
pnDH4asYAxpDxK1dXZxwFnpaSmoXoySTqdGQrorZz4dnT2hrcna0zg4HFNNkn4ko
BNHTtcSz3Plr6vMCr/lJ8mDrdkdYZo+UJGiZCLdy2SOFVrMK9Y75H9CZAoGBAJcl
jTc06VztTiA1H/uT3K1uLA2DF43gWL5wgEopbN24M7sZAdHEDcIx405AIUjgnI3J
+eVWHMPi9GAYXq2vT3mU9n95EJtb9wJznb2TE9JD4fkNX5+Z7w4sfQ9iX6hCk3PP
H11SAh0QQX4JkuRyzf7pselutC65Qze54S1ESpBZAoGACkqjFmmF9I9jLZfJdWJM
hOdPNHJD8NcM7ixbO9FBMw6S7PeUE//IuKQQcnxm9FsxCFVo2Q16+XKYLryZ/QxD
cRUVkq/nAg4IB78jDp5Yc3n5VXAr10zWHWNFwVbdcZAs3BT9Q4WacASPdyowQPx0
JYdnFqf9hx1XKT04zZ49M7w=
-----END PRIVATE KEY-----`,
    tokenUrl: "https://oauth2.googleapis.com/token",
    tabs: {
        'DS_SP': {
            range: 'DS_SP!A2:K',
            headers: ['id_sp_con', 'id_sp', 'ten_sp', 'gia_nhap_ncc', 'gia_ban', 'gia_dong_goi', 'gia_thap_nhat', 'id_sp_gian', 'udt', 'tinh_trang', 'anh'],
            priceCols: [3, 4, 5, 6],
            imgCol: 10
        },
        'TINH_GIA': {
            range: 'TINH_GIA!A2:V',
            headers: ['id_sp_con', 'id_sp', 'ten_sp', 'gia_nhap', 'gia_ban', 'gia_đong_goi', 'gia_thap_nhat', 'loi_nhuan%', 'lai_mong_muon', 'gia_đăng', 'phi_ads_%', 'phi_aff_%', '11%_phi_co_dinh', 'phi_co_dinh', '6%_phi_giao_dich', 'phi_giao_dich', '5.5% xtra', 'xtra', '1,5%_thue', 'thue', 'phi_ha_tang3.000_₫', 'phi_piship'],
            displayHeaders: ['id_sp_con', 'id_sp', 'anh', 'ten_sp', 'gia_ban', 'gia_thap_nhat', 'loi_nhuan%', 'lai_mong_muon', 'gia_đăng', 'phi_ads_%', 'phi_aff_%', '11%_phi_co_dinh', 'phi_co_dinh', '6%_phi_giao_dich', 'phi_giao_dich', '5.5% xtra', 'xtra', '1,5%_thue', 'thue', 'phi_ha_tang3.000_₫', 'phi_piship'],
            priceCols: [3, 4, 5, 6, 8, 9, 13, 15, 17, 19, 20, 21]
        },
        'SP_BO': {
            range: 'SP_BO!A2:C',
            headers: ['id_sp_con', 'id_sp', 'ten_sp'],
            displayHeaders: ['id_sp_con', 'id_sp', 'ten_sp']
        },
        'SP_GIAM_GIA': {
            range: 'SP_GIAM_GIA!A2:I',
            headers: ['Mã sản phẩm', 'Tên Sản phẩm', 'Số SKU Sản phẩm', 'Mã phân loại hàng', 'Tên phân loại hàng', 'Số SKU Phân loại hàng', 'Giá gốc', 'Giá đã giảm', 'gian'],
            priceCols: [6, 7]
        },
        'WEB_SP': {
            range: 'WEB_SP!A2:O',
            headers: ['id', 'gian', 'sku', 'phan_loai', 'ten_sp', 'nganh_hang', 'mo_ta', 'anh', 'anh_mota', 'anh_phan_loai', 'link_video', 'gia', 'gia_khuyen_mai', 'id_shopee', 'link_shopee'],
            displayHeaders: ['id', 'gian', 'sku', 'phan_loai', 'ten_sp', 'nganh_hang', 'mo_ta', 'anh', 'anh_mota', 'anh_phan_loai', 'link_video', 'gia', 'gia_khuyen_mai', 'id_shopee', 'link_shopee'],
            priceCols: [11, 12],
            imgCol: 7
        },
        'DH': {
            range: 'DH!A2:AA',
            headers: ['gian', 'ngay', 'ngay_gio', 'mdh', 'mvd', 'tong_tien', 'ma_giam_gia', 'phi_vc', 'phu_phi', 'thue', 'doanh_thu', 'phi_khac', 'tien_sp', 'loi_nhuan', 'tinh_trang', 'trang_thai', 'sku', 'id_sp', 'slg', 'don_gia', 'thanh_tien', 'ten_khach', 'ng_nhan', 'dia_chi', 'link_don', 'mvd_huy', 'mdh_huy'],
            displayHeaders: ['gian', 'ngay', 'mdh', 'mvd', 'mvd_huy', 'mdh_huy', 'tong_tien', 'ma_giam_gia', 'phi_vc', 'phu_phi', 'thue', 'doanh_thu', 'phi_khac', 'tien_sp', 'loi_nhuan', 'tinh_trang', 'trang_thai', 'ten_khach', 'ng_nhan', 'dia_chi', 'link_don'],
            priceCols: [5, 6, 7, 8, 9, 10, 11, 12, 13, 19, 20]
        }
    }
};

export const TAB_TITLES = {
    'DS_SP': 'DS SP',
    'TINH_GIA': 'TÍNH GIÁ',
    'SP_BO': 'SP BỎ',
    'SP_GIAM_GIA': 'SP GIẢM GIÁ',
    'WEB_SP': 'WEB SP',
    'DH': 'ĐH'
};

// Đồng bộ hai chiều với Chrome Extension (customSpreadsheetId)
if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
    chrome.storage.local.get(['customSpreadsheetId'], (res) => {
        if (res?.customSpreadsheetId && res.customSpreadsheetId.trim()) {
            CONFIG.spreadsheetId = res.customSpreadsheetId.trim();
        }
    });
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.customSpreadsheetId) {
            const nextId = changes.customSpreadsheetId.newValue || '';
            if (nextId.trim()) {
                CONFIG.spreadsheetId = nextId.trim();
            }
        }
    });
}

