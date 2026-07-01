import os

app_js_path = r'd:\tải xuống 2\TONY\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    text = f.read()

target1 = "            displayHeaders: ['id_sp_con', 'id_sp', 'ten_sp', 'gia_nhap', 'gia_ban', 'gia_đong_goi', 'gia_thap_nhat', 'loi_nhuan%', 'lai_mong_muon', 'gia_đăng', 'phi_ads_%', 'phi_aff_%', '11%_phi_co_dinh', 'phi_co_dinh', '6%_phi_giao_dich', 'phi_giao_dich', '5.5% xtra', 'xtra', '1,5%_thue', 'thue', 'phi_ha_tang3.000_₫', 'phi_piship'],"
replacement1 = "            displayHeaders: ['id_sp_con', 'id_sp', 'ten_sp', 'gia_ban', 'gia_thap_nhat', 'loi_nhuan%', 'lai_mong_muon', 'gia_đăng', 'phi_ads_%', 'phi_aff_%', '11%_phi_co_dinh', 'phi_co_dinh', '6%_phi_giao_dich', 'phi_giao_dich', '5.5% xtra', 'xtra', '1,5%_thue', 'thue', 'phi_ha_tang3.000_₫', 'phi_piship'],"

if target1 in text:
    text = text.replace(target1, replacement1)
else:
    print('target1 not found')


target2 = """                    if (header === 'gia_đăng') {
                        inputHtml = <div style="display:flex; align-items:center; gap:4px;"> + inputHtml + <button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickGiaDang(, this)" title="Điền Giá Thấp Nhất" style="padding: 2px 4px; font-size: 10px;">👇</button><button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickFees(, this)" title="Điền Phí Mặc Định" style="padding: 2px 4px; font-size: 10px;">⚡</button></div>;
                    }
                    return <td></td>;
                }
            }"""

replacement2 = """                    if (header === 'gia_đăng') {
                        inputHtml = <div style="display:flex; align-items:center; gap:4px;"> + inputHtml + <button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickGiaDang(, this)" title="Điền Giá Thấp Nhất" style="padding: 2px 4px; font-size: 10px;">👇</button><button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickFees(, this)" title="Điền Phí Mặc Định" style="padding: 2px 4px; font-size: 10px;">⚡</button></div>;
                        const numGiaDang = parseMoney(cell);
                        inputHtml += <div style="color: gray; font-size: 11px; margin-top: 4px; font-weight: 500;"></div>;
                    }
                    return <td></td>;
                }
                if (header === 'gia_thap_nhat') {
                    const numGiaThapNhat = parseMoney(cell);
                    return <td><div style="font-weight: 500; font-size: 13px;"></div><div style="color: gray; font-size: 11px; margin-top: 4px; font-weight: 500;"></div></td>;
                }
            }"""

if target2 in text:
    text = text.replace(target2, replacement2)
else:
    print('target2 not found')


with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('Replacement completed.')
