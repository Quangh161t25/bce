# Ghi chu module DS_SP

## Cau truc file

- `index.html`: giao dien chinh, sidebar trai, thanh cong cu, bang du lieu va form them/sua san pham.
- `styles.css`: style cho layout, sidebar thu gon, bang, phan trang, bo loc va modal.
- `app.js`: logic doc/ghi Google Sheet cho cac module, tim kiem, loc, phan trang, upload/upsert, them moi va sua dong.

## Sheet du lieu

- Spreadsheet ID: `1lkxlOmYkebWvkCCIrMGNl5yRCoFEsJIvYuvwSP_2LLQ`

### DS_SP

- Sheet: `DS_SP`
- Vung doc: `DS_SP!A2:D`
- Cot du lieu:
  - `id`
  - `ten_sp`
  - `ncc`
  - `ghi_chu`

### XUAT_KHO

- Sheet: `XUAT_KHO`
- Vung doc: `XUAT_KHO!A2:M`
- Cot du lieu: `id`, `ngay`, `npp`, `id_sp`, `ten_sp`, `don_gia`, `slg`, `thanh_tien`, `id_nv`, `ghi_chu`, `vi_tri`, `tinh_trang`, `trang_thai`

### NHAP_KHO

- Sheet: `NHAP_KHO`
- Vung doc: `NHAP_KHO!A2:L`
- Cot du lieu: `id`, `ngay`, `ncc`, `id_sp`, `ten_sp`, `don_gia`, `slg`, `thanh_tien`, `ghi_chu`, `vi_tri`, `tinh_trang`, `trang_thai`

### DS_KHACH

- Sheet nguon goi y khach hang/nha cung cap: `DS_KHACH`
- Vung doc: `DS_KHACH!A2:E`
- Cot du lieu: `id`, `ncc_npp`, `ten`, `sdt`, `dia_chi`

### TON_KHO

- Sheet: `TON_KHO`
- Vung doc: `TON_KHO!A2:I`
- Cot du lieu that tren sheet: `id`, `kho`, `id_sp`, `ten_sp`, `ton_dau`, `ton_cuoi`, `ghi_chu`, `tinh_trang`, `trang_thai`
- Cot hien thi tren giao dien: `id`, `kho`, `id_sp`, `ten_sp`, `ton_dau`, `nhap`, `xuat`, `ton_cuoi`, `ghi_chu`, `tinh_trang`, `trang_thai`
- Hai cot `nhap` va `xuat` la cot ao, duoc tinh tu tong `slg` theo `id_sp` trong sheet `NHAP_KHO` va `XUAT_KHO`.
- `ton_cuoi` tren giao dien duoc tinh bang `ton_dau + nhap - xuat`.

## Chuc nang giao dien

- Sidebar trai co module `DS_SP`, `XUAT_KHO`, `NHAP_KHO`, `TON_KHO`.
- Nut thu gon/mo rong sidebar dung `toggleSidebar()`.
- Bang hien thi cot theo module dang chon, khong co cot xoa.
- Phan trang: 150 dong/trang.
- Tim kiem nhanh: loc tren tat ca cot cua dong.
- Loc NCC: chi hien trong `DS_SP`; o nhap co goi y tu cac NCC cu kem so luong, co the go de loc theo mot phan ten NCC.
- Cac module `DS_SP`, `XUAT_KHO`, `NHAP_KHO`, `TON_KHO` deu co nut `Them moi` va `Tai Excel len`.
- Nut `Load lai` tai lai du lieu module dang mo tu Google Sheet.

## Them va sua san pham

- Nut `Them moi` mo form dong theo module dang chon.
- Double click vao mot dong trong bang de mo form sua dong do.
- Form tu tao truong theo header cua module dang chon.
- Cot `id` tu sinh va khong hien tren form.
- Cot `ngay` hien dang date.
- Cot `id_sp` cho phep go va goi y tu sheet `DS_SP` theo dang `id - ten_sp`; de tranh lag chi hien toi da 50 goi y khop noi dung dang go. Cot `ten_sp` tu dong lay theo `id_sp`.
- Cot `ncc` trong `NHAP_KHO` chon tu sheet `DS_KHACH` voi `ncc_npp = ncc`.
- Cot `npp` trong `XUAT_KHO` chon tu sheet `DS_KHACH` voi `ncc_npp = npp`.
- Cot `slg` co nut `-` va `+` de giam/tang so luong.
- Cot `don_gia`, `slg`, `thanh_tien` hien dau cham phan tach hang nghin tren form; khi luu se ghi ve gia tri so. Cot `thanh_tien` tu dong tinh bang `don_gia * slg`.
- Cot `id_nv` tam an tren form.
- Cot `vi_tri` hien dang dropdown enum, lay tu gia tri co san va mot so gia tri mac dinh.
- Khi luu:
  - Neu dang sua dong cu, cap nhat dung dong dang sua.
  - Neu them moi ma `id` da ton tai, cap nhat dong co `id` do.
  - Neu `id` chua ton tai, them dong moi vao cuoi sheet.
  - Khi them/sua `NHAP_KHO` hoac `XUAT_KHO`, neu `id_sp` chua co trong `TON_KHO` thi tu dong them mot dong ton kho moi cho san pham do.

## Upload file

- Ho tro `.xlsx`, `.xls`, `.csv`.
- Doc sheet dau tien trong file upload.
- Neu dong dau tien co cot dau tien chua `ID`, bo dong header.
- Moi dong upload duoc chuan hoa theo so cot cua module dang chon.
- Logic upload la upsert theo `id`:
  - `id` da co trong sheet: cap nhat dong hien co.
  - `id` chua co trong sheet: them dong moi.
- Upload khong xoa toan bo sheet va ap dung cho module dang chon.

## Cac ham logic chinh trong app.js

- `fetchData()`: lay du lieu tu Google Sheet theo module dang chon va nap vao `allData`.
- `populateFilters()`: tao danh sach goi y NCC kem so luong tu du lieu `DS_SP`.
- `filterTable()`: ap dung tim kiem nhanh va cac bo loc.
- `renderTable()`: ve bang theo `filteredData` va trang hien tai.
- `renderPagination()`: ve nut phan trang.
- `openRecordForm(rowIndex)`: mo modal them/sua theo module dang chon; neu co `rowIndex` thi nap du lieu dong de sua.
- `saveRecordFromForm(event)`: luu form ve Google Sheet.
- `writeRecordRow(row, sheetRow)`: cap nhat mot dong co san tren sheet.
- `appendRecordRows(rows)`: them dong moi vao cuoi sheet.
- `upsertRecordRows(rows)`: cap nhat/them moi danh sach dong theo `id`.
- `processFiles(files)`: xu ly upload file va goi upsert.
- `toggleSidebar()`: thu gon/mo rong sidebar trai.
- `reloadCurrentTab()`: tai lai du lieu module dang mo.
