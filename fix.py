with open('app.js', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace("['gia_dang', 'lai_mong_muon']", "['gia_dang', 'lai_mong_muon']")
c = c.replace("getTrNum('gia_dang')", "getTrNum('gia_dang')")
c = c.replace("setVal('gia_dang'", "setVal('gia_dang'")
c = c.replace("tr.querySelector('[data-header=\"gia_dang\"]')", "tr.querySelector('[data-header=\"gia_dang\"]')")
c = c.replace("source === 'loi_nhuan_pt'", "source === 'loi_nhuan%'")
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(c)
