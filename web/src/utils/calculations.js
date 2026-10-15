import { parseMoney } from './formatters.js';

export function recalculateTinhGiaRowData(sourceRow) {
    const row = [...sourceRow];
    const giaBan = parseMoney(row[4] ?? '');
    let giaDang = parseMoney(row[9] ?? '');

    const getRate = (idx, defaultVal) => {
        const valStr = String(row[idx] ?? defaultVal).replace('%', '').replace(',', '.').trim();
        const num = parseFloat(valStr);
        return (Number.isFinite(num) ? num : defaultVal) / 100;
    };

    let rAds = getRate(10, 0);
    let rAff = getRate(11, 0);
    let rCd = getRate(12, 11);
    let rGd = getRate(14, 6);
    let rXt = getRate(16, 5.5);
    let rTh = getRate(18, 1.5);

    const phiHaTang = 3000;
    const phiPiship = 2700;

    let xtra = Math.min(giaDang * rXt, 50000);
    let phiCoDinh = Math.round(giaDang * rCd);
    let phiGiaoDich = Math.round(giaDang * rGd);
    let thue = Math.round(giaDang * rTh);
    let phiAds = Math.round(giaDang * rAds);
    let phiAff = Math.round(giaDang * rAff);

    let laiMongMuon = giaDang - phiAds - phiAff - phiCoDinh - phiGiaoDich - xtra - thue - phiHaTang - phiPiship - giaBan;
    let loiNhuanPt = giaDang > 0 ? (laiMongMuon / giaDang) : 0;

    row[8] = Math.round(laiMongMuon);
    row[7] = +(loiNhuanPt * 100).toFixed(2) + '%';
    row[13] = phiCoDinh;
    row[15] = phiGiaoDich;
    row[17] = Math.round(xtra);
    row[19] = thue;
    row[20] = phiHaTang;
    row[21] = phiPiship;

    if (sourceRow._sheetRow) row._sheetRow = sourceRow._sheetRow;
    return row;
}

export function recalculateTinhGiaRowByProfitRate(sourceRow, targetProfitRateNum) {
    const row = [...sourceRow];
    const giaBan = parseMoney(row[4] ?? '');

    const getRate = (idx, defaultVal) => {
        const valStr = String(row[idx] ?? defaultVal).replace('%', '').replace(',', '.').trim();
        const num = parseFloat(valStr);
        return (Number.isFinite(num) ? num : defaultVal) / 100;
    };

    let rAds = getRate(10, 0);
    let rAff = getRate(11, 0);
    let rCd = getRate(12, 11);
    let rGd = getRate(14, 6);
    let rXt = getRate(16, 5.5);
    let rTh = getRate(18, 1.5);

    const phiHaTang = 3000;
    const phiPiship = 2700;
    const CFix = phiHaTang + phiPiship + giaBan;
    const RSum = rAds + rAff + rCd + rGd + rTh;
    const loiNhuanPt = targetProfitRateNum;

    let p1 = CFix / (1 - RSum - loiNhuanPt - rXt);
    let xtra1 = p1 * rXt;
    let giaDang = 0;
    if (xtra1 <= 50000) {
        giaDang = Math.round(p1);
    } else {
        let p2 = (CFix + 50000) / (1 - RSum - loiNhuanPt);
        giaDang = Math.round(p2);
    }
    if (giaDang < 0 || isNaN(giaDang) || !isFinite(giaDang)) giaDang = 0;

    row[9] = giaDang;
    row[7] = +(loiNhuanPt * 100).toFixed(2) + '%';

    return recalculateTinhGiaRowData(row);
}

export function recalculateTinhGiaModalState(state, source = null) {
    const giaBan = parseMoney(state.giaBan);
    let giaDang = parseMoney(state.giaDang);
    let laiMongMuon = parseMoney(state.laiMongMuon);
    let loiNhuanPt = (parseFloat(state.loiNhuanPt) || 0) / 100;

    const rAds = (parseFloat(state.phiAdsPt) || 0) / 100;
    const rAff = (parseFloat(state.phiAffPt) || 0) / 100;
    const rCd = (parseFloat(state.phiCoDinhPt) || 11) / 100;
    const rGd = (parseFloat(state.phiGiaoDichPt) || 6) / 100;
    const rXt = (parseFloat(state.xtraPt) || 5.5) / 100;
    const rTh = (parseFloat(state.thuePt) || 1.5) / 100;

    const phiHaTang = 3000;
    const phiPiship = 2700;
    const CFix = phiHaTang + phiPiship + giaBan;
    const RSum = rAds + rAff + rCd + rGd + rTh;

    if (source === 'lai_mong_muon') {
        let p1 = (laiMongMuon + CFix) / (1 - RSum - rXt);
        let xtra1 = p1 * rXt;
        if (xtra1 <= 50000) {
            giaDang = Math.round(p1);
        } else {
            let p2 = (laiMongMuon + CFix + 50000) / (1 - RSum);
            giaDang = Math.round(p2);
        }
        if (giaDang < 0 || isNaN(giaDang) || !isFinite(giaDang)) giaDang = 0;
        loiNhuanPt = giaDang > 0 ? laiMongMuon / giaDang : 0;
    } else if (source === 'loi_nhuan%') {
        let p1 = CFix / (1 - RSum - loiNhuanPt - rXt);
        let xtra1 = p1 * rXt;
        if (xtra1 <= 50000) {
            giaDang = Math.round(p1);
        } else {
            let p2 = (CFix + 50000) / (1 - RSum - loiNhuanPt);
            giaDang = Math.round(p2);
        }
        if (giaDang < 0 || isNaN(giaDang) || !isFinite(giaDang)) giaDang = 0;
        laiMongMuon = Math.round(giaDang * loiNhuanPt);
    } else if (source === 'gia_đăng' || source === 'phi' || source === null) {
        let xtra = Math.min(giaDang * rXt, 50000);
        let phiCoDinh = giaDang * rCd;
        let phiGiaoDich = giaDang * rGd;
        let thue = giaDang * rTh;
        let phiAds = giaDang * rAds;
        let phiAff = giaDang * rAff;

        laiMongMuon = giaDang - phiAds - phiAff - phiCoDinh - phiGiaoDich - xtra - thue - phiHaTang - phiPiship - giaBan;
        loiNhuanPt = giaDang > 0 ? laiMongMuon / giaDang : 0;
    }

    let xtra = Math.min(giaDang * rXt, 50000);
    let phiCoDinh = Math.round(giaDang * rCd);
    let phiGiaoDich = Math.round(giaDang * rGd);
    let thue = Math.round(giaDang * rTh);
    let phiAds = Math.round(giaDang * rAds);
    let phiAff = Math.round(giaDang * rAff);

    let tongChiPhi = phiCoDinh + phiGiaoDich + Math.round(xtra) + thue + phiHaTang + phiPiship + phiAds + phiAff + giaBan;

    return {
        ...state,
        giaDang,
        laiMongMuon: Math.round(laiMongMuon),
        loiNhuanPt: +(loiNhuanPt * 100).toFixed(2),
        phiCoDinhVal: phiCoDinh,
        phiGiaoDichVal: phiGiaoDich,
        xtraVal: Math.round(xtra),
        thueVal: thue,
        phiAdsVal: phiAds,
        phiAffVal: phiAff,
        tongChiPhi,
        tySuat: (loiNhuanPt * 100).toFixed(2) + '%'
    };
}

export function recalculateDhFinancials({
    tinhTrang = '',
    tongTien = 0,
    phiVc = 0,
    phuPhi = 0,
    thue = 0,
    phiKhac = 0,
    items = []
}) {
    const tinhTrangVal = String(tinhTrang || '').trim().toUpperCase();
    const isCanceled = (tinhTrangVal === 'HỦY');
    const isReturnedOrRefunded = ['HOÀN', 'TRẢ', 'HOÀN TRẢ'].includes(tinhTrangVal);

    let tienSp = 0;
    if (!isCanceled && !isReturnedOrRefunded) {
        items.forEach(item => {
            const slg = Math.max(0, parseInt(item.slg, 10) || 0);
            const donGia = parseMoney(item.don_gia || 0);
            tienSp += (slg * donGia);
        });
    }

    let doanhThu = 0;
    if (!isCanceled) {
        doanhThu = parseMoney(tongTien) - (parseMoney(phiVc) + parseMoney(phuPhi) + parseMoney(thue) + parseMoney(phiKhac));
    }

    const loiNhuan = doanhThu - tienSp;

    return {
        tienSp,
        doanhThu,
        loiNhuan
    };
}
