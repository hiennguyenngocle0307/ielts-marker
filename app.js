/* IELTS Speaking Marker — offline marking tool
   No frameworks, no build step, no network calls. Everything stays on this machine:
   - transcript + scores + feedback are saved to localStorage (this browser only)
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

  // ---------------------------------------------------------------------
  // 2. State
  // ---------------------------------------------------------------------
  let state = {
    id: null,
    studentName: "",
    testDate: "",
    testPart: "",
    examinerNote: "",
    audioFileName: "",
    transcript: "",
    flags: [], // {time, note}
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
    examinerNote: $("#examinerNote"),
    dropzone: $("#dropzone"),
    audioFile: $("#audioFile"),
    audioControls: $("#audioControls"),
    player: $("#player"),
    flagNote: $("#flagNote"),
    btnFlag: $("#btnFlag"),
    flagList: $("#flagList"),
    transcript: $("#transcript"),
    wordCountBadge: $("#wordCountBadge"),
    statsRow: $("#statsRow"),
    btnPreview: $("#btnPreview"),
    highlightPreview: $("#highlightPreview"),
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
    historyList: $("#historyList")
  };

  const RING_CIRC = 2 * Math.PI * 52;

  // ---------------------------------------------------------------------
  // 4. Utility
  // ---------------------------------------------------------------------
  function fmtTime(t) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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

  el.btnFlag.addEventListener("click", () => {
    if (!el.player.src) return;
    const note = el.flagNote.value.trim() || "(không có ghi chú)";
    state.flags.push({ time: el.player.currentTime, note });
    state.flags.sort((a, b) => a.time - b.time);
    el.flagNote.value = "";
    renderFlags();
  });

  function renderFlags() {
    if (state.flags.length === 0) {
      el.flagList.innerHTML = '<li class="empty-hint">Chưa có đánh dấu nào. Nghe audio và bấm "Đánh dấu thời điểm" để ghi lại lỗi/điểm cần chú ý.</li>';
      return;
    }
    el.flagList.innerHTML = state.flags.map((f, i) => `
      <li class="flag-item">
        <button class="flag-time" data-idx="${i}" data-action="seek">${fmtTime(f.time)}</button>
        <span class="flag-note">${escapeHtml(f.note)}</span>
        <button class="flag-del" data-idx="${i}" data-action="del">✕</button>
      </li>`).join("");
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
    }
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

    let audioDuration = el.player.duration;
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

  function renderHighlightPreview(text) {
    if (!text.trim()) { el.highlightPreview.innerHTML = '<span class="empty-hint">Chưa có transcript.</span>'; return; }
    let html = escapeHtml(text);

    FILLERS.forEach((f) => {
      const re = new RegExp(`\\b(${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi");
      html = html.replace(re, '<mark class="hl-warn">$1</mark>');
    });
    html = html.replace(/\b(\w+)(\s+)\1\b/gi, '<mark class="hl-warn">$1$2$1</mark>');

    // Wrap long sentences with a note mark (best-effort split on . ! ?)
    html = html.split(/(?<=[.!?])\s+/).map((sentence) => {
      const plain = sentence.replace(/<[^>]+>/g, "");
      const wc = (plain.match(/[A-Za-zÀ-ỹ']+/g) || []).length;
      if (wc > 25) return `<mark class="hl-note">${sentence}</mark>`;
      return sentence;
    }).join(" ");

    el.highlightPreview.innerHTML = `<p>${html}</p>`;
  }

  let lastStats = computeStats("");

  function onTranscriptChange() {
    state.transcript = el.transcript.value;
    lastStats = computeStats(state.transcript);
    renderStats(lastStats);
    if (el.highlightPreview.classList.contains("active")) renderHighlightPreview(state.transcript);
  }
  el.transcript.addEventListener("input", onTranscriptChange);

  el.btnPreview.addEventListener("click", () => {
    el.highlightPreview.classList.toggle("active");
    if (el.highlightPreview.classList.contains("active")) renderHighlightPreview(state.transcript);
  });

  // ---------------------------------------------------------------------
  // 7. Rubric sliders
  // ---------------------------------------------------------------------
  function updateCriterion(critEl) {
    const key = critEl.dataset.crit;
    const slider = critEl.querySelector(".crit-slider");
    const band = parseInt(slider.value, 10);
    state.scores[key] = band;
    critEl.querySelector(".crit-band").textContent = band;
    critEl.querySelector(".criterion-desc").textContent = DESCRIPTORS[key][band];
  }

  $$(".criterion").forEach((critEl) => {
    updateCriterion(critEl);
    critEl.querySelector(".crit-slider").addEventListener("input", () => {
      updateCriterion(critEl);
      updateOverall();
      renderSuggestion();
    });
  });

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
  function renderSuggestion() {
    const overall = updateOverall();
    const s = state.scores;
    const stats = lastStats;

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

    if (state.flags.length > 0) {
      lines.push("");
      lines.push("GHI CHÚ THEO THỜI ĐIỂM (khi nghe audio):");
      state.flags.forEach((f) => lines.push(`- ${fmtTime(f.time)}: ${f.note}`));
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
    state.examinerNote = el.examinerNote.value.trim();
    state.transcript = el.transcript.value;
    state.feedbackFinal = el.feedbackFinal.value;
  }

  function applyStateToForm() {
    el.studentName.value = state.studentName || "";
    el.testDate.value = state.testDate || "";
    el.testPart.value = state.testPart || "";
    el.examinerNote.value = state.examinerNote || "";
    el.transcript.value = state.transcript || "";
    el.feedbackFinal.value = state.feedbackFinal || "";
    $$(".criterion").forEach((critEl) => {
      const key = critEl.dataset.crit;
      critEl.querySelector(".crit-slider").value = state.scores[key];
      updateCriterion(critEl);
    });
    onTranscriptChange();
    renderFlags();
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
      id: null, studentName: "", testDate: "", testPart: "", examinerNote: "",
      audioFileName: "", transcript: "", flags: [],
      scores: { fc: 4, lr: 4, gra: 4, pron: 4 }, feedbackFinal: "", savedAt: null
    };
    if (audioURL) { URL.revokeObjectURL(audioURL); audioURL = null; }
    el.player.src = "";
    el.audioControls.classList.remove("active");
    el.audioFile.value = "";
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
        <div class="hi-meta">Lưu lúc: ${s.savedAt ? new Date(s.savedAt).toLocaleString("vi-VN") : ""}</div>
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
  // 11. Export
  // ---------------------------------------------------------------------
  el.btnExportReport.addEventListener("click", () => {
    collectStateFromForm();
    window.print();
  });

  el.btnExportCsv.addEventListener("click", () => {
    const sessions = getSessions();
    if (sessions.length === 0) { alert("Chưa có bài chấm nào để xuất."); return; }
    const header = ["Học viên", "Ngày", "Phần thi", "FC", "LR", "GRA", "Pronunciation", "Band tổng", "Lưu lúc"];
    const rows = sessions.map((s) => [
      s.studentName, s.testDate, s.testPart,
      s.scores.fc, s.scores.lr, s.scores.gra, s.scores.pron,
      s.overall, s.savedAt
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
  el.player.addEventListener("loadedmetadata", () => renderStats(computeStats(state.transcript)));
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
