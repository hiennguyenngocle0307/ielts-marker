# Workflow tự động "IELTS NHÀ"

Giao bài → nhắc nộp → chấm bài → báo cáo, mỗi ngày, cho nhóm Zalo **_IELTS NHÀ**.
Học viên: **HUYỀN TRÂM** và **MOON - NGHI**.

---

## 1. Một ngày chạy như thế nào

| Giờ | Việc | Ai làm |
|---|---|---|
| **07:10** | Giao bài vào nhóm Zalo: 1 PPT bài giảng + 1 DOCX bài tập + link podcast + các bước shadowing + bài tóm tắt 3 phút + link nộp bài | Tác vụ `ielts-nha-giao-bai` |
| **20:05** | Soi 2 thư mục Drive, ai chưa nộp thì nhắc đích danh trong nhóm | Tác vụ `ielts-nha-nhac-nop-bai` |
| **22:20** | Chấm bài đã nộp theo 4 tiêu chí IELTS, trả điểm + nhận xét vào nhóm, **báo cáo tiến độ cho cô Hiền** | Tác vụ `ielts-nha-cham-bai-bao-cao` |

Ba tác vụ nằm ở `C:\Users\MSl\.claude\scheduled-tasks\`. Xem/sửa/tắt trong mục **Scheduled** ở thanh bên của app.

> ⚠️ Tác vụ chỉ chạy khi app đang mở. Nếu đến giờ mà app đóng, nó sẽ chạy vào lần mở app kế tiếp.

---

## 2. Mỗi ngày học viên phải nộp 4 file

| File | Nội dung |
|---|---|
| `DAYxx_<ChuDe>_BAITAP_<TÊN>.docx` | Bài tập Word của Keith, làm xong |
| `DAYxx_SHADOWING_<TÊN>.m4a` | Ghi âm nhại lại đoạn 2 phút trong podcast |
| `DAYxx_TOMTAT3P_<TÊN>.m4a` | Ghi âm nói 3 phút: 30s nội dung + 90s 5 từ mới đặt câu + 60s liên hệ bản thân |
| `DAYxx_TRANSCRIPT_<TÊN>.txt` | **Tự gõ lại đúng lời mình vừa nói** ở file trên |

**Vì sao bắt buộc có TRANSCRIPT:** không có công cụ nào ở đây chuyển giọng nói thành chữ. Không có transcript thì máy không chấm được phần nói — chỉ ghi nhận "có nộp". Bắt học viên tự gõ lại lời mình vừa nói vừa giải được bài toán chấm, vừa là bài luyện tốt nhất: các em tự nhìn ra lỗi của chính mình.

Phần **Pronunciation** máy không tự chấm được. Cô nghe file ghi âm rồi chấm bằng app
<https://hiennguyenngocle0307.github.io/ielts-marker/>, máy sẽ chấm 3 tiêu chí còn lại và đưa điểm tạm tính.

---

## 3. Cấu trúc trên Google Drive

```
_IELTS NHÀ - NỘP BÀI/                     ← https://drive.google.com/drive/folders/1t1H_TgaToZ5ixs4NGBhn3DHNpKdms4_K
├── 00 - BẢNG THEO DÕI HOẠT ĐỘNG VÀ NỘP BÀI   (Google Sheet — bản để cô xem/sửa tay)
├── 01 - HUYỀN TRÂM/                          ← em Trâm nộp vào đây
├── 02 - MOON - NGHI/                         ← em Nghi nộp vào đây
└── 03 - TÀI LIỆU BÀI GIẢNG MỖI NGÀY/         (kho dự phòng, xem mục 6)
```

Bảng theo dõi **thật sự** mà máy đọc/ghi là file `tracking.csv` trong thư mục này (máy không sửa được nội dung Google Sheet qua kết nối hiện có — chỉ tạo được file mới). Sheet trên Drive là bản cho người xem.

---

## 4. Chương trình học — 56 ngày

Nguồn: **Free Lessons - 50 Chủ Đề (Keith Academy)** — mỗi ngày đúng 1 file PPT bài giảng + 1 file Word bài tập.
`D:\IELTS MATERIALS\IELTS APPS\ILETS  SPEAKING DAILY\Free Lessons - 50 Chu De (Keith Academy)`

Ngày 1 = 31/08/2026 (Food) → ngày 56 = 25/10/2026 (Global Warming).

Podcast luyện nghe lấy từ kênh **Speak English With Class** — hiện có 12 video, dùng xoay vòng.
Muốn thêm video mới: sửa mảng `PODS` trong `tools/gen-curriculum.sh` rồi chạy lại, hoặc sửa thẳng `podcastId` / `podcastTitle` trong `curriculum.json`.

---

## 5. Chạy tay khi cần

Mọi lệnh chạy trong PowerShell, từ thư mục này:

```powershell
# Xem bài của hôm nay
.\IeltsDaily.ps1 -Action Info

# Dựng tin nhắn giao bài + copy 2 file ra out\
.\IeltsDaily.ps1 -Action Assign

# Dựng tin nhắn nhắc nộp
.\IeltsDaily.ps1 -Action Remind -Missing "HUYỀN TRÂM"

# Đưa tin nhắn vào clipboard rồi Ctrl+V vào Zalo
.\IeltsDaily.ps1 -Action Clip

# Đưa 2 file bài học vào clipboard rồi Ctrl+V vào Zalo
.\IeltsDaily.ps1 -Action ClipFiles

# Làm bài của một ngày khác
.\IeltsDaily.ps1 -Action Assign -Day 7
.\IeltsDaily.ps1 -Action Assign -Date 2026-09-10
```

Trong Zalo: **Enter = gửi**, **Shift+Enter = xuống dòng**. Tin nhắn nhiều dòng nên luôn dán bằng Ctrl+V.

---

## 6. Việc phải làm tay (máy không làm được)

1. **Mở quyền 2 thư mục Drive.** Kết nối Drive hiện tại chỉ chia sẻ được cho *email cụ thể*, không bật được "bất kỳ ai có link". Chọn 1 trong 2:
   - Cho biết email Gmail của 2 em → máy chia sẻ quyền Editor thẳng cho từng em (an toàn hơn).
   - Hoặc cô tự vào thư mục `_IELTS NHÀ - NỘP BÀI` → Chia sẻ → "Bất kỳ ai có đường liên kết" → **Người chỉnh sửa**.
2. **Cấp quyền điều khiển Zalo — 1 lần duy nhất.** Máy chỉ gõ/dán được vào Zalo khi cô bấm **Cho phép** ở hộp thoại xin quyền. Cách làm gọn nhất: vào mục **Scheduled** ở thanh bên → chọn `ielts-nha-giao-bai` → **Run now** → bấm Cho phép. Quyền đó được lưu lại cho các lần chạy sau, những ngày sau sẽ không hỏi nữa.
   Nếu cô không muốn cấp quyền: mọi tin nhắn vẫn được soạn sẵn trong `out\DAYxx_GIAOBAI.txt`, cô chỉ cần chạy `.\IeltsDaily.ps1 -Action Clip` rồi Ctrl+V vào Zalo.
3. **Kho tài liệu dự phòng (không bắt buộc).** Kéo thả 2 thư mục `Bai giang PPT` và `Bai tap Word` (tổng ~3 MB) vào `03 - TÀI LIỆU BÀI GIẢNG MỖI NGÀY` một lần duy nhất — để em nào lỡ mất tin nhắn Zalo vẫn tải lại được.
4. **Nghe file ghi âm để chấm Pronunciation.**

---

## 7. Cấu trúc file

```
curriculum.json            56 ngày: chủ đề, đường dẫn PPT/DOCX, podcast, id thư mục Drive
IeltsDaily.ps1             engine: dựng tin nhắn, copy file, đưa vào clipboard
tracking.csv               bảng theo dõi máy đọc/ghi (UTF-8 có BOM)
tools/gen-curriculum.sh    sinh lại curriculum.json khi đổi giáo trình / thêm podcast
out/                       tin nhắn + file đã stage theo từng ngày (tự sinh)
```

`IeltsDaily.ps1` và `tracking.csv` **phải giữ UTF-8 có BOM** — Windows PowerShell 5.1 đọc file không BOM theo bảng mã ANSI và sẽ vỡ hết tiếng Việt.
