import os

app_js_path = r'd:\tải xuống 2\TONY\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    text = f.read()

target2 = """                    if (header === 'gia_đăng') {
                        inputHtml = <div style="display:flex; align-items:center; gap:4px;"> + inputHtml + <button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickGiaDang(, this)" title="Điền Giá Thấp Nhất" style="padding: 2px 4px; font-size: 10px;">👇</button><button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickFees(, this)" title="Điền Phí Mặc Định" style="padding: 2px 4px; font-size: 10px;">⚡</button></div>;
                    }
                    return <td></td>;
                }
            }"""

replacement2 = """                    if (header === 'gia_đăng') {
                        inputHtml = <div style="display:flex; align-items:center; gap:4px;"> + inputHtml + <button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickGiaDang(, this)" title="Điền Giá Thấp Nhất" style="padding: 2px 4px; font-size: 10px;">👇</button><button class="quick-btn-inline" onclick="event.stopPropagation(); setInlineQuickFees(, this)" title="Điền Phí Mặc Định" style="padding: 2px 4px; font-size: 10px;">⚡</button></div>;
                        const numGiaDang = parseMoney(cell);
                        if (numGiaDang > 0) inputHtml += <div style="color: gray; font-size: 11px; margin-top: 4px; font-weight: 500;"> + formatDisplayNumber(Math.round(numGiaDang / 0.8)) + </div>;
                    }
                    return <td></td>;
                }
                if (header === 'gia_thap_nhat') {
                    const numGiaThapNhat = parseMoney(cell);
                    const belowVal = numGiaThapNhat > 0 ? numGiaThapNhat / 0.8 : 0;
                    const cellVal = escapeHtml(formatDisplayNumber(cell));
                    return <td><div style="font-weight: 500;"></div> + (belowVal > 0 ? <div style="color: gray; font-size: 11px; margin-top: 4px; font-weight: 500;"> + formatDisplayNumber(Math.round(belowVal)) + </div> : '') + </td>;
                }
            }"""

if target2 in text:
    text = text.replace(target2, replacement2)
    print("target2 Replaced")
else:
    # Try normalizing newlines
    target2 = target2.replace('\r\n', '\n')
    if target2 in text:
        text = text.replace(target2, replacement2)
        print("target2 Replaced (normalized newlines)")
    else:
        print("target2 not found at all")

with open(app_js_path, 'w', encoding='utf-8') as f:
    f.write(text)
