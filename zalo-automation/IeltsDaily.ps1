<#
.SYNOPSIS
  Engine cho workflow "IELTS NHÀ" - giao bài / nhắc nộp / kiểm tra tiến độ mỗi ngày.

.DESCRIPTION
  Đọc curriculum.json, xác định bài của ngày hôm nay, và:
    -Action Assign  : dựng tin nhắn GIAO BÀI + stage 2 file (PPT/DOCX) ra thư mục out\
    -Action Remind  : dựng tin nhắn NHẮC NỘP
    -Action Stage   : chỉ copy file của ngày ra out\ (không dựng tin nhắn)
    -Action Clip    : đưa nội dung tin nhắn vào clipboard (để Ctrl+V vào Zalo)
    -Action ClipFiles : đưa 2 file bài học vào clipboard (để Ctrl+V gửi file trong Zalo)
    -Action Info    : in thông tin bài hôm nay dạng ngắn

  Script KHÔNG tự bấm gửi trong Zalo. Việc mở Zalo, chọn đúng nhóm và bấm gửi
  do Claude thực hiện bằng computer-use (có nhìn màn hình để xác nhận đúng nhóm).

.EXAMPLE
  .\IeltsDaily.ps1 -Action Assign
  .\IeltsDaily.ps1 -Action Remind -Missing "HUYỀN TRÂM"
  .\IeltsDaily.ps1 -Action Assign -Date 2026-09-05
#>
[CmdletBinding()]
param(
    [ValidateSet('Assign', 'Remind', 'Stage', 'Clip', 'ClipFiles', 'Info')]
    [string]$Action = 'Info',

    # Ngày cần xử lý (yyyy-MM-dd). Mặc định: hôm nay.
    [string]$Date,

    # Danh sách học viên CHƯA nộp, dùng cho -Action Remind.
    [string[]]$Missing,

    # Ép dùng đúng số DAY thay vì tính theo ngày.
    [int]$Day
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$cfg = Get-Content (Join-Path $root 'curriculum.json') -Raw -Encoding utf8 | ConvertFrom-Json
$outDir = Join-Path $root 'out'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory $outDir | Out-Null }

# ---------- chọn bài của ngày ----------
function Get-Lesson {
    if ($Day -gt 0) {
        $l = $cfg.days | Where-Object { $_.day -eq $Day }
        if ($l) { return $l }
        throw "Không có DAY $Day trong curriculum.json"
    }
    $target = if ($Date) { $Date } else { (Get-Date).ToString('yyyy-MM-dd') }
    $l = $cfg.days | Where-Object { $_.date -eq $target }
    if ($l) { return $l }

    # Ngoài phạm vi lịch: quay vòng lại từ đầu để chương trình không bị đứt.
    $start = [datetime]::ParseExact($cfg.startDate, 'yyyy-MM-dd', $null)
    $offset = ([datetime]::ParseExact($target, 'yyyy-MM-dd', $null) - $start).Days
    if ($offset -lt 0) { $offset = 0 }
    $idx = $offset % $cfg.days.Count
    return $cfg.days[$idx]
}

$lesson = Get-Lesson
$viDate = [datetime]::ParseExact($lesson.date, 'yyyy-MM-dd', $null).ToString('dd/MM/yyyy')
$dayTag = 'DAY{0:D2}' -f $lesson.day
$pptPath = Join-Path $cfg.sourceRoot $lesson.ppt
$docPath = Join-Path $cfg.sourceRoot $lesson.doc
$podcastUrl = "https://www.youtube.com/watch?v=$($lesson.podcastId)"
$deadline = "22:00 ngày $viDate"

# ---------- tin nhắn GIAO BÀI ----------
function New-AssignMessage {
    $sb = [System.Text.StringBuilder]::new()
    $n = { param($t) [void]$sb.AppendLine($t) }

    & $n "🌟 IELTS NHÀ - $dayTag · $viDate"
    & $n "CHỦ ĐỀ HÔM NAY: $($lesson.topic.ToUpper())"
    & $n ""
    & $n "📎 Cô gửi kèm 2 file ngay dưới tin nhắn này:"
    & $n "   1) $(Split-Path $lesson.ppt -Leaf)  →  BÀI GIẢNG (học trước)"
    & $n "   2) $(Split-Path $lesson.doc -Leaf)  →  BÀI TẬP (làm rồi nộp)"
    & $n ""
    & $n "━━━━━━━━━━━━━━━━━━━━━━━"
    & $n "① BÀI GIẢNG PPT - 20 phút"
    & $n "Mở file PPT, học hết từ vựng + mẫu câu."
    & $n "Đọc TO thành tiếng, KHÔNG đọc thầm."
    & $n ""
    & $n "② BÀI TẬP WORD - 25 phút"
    & $n "Làm hết file .docx, gõ trực tiếp vào file rồi lưu tên:"
    & $n "   ${dayTag}_$($lesson.topic)_BAITAP_<TÊN EM>.docx"
    & $n ""
    & $n "③ 🎧 PODCAST + SHADOWING - 30 phút  ⭐ QUAN TRỌNG NHẤT"
    & $n "Nghe tại: $podcastUrl"
    & $n "Bài: $($lesson.podcastTitle)"
    & $n ""
    & $n "CÁC BƯỚC SHADOWING - làm đúng thứ tự, đừng bỏ bước nào:"
    & $n "   B1. Nghe TRỌN VẸN 1 lần, KHÔNG nhìn phụ đề. Chỉ nghe lấy ý chính."
    & $n "   B2. Bật phụ đề (CC), nghe lần 2. Ghi ra 10 từ/cụm mới + nghĩa."
    & $n "   B3. Chọn 1 đoạn 2 PHÚT em thấy hay nhất để luyện."
    & $n "   B4. Nghe TỪNG CÂU → bấm dừng → nhại lại NGAY, bắt chước y hệt:"
    & $n "       · ngữ điệu lên/xuống   · chỗ ngắt nghỉ"
    & $n "       · nối âm (linking)     · âm cuối s / ed / t / d"
    & $n "       Mỗi câu lặp 3 LẦN rồi mới qua câu kế tiếp."
    & $n "   B5. Bật lại cả đoạn 2 phút, nói ĐỒNG THỜI với speaker (nói đè lên)."
    & $n "       Làm 3 lần liên tiếp, không dừng."
    & $n "   B6. 🎙️ TẮT tiếng speaker → GHI ÂM em nói lại đoạn đó MỘT MÌNH."
    & $n "       Đặt tên: ${dayTag}_SHADOWING_<TÊN EM>.m4a"
    & $n ""
    & $n "④ 🎙️ BÀI TÓM TẮT 3 PHÚT - CÓ CHẤM ĐIỂM"
    & $n "Ghi âm em nói 3 PHÚT (tối thiểu 2'30, tối đa 3'30):"
    & $n "   • 30 giây - Podcast/bài hôm nay nói về điều gì?"
    & $n "   • 90 giây - 5 từ vựng mới, mỗi từ đặt 1 câu CỦA RIÊNG EM"
    & $n "   • 60 giây - Liên hệ bản thân em với chủ đề $($lesson.topic.ToUpper())"
    & $n "   Đặt tên: ${dayTag}_TOMTAT3P_<TÊN EM>.m4a"
    & $n ""
    & $n "⑤ ✍️ GÕ LẠI LỜI MÌNH VỪA NÓI - BẮT BUỘC"
    & $n "Nghe lại bản ghi ở bước ④, gõ đúng những gì em đã nói (kể cả chỗ nói sai)"
    & $n "vào file: ${dayTag}_TRANSCRIPT_<TÊN EM>.txt"
    & $n "→ Cô cần file này để chấm chi tiết. Và đây cũng là bước giúp em tiến bộ"
    & $n "   nhanh nhất, vì em sẽ TỰ nhìn ra lỗi của chính mình."
    & $n ""
    & $n "━━━━━━━━━━━━━━━━━━━━━━━"
    & $n "📤 NỘP BÀI - HẠN $deadline"
    foreach ($s in $cfg.students) {
        & $n "   $($s.name):"
        & $n "   $($s.folderUrl)"
    }
    & $n "(Access đã mở sẵn - bấm link → Tải lên / Upload là xong)"
    & $n ""
    & $n "Nộp đủ 4 file: BAITAP.docx · SHADOWING.m4a · TOMTAT3P.m4a · TRANSCRIPT.txt"
    & $n ""
    & $n "Cô chấm theo 4 tiêu chí IELTS Speaking (Fluency & Coherence · Lexical"
    & $n "Resource · Grammatical Range · Pronunciation) và trả điểm + nhận xét"
    & $n "ngay trong ngày. Cố lên nhé! 💪"

    return $sb.ToString().TrimEnd()
}

# ---------- tin nhắn NHẮC NỘP ----------
function New-RemindMessage {
    $who = if ($Missing -and $Missing.Count -gt 0) { $Missing } else { $cfg.students.name }
    $sb = [System.Text.StringBuilder]::new()
    $n = { param($t) [void]$sb.AppendLine($t) }

    & $n "⏰ NHẮC NỘP BÀI - $dayTag · $viDate · chủ đề $($lesson.topic.ToUpper())"
    & $n ""
    & $n "Đến giờ này cô chưa nhận được bài của:"
    foreach ($w in $who) { & $n "   ❗ $w" }
    & $n ""
    & $n "Hạn nộp: $deadline"
    & $n ""
    & $n "Còn thiếu file nào thì nộp file đó, đừng để trống cả buổi nhé:"
    & $n "   □ ${dayTag}_$($lesson.topic)_BAITAP_<TÊN EM>.docx"
    & $n "   □ ${dayTag}_SHADOWING_<TÊN EM>.m4a"
    & $n "   □ ${dayTag}_TOMTAT3P_<TÊN EM>.m4a"
    & $n "   □ ${dayTag}_TRANSCRIPT_<TÊN EM>.txt"
    & $n ""
    foreach ($s in $cfg.students) {
        if ($who -contains $s.name) {
            & $n "$($s.name) → $($s.folderUrl)"
        }
    }
    & $n ""
    & $n "Nếu hôm nay em bận thật thì nhắn cô 1 câu, cô dời hạn cho."
    & $n "Im lặng không nộp mới là điều cô không muốn. 🙏"

    return $sb.ToString().TrimEnd()
}

# ---------- stage file ----------
function Copy-Materials {
    $dayDir = Join-Path $outDir "$dayTag`_$($lesson.topic -replace '[^\w]', '')"
    if (-not (Test-Path $dayDir)) { New-Item -ItemType Directory $dayDir | Out-Null }
    $copied = @()
    foreach ($p in @($pptPath, $docPath)) {
        if (Test-Path $p) {
            Copy-Item $p $dayDir -Force
            $copied += (Join-Path $dayDir (Split-Path $p -Leaf))
        }
        else { Write-Warning "Không tìm thấy: $p" }
    }
    return @{ Dir = $dayDir; Files = $copied }
}

# ---------- chạy ----------
switch ($Action) {

    'Info' {
        [pscustomobject]@{
            Day        = $lesson.day
            Ngay       = $viDate
            ChuDe      = $lesson.topic
            PPT        = $pptPath
            DOCX       = $docPath
            PPTTonTai  = Test-Path $pptPath
            DOCXTonTai = Test-Path $docPath
            Podcast    = $podcastUrl
            HanNop     = $deadline
        } | Format-List
    }

    'Stage' {
        $r = Copy-Materials
        "Đã stage $($r.Files.Count) file vào: $($r.Dir)"
        $r.Files | ForEach-Object { "  $_" }
    }

    'Assign' {
        $msg = New-AssignMessage
        $f = Join-Path $outDir "$dayTag`_GIAOBAI.txt"
        $msg | Out-File $f -Encoding utf8
        $r = Copy-Materials
        $msg
        ""
        "─────────────────────────────────────"
        "✔ Tin nhắn đã lưu: $f"
        "✔ File đính kèm sẵn sàng tại: $($r.Dir)"
        $r.Files | ForEach-Object { "    $_" }
    }

    'Remind' {
        $msg = New-RemindMessage
        $f = Join-Path $outDir "$dayTag`_NHACNOP.txt"
        $msg | Out-File $f -Encoding utf8
        $msg
        ""
        "─────────────────────────────────────"
        "✔ Tin nhắn đã lưu: $f"
    }

    'Clip' {
        $msg = if ($Missing) { New-RemindMessage } else { New-AssignMessage }
        Set-Clipboard -Value $msg
        "✔ Đã copy tin nhắn vào clipboard ($($msg.Length) ký tự). Ctrl+V vào Zalo."
    }

    'ClipFiles' {
        $r = Copy-Materials
        if ($r.Files.Count -eq 0) { throw "Không có file nào để copy." }
        Set-Clipboard -Path $r.Files
        "✔ Đã copy $($r.Files.Count) file vào clipboard. Ctrl+V vào khung chat Zalo."
        $r.Files | ForEach-Object { "    $(Split-Path $_ -Leaf)" }
    }
}
