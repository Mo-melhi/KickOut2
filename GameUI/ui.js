/* ============================================================
   كيك أوت — KickOut | Game Logic (Vanilla JS SPA)
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Icon set (inline SVG, no emojis) ---------- */
  var S = 'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  var ICONS = {
    trophy: '<svg viewBox="0 0 24 24" '+S+'><path d="M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"/><path d="M12 14v4M9 21h6M9.5 21l.5-3h4l.5 3"/></svg>',
    bell:   '<svg viewBox="0 0 24 24" '+S+'><path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2h-15L6 16Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>',
    star:   '<svg viewBox="0 0 24 24" '+S+'><path d="M12 3.5 14.6 9l6 .6-4.5 4 1.3 5.9L12 16.8 6.6 19.5 7.9 13.6l-4.5-4 6-.6L12 3.5Z"/></svg>',
    bolt:   '<svg viewBox="0 0 24 24" '+S+'><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z"/></svg>',
    music:  '<svg viewBox="0 0 24 24" '+S+'><path d="M9 18V6l10-2v12"/><circle cx="6" cy="18" r="3"/><circle cx="16" cy="16" r="3"/></svg>',
    hands:  '<svg viewBox="0 0 24 24" '+S+'><path d="M12 12 8.5 8.5a2 2 0 0 0-3 2.6L9 15M12 12l3.5-3.5a2 2 0 0 1 3 2.6L15 15"/><path d="M9 15v3a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-3"/></svg>',
    crown:  '<svg viewBox="0 0 24 24" '+S+'><path d="M4 8l3 8h10l3-8-4.5 3L12 6 8.5 11 4 8Z"/><path d="M6 19h12"/></svg>',
    ring:   '<svg viewBox="0 0 24 24" '+S+'><rect x="3" y="7" width="18" height="12" rx="1"/><path d="M3 7 6 3h12l3 4M7 7v12M17 7v12"/></svg>'
  };

  /* ---------- Category catalogue ---------- */
  var CATEGORIES = [
    { id: "titles",     name: "الألقاب",         icon: "trophy", accent: "var(--yellow)" },
    { id: "rumble",     name: "رويال رامبل",     icon: "bell",   accent: "var(--red)" },
    { id: "legends",    name: "الأساطير",        icon: "star",   accent: "var(--blue)" },
    { id: "finishers",  name: "الحركات القاضية", icon: "bolt",   accent: "var(--red)" },
    { id: "themes",     name: "أغاني الدخول",     icon: "music",  accent: "var(--blue)" },
    { id: "tag",        name: "الفرق الثنائية",   icon: "hands",  accent: "var(--yellow)" },
    { id: "women",      name: "قسم السيدات",      icon: "crown",  accent: "var(--red)" },
    { id: "mania",      name: "راسلمينيا",        icon: "ring",   accent: "var(--blue)" }
  ];

  var POINTS = [400, 400, 600, 600];

  /* ---------- Question bank (sample content per category) ---------- */
  var QUESTIONS = {
    titles: [
      { q: "من هو أول بطل عالمي للوزن الثقيل في تاريخ WWE؟", a: "باడي روجرز" },
      { q: "ما اسم الحزام الذي يُعتبر أعرق ألقاب المصارعة؟", a: "بطولة WWE" },
      { q: "من حمل لقب البطولة الكونية (Universal) أطول فترة؟", a: "رومان رينز" },
      { q: "أي بطل لُقّب بـ«الرجل الأطول عهداً» بلقب WWE في العصر الحديث؟", a: "سي إم بانك (434 يوماً)" }
    ],
    rumble: [
      { q: "كم عدد المصارعين المشاركين عادةً في مباراة رويال رامبل؟", a: "30 مصارعاً" },
      { q: "من فاز بأول رويال رامبل عام 1988؟", a: "جيم دوغان" },
      { q: "من صاحب أكبر عدد انتصارات في رويال رامبل؟", a: "ستيف أوستن (3 مرات)" },
      { q: "ما الرقم القياسي لأطول مدة صمود في الرامبل يملكه ريبك؟", a: "أكثر من ساعة" }
    ],
    legends: [
      { q: "من يُلقّب بـ«The Deadman»؟", a: "ذا أندرتيكر" },
      { q: "ما لقب هالك هوغان الشهير بين جماهيره؟", a: "هالكامينيا" },
      { q: "من هو «The Heartbreak Kid»؟", a: "شون مايكلز" },
      { q: "كم بلغ سجل الأندرتيكر في راسلمينيا قبل أن يُهزم؟", a: "21-0" }
    ],
    finishers: [
      { q: "ما اسم حركة جون سينا القاضية؟", a: "Attitude Adjustment" },
      { q: "ما اسم قفلة الاستسلام الخاصة بـ بريت هارت؟", a: "Sharpshooter" },
      { q: "من صاحب حركة «RKO»؟", a: "راندي أورتن" },
      { q: "ما اسم حركة «Stone Cold» ستيف أوستن القاضية؟", a: "Stone Cold Stunner" }
    ],
    themes: [
      { q: "«If you smell...» جزء من أغنية دخول أي نجم؟", a: "ذا روك" },
      { q: "أغنية «My Time Is Now» تخص أي مصارع؟", a: "جون سينا" },
      { q: "صوت تحطّم الزجاج يعلن دخول أي أسطورة؟", a: "ستيف أوستن" },
      { q: "أغنية «Metalingus» ارتبطت بأي نجم؟", a: "إيدج" }
    ],
    tag: [
      { q: "ما اسم الفريق الذي يضم الأخوين أوسو؟", a: "The Usos" },
      { q: "من هما ثنائي «D-Generation X» الأشهر؟", a: "شون مايكلز و تريبل إتش" },
      { q: "أي فريق عُرف بشعار «Awesome Truth»؟", a: "ذا ميز و آر-تروث" },
      { q: "ما اسم فريق الأخوين هاردي الشهير؟", a: "The Hardy Boyz" }
    ],
    women: [
      { q: "من أول امرأة تتصدّر الحدث الرئيسي في راسلمينيا؟", a: "بيكي لينش (بالمشاركة)" },
      { q: "ما لقب بطولة السيدات الحالي في العرض الأحمر؟", a: "بطولة سيدات رو" },
      { q: "من يُلقّب بـ«The Man»؟", a: "بيكي لينش" },
      { q: "من حققت الفوز بأول Women's Royal Rumble؟", a: "آسكا" }
    ],
    mania: [
      { q: "في أي مدينة أقيمت أول راسلمينيا عام 1985؟", a: "نيويورك" },
      { q: "من هزم الأندرتيكر منهياً سجله في راسلمينيا؟", a: "بروك ليسنر" },
      { q: "كم مرة استضافت راسلمينيا حدثاً على مدى ليلتين؟", a: "عدة مرات منذ 2020" },
      { q: "من يُلقّب بـ«Mr. WrestleMania»؟", a: "شون مايكلز" }
    ]
  };

  /* ---------- Game state ---------- */
  var state = {
    teams: [
      { name: "الفريق الأول", score: 0, color: "red" },
      { name: "الفريق الثاني", score: 0, color: "blue" }
    ],
    pickPhase: 0,          // 0 => team1 picking, 1 => team2 picking
    picks: [[], []],       // selected category ids per team
    boardCategories: [],   // 4 chosen categories (objects)
    activeTeam: 0,         // whose turn it is on the board
    remaining: 16,
    current: null          // { catId, catName, qIndex, points, cell }
  };

  /* ---------- Element helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var screens = {
    setup: $("screen-setup"),
    categories: $("screen-categories"),
    board: $("screen-board"),
    winner: $("screen-winner")
  };

  function showScreen(key) {
    Object.keys(screens).forEach(function (k) {
      var s = screens[k];
      if (k === key) {
        s.hidden = false;
        // retrigger entrance animation
        s.classList.remove("is-active");
        void s.offsetWidth;
        s.classList.add("is-active");
      } else {
        s.hidden = true;
        s.classList.remove("is-active");
      }
    });
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ============================================================
     SCREEN 1 — SETUP
     ============================================================ */
  var startBtn = $("startBtn");
  var team1Name = $("team1Name");
  var team2Name = $("team2Name");
  var setupError = $("setupError");

  function beginMatch() {
    var n1 = team1Name.value.trim();
    var n2 = team2Name.value.trim();

    if (!n1 || !n2) {
      showError("الرجاء إدخال اسم لكل فريق قبل الدخول إلى الحلبة.");
      return;
    }
    if (n1.toLowerCase() === n2.toLowerCase()) {
      showError("يجب أن يكون لكل فريق اسم مختلف.");
      return;
    }
    setupError.hidden = true;
    state.teams[0].name = n1;
    state.teams[1].name = n2;
    startPickPhase(0);
  }

  function showError(msg) {
    setupError.textContent = msg;
    setupError.hidden = false;
  }

  startBtn.addEventListener("click", beginMatch);
  [team1Name, team2Name].forEach(function (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.nativeEvent?.isComposing && e.keyCode !== 229) beginMatch();
    });
  });

  /* ============================================================
     SCREEN 2 — CATEGORY SELECTION
     ============================================================ */
  var catGrid = $("catGrid");
  var pickCount = $("pickCount");
  var pickTeamName = $("pickTeamName");
  var pickEyebrow = $("pickEyebrow");
  var catNextBtn = $("catNextBtn");
  var catNextLabel = $("catNextLabel");

  function startPickPhase(phase) {
    state.pickPhase = phase;
    var team = state.teams[phase];
    pickTeamName.textContent = team.name;
    pickTeamName.classList.toggle("is-blue", phase === 1);
    pickEyebrow.textContent = phase === 0 ? "دور الاختيار الأول" : "دور الاختيار الثاني";
    renderCategoryCards();
    updatePickUI();
    showScreen("categories");
  }

  function alreadyTaken(catId) {
    return state.pickPhase === 1 && state.picks[0].indexOf(catId) !== -1;
  }

  function renderCategoryCards() {
    catGrid.innerHTML = "";
    CATEGORIES.forEach(function (cat) {
      var card = el("button", "cat-card");
      card.type = "button";
      card.style.setProperty("--accent", cat.accent);
      card.setAttribute("data-id", cat.id);

      var check = el("span", "cat-card__check", "✔");
      var icon = el("span", "cat-card__icon");
      icon.innerHTML = ICONS[cat.icon] || "";
      var name = el("span", "cat-card__name", cat.name);
      card.appendChild(check);
      card.appendChild(icon);
      card.appendChild(name);

      if (alreadyTaken(cat.id)) {
        card.classList.add("is-taken");
        card.disabled = true;
      }
      card.addEventListener("click", function () { toggleCategory(cat.id, card); });
      catGrid.appendChild(card);
    });
  }

  function toggleCategory(catId, card) {
    var picks = state.picks[state.pickPhase];
    var idx = picks.indexOf(catId);
    if (idx !== -1) {
      picks.splice(idx, 1);
      card.classList.remove("is-selected");
    } else {
      if (picks.length >= 2) return; // cap at two
      picks.push(catId);
      card.classList.add("is-selected");
    }
    updatePickUI();
  }

  function updatePickUI() {
    var picks = state.picks[state.pickPhase];
    pickCount.textContent = picks.length;
    var ready = picks.length === 2;
    catNextBtn.disabled = !ready;
    catNextBtn.classList.toggle("is-disabled", !ready);
    if (!ready) {
      catNextLabel.textContent = "اختر تصنيفين للمتابعة";
    } else {
      catNextLabel.textContent = state.pickPhase === 0 ? "التالي: اختيار الفريق الثاني" : "ابدأ اللعب";
    }
  }

  catNextBtn.addEventListener("click", function () {
    if (state.picks[state.pickPhase].length !== 2) return;
    if (state.pickPhase === 0) {
      startPickPhase(1);
    } else {
      buildBoard();
    }
  });

  /* ============================================================
     SCREEN 3 — BOARD
     ============================================================ */
  var boardGrid = $("boardGrid");
  var questionsLeft = $("questionsLeft");

  function catById(id) {
    for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i];
    return null;
  }

  function buildBoard() {
    var ids = state.picks[0].concat(state.picks[1]);
    state.boardCategories = ids.map(catById);
    state.remaining = ids.length * 4;
    state.activeTeam = 0;
    state.teams[0].score = 0;
    state.teams[1].score = 0;

    renderScoreboard();
    renderBoardGrid();
    updateScoreboard(false);
    showScreen("board");
  }

  function renderScoreboard() {
    $("sbName1").textContent = state.teams[0].name;
    $("sbName2").textContent = state.teams[1].name;
    $("sbScore1").textContent = "0";
    $("sbScore2").textContent = "0";
  }

  function renderBoardGrid() {
    boardGrid.innerHTML = "";
    state.boardCategories.forEach(function (cat) {
      var panel = el("div", "cat-panel");
      panel.style.setProperty("--accent", cat.accent);

      var head = el("div", "cat-panel__head");
      var pIcon = el("span", "cat-panel__icon");
      pIcon.innerHTML = ICONS[cat.icon] || "";
      head.appendChild(pIcon);
      head.appendChild(el("span", "cat-panel__title", cat.name));
      panel.appendChild(head);

      var body = el("div", "cat-panel__body");
      POINTS.forEach(function (pts, qi) {
        var cell = el("button", "qbtn-cell", String(pts));
        cell.type = "button";
        cell.setAttribute("data-cat", cat.id);
        cell.setAttribute("data-q", String(qi));
        cell.addEventListener("click", function () {
          openQuestion(cat, qi, pts, cell);
        });
        body.appendChild(cell);
      });
      panel.appendChild(body);
      boardGrid.appendChild(panel);
    });
  }

  function updateScoreboard(bump) {
    var t1 = $("sbScore1"), t2 = $("sbScore2");
    setScoreText(t1, state.teams[0].score, bump === 0);
    setScoreText(t2, state.teams[1].score, bump === 1);

    $("scoreTeam1").classList.toggle("is-turn", state.activeTeam === 0);
    $("scoreTeam2").classList.toggle("is-turn", state.activeTeam === 1);
    questionsLeft.textContent = state.remaining;
  }

  function setScoreText(node, value, doBump) {
    node.textContent = value;
    if (doBump) {
      node.classList.remove("is-bumping");
      void node.offsetWidth;
      node.classList.add("is-bumping");
    }
  }

  /* ============================================================
     SCREEN 4 — QUESTION MODAL
     ============================================================ */
  var modal = $("questionModal");
  var modalOverlay = $("modalOverlay");
  var modalCategory = $("modalCategory");
  var modalPoints = $("modalPoints");
  var modalTurnTeam = $("modalTurnTeam");
  var modalQuestion = $("modalQuestion");
  var modalAnswer = $("modalAnswer");
  var modalAnswerText = $("modalAnswerText");
  var revealBtn = $("revealBtn");
  var rightBtn = $("rightBtn");
  var wrongBtn = $("wrongBtn");
  var skipBtn = $("skipBtn");
  var backBtn = $("backBtn");

  function openQuestion(cat, qi, pts, cell) {
    var data = QUESTIONS[cat.id][qi];
    state.current = { catId: cat.id, catName: cat.name, qIndex: qi, points: pts, cell: cell };

    modalCategory.textContent = cat.name;
    modalPoints.textContent = pts;
    modalTurnTeam.textContent = state.teams[state.activeTeam].name;
    modalQuestion.textContent = data.q;
    modalAnswerText.textContent = data.a;

    // reset modal action state
    modalAnswer.hidden = true;
    revealBtn.disabled = false;
    rightBtn.disabled = false;
    wrongBtn.disabled = false;
    skipBtn.disabled = false;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    revealBtn.focus();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    state.current = null;
  }

  function revealAnswer() {
    modalAnswer.hidden = false;
    revealBtn.disabled = true;
  }

  function markUsed() {
    var cur = state.current;
    if (!cur || !cur.cell) return;
    cur.cell.disabled = true;
    cur.cell.classList.add("is-used");
    state.remaining -= 1;
  }

  function nextTurn() {
    state.activeTeam = state.activeTeam === 0 ? 1 : 0;
  }

  function resolveQuestion(awardPoints) {
    var scoringTeam = state.activeTeam;
    if (awardPoints && state.current) {
      state.teams[scoringTeam].score += state.current.points;
    }
    markUsed();
    nextTurn();
    closeModal();
    updateScoreboard(awardPoints ? scoringTeam : false);

    if (state.remaining <= 0) {
      window.setTimeout(showWinner, 650);
    }
  }

  revealBtn.addEventListener("click", revealAnswer);
  rightBtn.addEventListener("click", function () { resolveQuestion(true); });
  wrongBtn.addEventListener("click", function () { resolveQuestion(false); });
  skipBtn.addEventListener("click", function () { resolveQuestion(false); });
  backBtn.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  /* ============================================================
     SCREEN 5 — WINNER
     ============================================================ */
  var confetti = $("confetti");

  function showWinner() {
    var t1 = state.teams[0], t2 = state.teams[1];
    var winner, loser, tie = false;
    if (t1.score > t2.score) { winner = t1; loser = t2; }
    else if (t2.score > t1.score) { winner = t2; loser = t1; }
    else { tie = true; winner = t1; loser = t2; }

    if (tie) {
      $("winnerTitle").textContent = "تعادل!";
      $("winnerTitle").style.textShadow = "5px 5px 0 var(--blue)";
      $("winnerTag").textContent = "تعادل الفريقان في حلبة كيك أوت";
    } else {
      $("winnerTitle").textContent = winner.name;
      $("winnerTitle").style.textShadow = "5px 5px 0 var(--yellow)";
      $("winnerTag").textContent = "بطل حلبة كيك أوت";
    }

    // final score cards: winner on top-left card
    $("finalName1").textContent = winner.name;
    $("finalScore1").textContent = winner.score;
    $("finalName2").textContent = loser.name;
    $("finalScore2").textContent = loser.score;
    $("finalCard1").classList.toggle("winner__score--win", !tie);
    $("finalCard2").classList.toggle("winner__score--lose", !tie);

    spawnConfetti();
    showScreen("winner");
  }

  function spawnConfetti() {
    confetti.innerHTML = "";
    var colors = ["var(--red)", "var(--blue)", "var(--yellow)", "var(--white)"];
    for (var i = 0; i < 60; i++) {
      var piece = el("i");
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = (2.5 + Math.random() * 2.5) + "s";
      piece.style.animationDelay = (Math.random() * 2) + "s";
      piece.style.transform = "rotate(" + (Math.random() * 360) + "deg)";
      confetti.appendChild(piece);
    }
  }

  $("playAgainBtn").addEventListener("click", function () {
    // keep teams + categories, reset scores + board
    buildBoard();
  });
  $("homeBtn").addEventListener("click", resetToHome);
  $("hudHome").addEventListener("click", function () {
    if (!modal.hidden) closeModal();
    resetToHome();
  });

  function resetToHome() {
    state.picks = [[], []];
    state.boardCategories = [];
    state.teams[0].score = 0;
    state.teams[1].score = 0;
    state.activeTeam = 0;
    state.remaining = 16;
    confetti.innerHTML = "";
    showScreen("setup");
  }

  /* ---------- Boot ---------- */
  showScreen("setup");
})();
