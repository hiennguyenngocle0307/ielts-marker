# IELTS Speaking Marker

Công cụ chấm bài nói IELTS chạy hoàn toàn **offline trên máy của bạn** — không cần cài đặt, không cần server, không có audio/transcript nào được gửi đi đâu cả.

## Cách chạy

Cách 1 — nhanh nhất: bấm đúp vào `start.bat`.

Cách 2: bấm đúp trực tiếp vào `index.html`, trình duyệt mặc định sẽ mở app.

Không cần Node, không cần internet, không cần cài thư viện gì. Chỉ cần một trình duyệt hiện đại (Chrome, Edge, Firefox).

## Tính năng

- **Upload & nghe audio dài (9–15 phút, cả Part 1+2+3 trong 1 file)**: kéo-thả hoặc chọn file, tua nhanh/chậm (0.75x–1.5x) để nghe kỹ phát âm.
- **Nhật ký lỗi có phân loại, theo từng mốc thời gian trên toàn bộ file nghe**: khi nghe, chọn loại lỗi (🗣️ Phát âm, 🎵 Ngữ điệu/Trọng âm, 📖 Từ vựng/Collocation, ✏️ Ngữ pháp), gõ "Nghe được gì" và "Sửa thành gì", rồi bấm "Ghi lỗi tại thời điểm đang nghe". Mỗi lỗi được gắn timestamp chính xác.
- **Timeline trực quan**: một dải nhỏ dưới audio hiển thị tất cả lỗi đã ghi theo đúng vị trí thời gian của chúng trong file (màu theo loại lỗi) — nhìn một cái là biết lỗi tập trung ở đoạn nào (VD: Part 2 nhiều lỗi ngữ pháp hơn Part 1). Bấm vào một điểm trên timeline để tua tới đó.
- **Nút "Lỗi trước / Lỗi sau"**: nhảy nhanh giữa các mốc đã đánh dấu mà không cần tua thủ công — rất hữu ích với file dài.
- **Dán transcript**: app tự tính số từ, số câu, độ dài câu trung bình, số từ đệm (um/uh/like...), số lần lặp từ liền kề, tỉ lệ đa dạng từ vựng, số câu quá dài, tốc độ nói (WPM) — các tín hiệu này giúp chấm sát hơn nhưng **không tự chấm điểm thay bạn**.
- **Xem highlight**: bật chế độ highlight để thấy trực quan từ đệm/lặp từ (hồng) và câu quá dài (xanh) ngay trong transcript.
- **Rubric 4 tiêu chí chính thức của IELTS Speaking** (Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation), mỗi tiêu chí có thanh trượt band 1–9 kèm mô tả band tương ứng để bạn đối chiếu khi chấm.
- **Tính band tổng tự động** theo đúng công thức làm tròn của IELTS (trung bình 4 tiêu chí; .25 làm tròn lên nửa band, .75 làm tròn lên nguyên band).
- **Gợi ý nhận xét tự sinh**, gộp theo từng loại lỗi (phát âm/ngữ điệu/từ vựng/ngữ pháp) kèm timestamp + cách sửa cho từng lỗi — bạn chỉnh sửa lại trước khi dùng làm nhận xét chính thức.
- **Lưu & lịch sử chấm**: mỗi bài chấm được lưu lại (tên học viên, ngày, giáo viên chấm, 4 điểm tiêu chí, band tổng, toàn bộ nhật ký lỗi, nhận xét) để xem lại hoặc mở lại sau.
- **Xuất báo cáo chuyên nghiệp (in/PDF)**: một văn bản báo cáo riêng — có tiêu đề, bảng thông tin học viên, bảng điểm 4 tiêu chí, nhật ký lỗi chi tiết theo từng nhóm (kèm bảng "Thời điểm | Nghe được | Cách sửa"), nhận xét tổng kết, và dòng ký tên — thiết kế như một văn bản chấm thi chính thức, không lẫn giao diện thao tác của app.
- **Xuất CSV** toàn bộ lịch sử chấm để lưu trữ/theo dõi tiến độ nhiều học viên.

## Giới hạn cần biết

- **Dữ liệu lưu ở đâu**: transcript, điểm, nhận xét được lưu trong `localStorage` của trình duyệt — nghĩa là lưu theo từng máy/trình duyệt cụ thể, không đồng bộ giữa các máy. Nếu xoá dữ liệu duyệt web (clear browsing data) thì lịch sử chấm cũng mất — nên xuất CSV định kỳ để sao lưu.
- **Audio không được lưu lại** giữa các phiên (để tránh phình dung lượng trình duyệt) — mỗi lần mở lại một bài chấm cũ, bạn cần tải lại file audio nếu muốn nghe lại.
- **Các con số thống kê transcript** (từ đệm, đa dạng từ vựng...) chỉ là gợi ý dựa trên từ khóa/heuristic đơn giản, không phải AI chấm điểm — quyết định band cuối cùng luôn là của giáo viên.
- Rubric trong app là **bản diễn giải/paraphrase** cấu trúc 4 tiêu chí chính thức của IELTS Speaking, không phải văn bản gốc của IELTS/British Council/IDP.

## Cấu trúc file

```
index.html   giao diện
style.css    thiết kế (theo hệ màu xanh/hồng/vàng, tối giản cho giáo viên chấm nhanh)
app.js       toàn bộ logic: audio, transcript, rubric, tính điểm, lưu/lịch sử, xuất file
start.bat    mở app nhanh trên Windows
```

## Đưa lên GitHub

Repo git đã được khởi tạo sẵn (`git init` + commit đầu tiên). Để đẩy lên GitHub:

```bash
git remote add origin <URL_repo_github_cua_ban>
git branch -M main
git push -u origin main
```

Nếu bạn chưa có repo trên GitHub, tạo repo mới (trống, không kèm README) trên GitHub trước, rồi copy URL vào lệnh `git remote add origin` ở trên.
