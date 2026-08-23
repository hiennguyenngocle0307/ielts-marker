# IELTS Speaking Marker

Công cụ chấm bài nói IELTS — **1 file HTML duy nhất**, mở là dùng ngay, không cần cài đặt, không cần internet, không có audio/transcript nào được gửi đi đâu cả.

## Cách chạy

Bấm đúp vào `start.bat`, hoặc bấm đúp trực tiếp vào `index.html`. Chỉ cần một trình duyệt hiện đại (Chrome, Edge, Firefox) — không cần Node, không cần cài thư viện gì.

## Tính năng

- **Audio**: chọn file audio, nghe với 3 tốc độ (0.75x / 1x / 1.25x).
- **Transcript**: dán trực tiếp vào ô, hoặc bấm "Tải file .txt" để nạp từ file có sẵn. App hiện số từ và số từ đệm (um/uh/like...) để tham khảo.
- **Rubric 4 tiêu chí IELTS Speaking** (Fluency & Coherence, Lexical Resource, Grammatical Range & Accuracy, Pronunciation) — chọn band 4–9 cho từng tiêu chí, mô tả band hiện ngay bên dưới để đối chiếu.
- **Tính band tổng tự động**, đúng công thức làm tròn của IELTS (trung bình 4 tiêu chí; .25 làm tròn lên nửa band, .75 làm tròn lên nguyên band).
- **Gợi ý nhận xét**: bấm 1 nút để có bản nháp nhận xét dựa trên band đã chọn, rồi chỉnh sửa lại theo ý bạn.
- **Lưu & mở lại**: mỗi bài chấm lưu vào danh sách bên dưới (tên, ngày, band) — bấm "Mở" để xem lại, "Xoá" để bỏ.
- **In / Xuất PDF**: xuất một báo cáo gọn — tên học viên, ngày, bảng điểm 4 tiêu chí + band tổng, nhận xét — dùng nút In/Save as PDF của trình duyệt.

## Về việc tự động tạo transcript từ audio

App **không tự động chuyển giọng nói thành văn bản**. Đây không phải giới hạn có thể sửa bằng cách "làm lại HTML" — không có cách nào làm việc này thật sự chính xác mà hoàn toàn offline/miễn phí trong một file HTML. Chỉ có 2 hướng thật sự khả thi:

1. **Dùng dịch vụ AI chuyển giọng nói trả phí** (OpenAI Whisper API, Google Speech-to-Text...) — cần API key, cần Internet, audio phải gửi qua dịch vụ đó, tính phí theo phút.
2. **Tính năng chuyển giọng nói có sẵn của Chrome** (Web Speech API) — miễn phí nhưng: chỉ nhận âm thanh trực tiếp từ micro (không nạp thẳng file audio được), vẫn cần Internet (Chrome gửi lên máy chủ Google để xử lý), và độ chính xác với giọng không phải người bản ngữ thường không ổn định.

Hiện tại app dùng cách đơn giản và đáng tin cậy nhất: bạn tự nghe và dán/tải transcript vào (nút "Tải file .txt" giúp nếu bạn đã có transcript dạng file). Nếu bạn muốn thử hướng (1), nói tôi biết — cần bạn có tài khoản + API key của dịch vụ đó.

## Giới hạn cần biết

- **Dữ liệu lưu ở đâu**: lưu trong `localStorage` của trình duyệt bạn đang dùng — theo từng máy/trình duyệt, không đồng bộ. Xoá dữ liệu duyệt web (clear browsing data) sẽ mất luôn danh sách đã lưu.
- **Audio không được lưu lại** giữa các phiên — mở lại một bài chấm cũ cần chọn lại file audio nếu muốn nghe lại.
- Rubric trong app là **bản diễn giải/paraphrase** cấu trúc 4 tiêu chí chính thức của IELTS Speaking, không phải văn bản gốc của IELTS/British Council/IDP.

## Cấu trúc file

```
index.html   toàn bộ app (HTML + CSS + JS gộp trong 1 file)
start.bat    mở app nhanh trên Windows
```

## GitHub Pages

Repo đã bật GitHub Pages — mở trực tiếp: **https://hiennguyenngocle0307.github.io/ielts-marker/**

Mỗi lần code được cập nhật và push lên `main`, trang này tự cập nhật theo trong 1–2 phút.
