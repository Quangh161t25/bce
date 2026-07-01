import os
import re

app_js_path = r'd:\tải xuống 2\TONY\app.js'
with open(app_js_path, 'r', encoding='utf-8') as f:
    text = f.read()

pattern = r"(if \(header === 'gia_đăng'\) \{.*?inputHtml = [^\n]+\n\s+\}\n\s+return <td>\$\{inputHtml\}</td>;\n\s+\}\n\s+\})"
match = re.search(pattern, text, re.DOTALL)

if match:
    original = match.group(1)
    
    parts = original.rsplit("return <td></td>;", 1)
    
    new_logic = """const numGiaDang = parseMoney(cell);
                        if (numGiaDang > 0) inputHtml += <div style="color: gray; font-size: 11px; margin-top: 4px; font-weight: 500;"> + formatDisplayNumber(Math.round(numGiaDang / 0.8)) + </div>;
                    return <td></td>;"""
    
    replaced = parts[0] + new_logic + parts[1]
    
    block_to_add = """
                if (header === 'gia_thap_nhat') {
                    const numGiaThapNhat = parseMoney(cell);
                    const belowVal = numGiaThapNhat > 0 ? numGiaThapNhat / 0.8 : 0;
                    const cellVal = escapeHtml(formatDisplayNumber(cell));
                    return <td data-col=""><div style="font-weight: 500;"></div> + (belowVal > 0 ? <div style="color: gray; font-size: 11px; margin-top: 4px; font-weight: 500;"> + formatDisplayNumber(Math.round(belowVal)) + </div> : '') + </td>;
                }"""
                
    idx = replaced.rfind('}')
    final_replaced = replaced[:idx] + block_to_add + "\n            }"
    
    text = text.replace(original, final_replaced)
    with open(app_js_path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Successfully replaced using regex.")
else:
    print("Regex did not match.")
