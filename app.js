/* IELTS Speaking Marker — offline marking tool
   No frameworks, no build step, no network calls. Everything stays on this machine:
   - transcript + scores + error log + feedback are saved to localStorage (this browser only)
   - the audio file itself is never uploaded or persisted between sessions
*/

(function () {
  "use strict";

  // ---------------------------------------------------------------------
  // 1. Rubric descriptors (own wording, paraphrased summary of the four
  //    official IELTS Speaking criteria — not verbatim IELTS text).
  // ---------------------------------------------------------------------
  const DESCRIPTORS = {
    fc: {
      1: "Gần như không giao tiếp được bằng tiếng Anh nói.",
      2: "Chỉ nói được vài từ/cụm từ học thuộc lòng, không tạo được câu.",
      3: "Trả lời rất ngắt quãng, chỉ truyền đạt được ý cơ bản trong tình huống quen thuộc.",
      4: "Không thể trả lời mà không dừng lại lâu để tìm từ/ý; nói chậm, lặp lại nhiều; tự sửa lỗi liên tục; chỉ nối câu bằng liên từ cơ bản (and, but, so).",
      5: "Duy trì được luồng nói nhưng phải dùng lặp từ, tự sửa lỗi hoặc nói chậm lại để 'câu giờ'; ý đơn giản thì trôi chảy, ý phức tạp thì bị vấp; lạm dụng một vài từ nối quen thuộc.",
      6: "Sẵn sàng nói dài nhưng đôi lúc mất mạch lạc do lặp từ, tự sửa lỗi hoặc ngập ngừng; dùng nhiều loại từ nối nhưng không phải lúc nào cũng đúng chỗ.",
      7: "Nói dài mà không tốn nhiều công sức, không mất mạch lạc rõ rệt; có ngập ngừng/lặp/tự sửa nhưng chủ yếu liên quan đến việc chọn từ/ngữ pháp chứ không phải nội dung; dùng từ nối khá linh hoạt.",
      8: "Nói trôi chảy, chỉ ngập ngừng thỉnh thoảng để tìm ý (không phải tìm từ); triển khai chủ đề mạch lạc, hợp lý; dùng đa dạng từ nối và liên kết diễn đạt linh hoạt.",
      9: "Nói trôi chảy gần như tuyệt đối, chỉ lặp/tự sửa rất hiếm và liên quan đến nội dung; duy trì mạch nói dài một cách tự nhiên; ý tưởng mạch lạc, tổ chức tốt, dùng liên kết tự nhiên và chính xác."
    },
    lr: {
      1: "Không đủ vốn từ để truyền đạt bất kỳ ý nào.",
      2: "Vốn từ cực kỳ hạn chế, chỉ vài từ đơn lẻ.",
      3: "Vốn từ chỉ đủ cho vài từ/cụm quen thuộc, thường sai nghĩa.",
      4: "Vốn từ chỉ đủ nói về chủ đề quen thuộc; diễn giải (paraphrase) rất hạn chế và thường không thành công.",
      5: "Đủ vốn từ để nói về chủ đề quen thuộc lẫn không quen thuộc nhưng thiếu linh hoạt; cố diễn giải nhưng không phải lúc nào cũng thành công.",
      6: "Đủ vốn từ để nói dài về nhiều chủ đề, nhưng đôi khi dùng từ chưa phù hợp; diễn giải thường thành công.",
      7: "Vốn từ đủ linh hoạt để bàn nhiều chủ đề; dùng được một số từ ít thông dụng/thành ngữ, có ý thức về văn phong và collocation dù đôi chỗ chưa chuẩn; diễn giải hiệu quả.",
      8: "Vốn từ rộng, dùng linh hoạt và chính xác để diễn đạt ý; dùng khéo léo từ ít thông dụng/thành ngữ dù đôi khi còn sai nhỏ về lựa chọn từ/collocation; diễn giải tự nhiên khi cần.",
      9: "Vốn từ linh hoạt và chính xác tuyệt đối ở mọi chủ đề; dùng ngôn ngữ thành ngữ một cách tự nhiên, tinh tế như người bản ngữ."
    },
    gra: {
      1: "Không tạo được câu có cấu trúc.",
      2: "Chỉ nói được cụm từ rời rạc, không có cấu trúc câu rõ ràng.",
      3: "Câu rất đơn giản, nhiều lỗi khiến người nghe khó hiểu.",
      4: "Kiểm soát được câu đơn cơ bản nhưng hiếm khi dùng mệnh đề phụ; lỗi xảy ra thường xuyên và có thể gây khó hiểu cho người nghe.",
      5: "Kiểm soát khá tốt câu đơn; có thử câu phức nhưng phạm vi hạn chế, thường mắc lỗi và đôi khi phải dừng lại sửa/nói lại.",
      6: "Kết hợp câu đơn và câu phức nhưng chưa linh hoạt; câu phức thường mắc lỗi, tuy nhiên hiếm khi gây cản trở giao tiếp.",
      7: "Dùng linh hoạt cả câu đơn và câu phức; nhiều câu không lỗi, nhưng vẫn còn một số lỗi ngữ pháp xen kẽ.",
      8: "Dùng đa dạng cấu trúc câu một cách linh hoạt; phần lớn câu không có lỗi, chỉ còn vài lỗi nhỏ hoặc cách diễn đạt chưa thật tự nhiên.",
      9: "Dùng đầy đủ các dạng cấu trúc câu một cách tự nhiên và phù hợp; chính xác gần như tuyệt đối, chỉ có lỗi rất nhỏ kiểu người bản ngữ đôi khi mắc phải."
    },
    pron: {
      1: "Không thể phát âm để người nghe hiểu được.",
      2: "Phát âm sai nghiêm trọng phần lớn các từ, gần như không hiểu được.",
      3: "Phát âm gây khó hiểu thường xuyên, người nghe phải đoán ý rất nhiều.",
      4: "Dùng rất ít đặc điểm phát âm hiệu quả (trọng âm, ngữ điệu...); cố kiểm soát nhưng hay bị lỗi; phát âm sai từ thường xuyên gây khó khăn cho người nghe.",
      5: "Có một số đặc điểm phát âm tốt nhưng chưa ổn định; phát âm sai từ/âm khá thường xuyên, người nghe vẫn theo dõi được nhìn chung.",
      6: "Dùng được nhiều đặc điểm phát âm nhưng mức kiểm soát chưa đều; phát âm sai đôi lúc làm giảm độ rõ, nhưng nhìn chung vẫn hiểu được xuyên suốt.",
      7: "Có hầu hết ưu điểm của band 6 và một phần ưu điểm của band 8; nhìn chung dễ hiểu dù đôi khi phát âm sai từ/âm khiến người nghe phải cố gắng.",
      8: "Dùng hiệu quả nhiều đặc điểm phát âm, thỉnh thoảng mới có sai sót nhỏ; dễ hiểu xuyên suốt, ảnh hưởng của ngôn ngữ mẹ đẻ rất ít.",
      9: "Dùng đầy đủ và tinh tế các đặc điểm phát âm (trọng âm câu, ngữ điệu, âm...) một cách nhất quán; nghe dễ dàng, không tốn công sức của người nghe."
    }
  };

  const CRIT_LABELS = { fc: "Fluency & Coherence", lr: "Lexical Resource", gra: "Grammatical Range & Accuracy", pron: "Pronunciation" };

  const FILLERS = ["um", "uh", "erm", "hmm", "you know", "i mean", "sort of", "kind of", "basically", "like", "actually", "well", "so yeah"];

  // Error log categories — mapped visually to the same blue/pink brand hues used elsewhere.
  const CATS = {
    pron:  { label: "Phát âm (âm/từ)",         icon: "🗣️", short: "Phát âm" },
    into:  { label: "Ngữ điệu / Trọng âm",      icon: "🎵", short: "Ngữ điệu" },
    vocab: { label: "Từ vựng / Collocation",    icon: "📖", short: "Từ vựng" },
    gram:  { label: "Ngữ pháp",                 icon: "✏️", short: "Ngữ pháp" }
  };
  const CAT_ORDER = ["pron", "into", "vocab", "gram"];

  // ---------------------------------------------------------------------
  // 2. State
  // ---------------------------------------------------------------------
  let state = {
    id: null,
    studentName: "",
    testDate: "",
    testPart: "",
    teacherName: "",
    examinerNote: "",
    audioFileName: "",
    audioDuration: 0,
    transcript: "",
    flags: [], // {time, category, heard, fix}
    scores: { fc: 4, lr: 4, gra: 4, pron: 4 },
    feedbackFinal: "",
    savedAt: null
  };

  let audioURL = null;

  // ---------------------------------------------------------------------
  // 3. DOM refs
  // ---------------------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const el = {
    studentName: $("#studentName"),
    testDate: $("#testDate"),
    testPart: $("#testPart"),
    teacherName: $("#teacherName"),
    examinerNote: $("#examinerNote"),
    dropzone: $("#dropzone"),
    audioFile: $("#audioFile"),
    audioControls: $("#audioControls"),
    player: $("#player"),
    durationBadge: $("#durationBadge"),
    timeline: $("#timeline"),
    btnPrevFlag: $("#btnPrevFlag"),
    btnNextFlag: $("#btnNextFlag"),
    errCategory: $("#errCategory"),
    errHeard: $("#errHeard"),
    errFix: $("#errFix"),
    btnFlag: $("#btnFlag"),
    errorSummary: $("#errorSummary"),
    flagList: $("#flagList"),
    transcript: $("#transcript"),
    wordCountBadge: $("#wordCountBadge"),
    statsRow: $("#statsRow"),
    issueCountBadge: $("#issueCountBadge"),
    annotatedTranscript: $("#annotatedTranscript"),
    suggestionPanel: $("#suggestionPanel"),
    errorTable: $("#errorTable"),
    ringFill: $("#ringFill"),
    overallNumber: $("#overallNumber"),
    obFC: $("#obFC"), obLR: $("#obLR"), obGRA: $("#obGRA"), obPron: $("#obPron"),
    suggestionBox: $("#suggestionBox"),
    btnInsertFeedback: $("#btnInsertFeedback"),
    btnRefreshSuggestion: $("#btnRefreshSuggestion"),
    feedbackFinal: $("#feedbackFinal"),
    btnExportReport: $("#btnExportReport"),
    btnExportCsv: $("#btnExportCsv"),
    btnHistory: $("#btnHistory"),
    btnNew: $("#btnNew"),
    btnSave: $("#btnSave"),
    drawer: $("#drawer"),
    drawerBackdrop: $("#drawerBackdrop"),
    btnCloseDrawer: $("#btnCloseDrawer"),
    historyList: $("#historyList"),
    printReport: $("#printReport")
  };

  const RING_CIRC = 2 * Math.PI * 52;

  // ---------------------------------------------------------------------
  // 4. Utility
  // ---------------------------------------------------------------------
  function fmtTime(t) {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function roundOverall(avg) {
    const rem = avg - Math.floor(avg);
    if (Math.abs(rem - 0.25) < 1e-6) return Math.floor(avg) + 0.5;
    if (Math.abs(rem - 0.75) < 1e-6) return Math.ceil(avg);
    return Math.round(avg * 4) / 4; // 0 / .25 / .5 handled naturally, snap float noise
  }

  function uid() {
    return "s_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
  }

  // ---------------------------------------------------------------------
  // 5. Audio handling
  // ---------------------------------------------------------------------
  function loadAudioFile(file) {
    if (!file) return;
    if (audioURL) URL.revokeObjectURL(audioURL);
    audioURL = URL.createObjectURL(file);
    el.player.src = audioURL;
    el.audioControls.classList.add("active");
    state.audioFileName = file.name;
  }

  el.audioFile.addEventListener("change", (e) => loadAudioFile(e.target.files[0]));

  ["dragenter", "dragover"].forEach((evt) =>
    el.dropzone.addEventListener(evt, (e) => { e.preventDefault(); el.dropzone.classList.add("drag-over"); })
  );
  ["dragleave", "drop"].forEach((evt) =>
    el.dropzone.addEventListener(evt, (e) => { e.preventDefault(); el.dropzone.classList.remove("drag-over"); })
  );
  el.dropzone.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("audio")) loadAudioFile(file);
  });

  $$(".speed-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".speed-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      el.player.playbackRate = parseFloat(btn.dataset.speed);
    });
  });

  el.player.addEventListener("loadedmetadata", () => {
    state.audioDuration = el.player.duration || 0;
    el.durationBadge.textContent = state.audioDuration ? `Tổng thời lượng: ${fmtTime(state.audioDuration)}` : "";
    renderStats(computeStats(state.transcript));
    renderTimeline();
  });

  // ---- Error log (categorized, timestamped) ----
  el.btnFlag.addEventListener("click", () => {
    if (!el.player.src) { alert("Hãy tải file audio lên trước."); return; }
    const heard = el.errHeard.value.trim();
    if (!heard) { el.errHeard.focus(); alert("Mô tả 'Nghe được gì' trước khi ghi lỗi."); return; }
    const entry = {
      time: el.player.currentTime,
      category: el.errCategory.value,
      heard,
      fix: el.errFix.value.trim()
    };
    state.flags.push(entry);
    state.flags.sort((a, b) => a.time - b.time);
    el.errHeard.value = "";
    el.errFix.value = "";
    el.errHeard.focus();
    renderFlags();
    renderTimeline();
    renderErrorSummary();
    renderErrorTable();
    applyAutoBandSuggestions();
  });

  function renderErrorSummary() {
    const counts = { pron: 0, into: 0, vocab: 0, gram: 0 };
    state.flags.forEach((f) => { if (counts[f.category] != null) counts[f.category]++; });
    const total = state.flags.length;
    if (total === 0) { el.errorSummary.innerHTML = ""; return; }
    el.errorSummary.innerHTML = CAT_ORDER.map((c) =>
      `<span class="cat-chip cat-${c}">${CATS[c].icon} ${CATS[c].short}: ${counts[c]}</span>`
    ).join("") + `<span class="cat-chip" style="background:var(--yellow-50); color:var(--yellow-700);">Tổng: ${total}</span>`;
  }

  function renderFlags() {
    if (state.flags.length === 0) {
      el.flagList.innerHTML = '<li class="empty-hint">Chưa có lỗi nào được ghi. Nghe audio, chọn loại lỗi, mô tả rồi bấm "Ghi lỗi tại thời điểm đang nghe".</li>';
      return;
    }
    el.flagList.innerHTML = state.flags.map((f, i) => {
      const cat = CATS[f.category] || CATS.pron;
      return `
      <li class="flag-item cat-${f.category}">
        <div class="flag-item-head">
          <button class="flag-time" data-idx="${i}" data-action="seek">${fmtTime(f.time)}</button>
          <span class="flag-cat-label">${cat.icon} ${cat.label}</span>
          <button class="flag-del" data-idx="${i}" data-action="del">✕</button>
        </div>
        <div class="flag-heard">${escapeHtml(f.heard)}</div>
        ${f.fix ? `<div class="flag-fix"><b>Sửa:</b> ${escapeHtml(f.fix)}</div>` : ""}
      </li>`;
    }).join("");
  }

  el.flagList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const idx = parseInt(btn.dataset.idx, 10);
    if (btn.dataset.action === "seek") {
      el.player.currentTime = state.flags[idx].time;
      el.player.play();
    } else if (btn.dataset.action === "del") {
      state.flags.splice(idx, 1);
      renderFlags();
      renderTimeline();
      renderErrorSummary();
      renderErrorTable();
      applyAutoBandSuggestions();
    }
  });

  // ---- Timeline: visualise where errors sit across a long (9-15 min) file ----
  function renderTimeline() {
    const duration = state.audioDuration || el.player.duration || 0;
    if (!duration || !isFinite(duration)) {
      el.timeline.innerHTML = '<span class="timeline-empty">Timeline sẽ hiện sau khi audio tải xong.</span>';
      return;
    }
    if (state.flags.length === 0) {
      el.timeline.innerHTML = "";
      return;
    }
    el.timeline.innerHTML = state.flags.map((f) => {
      const pct = Math.min(100, Math.max(0, (f.time / duration) * 100));
      const cat = CATS[f.category] || CATS.pron;
      const title = `${fmtTime(f.time)} · ${cat.label}: ${f.heard}`;
      return `<div class="timeline-marker cat-${f.category}" style="left:${pct}%" title="${escapeHtml(title)}" data-time="${f.time}"></div>`;
    }).join("");
  }

  function renderErrorTable() {
    const counts = { pron: 0, into: 0, vocab: 0, gram: 0 };
    const examples = { pron: null, into: null, vocab: null, gram: null };
    state.flags.forEach((f) => {
      if (counts[f.category] != null) counts[f.category]++;
      if (!examples[f.category]) examples[f.category] = f.heard;
    });
    lastAutoIssues.forEach((iss) => {
      const cat = iss.category === "structure" ? "gram" : iss.category;
      if (counts[cat] != null) counts[cat]++;
      if (!examples[cat]) examples[cat] = iss.matchText;
    });
    const total = counts.pron + counts.into + counts.vocab + counts.gram;
    if (total === 0) {
      el.errorTable.innerHTML = '<span class="empty-hint">Chưa có dữ liệu — dán transcript và/hoặc nghe + ghi lỗi phát âm.</span>';
      return;
    }
    const rows = CAT_ORDER.map((c) => `
      <tr>
        <td>${CATS[c].icon} ${CATS[c].label}</td>
        <td class="et-count">${counts[c]}</td>
        <td>${examples[c] ? `"${escapeHtml(examples[c])}"` : "—"}</td>
        <td>${escapeHtml(REMEDIATION[c])}</td>
      </tr>`).join("");
    el.errorTable.innerHTML = `
      <div class="error-table-wrap">
        <table class="error-table">
          <tr><th>Loại lỗi</th><th>Số lượng</th><th>Ví dụ tiêu biểu</th><th>Hướng khắc phục</th></tr>
          ${rows}
        </table>
      </div>`;
  }

  el.timeline.addEventListener("click", (e) => {
    const marker = e.target.closest(".timeline-marker");
    if (marker) {
      el.player.currentTime = parseFloat(marker.dataset.time);
      el.player.play();
      return;
    }
    const duration = state.audioDuration || el.player.duration || 0;
    if (!duration) return;
    const rect = el.timeline.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    el.player.currentTime = Math.max(0, Math.min(duration, pct * duration));
  });

  el.btnPrevFlag.addEventListener("click", () => {
    if (state.flags.length === 0) return;
    const t = el.player.currentTime;
    const prev = [...state.flags].reverse().find((f) => f.time < t - 0.25);
    el.player.currentTime = prev ? prev.time : state.flags[0].time;
  });
  el.btnNextFlag.addEventListener("click", () => {
    if (state.flags.length === 0) return;
    const t = el.player.currentTime;
    const next = state.flags.find((f) => f.time > t + 0.25);
    el.player.currentTime = next ? next.time : state.flags[state.flags.length - 1].time;
  });

  // ---------------------------------------------------------------------
  // 6. Transcript stats
  // ---------------------------------------------------------------------
  function computeStats(text) {
    const words = (text.match(/[A-Za-zÀ-ỹ']+/g) || []);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
    const sentenceCount = sentences.length || (wordCount ? 1 : 0);
    const avgSentenceLen = sentenceCount ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;

    const lower = text.toLowerCase();
    let fillerCount = 0;
    FILLERS.forEach((f) => {
      const re = new RegExp(`\\b${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
      const m = lower.match(re);
      if (m) fillerCount += m.length;
    });

    const repeatMatches = lower.match(/\b(\w+)\s+\1\b/g) || [];
    const repeatCount = repeatMatches.length;

    const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
    const ttr = wordCount ? Math.round((uniqueWords.size / wordCount) * 100) : 0;

    const longSentences = sentences.filter((s) => (s.match(/[A-Za-zÀ-ỹ']+/g) || []).length > 25).length;

    let audioDuration = state.audioDuration || el.player.duration;
    let wpm = null;
    if (audioDuration && isFinite(audioDuration) && audioDuration > 0 && wordCount > 0) {
      wpm = Math.round(wordCount / (audioDuration / 60));
    }

    return { wordCount, sentenceCount, avgSentenceLen, fillerCount, repeatCount, ttr, longSentences, wpm };
  }

  function renderStats(stats) {
    el.wordCountBadge.textContent = `${stats.wordCount} từ`;
    const chips = [];
    chips.push({ label: "Câu", val: stats.sentenceCount });
    chips.push({ label: "TB từ/câu", val: stats.avgSentenceLen });
    chips.push({ label: "Từ đệm", val: stats.fillerCount, warn: stats.fillerCount > 8 });
    chips.push({ label: "Lặp từ liền kề", val: stats.repeatCount, warn: stats.repeatCount > 2 });
    chips.push({ label: "Đa dạng từ vựng", val: stats.ttr + "%", warn: stats.ttr < 40 && stats.wordCount > 20 });
    chips.push({ label: "Câu dài >25 từ", val: stats.longSentences, warn: stats.longSentences > 3 });
    if (stats.wpm) chips.push({ label: "Tốc độ nói (WPM)", val: stats.wpm, warn: stats.wpm < 100 || stats.wpm > 190 });

    el.statsRow.innerHTML = chips.map((c) => `
      <span class="stat-chip ${c.warn ? "warn" : ""}">${c.label}: <span class="stat-num">${c.val}</span></span>
    `).join("");
  }

  let lastStats = computeStats("");
  let autoAnalyzeTimer = null;

  function onTranscriptChange() {
    state.transcript = el.transcript.value;
    lastStats = computeStats(state.transcript);
    renderStats(lastStats);
    clearTimeout(autoAnalyzeTimer);
    autoAnalyzeTimer = setTimeout(runAutoAnalysis, 500);
  }
  el.transcript.addEventListener("input", onTranscriptChange);

  // ---------------------------------------------------------------------
  // 6b. Auto error analysis (offline, heuristic, pattern-based)
  //     Detects common ESL grammar/collocation mistakes directly from the
  //     transcript. This is pattern-matching, not language understanding —
  //     always flagged to the teacher as "gợi ý phát hiện tự động" and never
  //     auto-applied without review.
  // ---------------------------------------------------------------------
  const IRREGULAR_PAST = {
    go: "went", have: "had", has: "had", do: "did", does: "did", see: "saw", eat: "ate", take: "took",
    make: "made", get: "got", give: "gave", come: "came", say: "said", think: "thought", buy: "bought",
    bring: "brought", catch: "caught", teach: "taught", feel: "felt", find: "found", keep: "kept",
    leave: "left", lose: "lost", meet: "met", pay: "paid", run: "ran", sell: "sold", send: "sent",
    sit: "sat", sleep: "slept", spend: "spent", stand: "stood", tell: "told", understand: "understood",
    win: "won", write: "wrote", speak: "spoke", break: "broke", choose: "chose", drive: "drove",
    fall: "fell", fly: "flew", forget: "forgot", grow: "grew", hear: "heard", hold: "held", know: "knew",
    lead: "led", lend: "lent", ride: "rode", ring: "rang", rise: "rose", show: "showed", sing: "sang",
    swim: "swam", wake: "woke", wear: "wore", become: "became", read: "read"
  };
  const BASE_VERBS = Object.keys(IRREGULAR_PAST).filter((v) => v !== "has" && v !== "does").join("|");

  // [regex (must have 1+ capture groups spanning the flagged phrase), makeFix, note]
  const GRAMMAR_DETECTORS = [
    {
      re: /\b(he|she|it|this|that)\s+(go|come|like|want|need|have|do|make|take|get|know|think|live|work|study|play|watch|eat|drink|love|hate|say|tell|walk|run|feel|look|seem|belong|prefer|enjoy|believe|include|use|need|start|stay)\b(?!\s*(?:ing|s\b))/gi,
      note: "Chia động từ sai ngôi thứ 3 số ít (thiếu -s/-es).",
      fix: (m) => {
        const v = m[2].toLowerCase();
        const irregular3rd = { have: "has", do: "does" };
        const form = irregular3rd[v] || m[2] + (/[sxzo]$|ch$|sh$/i.test(m[2]) ? "es" : "s");
        return `${m[1]} ${form}`;
      }
    },
    {
      re: new RegExp(`\\b(i|we|they|you)\\s+(${BASE_VERBS})\\b`, "gi"),
      note: "__PAST_TIME__", // handled specially below (needs whole-sentence context)
      fix: (m) => `${m[1]} ${IRREGULAR_PAST[m[2].toLowerCase()] || m[2] + "ed"}`
    },
    {
      re: /\b(don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't)\b([^.!?]{0,30}?)\b(no|nothing|nobody|none|never)\b/gi,
      note: "Phủ định kép (double negative) — tiếng Anh chuẩn chỉ dùng một từ phủ định.",
      fix: (m) => null
    },
    {
      re: /\bsince\s+(a|one|two|three|four|five|six|seven|eight|nine|ten|\d+)\s+(year|month|week|day)s?\b/gi,
      note: "'since' dùng cho mốc thời gian, khoảng thời gian phải dùng 'for'.",
      fix: (m) => `for ${m[1]} ${m[2]}s`
    },
    {
      re: /\bmore\s+(better|worse|taller|shorter|faster|slower|bigger|smaller|easier|harder|higher|lower|cheaper|older|younger|busier|happier)\b/gi,
      note: "So sánh hơn kép (double comparative) — bỏ 'more' vì tính từ đã ở dạng so sánh hơn.",
      fix: (m) => m[1]
    },
    {
      re: /\b(i am|i'm|he is|he's|she is|she's|they are|they're|we are|we're)\s+(teacher|doctor|engineer|student|nurse|farmer|worker|driver|singer|dancer|writer|artist|lawyer|manager|accountant)\b/gi,
      note: "Thiếu mạo từ (a/an) trước danh từ nghề nghiệp số ít.",
      fix: (m) => `${m[1]} a ${m[2]}`
    }
  ];

  const COLLOCATION_FIXES = [
    { re: /\bmake\s+(a\s+|an\s+)?(photo|photograph)s?\b/gi, fix: "take a photo", note: "Chụp ảnh: 'take a photo', không dùng 'make'." },
    { re: /\bdo\s+(a\s+|an\s+)?mistakes?\b/gi, fix: "make a mistake", note: "'make a mistake', không dùng 'do'." },
    { re: /\bmake\s+(my\s+|the\s+)?homework\b/gi, fix: "do homework", note: "'do homework', không dùng 'make'." },
    { re: /\bmake\s+(my\s+|the\s+)?housework\b/gi, fix: "do housework", note: "'do housework', không dùng 'make'." },
    { re: /\bdo\s+(a\s+)?decisions?\b/gi, fix: "make a decision", note: "'make a decision', không dùng 'do'." },
    { re: /\bsay\s+(a\s+)?lies?\b/gi, fix: "tell a lie", note: "'tell a lie', không dùng 'say'." },
    { re: /\bmarried\s+with\b/gi, fix: "married to", note: "'married to', không dùng 'with'." },
    { re: /\bdepend\s+of\b/gi, fix: "depend on", note: "'depend on', không dùng 'of'." },
    { re: /\blisten\s+(music|song|radio)\b/gi, fix: (m) => `listen to ${m[1]}`, note: "'listen to' + danh từ — 'listen' cần giới từ 'to'." },
    { re: /\bdiscuss\s+about\b/gi, fix: "discuss", note: "'discuss' là ngoại động từ, không cần 'about'." },
    { re: /\bexplain\s+(me|him|her|us|them)\b/gi, fix: (m) => `explain to ${m[1]}`, note: "'explain to somebody', cần giới từ 'to'." },
    { re: /\bafraid\s+about\b/gi, fix: "afraid of", note: "'afraid of', không dùng 'about'." },
    { re: /\binterested\s+about\b/gi, fix: "interested in", note: "'interested in', không dùng 'about'." },
    { re: /\bvery\s+good\b/gi, fix: "excellent / outstanding", note: "Tính từ cơ bản dùng lặp lại — nâng band Lexical Resource bằng từ đồng nghĩa mạnh hơn." },
    { re: /\bvery\s+bad\b/gi, fix: "terrible / awful", note: "Tính từ cơ bản dùng lặp lại — nâng band Lexical Resource bằng từ đồng nghĩa mạnh hơn." },
    { re: /\bvery\s+nice\b/gi, fix: "lovely / delightful", note: "Tính từ cơ bản dùng lặp lại — nâng band Lexical Resource bằng từ đồng nghĩa mạnh hơn." },
    { re: /\bvery\s+beautiful\b/gi, fix: "stunning / gorgeous", note: "Tính từ cơ bản dùng lặp lại — nâng band Lexical Resource bằng từ đồng nghĩa mạnh hơn." },
    { re: /\bvery\s+big\b/gi, fix: "huge / enormous", note: "Tính từ cơ bản dùng lặp lại — nâng band Lexical Resource bằng từ đồng nghĩa mạnh hơn." }
  ];

  const PAST_TIME_MARKER = /\b(yesterday|last (night|week|month|year|weekend)|(\d+|a|one|two|three|four|five)\s+(day|week|month|year)s?\s+ago|when i was\s+(a\s+|an\s+)?(young|child|kid|student|little))\b/i;

  function splitSentencesWithOffsets(text) {
    const sentences = [];
    let lastIndex = 0;
    const re = /[.!?]+(\s+|$)/g;
    let m;
    while ((m = re.exec(text))) {
      const end = m.index + m[0].length;
      const raw = text.slice(lastIndex, end);
      if (raw.trim()) sentences.push({ text: raw, start: lastIndex, end });
      lastIndex = end;
    }
    if (lastIndex < text.length) {
      const raw = text.slice(lastIndex);
      if (raw.trim()) sentences.push({ text: raw, start: lastIndex, end: text.length });
    }
    return sentences;
  }

  function analyzeTranscript(text) {
    const issues = []; // {start, end, category, matchText, suggestion, note}
    if (!text || !text.trim()) return issues;

    const sentences = splitSentencesWithOffsets(text);

    sentences.forEach((sent) => {
      const hasPastMarker = PAST_TIME_MARKER.test(sent.text);
      const wordsInSentence = (sent.text.match(/[A-Za-zÀ-ỹ']+/g) || []).length;

      // Structural: whole sentence too long / likely run-on
      if (wordsInSentence > 25) {
        issues.push({
          start: sent.start, end: sent.end, category: "structure",
          matchText: sent.text.trim(),
          suggestion: null,
          note: "Câu quá dài (>25 từ) — cân nhắc tách thành 2 câu ngắn hơn để tăng độ chính xác ngữ pháp và mạch lạc."
        });
      }

      GRAMMAR_DETECTORS.forEach((det) => {
        det.re.lastIndex = 0;
        let m;
        while ((m = det.re.exec(sent.text))) {
          if (det.note === "__PAST_TIME__" && !hasPastMarker) continue; // only flag base-form verb if a past-time marker is present
          const matchText = m[0];
          const localStart = m.index;
          const globalStart = sent.start + localStart;
          const globalEnd = globalStart + matchText.length;
          const suggestion = det.fix ? det.fix(m) : null;
          const note = det.note === "__PAST_TIME__"
            ? "Có mốc thời gian quá khứ trong câu nhưng động từ vẫn ở dạng nguyên mẫu — cần chia thì quá khứ."
            : det.note;
          issues.push({ start: globalStart, end: globalEnd, category: "gram", matchText, suggestion, note });
          if (!det.re.global) break;
        }
      });

      COLLOCATION_FIXES.forEach((det) => {
        det.re.lastIndex = 0;
        let m;
        while ((m = det.re.exec(sent.text))) {
          const matchText = m[0];
          const globalStart = sent.start + m.index;
          const globalEnd = globalStart + matchText.length;
          const suggestion = typeof det.fix === "function" ? det.fix(m) : det.fix;
          issues.push({ start: globalStart, end: globalEnd, category: "vocab", matchText, suggestion, note: det.note });
        }
      });
    });

    // De-overlap gram/vocab (point) issues among themselves only — a "structure" issue
    // spans the whole sentence and must NEST around point issues, not swallow them.
    const structureIssues = issues.filter((i) => i.category === "structure");
    const pointIssues = issues.filter((i) => i.category !== "structure");
    pointIssues.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));
    const clean = [];
    let cursor = -1;
    pointIssues.forEach((iss) => {
      if (iss.start >= cursor) { clean.push(iss); cursor = iss.end; }
    });
    return clean.concat(structureIssues).sort((a, b) => a.start - b.start);
  }

  function renderAnnotatedTranscript(text, issues) {
    if (!text.trim()) {
      el.annotatedTranscript.innerHTML = '<span class="empty-hint">Dán transcript ở trên để xem phân tích.</span>';
      return;
    }
    if (issues.length === 0) {
      el.annotatedTranscript.innerHTML = `<p>${escapeHtml(text)}</p>`;
      return;
    }

    // Render sentence-by-sentence so a "structure" (too-long-sentence) box can nest
    // around gram/vocab spans instead of competing with them for the same characters.
    const sentences = splitSentencesWithOffsets(text);
    const pointIssues = issues.filter((i) => i.category !== "structure").sort((a, b) => a.start - b.start);
    const structureIssues = issues.filter((i) => i.category === "structure");

    let html = "";
    let cursor = 0;
    let pi = 0;

    sentences.forEach((sent) => {
      html += escapeHtml(text.slice(cursor, sent.start));
      let inner = "";
      let innerCursor = sent.start;
      while (pi < pointIssues.length && pointIssues[pi].start < sent.end) {
        const iss = pointIssues[pi];
        const idx = issues.indexOf(iss);
        inner += escapeHtml(text.slice(innerCursor, iss.start));
        const core = `<b>${escapeHtml(text.slice(iss.start, iss.end))}</b>`;
        const cls = iss.category === "gram" ? "ann-gram" : "ann-vocab";
        inner += `<span class="${cls}" data-issue="${idx}" title="${escapeHtml(iss.note)}">${core}</span>`;
        innerCursor = iss.end;
        pi++;
      }
      inner += escapeHtml(text.slice(innerCursor, sent.end));

      const structIssue = structureIssues.find((s) => s.start === sent.start && s.end === sent.end);
      if (structIssue) {
        const idx = issues.indexOf(structIssue);
        html += `<span class="ann-box" data-issue="${idx}" title="${escapeHtml(structIssue.note)}">${inner}</span>`;
      } else {
        html += inner;
      }
      cursor = sent.end;
    });
    html += escapeHtml(text.slice(cursor));
    el.annotatedTranscript.innerHTML = `<p>${html}</p>`;
  }

  function renderSuggestionPanel(issues) {
    if (issues.length === 0) {
      el.suggestionPanel.innerHTML = '<span class="empty-hint">Chưa phát hiện lỗi nào trong transcript hiện tại.</span>';
      return;
    }
    el.suggestionPanel.innerHTML = issues.map((iss, i) => {
      const catClass = iss.category === "structure" ? "cat-structure" : `cat-${iss.category}`;
      const label = iss.category === "structure" ? "📏 Câu dài / cấu trúc" : (CATS[iss.category] ? `${CATS[iss.category].icon} ${CATS[iss.category].label}` : iss.category);
      return `
      <div class="suggestion-item ${catClass}" data-issue="${i}">
        <div class="si-head">${label}</div>
        <div class="si-orig">"${escapeHtml(iss.matchText)}"</div>
        ${iss.suggestion ? `<div class="si-fix"><b>Sửa:</b> ${escapeHtml(iss.suggestion)}</div>` : ""}
        <div class="si-fix" style="color:var(--ink-600);">${escapeHtml(iss.note)}</div>
      </div>`;
    }).join("");
  }

  function wireIssueLinking() {
    function setActive(idx, active) {
      $$(`[data-issue="${idx}"]`).forEach((elm) => {
        if (elm.classList.contains("suggestion-item")) return;
        if (active) elm.setAttribute("data-active", "true"); else elm.removeAttribute("data-active");
      });
    }
    el.annotatedTranscript.querySelectorAll("[data-issue]").forEach((elm) => {
      const idx = elm.dataset.issue;
      elm.addEventListener("mouseenter", () => setActive(idx, true));
      elm.addEventListener("mouseleave", () => setActive(idx, false));
      elm.addEventListener("click", () => {
        const panelItem = el.suggestionPanel.querySelector(`[data-issue="${idx}"]`);
        if (panelItem) panelItem.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
    el.suggestionPanel.querySelectorAll("[data-issue]").forEach((elm) => {
      const idx = elm.dataset.issue;
      elm.addEventListener("mouseenter", () => setActive(idx, true));
      elm.addEventListener("mouseleave", () => setActive(idx, false));
      elm.addEventListener("click", () => {
        const span = el.annotatedTranscript.querySelector(`[data-issue="${idx}"]`);
        if (span) span.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  const REMEDIATION = {
    pron: "Luyện âm cuối (-s, -ed), các cặp âm dễ nhầm (θ/s, r/l...) và trọng âm từ đa âm tiết; shadowing theo audio người bản ngữ 10-15 phút/ngày.",
    into: "Luyện lên/xuống giọng đúng chức năng câu (câu hỏi Yes/No lên giọng cuối, câu trần thuật xuống giọng); nghe và bắt chước ngữ điệu người bản ngữ trước khi nói lại.",
    vocab: "Học theo cụm từ (collocation) thay vì từ đơn lẻ; ôn lại danh sách collocation đã sai và thay thế các tính từ cơ bản (good/nice/bad) bằng từ đồng nghĩa mạnh hơn.",
    gram: "Ôn lại quy tắc chia động từ theo chủ ngữ và theo mốc thời gian; luyện viết lại câu đã sai trước khi nói lại để tạo phản xạ đúng.",
    structure: "Luyện chia ý thành câu ngắn, rõ ràng thay vì nối nhiều ý bằng 'and/but/so' liên tục — mỗi câu nên diễn đạt trọn một ý."
  };

  let lastAutoIssues = [];

  function runAutoAnalysis() {
    lastAutoIssues = analyzeTranscript(state.transcript);
    el.issueCountBadge.textContent = `${lastAutoIssues.length} lỗi`;
    renderAnnotatedTranscript(state.transcript, lastAutoIssues);
    renderSuggestionPanel(lastAutoIssues);
    wireIssueLinking();
    renderErrorTable();
    applyAutoBandSuggestions();
  }

  // ---------------------------------------------------------------------
  // 7. Rubric sliders
  // ---------------------------------------------------------------------
  const CRIT_KEYS = ["fc", "lr", "gra", "pron"];
  const sliderTouched = { fc: false, lr: false, gra: false, pron: false };

  function ensureAutoBadge(critEl) {
    let badge = critEl.querySelector(".auto-badge");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "auto-badge";
      badge.textContent = "🤖 gợi ý";
      critEl.querySelector(".crit-name").insertAdjacentElement("afterend", badge);
    }
    return badge;
  }

  function updateCriterion(critEl) {
    const key = critEl.dataset.crit;
    const slider = critEl.querySelector(".crit-slider");
    const band = parseInt(slider.value, 10);
    state.scores[key] = band;
    critEl.querySelector(".crit-band").textContent = band;
    critEl.querySelector(".criterion-desc").textContent = DESCRIPTORS[key][band];
  }

  $$(".criterion").forEach((critEl) => {
    ensureAutoBadge(critEl);
    updateCriterion(critEl);
    critEl.querySelector(".crit-slider").addEventListener("input", () => {
      sliderTouched[critEl.dataset.crit] = true;
      ensureAutoBadge(critEl).classList.remove("show");
      updateCriterion(critEl);
      updateOverall();
      renderSuggestion();
    });
  });

  function applyAutoBandSuggestions() {
    const bands = computeAutoBands(lastStats, lastAutoIssues, state.flags);
    $$(".criterion").forEach((critEl) => {
      const key = critEl.dataset.crit;
      if (sliderTouched[key]) return; // never override a band the teacher already set/confirmed
      const suggested = bands[key];
      if (suggested == null) return;
      critEl.querySelector(".crit-slider").value = suggested;
      updateCriterion(critEl);
      ensureAutoBadge(critEl).classList.add("show");
    });
    updateOverall();
    renderSuggestion();
  }

  function computeAutoBands(stats, issues, manualFlags) {
    const words = Math.max(stats.wordCount, 1);
    const per100 = (n) => (n / words) * 100;
    function bandFromRate(rate, thresholds) {
      for (const [band, maxRate] of thresholds) if (rate <= maxRate) return band;
      return 4;
    }
    // Deliberately conservative thresholds (chấm sát) — capped at band 8, never auto-suggests 9.
    const STRICT = [[8, 0], [7, 1], [6, 2.5], [5, 4.5], [4, Infinity]];

    const gramCount = issues.filter((i) => i.category === "gram" || i.category === "structure").length
      + manualFlags.filter((f) => f.category === "gram").length;
    const vocabCount = issues.filter((i) => i.category === "vocab").length
      + manualFlags.filter((f) => f.category === "vocab").length;

    const graBand = bandFromRate(per100(gramCount), STRICT);
    const lrBand = bandFromRate(per100(vocabCount), STRICT);

    let fcPenalty = 0;
    if (stats.fillerCount > 8) fcPenalty++;
    if (stats.repeatCount > 2) fcPenalty++;
    if (stats.ttr < 40 && stats.wordCount > 20) fcPenalty++;
    if (stats.wpm && (stats.wpm < 100 || stats.wpm > 190)) fcPenalty++;
    const fcBand = stats.wordCount > 0 ? Math.max(4, Math.min(8, 7 - fcPenalty)) : null;

    const pronCount = manualFlags.filter((f) => f.category === "pron" || f.category === "into").length;
    const pronBand = pronCount > 0 || manualFlags.length > 0 ? bandFromRate(per100(pronCount), STRICT) : null;

    return {
      fc: fcBand,
      lr: stats.wordCount > 0 ? lrBand : null,
      gra: stats.wordCount > 0 ? graBand : null,
      pron: pronBand
    };
  }

  function updateOverall() {
    const { fc, lr, gra, pron } = state.scores;
    const avg = (fc + lr + gra + pron) / 4;
    const overall = roundOverall(avg);
    el.overallNumber.textContent = overall.toFixed(overall % 1 === 0 ? 0 : 1);
    el.obFC.textContent = fc;
    el.obLR.textContent = lr;
    el.obGRA.textContent = gra;
    el.obPron.textContent = pron;
    const pct = overall / 9;
    el.ringFill.style.strokeDashoffset = RING_CIRC * (1 - pct);
    return overall;
  }

  // ---------------------------------------------------------------------
  // 8. Feedback suggestion
  // ---------------------------------------------------------------------
  function groupFlagsByCategory() {
    const groups = { pron: [], into: [], vocab: [], gram: [] };
    state.flags.forEach((f) => { if (groups[f.category]) groups[f.category].push(f); });
    return groups;
  }

  function renderSuggestion() {
    const overall = updateOverall();
    const s = state.scores;
    const stats = lastStats;
    const groups = groupFlagsByCategory();

    let lines = [];
    lines.push(`BAND ĐIỂM TỔNG: ${overall}`);
    lines.push("");
    Object.keys(CRIT_LABELS).forEach((key) => {
      lines.push(`${CRIT_LABELS[key]} — Band ${s[key]}`);
      lines.push(DESCRIPTORS[key][s[key]]);
      lines.push("");
    });

    lines.push("TÍN HIỆU TỪ TRANSCRIPT (tham khảo, không tự động chấm điểm):");
    if (stats.wordCount > 0) {
      lines.push(`- Từ đệm phát hiện: ${stats.fillerCount}${stats.fillerCount > 8 ? " (khá nhiều — cân nhắc trừ Fluency & Coherence)" : ""}`);
      lines.push(`- Lặp từ liền kề: ${stats.repeatCount}${stats.repeatCount > 2 ? " (dấu hiệu tự sửa lỗi/mất mạch lạc)" : ""}`);
      lines.push(`- Đa dạng từ vựng (tỉ lệ từ khác nhau): ${stats.ttr}%${stats.ttr < 40 ? " (khá thấp — kiểm tra Lexical Resource)" : ""}`);
      lines.push(`- Câu dài trên 25 từ: ${stats.longSentences}${stats.longSentences > 3 ? " (kiểm tra xem có phải câu chạy dài thiếu kiểm soát ngữ pháp không)" : ""}`);
      if (stats.wpm) lines.push(`- Tốc độ nói ước tính: ${stats.wpm} từ/phút`);
    } else {
      lines.push("- Chưa có transcript để phân tích.");
    }

    if (lastAutoIssues.length > 0) {
      lines.push("");
      lines.push(`LỖI PHÁT HIỆN TỰ ĐỘNG TỪ TRANSCRIPT (${lastAutoIssues.length}, ngữ pháp/từ vựng/cấu trúc):`);
      ["gram", "vocab", "structure"].forEach((c) => {
        const list = lastAutoIssues.filter((i) => i.category === c);
        if (list.length === 0) return;
        const label = c === "structure" ? "📏 Câu dài / cấu trúc" : `${CATS[c].icon} ${CATS[c].label}`;
        lines.push("");
        lines.push(`${label} (${list.length}):`);
        list.forEach((iss) => {
          lines.push(`  "${iss.matchText}"${iss.suggestion ? ` → Sửa: ${iss.suggestion}` : ""} — ${iss.note}`);
        });
      });
    }

    if (state.flags.length > 0) {
      lines.push("");
      lines.push(`NHẬT KÝ LỖI THEO THỜI ĐIỂM KHI NGHE (${state.flags.length} lỗi, Phát âm & Ngữ điệu):`);
      CAT_ORDER.forEach((c) => {
        const list = groups[c];
        if (list.length === 0) return;
        lines.push("");
        lines.push(`${CATS[c].icon} ${CATS[c].label} (${list.length}):`);
        list.forEach((f) => {
          lines.push(`  [${fmtTime(f.time)}] Nghe được: ${f.heard}${f.fix ? ` → Sửa: ${f.fix}` : ""}`);
        });
      });
    }

    const text = lines.join("\n");
    el.suggestionBox.textContent = text;
    return text;
  }

  el.btnInsertFeedback.addEventListener("click", () => {
    el.feedbackFinal.value = el.suggestionBox.textContent;
    state.feedbackFinal = el.feedbackFinal.value;
  });
  el.btnRefreshSuggestion.addEventListener("click", renderSuggestion);
  el.feedbackFinal.addEventListener("input", () => { state.feedbackFinal = el.feedbackFinal.value; });

  // ---------------------------------------------------------------------
  // 9. Save / load / history (localStorage)
  // ---------------------------------------------------------------------
  const STORAGE_KEY = "ielts_speaking_marker_sessions_v1";

  function getSessions() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveSessions(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function collectStateFromForm() {
    state.studentName = el.studentName.value.trim();
    state.testDate = el.testDate.value;
    state.testPart = el.testPart.value.trim();
    state.teacherName = el.teacherName.value.trim();
    state.examinerNote = el.examinerNote.value.trim();
    state.transcript = el.transcript.value;
    state.feedbackFinal = el.feedbackFinal.value;
  }

  function applyStateToForm() {
    el.studentName.value = state.studentName || "";
    el.testDate.value = state.testDate || "";
    el.testPart.value = state.testPart || "";
    el.teacherName.value = state.teacherName || "";
    el.examinerNote.value = state.examinerNote || "";
    el.transcript.value = state.transcript || "";
    el.feedbackFinal.value = state.feedbackFinal || "";
    el.durationBadge.textContent = state.audioDuration ? `Tổng thời lượng: ${fmtTime(state.audioDuration)}` : "";
    $$(".criterion").forEach((critEl) => {
      const key = critEl.dataset.crit;
      critEl.querySelector(".crit-slider").value = state.scores[key];
      updateCriterion(critEl);
      ensureAutoBadge(critEl).classList.remove("show");
    });
    state.transcript = el.transcript.value;
    lastStats = computeStats(state.transcript);
    renderStats(lastStats);
    clearTimeout(autoAnalyzeTimer);
    runAutoAnalysis();
    renderFlags();
    renderTimeline();
    renderErrorSummary();
    renderSuggestion();
  }

  el.btnSave.addEventListener("click", () => {
    collectStateFromForm();
    if (!state.studentName) {
      el.studentName.focus();
      alert("Nhập tên học viên trước khi lưu.");
      return;
    }
    if (!state.id) state.id = uid();
    state.savedAt = new Date().toISOString();
    const overall = updateOverall();
    state.overall = overall;

    const sessions = getSessions();
    const idx = sessions.findIndex((s) => s.id === state.id);
    const toSave = JSON.parse(JSON.stringify(state));
    if (idx >= 0) sessions[idx] = toSave; else sessions.push(toSave);
    saveSessions(sessions);
    renderHistory();
    flashButton(el.btnSave, "Đã lưu ✓");
  });

  function flashButton(btn, text) {
    const original = btn.textContent;
    btn.textContent = text;
    setTimeout(() => { btn.textContent = original; }, 1400);
  }

  el.btnNew.addEventListener("click", () => {
    if (!confirm("Bắt đầu bài chấm mới? Dữ liệu chưa lưu sẽ mất.")) return;
    resetForm();
  });

  function resetForm() {
    state = {
      id: null, studentName: "", testDate: "", testPart: "", teacherName: "", examinerNote: "",
      audioFileName: "", audioDuration: 0, transcript: "", flags: [],
      scores: { fc: 4, lr: 4, gra: 4, pron: 4 }, feedbackFinal: "", savedAt: null
    };
    if (audioURL) { URL.revokeObjectURL(audioURL); audioURL = null; }
    el.player.src = "";
    el.audioControls.classList.remove("active");
    el.audioFile.value = "";
    CRIT_KEYS.forEach((k) => { sliderTouched[k] = false; });
    applyStateToForm();
  }

  // ---------------------------------------------------------------------
  // 10. History drawer
  // ---------------------------------------------------------------------
  function renderHistory() {
    const sessions = getSessions().slice().sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
    if (sessions.length === 0) {
      el.historyList.innerHTML = '<p class="empty-hint">Chưa có bài chấm nào được lưu.</p>';
      return;
    }
    el.historyList.innerHTML = sessions.map((s) => `
      <div class="history-item" data-id="${s.id}">
        <div class="hi-top">
          <span class="hi-name">${escapeHtml(s.studentName || "(chưa đặt tên)")}</span>
          <span class="hi-band">${s.overall != null ? s.overall : "–"}</span>
        </div>
        <div class="hi-meta">${s.testDate || ""} ${s.testPart ? "· " + escapeHtml(s.testPart) : ""}</div>
        <div class="hi-meta">${(s.flags || []).length} lỗi ghi nhận · Lưu lúc: ${s.savedAt ? new Date(s.savedAt).toLocaleString("vi-VN") : ""}</div>
        <div class="hi-actions">
          <button class="btn btn-sm" data-action="load">Mở</button>
          <button class="btn btn-sm btn-danger" data-action="delete">Xoá</button>
        </div>
      </div>
    `).join("");
  }

  el.historyList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const item = e.target.closest(".history-item");
    const id = item.dataset.id;
    if (btn.dataset.action === "load") {
      const sessions = getSessions();
      const found = sessions.find((s) => s.id === id);
      if (found) {
        state = JSON.parse(JSON.stringify(found));
        CRIT_KEYS.forEach((k) => { sliderTouched[k] = true; }); // loaded bands were already teacher-confirmed — don't auto-override
        applyStateToForm();
        closeDrawer();
      }
    } else if (btn.dataset.action === "delete") {
      if (!confirm("Xoá bài chấm này khỏi lịch sử?")) return;
      let sessions = getSessions();
      sessions = sessions.filter((s) => s.id !== id);
      saveSessions(sessions);
      renderHistory();
    }
  });

  function openDrawer() { el.drawer.classList.add("active"); el.drawerBackdrop.classList.add("active"); renderHistory(); }
  function closeDrawer() { el.drawer.classList.remove("active"); el.drawerBackdrop.classList.remove("active"); }
  el.btnHistory.addEventListener("click", openDrawer);
  el.btnCloseDrawer.addEventListener("click", closeDrawer);
  el.drawerBackdrop.addEventListener("click", closeDrawer);

  // ---------------------------------------------------------------------
  // 11. Professional print report
  // ---------------------------------------------------------------------
  function buildPrintReport() {
    const s = state;
    const overall = updateOverall();
    const groups = groupFlagsByCategory();
    const genDate = new Date().toLocaleString("vi-VN");

    const infoRows = [
      ["Học viên", s.studentName || "—"],
      ["Ngày chấm", s.testDate || "—"],
      ["Phần thi", s.testPart || "—"],
      ["Giáo viên chấm", s.teacherName || "—"],
      ["File audio", s.audioFileName || "—"],
      ["Thời lượng", s.audioDuration ? fmtTime(s.audioDuration) : "—"],
      ["Ghi chú", s.examinerNote || "—"]
    ];

    const infoHtml = `<table class="pr-info-table">${infoRows.map(([label, val]) =>
      `<tr><td class="pr-label">${escapeHtml(label)}</td><td>${escapeHtml(val)}</td></tr>`
    ).join("")}</table>`;

    const bandHtml = `
      <table class="pr-band-table">
        <tr><th>Fluency &amp; Coherence</th><th>Lexical Resource</th><th>Grammatical Range &amp; Accuracy</th><th>Pronunciation</th><th>Band tổng</th></tr>
        <tr>
          <td class="pr-band-num">${s.scores.fc}</td>
          <td class="pr-band-num">${s.scores.lr}</td>
          <td class="pr-band-num">${s.scores.gra}</td>
          <td class="pr-band-num">${s.scores.pron}</td>
          <td class="pr-overall">${overall}</td>
        </tr>
      </table>`;

    const critHtml = Object.keys(CRIT_LABELS).map((key) => `
      <div class="pr-criterion-block">
        <span class="pr-crit-name">${CRIT_LABELS[key]}</span> — <span class="pr-crit-band">Band ${s.scores[key]}</span>
        <p>${escapeHtml(DESCRIPTORS[key][s.scores[key]])}</p>
      </div>
    `).join("");

    let logHtml = "";
    if (s.flags.length === 0) {
      logHtml = `<p class="pr-empty">Không có lỗi nào được ghi lại theo thời điểm trong lần nghe này.</p>`;
    } else {
      CAT_ORDER.forEach((c) => {
        const list = groups[c];
        if (!list || list.length === 0) return;
        logHtml += `<div class="pr-cat-heading">${CATS[c].icon} ${CATS[c].label} (${list.length} lỗi)</div>`;
        logHtml += `<table class="pr-log-table"><tr><th>Thời điểm</th><th>Nghe được (lỗi)</th><th>Cách sửa</th></tr>`;
        list.forEach((f) => {
          logHtml += `<tr><td class="pr-time">${fmtTime(f.time)}</td><td>${escapeHtml(f.heard)}</td><td>${f.fix ? escapeHtml(f.fix) : "—"}</td></tr>`;
        });
        logHtml += `</table>`;
      });
    }

    const feedbackText = s.feedbackFinal && s.feedbackFinal.trim() ? s.feedbackFinal : el.suggestionBox.textContent;
    const annotatedHtml = state.transcript.trim() ? el.annotatedTranscript.innerHTML : '<p class="pr-empty">Chưa có transcript.</p>';
    const errorTableHtml = el.errorTable.querySelector("table") ? el.errorTable.innerHTML : '<p class="pr-empty">Chưa có dữ liệu lỗi.</p>';

    el.printReport.innerHTML = `
      <div class="pr-letterhead">
        <div>
          <div class="pr-title">Báo cáo chấm nói IELTS</div>
          <div class="pr-sub">IELTS Speaking Marker — báo cáo chấm chi tiết theo rubric 4 tiêu chí</div>
        </div>
        <div class="pr-meta">Ngày xuất báo cáo<br>${escapeHtml(genDate)}</div>
      </div>

      ${infoHtml}

      <div class="pr-section-title">1. Kết quả theo 4 tiêu chí</div>
      ${bandHtml}
      ${critHtml}

      <div class="pr-section-title">2. Bảng tổng hợp phân tích lỗi</div>
      ${errorTableHtml}

      <div class="pr-section-title">3. Bản ghi có đánh dấu lỗi</div>
      <div class="small-note" style="margin-bottom:6px;">Gạch chân = ngữ pháp · Highlight = từ vựng/collocation · Khung viền = câu quá dài/cấu trúc · <b>Đậm</b> = từ/cụm sai chính xác.</div>
      <div class="pr-annotated">${annotatedHtml}</div>

      <div class="pr-section-title">4. Nhật ký lỗi theo thời điểm khi nghe (Phát âm &amp; Ngữ điệu)</div>
      ${logHtml}

      <div class="pr-section-title">5. Nhận xét tổng kết của giáo viên</div>
      <div class="pr-feedback-text">${escapeHtml(feedbackText || "(chưa có nhận xét)")}</div>

      <div class="pr-signoff">
        <div class="pr-sign-block"><div class="pr-sign-line">Giáo viên chấm${s.teacherName ? " — " + escapeHtml(s.teacherName) : ""}</div></div>
        <div class="pr-sign-block"><div class="pr-sign-line">Ngày ký</div></div>
      </div>
    `;
  }

  el.btnExportReport.addEventListener("click", () => {
    collectStateFromForm();
    runAutoAnalysis();
    buildPrintReport();
    window.print();
  });

  el.btnExportCsv.addEventListener("click", () => {
    const sessions = getSessions();
    if (sessions.length === 0) { alert("Chưa có bài chấm nào để xuất."); return; }
    const header = ["Học viên", "Ngày", "Phần thi", "Giáo viên", "FC", "LR", "GRA", "Pronunciation", "Band tổng", "Số lỗi ghi nhận", "Lưu lúc"];
    const rows = sessions.map((s) => [
      s.studentName, s.testDate, s.testPart, s.teacherName,
      s.scores.fc, s.scores.lr, s.scores.gra, s.scores.pron,
      s.overall, (s.flags || []).length, s.savedAt
    ]);
    const csv = [header, ...rows].map((r) =>
      r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
    ).join("\r\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ielts_speaking_sessions_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // ---------------------------------------------------------------------
  // 12. Init
  // ---------------------------------------------------------------------
  el.testDate.valueAsDate = new Date();
  applyStateToForm();
  renderHistory();

  window.addEventListener("beforeunload", (e) => {
    // Light guard against accidental data loss; not shown if nothing entered.
    if (state.studentName || state.transcript) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
})();
