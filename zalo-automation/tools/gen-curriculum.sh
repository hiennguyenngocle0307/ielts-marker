#!/bin/bash
PODS=("nL1_N_cX1II|Talk About Your Day (B2-C1)"
"HkzLDqMOpWM|Leading With Clarity - Workplace English"
"OcOmLcVfJR4|Real Slang, Idioms & Listening"
"4qJM6fPN9c4|30-Minute C1 Listening Practice"
"9kt0j5AfrXc|Learn How to Talk About Yourself"
"hubiP47XSak|What's Your Dream Job?"
"KFwpxB8uslk|Talk About Dreams and Goals"
"TT7u84ReKso|Talk With Confidence"
"eryDcxZxbE4|How to Protect Your Peace"
"_TW0c33peUs|Stop Thinking, Start Talking"
"rf3VXMY9-4A|Real Daily Life English"
"mr3q9qDCvt4|Talk About Daily Routine")
NP=${#PODS[@]}
echo '{'
echo '  "startDate": "2026-09-01",'
echo '  "timezone": "Asia/Ho_Chi_Minh",'
echo '  "zaloGroup": "_IELTS NHÀ",'
echo '  "students": ['
echo '    { "name": "HUYỀN TRÂM", "folderId": "1aczfEz9n0Hx389eH1bY0G_8K2KHDUYMY", "folderUrl": "https://drive.google.com/drive/folders/1aczfEz9n0Hx389eH1bY0G_8K2KHDUYMY" },'
echo '    { "name": "MOON - NGHI", "folderId": "1VkkXW_029flsO2RIWP18eyPBHEC6KiL-", "folderUrl": "https://drive.google.com/drive/folders/1VkkXW_029flsO2RIWP18eyPBHEC6KiL-" }'
echo '  ],'
echo '  "drive": {'
echo '    "rootFolderId": "1t1H_TgaToZ5ixs4NGBhn3DHNpKdms4_K",'
echo '    "rootFolderUrl": "https://drive.google.com/drive/folders/1t1H_TgaToZ5ixs4NGBhn3DHNpKdms4_K",'
echo '    "trackingSheetId": "1sftpaRdS8K1gGvBy2d87XaHM5tvWnJOTL7DTXrCPJfY",'
echo '    "trackingSheetUrl": "https://docs.google.com/spreadsheets/d/1sftpaRdS8K1gGvBy2d87XaHM5tvWnJOTL7DTXrCPJfY/edit"'
echo '  },'
echo '  "sourceRoot": "D:/IELTS MATERIALS/IELTS APPS/ILETS  SPEAKING DAILY/Free Lessons - 50 Chu De (Keith Academy)",'
echo '  "markerAppUrl": "https://hiennguyenngocle0307.github.io/ielts-marker/",'
echo '  "days": ['
i=0
while IFS= read -r topic; do
  num=$(printf "%02d" $((i+1)))
  name="${topic#*- }"
  p="${PODS[$((i % NP))]}"
  vid="${p%%|*}"; vtitle="${p#*|}"
  date=$(date -d "2026-09-01 +$i days" +%Y-%m-%d)
  sep=","; if [ $i -eq 55 ]; then sep=""; fi
  printf '    { "day": %d, "date": "%s", "topic": "%s", "ppt": "Bai giang PPT/%s.pptx", "doc": "Bai tap Word/%s.docx", "pdf": "PDF goc (Keith)/%s.pdf", "podcastId": "%s", "podcastTitle": "%s" }%s\n' \
    $((i+1)) "$date" "$name" "$topic" "$topic" "$topic" "$vid" "$vtitle" "$sep"
  i=$((i+1))
done < /tmp/topics.txt
echo '  ]'
echo '}'
