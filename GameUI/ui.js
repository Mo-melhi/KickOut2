/* ============================================================
   كيك أوت — KickOut | Game Logic (Vanilla JS SPA)
   Host control panel — manual timing & turn control.
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
    ring:   '<svg viewBox="0 0 24 24" '+S+'><rect x="3" y="7" width="18" height="12" rx="1"/><path d="M3 7 6 3h12l3 4M7 7v12M17 7v12"/></svg>',
    buoy:   '<svg viewBox="0 0 24 24" '+S+'><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.4"/><path d="M5 5l4.5 4.5M14.5 14.5 19 19M19 5l-4.5 4.5M9.5 14.5 5 19"/></svg>'
  };

  /* ---------- Genre filters ---------- */
  var GENRES = [
    { id: "all",     name: "الكل" },
    { id: "titles",  name: "البطولات" },
    { id: "stars",   name: "النجوم" },
    { id: "events",  name: "الأحداث" },
    { id: "moves",   name: "الحركات" },
    { id: "music",   name: "الموسيقى" },
    { id: "teams",   name: "الفرق" },
    { id: "women",   name: "السيدات" }
  ];

  /* ---------- Category catalogue ---------- */
  var CATEGORIES = [
    { id: "titles",    name: "الألقاب",         icon: "trophy", accent: "var(--yellow)", genre: "titles", desc: "من حمل الذهب... ومن خسره؟" },
    { id: "rumble",    name: "رويال رامبل",     icon: "bell",   accent: "var(--red)",    genre: "events", desc: "ثلاثون نجماً... وفائز واحد فقط." },
    { id: "legends",   name: "الأساطير",        icon: "star",   accent: "var(--blue)",   genre: "stars",  desc: "أساطير صنعت تاريخ الحلبة." },
    { id: "finishers", name: "الحركات القاضية", icon: "bolt",   accent: "var(--red)",    genre: "moves",  desc: "الحركات التي تُنهي النزال." },
    { id: "themes",    name: "أغاني الدخول",    icon: "music",  accent: "var(--blue)",   genre: "music",  desc: "الألحان التي تهزّ الجماهير." },
    { id: "tag",       name: "الفرق الثنائية",  icon: "hands",  accent: "var(--yellow)", genre: "teams",  desc: "أقوى الثنائيات في التاريخ." },
    { id: "women",     name: "قسم السيدات",     icon: "crown",  accent: "var(--red)",    genre: "women",  desc: "نجمات غيّرن قواعد اللعبة." },
    { id: "mania",     name: "راسلمينيا",       icon: "ring",   accent: "var(--blue)",   genre: "events", desc: "أعظم حدث في عالم المصارعة." }
  ];

  var POINTS = [200, 200, 400, 400, 600, 600];
  var QUESTIONS_PER_CAT = POINTS.length;   // 6
  var TIMER_SECONDS = 60;

  /* ---------- Question bank (6 per category) ---------- */
  var QUESTIONS = {
    titles: [
      { q: "من هو أول بطل عالمي للوزن الثقيل في تاريخ WWE؟", a: "باڊي روجرز" },
      { q: "ما اسم الحزام الذي يُعتبر أعرق ألقاب المصارعة؟", a: "بطولة WWE" },
      { q: "من حمل لقب البطولة الكونية (Universal) أطول فترة؟", a: "رومان رينز" },
      { q: "أي بطل لُقّب بأطول عهد بلقب WWE في العصر الحديث؟", a: "سي إم بانك (434 يوماً)" },
      { q: "ما اسم أول لقب رقمي (24/7) قُدّم في WWE؟", a: "لقب 24/7" },
      { q: "من أصغر بطل عالمي في تاريخ WWE؟", a: "بروك ليسنر" }
    ],
    rumble: [
      { q: "كم عدد المصارعين المشاركين عادةً في رويال رامبل؟", a: "30 مصارعاً" },
      { q: "من فاز بأول رويال رامبل عام 1988؟", a: "جيم دوغان" },
      { q: "من صاحب أكبر عدد انتصارات في رويال رامبل؟", a: "ستيف أوستن (3 مرات)" },
      { q: "من يملك أطول مدة صمود في تاريخ الرامبل؟", a: "ريبك (أكثر من ساعة)" },
      { q: "في أي شهر تُقام مباراة رويال رامبل عادةً؟", a: "يناير" },
      { q: "من فاز برامبل 2021 من الرجال؟", a: "إيدج" }
    ],
    legends: [
      { q: "من يُلقّب بـ«The Deadman»؟", a: "ذا أندرتيكر" },
      { q: "ما لقب هالك هوغان الشهير بين جماهيره؟", a: "هالكامينيا" },
      { q: "من هو «The Heartbreak Kid»؟", a: "شون مايكلز" },
      { q: "كم بلغ سجل الأندرتيكر في راسلمينيا قبل أن يُهزم؟", a: "21-0" },
      { q: "من يُلقّب بـ«The Nature Boy»؟", a: "ريك فلير" },
      { q: "من يُلقّب بـ«The Rattlesnake»؟", a: "ستيف أوستن" }
    ],
    finishers: [
      { q: "ما اسم حركة جون سينا القاضية؟", a: "Attitude Adjustment" },
      { q: "ما اسم قفلة الاستسلام الخاصة بـ بريت هارت؟", a: "Sharpshooter" },
      { q: "من صاحب حركة «RKO»؟", a: "راندي أورتن" },
      { q: "ما اسم حركة ستيف أوستن القاضية؟", a: "Stone Cold Stunner" },
      { q: "ما اسم حركة أندرتيكر للاستسلام؟", a: "Hell's Gate" },
      { q: "من صاحب حركة «619»؟", a: "ريه ميستيريو" }
    ],
    themes: [
      { q: "«If you smell...» جزء من أغنية دخول أي نجم؟", a: "ذا روك" },
      { q: "أغنية «My Time Is Now» تخص أي مصارع؟", a: "جون سينا" },
      { q: "صوت تحطّم الزجاج يعلن دخول أي أسطورة؟", a: "ستيف أوستن" },
      { q: "أغنية «Metalingus» ارتبطت بأي نجم؟", a: "إيدج" },
      { q: "أغنية «Break the Walls Down» تخص أي نجم؟", a: "كريس جيريكو" },
      { q: "من صاحب أغنية «Real American»؟", a: "هالك هوغان" }
    ],
    tag: [
      { q: "ما اسم الفريق الذي يضم الأخوين أوسو؟", a: "The Usos" },
      { q: "من هما ثنائي «D-Generation X» الأشهر؟", a: "شون مايكلز و تريبل إتش" },
      { q: "أي فريق عُرف بشعار «Awesome Truth»؟", a: "ذا ميز و آر-تروث" },
      { q: "ما اسم فريق الأخوين هاردي الشهير؟", a: "The Hardy Boyz" },
      { q: "ما اسم فريق «إيدج و كريستيان»؟", a: "Edge and Christian" },
      { q: "ما اسم فريق «كين و دانيال براين»؟", a: "Team Hell No" }
    ],
    women: [
      { q: "من أول امرأة تتصدّر الحدث الرئيسي في راسلمينيا؟", a: "بيكي لينش (بالمشاركة)" },
      { q: "ما لقب بطولة السيدات في العرض الأحمر؟", a: "بطولة سيدات رو" },
      { q: "من تُلقّب بـ«The Man»؟", a: "بيكي لينش" },
      { q: "من حققت الفوز بأول Women's Royal Rumble؟", a: "آسكا" },
      { q: "من تُلقّب بـ«The Queen»؟", a: "شارلوت فلير" },
      { q: "من تُلقّب بـ«The Empress of Tomorrow»؟", a: "آسكا" }
    ],
    mania: [
      { q: "في أي مدينة أقيمت أول راسلمينيا عام 1985؟", a: "نيويورك" },
      { q: "من هزم الأندرتيكر منهياً سجله في راسلمينيا؟", a: "بروك ليسنر" },
      { q: "منذ أي عام أصبحت راسلمينيا تُقام على ليلتين؟", a: "2020" },
      { q: "من يُلقّب بـ«Mr. WrestleMania»؟", a: "شون مايكلز" },
      { q: "أي راسلمينيا حملت الرقم 30؟", a: "راسلمينيا 30 (2014)" },
      { q: "من تصدّر الحدث الرئيسي لراسلمينيا 40؟", a: "كودي رودز" }
    ]
  };

  /* ---------- Game state ---------- */
  var state = {
    matchName: "",
    teams: [
      { name: "الفريق الأول", score: 0, color: "red", helpers: 3 },
      { name: "الفريق الثاني", score: 0, color: "blue", helpers: 3 }
    ],
    pickPhase: 0,
    picks: [[], []],
    activeFilter: "all",
    boardCategories: [],
    activeTeam: 0,
    remaining: QUESTIONS_PER_CAT * 4,
    remainingGames: 1,     // dynamic — backend later
    current: null
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
  var dock = $("dock");

  function showScreen(key) {
    Object.keys(screens).forEach(function (k) {
      var s = screens[k];
      if (k === key) {
        s.hidden = false;
        s.classList.remove("is-active");
        void s.offsetWidth;
        s.classList.add("is-active");
      } else {
        s.hidden = true;
        s.classList.remove("is-active");
      }
    });
    document.body.setAttribute("data-screen", key);
    dock.hidden = key !== "categories";
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ============================================================
     SCREEN 1 — MATCH CREATION
     ============================================================ */
  var matchName = $("matchName");
  var team1Name = $("team1Name");
  var team2Name = $("team2Name");
  var setupError = $("setupError");

  function beginMatch() {
    var mn = matchName.value.trim();
    var n1 = team1Name.value.trim();
    var n2 = team2Name.value.trim();

    if (!n1 || !n2) { return showError("الرجاء إدخال اسم لكل فريق قبل المتابعة."); }
    if (n1.toLowerCase() === n2.toLowerCase()) { return showError("يجب أن يكون لكل فريق اسم مختلف."); }

    setupError.hidden = true;
    state.matchName = mn || "مباراة كيك أوت";
    state.teams[0].name = n1;
    state.teams[1].name = n2;
    startPickPhase(0);
  }
  function showError(msg) { setupError.textContent = msg; setupError.hidden = false; }

  $("startBtn").addEventListener("click", beginMatch);
  [matchName, team1Name, team2Name].forEach(function (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) beginMatch();
    });
  });

  /* ============================================================
     SCREEN 2 — CATEGORY SELECTION
     ============================================================ */
  var catGrid = $("catGrid");
  var filterBar = $("filterBar");
  var pickCount = $("pickCount");
  var pickTeamName = $("pickTeamName");
  var pickEyebrow = $("pickEyebrow");
  var dockNext = $("dockNext");
  var dockBack = $("dockBack");
  var dockHint = $("dockHint");

  function renderFilterBar() {
    filterBar.innerHTML = "";
    GENRES.forEach(function (g) {
      var chip = el("button", "filter-chip", g.name);
      chip.type = "button";
      chip.setAttribute("role", "tab");
      chip.setAttribute("data-genre", g.id);
      if (g.id === state.activeFilter) chip.classList.add("is-active");
      chip.setAttribute("aria-selected", g.id === state.activeFilter ? "true" : "false");
      chip.addEventListener("click", function () {
        state.activeFilter = g.id;
        renderFilterBar();
        renderCategoryCards();
      });
      filterBar.appendChild(chip);
    });
  }

  function startPickPhase(phase) {
    state.pickPhase = phase;
    state.activeFilter = "all";
    var team = state.teams[phase];
    pickTeamName.textContent = team.name;
    pickTeamName.classList.toggle("is-blue", phase === 1);
    pickEyebrow.textContent = phase === 0 ? "دور الفريق الأول" : "دور الفريق الثاني";
    renderFilterBar();
    renderCategoryCards();
    updatePickUI();
    showScreen("categories");
  }

  function alreadyTaken(catId) {
    return state.pickPhase === 1 && state.picks[0].indexOf(catId) !== -1;
  }

  function renderCategoryCards() {
    catGrid.innerHTML = "";
    var list = CATEGORIES.filter(function (c) {
      return state.activeFilter === "all" || c.genre === state.activeFilter;
    });
    list.forEach(function (cat) {
      var card = el("button", "cat-card");
      card.type = "button";
      card.style.setProperty("--accent", cat.accent);
      card.setAttribute("data-id", cat.id);

      var check = el("span", "cat-card__check", "✔");
      var icon = el("span", "cat-card__icon");
      icon.innerHTML = ICONS[cat.icon] || "";
      var name = el("span", "cat-card__name", cat.name);
      var desc = el("span", "cat-card__desc", cat.desc);
      card.appendChild(check);
      card.appendChild(icon);
      card.appendChild(name);
      card.appendChild(desc);

      if (state.picks[state.pickPhase].indexOf(cat.id) !== -1) card.classList.add("is-selected");
      if (alreadyTaken(cat.id)) { card.classList.add("is-taken"); card.disabled = true; }

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
      if (picks.length >= 2) return;
      picks.push(catId);
      card.classList.add("is-selected");
    }
    updatePickUI();
  }

  function updatePickUI() {
    var picks = state.picks[state.pickPhase];
    pickCount.textContent = picks.length;
    var ready = picks.length === 2;
    dockNext.disabled = !ready;
    dockNext.classList.toggle("is-disabled", !ready);
    if (!ready) {
      dockHint.textContent = "اختر تصنيفين للمتابعة";
    } else {
      dockHint.textContent = state.pickPhase === 0 ? "جاهز — التالي دور الفريق الثاني" : "جاهز — ابدأ اللعب";
    }
  }

  dockNext.addEventListener("click", function () {
    if (state.picks[state.pickPhase].length !== 2) return;
    if (state.pickPhase === 0) startPickPhase(1);
    else buildBoard();
  });
  dockBack.addEventListener("click", function () {
    if (state.pickPhase === 1) { state.picks[1] = []; startPickPhase(0); }
    else showScreen("setup");
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
    state.remaining = ids.length * QUESTIONS_PER_CAT;
    state.activeTeam = 0;
    state.teams[0].score = 0;
    state.teams[1].score = 0;
    state.teams[0].helpers = 3;
    state.teams[1].helpers = 3;

    renderScoreboard();
    renderHelpers();
    renderBoardGrid();
    updateScoreboard(false);
    showScreen("board");
  }

  function renderScoreboard() {
    $("sbName1").textContent = state.teams[0].name;
    $("sbName2").textContent = state.teams[1].name;
    $("sbScore1").textContent = "0";
    $("sbScore2").textContent = "0";
    $("centerMatchName").textContent = state.matchName;
  }

  function renderHelpers() {
    [0, 1].forEach(function (t) {
      var wrap = $("helpers" + (t + 1));
      wrap.innerHTML = "";
      for (var i = 0; i < 3; i++) {
        var b = el("button", "helper-btn");
        b.type = "button";
        b.innerHTML = ICONS.buoy;
        b.setAttribute("aria-label", "وسيلة مساعدة للفريق");
        b.setAttribute("title", "وسيلة مساعدة (تُستخدم مرة واحدة)");
        (function (btn, team) {
          btn.addEventListener("click", function () {
            if (btn.classList.contains("is-used")) return;
            btn.classList.add("is-used");
            btn.disabled = true;
            state.teams[team].helpers -= 1;
          });
        })(b, t);
        wrap.appendChild(b);
      }
    });
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
        cell.addEventListener("click", function () { openQuestion(cat, qi, pts, cell); });
        body.appendChild(cell);
      });
      panel.appendChild(body);
      boardGrid.appendChild(panel);
    });
  }

  function updateScoreboard(bump) {
    setScoreText($("sbScore1"), state.teams[0].score, bump === 0);
    setScoreText($("sbScore2"), state.teams[1].score, bump === 1);
    $("scoreTeam1").classList.toggle("is-turn", state.activeTeam === 0);
    $("scoreTeam2").classList.toggle("is-turn", state.activeTeam === 1);
    questionsLeft.textContent = state.remaining;
  }

  function setScoreText(node, value, doBump) {
    node.textContent = value;
    if (doBump) { node.classList.remove("is-bumping"); void node.offsetWidth; node.classList.add("is-bumping"); }
  }

  /* ----- manual score adjustment ----- */
  document.querySelectorAll(".control-panel__adjust").forEach(function (grp) {
    var team = parseInt(grp.getAttribute("data-team"), 10);
    grp.querySelectorAll(".adj-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var delta = parseInt(btn.getAttribute("data-delta"), 10);
        state.teams[team].score += delta;
        updateScoreboard(team);
      });
    });
  });

  /* ============================================================
     SCREEN 4 — QUESTION MODAL + TIMER
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

  /* timer */
  var timerWrap = $("timer");
  var timerTime = $("timerTime");
  var timerStart = $("timerStart");
  var timerStartLabel = $("timerStartLabel");
  var timerRestart = $("timerRestart");
  var timer = { remaining: TIMER_SECONDS, status: "idle", interval: null };

  function fmt(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }
  function renderTimer() {
    timerTime.textContent = fmt(timer.remaining);
    timerWrap.classList.toggle("is-warning", timer.status === "running" && timer.remaining <= 10 && timer.remaining > 0);
    timerWrap.classList.toggle("is-done", timer.status === "done");
    if (timer.status === "running") { timerStartLabel.textContent = "إيقاف مؤقت"; timerStart.className = "timer-btn timer-btn--start is-running"; }
    else if (timer.status === "paused") { timerStartLabel.textContent = "استئناف"; timerStart.className = "timer-btn timer-btn--start is-paused"; }
    else if (timer.status === "done") { timerStartLabel.textContent = "انتهى الوقت"; timerStart.className = "timer-btn timer-btn--start"; }
    else { timerStartLabel.textContent = "ابدأ المؤقت"; timerStart.className = "timer-btn timer-btn--start"; }
    timerStart.disabled = timer.status === "done";
  }
  function stopInterval() { if (timer.interval) { clearInterval(timer.interval); timer.interval = null; } }
  function timerTick() {
    timer.remaining -= 1;
    if (timer.remaining <= 0) { timer.remaining = 0; timer.status = "done"; stopInterval(); }
    renderTimer();
  }
  function startTimer() {
    timer.status = "running";
    stopInterval();
    timer.interval = setInterval(timerTick, 1000);
    renderTimer();
  }
  function pauseTimer() { timer.status = "paused"; stopInterval(); renderTimer(); }
  function resetTimer() { stopInterval(); timer.remaining = TIMER_SECONDS; timer.status = "idle"; renderTimer(); }

  timerStart.addEventListener("click", function () {
    if (timer.status === "running") pauseTimer();
    else if (timer.status === "idle" || timer.status === "paused") startTimer();
  });
  timerRestart.addEventListener("click", resetTimer);

  function openQuestion(cat, qi, pts, cell) {
    var data = QUESTIONS[cat.id][qi];
    state.current = { catId: cat.id, catName: cat.name, qIndex: qi, points: pts, cell: cell };

    modalCategory.textContent = cat.name;
    modalPoints.textContent = pts;
    modalTurnTeam.textContent = state.teams[state.activeTeam].name;
    modalQuestion.textContent = data.q;
    modalAnswerText.textContent = data.a;

    modalAnswer.hidden = true;
    revealBtn.disabled = false;
    rightBtn.disabled = false;
    wrongBtn.disabled = false;
    skipBtn.disabled = false;

    resetTimer();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    timerStart.focus();
  }

  function closeModal() {
    stopInterval();
    modal.hidden = true;
    document.body.style.overflow = "";
    state.current = null;
  }
  function revealAnswer() { modalAnswer.hidden = false; revealBtn.disabled = true; }

  function markUsed() {
    var cur = state.current;
    if (!cur || !cur.cell) return;
    cur.cell.disabled = true;
    cur.cell.classList.add("is-used");
    state.remaining -= 1;
  }

  /* Resolve — NO automatic turn switch (host controls turns manually) */
  function resolveQuestion(awardPoints) {
    var scoringTeam = state.activeTeam;
    if (awardPoints && state.current) state.teams[scoringTeam].score += state.current.points;
    markUsed();
    closeModal();
    updateScoreboard(awardPoints ? scoringTeam : false);
    if (state.remaining <= 0) window.setTimeout(showWinner, 650);
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
     HEADER CONTROLS
     ============================================================ */
  var switchTurnBtn = $("switchTurnBtn");
  switchTurnBtn.addEventListener("click", function () {
    state.activeTeam = state.activeTeam === 0 ? 1 : 0;
    updateScoreboard(false);
    if (!modal.hidden) modalTurnTeam.textContent = state.teams[state.activeTeam].name;
  });

  /* confirm dialog */
  var confirmModal = $("confirmModal");
  var confirmOverlay = $("confirmOverlay");
  var confirmTitle = $("confirmTitle");
  var confirmText = $("confirmText");
  var confirmOk = $("confirmOk");
  var confirmCancel = $("confirmCancel");
  var confirmAction = null;

  function openConfirm(title, text, onOk) {
    confirmTitle.textContent = title;
    confirmText.textContent = text;
    confirmAction = onOk;
    confirmModal.hidden = false;
  }
  function closeConfirm() { confirmModal.hidden = true; confirmAction = null; }
  confirmOk.addEventListener("click", function () { var a = confirmAction; closeConfirm(); if (a) a(); });
  confirmCancel.addEventListener("click", closeConfirm);
  confirmOverlay.addEventListener("click", closeConfirm);

  $("exitBtn").addEventListener("click", function () {
    openConfirm("الخروج من المباراة", "سيتم إنهاء الجلسة الحالية والعودة إلى الصفحة الرئيسية. هل تريد المتابعة؟", resetToHome);
  });
  $("finishBtn").addEventListener("click", function () {
    openConfirm("إنهاء المباراة", "سيتم إنهاء المباراة الآن، ويفوز الفريق صاحب أعلى نتيجة. هل تريد المتابعة؟", function () {
      if (!modal.hidden) closeModal();
      showWinner();
    });
  });

  /* settings placeholder */
  var settingsModal = $("settingsModal");
  $("settingsBtn").addEventListener("click", function () { settingsModal.hidden = false; });
  $("settingsClose").addEventListener("click", function () { settingsModal.hidden = true; });
  $("settingsOverlay").addEventListener("click", function () { settingsModal.hidden = true; });

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

  $("playAgainBtn").addEventListener("click", buildBoard);
  $("homeBtn").addEventListener("click", resetToHome);
  $("hudHome").addEventListener("click", function () {
    if (!modal.hidden) closeModal();
    openConfirm("العودة إلى البداية", "سيتم إنهاء الجلسة الحالية والعودة إلى شاشة إنشاء المباراة. هل تريد المتابعة؟", resetToHome);
  });

  function resetToHome() {
    if (!modal.hidden) closeModal();
    state.picks = [[], []];
    state.boardCategories = [];
    state.teams[0].score = 0;
    state.teams[1].score = 0;
    state.teams[0].helpers = 3;
    state.teams[1].helpers = 3;
    state.activeTeam = 0;
    state.remaining = QUESTIONS_PER_CAT * 4;
    confetti.innerHTML = "";
    showScreen("setup");
  }

  /* ============================================================
     BACKEND-READY HOOKS (public API)
     ============================================================ */
  function setRemainingGames(n) {
    state.remainingGames = n;
    $("remainingGamesValue").textContent = n;
  }
  window.KickOut = {
    state: state,
    setRemainingGames: setRemainingGames,
    getMatchSnapshot: function () {
      return {
        matchName: state.matchName,
        teams: state.teams.map(function (t) { return { name: t.name, score: t.score, helpersUsed: 3 - t.helpers }; }),
        categories: state.boardCategories.map(function (c) { return c.id; }),
        questionsRemaining: state.remaining,
        activeTeam: state.activeTeam,
        date: new Date().toISOString()
      };
    }
  };

  /* ---------- Boot ---------- */
  setRemainingGames(state.remainingGames);
  showScreen("setup");
})();
