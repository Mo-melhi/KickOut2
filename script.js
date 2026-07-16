/* ============================================================
   كيك أوت — KickOut  |  Interaction Engine
   Entrance sequence · idle motion · parallax · scroll transform
   arcade press · pinfall easter egg · 2.99 dodge · CTA cycle
   ============================================================ */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  const body = document.body;
  const hud = document.getElementById('hud');
  const navRight = document.getElementById('navRight');
  const navLeft = document.getElementById('navLeft');
  const hudLogo = document.getElementById('hudLogo');
  const logo = document.getElementById('logo');
  const pinDot = document.getElementById('pinDot');
  const arena = document.getElementById('arena');
  const hero = document.getElementById('hero');
  const giant = document.getElementById('giant');
  const ringWord = document.getElementById('ringWord');
  const heroCta = document.getElementById('heroCta');
  const heroCtaFace = document.getElementById('heroCtaFace');
  const headerCta = document.getElementById('headerCta');
  const flash = document.getElementById('flash');
  const cards = Array.from(document.querySelectorAll('.tcard'));

  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ============================================================
     1) ENTRANCE — THE 2.99 KICKOUT (once per session)
     ============================================================ */
  function runEntrance() {
    // logo drop
    hudLogo.style.animation = 'logo-drop 0.42s cubic-bezier(0.16,1,0.3,1) forwards';

    // count "1..." -> subtle shake
    setTimeout(() => {
      hud.classList.add('shake');
    }, 300);

    // count "2..." -> pin compress then kick at 2.99
    setTimeout(() => {
      hud.classList.remove('shake');
      hudLogo.style.animation = 'logo-pin-kick 0.62s cubic-bezier(0.16,1,0.3,1) forwards';
    }, 480);

    // KICK OUT: burst pops + nav snaps in from opposite directions
    setTimeout(() => {
      const burst = document.querySelector('.burst');
      if (burst) burst.style.animation = 'burst-pop 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
      navRight.style.animation = 'nav-snap-right 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
      navLeft.style.animation = 'nav-snap-left 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
    }, 900);

    // settle: clear inline transforms so scroll/idle can take over
    setTimeout(() => {
      body.classList.remove('intro');
      hudLogo.style.animation = '';
      navRight.style.animation = '';
      navLeft.style.animation = '';
    }, 1450);
  }

  function skipEntrance() {
    body.classList.remove('intro');
    const burst = document.querySelector('.burst');
    if (burst) burst.style.transform = 'translate(-50%, -50%) scale(1)';
  }

  function initEntrance() {
    const played = sessionStorage.getItem('kickout_intro_played');
    if (reduceMotion || played) {
      skipEntrance();
    } else {
      body.classList.add('intro');
      requestAnimationFrame(() => runEntrance());
      try { sessionStorage.setItem('kickout_intro_played', '1'); } catch (e) { /* private mode */ }
    }
  }

  /* ============================================================
     2) HERO ENTRANCE — the "الحلبة" SLAM
     ============================================================ */
  function runHeroEntrance() {
    if (reduceMotion) {
      hero.classList.add('seq-in', 'cta-in');
      return;
    }
    // eyebrow + line1 quick
    hero.classList.add('seq-in');

    // then الحلبة slams down
    setTimeout(() => {
      ringWord.style.animation = 'ring-slam 0.5s cubic-bezier(0.16,1,0.3,1) forwards';

      // impact: screen shake + cards jump + giant pulse
      setTimeout(() => {
        arena.classList.add('slam-shake');
        setTimeout(() => arena.classList.remove('slam-shake'), 160);

        cards.forEach((c, i) => {
          setTimeout(() => {
            c.classList.add('jump');
            setTimeout(() => c.classList.remove('jump'), 420);
          }, i * 40);
        });

        if (giant) {
          giant.style.animation = 'giant-pulse 0.4s ease-in-out';
          setTimeout(() => { giant.style.animation = ''; }, 420);
        }
      }, 240);

      // CTA appears after impact
      setTimeout(() => hero.classList.add('cta-in'), 520);
    }, 420);
  }

  /* ============================================================
     3) PARALLAX (mouse -> lerp -> CSS vars per depth) + idle
     ============================================================ */
  const depthMap = {
    'bg': 3,
    'rope-back': 4,
    'card-mid': 18,
    'rope-front': 18,
    'card-front': 38,
    'hero': 5,
  };

  const layers = [giant, ...document.querySelectorAll('[data-depth]')]
    .filter(Boolean)
    // de-duplicate (giant also has data-depth)
    .filter((el, idx, arr) => arr.indexOf(el) === idx);

  const target = { x: 0, y: 0 };   // normalized -1..1
  const current = { x: 0, y: 0 };

  // giant dodge target
  const dodge = { x: 0, y: 0 };
  const dodgeCurrent = { x: 0, y: 0 };
  let pointer = { x: -9999, y: -9999 };

  function onMove(e) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    target.x = (e.clientX / w - 0.5) * 2;
    target.y = (e.clientY / h - 0.5) * 2;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  }

  let idlePhase = 0;

  function tick() {
    // parallax easing
    current.x = lerp(current.x, target.x, 0.06);
    current.y = lerp(current.y, target.y, 0.06);

    // idle organic drift (touch, or ambient on desktop)
    idlePhase += 0.012;
    const idleX = Math.sin(idlePhase) * (isTouch ? 0.35 : 0.12);
    const idleY = Math.cos(idlePhase * 0.8) * (isTouch ? 0.3 : 0.1);

    const baseX = isTouch ? idleX : current.x + idleX * 0.4;
    const baseY = isTouch ? idleY : current.y + idleY * 0.4;

    layers.forEach((el) => {
      const depth = depthMap[el.getAttribute('data-depth')] || 0;
      el.style.setProperty('--px', (-baseX * depth).toFixed(2) + 'px');
      el.style.setProperty('--py', (-baseY * depth).toFixed(2) + 'px');
    });

    // 2.99 dodge cursor
    if (giant && !isTouch) {
      const rect = giant.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = pointer.x - cx;
      const dy = pointer.y - cy;
      const dist = Math.hypot(dx, dy);
      const radius = 260;
      if (dist < radius && dist > 0.01) {
        const strength = (1 - dist / radius) * 34;
        dodge.x = (-dx / dist) * strength;
        dodge.y = (-dy / dist) * strength;
      } else {
        dodge.x = 0;
        dodge.y = 0;
      }
    } else {
      dodge.x = 0;
      dodge.y = 0;
    }
    dodgeCurrent.x = lerp(dodgeCurrent.x, dodge.x, 0.08);
    dodgeCurrent.y = lerp(dodgeCurrent.y, dodge.y, 0.08);
    if (giant) {
      giant.style.setProperty('--dodge-x', dodgeCurrent.x.toFixed(2) + 'px');
      giant.style.setProperty('--dodge-y', dodgeCurrent.y.toFixed(2) + 'px');
    }

    // subtle header idle: logo rotate, nav slabs opposite vertical drift
    if (!reduceMotion) {
      const p = getScrollProgress();
      if (p < 0.05) {
        const rot = Math.sin(idlePhase * 0.7) * 1; // -1..1 deg
        logo.style.transform = 'rotate(' + rot.toFixed(2) + 'deg)';
        const nv = Math.sin(idlePhase) * 1.6;
        navRight.style.transform = 'translateY(' + nv.toFixed(2) + 'px)';
        navLeft.style.transform = 'translateY(' + (-nv).toFixed(2) + 'px)';
      } else {
        // during scroll lock, let CSS vars drive transforms
        logo.style.transform = '';
        navRight.style.transform = '';
        navLeft.style.transform = '';
      }
    }

    requestAnimationFrame(tick);
  }

  /* ============================================================
     4) SCROLL TRANSFORMATION (progress 0..1 -> CSS var)
     ============================================================ */
  function getScrollProgress() {
    return clamp(window.scrollY / 140, 0, 1);
  }

  function onScroll() {
    const p = getScrollProgress();
    document.documentElement.style.setProperty('--scroll-progress', p.toFixed(3));

    // hero scroll preparation: content up, giant scale, cards drift out
    const sc = window.scrollY;
    if (hero) hero.style.setProperty('--py', (-sc * 0.15).toFixed(1) + 'px');
    if (giant) giant.style.setProperty('--giant-scale', (1 + sc * 0.0006).toFixed(3));
    cards.forEach((c) => {
      const dir = c.classList.contains('tcard--blur') ? 1.4 : 1;
      const off = c.offsetLeft < window.innerWidth / 2 ? -1 : 1;
      c.style.setProperty('--px', (off * sc * 0.12 * dir).toFixed(1) + 'px');
    });
  }


  /* ============================================================
     6) HERO CTA — playful text cycle + press flash
     ============================================================ */
  function initHeroCta() {
    const states = ['ادخل الحلبة', 'جاهز؟', 'يلا!'];
    let idx = 0;
    let cycleTimer = null;

    heroCta.addEventListener('mouseenter', () => {
      idx = 0;
      cycleTimer = setInterval(() => {
        idx = Math.min(idx + 1, states.length - 1);
        heroCtaFace.textContent = states[idx];
        if (idx === states.length - 1) {
          clearInterval(cycleTimer);
          cycleTimer = null;
        }
      }, 520);
    });

    heroCta.addEventListener('mouseleave', () => {
      if (cycleTimer) { clearInterval(cycleTimer); cycleTimer = null; }
      heroCtaFace.textContent = states[0];
      idx = 0;
    });

    heroCta.addEventListener('click', (e) => {
      heroCta.classList.add('pressed');
      setTimeout(() => heroCta.classList.remove('pressed'), 180);

      // yellow radial flash from button position
      const rect = arena.getBoundingClientRect();
      flash.style.setProperty('--fx', (e.clientX - rect.left) + 'px');
      flash.style.setProperty('--fy', (e.clientY - rect.top) + 'px');
      flash.classList.remove('go');
      // force reflow to restart animation
      void flash.offsetWidth;
      flash.classList.add('go');
      // Prepared for future transition into game setup (no navigation yet).
    });
  }

  function initHeaderCta() {
    headerCta.addEventListener('click', () => {
      headerCta.classList.add('pressed');
      setTimeout(() => headerCta.classList.remove('pressed'), 160);
    });
  }

  /* How to Play: a scroll-controlled miniature KickOut match. */
  function initTutorial() {
    const section = document.getElementById('howToPlay');
    if (!section) return;
    const board = document.getElementById('tutorialBoard');
    const stages = [...section.querySelectorAll('.tutorial-stage')];
    const copy = [...section.querySelectorAll('.tutorial-copy__item')];
    const nodes = [...section.querySelectorAll('.ref-node')];
    const scoreboard = document.getElementById('scoreboard');
    const blueName = document.getElementById('blueTeamName');
    const redName = document.getElementById('redTeamName');
    const vs = document.getElementById('vsBadge');
    const catWM = document.getElementById('catWM');
    const catTitles = document.getElementById('catTitles');
    const tile500 = document.getElementById('tile500');
    const values = document.getElementById('valueGrid');
    const question = document.getElementById('questionPanel');
    const score = document.getElementById('sbBlueScore');
    const redTeam = section.querySelector('.sb-team--red');
    const cursor = document.getElementById('tutCursor');
    let active = -1;
    let run = 0;
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    function setCursorVisible(show) {
      if (!cursor) return;

      cursor.classList.toggle(
        'show',
        show && !reduceMotion
      );
    }

    function moveCursorTo(element, id, duration = 420) {
      if (!cursor || !element || reduceMotion) {
        return Promise.resolve();
      }

      const targetRect = element.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();

      cursor.style.transition = `
    left ${duration}ms cubic-bezier(.16,1,.3,1),
    top ${duration}ms cubic-bezier(.16,1,.3,1),
    transform .12s ease
  `;

      cursor.style.left =
        `${targetRect.left - boardRect.left + targetRect.width / 2}px`;

      cursor.style.top =
        `${targetRect.top - boardRect.top + targetRect.height / 2}px`;

      return wait(duration + 70);
    }

    function cursorClick() {
      if (!cursor || reduceMotion) return;

      cursor.classList.add('click');

      setTimeout(() => {
        cursor.classList.remove('click');
      }, 130);
    }

    function reset() {
      run += 1;
      setCursorVisible(false);
      stages.forEach((el) => el.classList.remove('active'));
      copy.forEach((el) => el.classList.remove('active'));
      nodes.forEach((el) => el.classList.remove('active', 'done'));
      board.classList.remove('has-scoreboard', 'to-winner', 'shake');
      scoreboard.classList.remove('show');
      vs.classList.remove('slam');
      catWM.classList.remove('sel-blue'); catTitles.classList.remove('sel-red');
      tile500.classList.remove('flip'); values.classList.remove('hide'); question.classList.remove('show');
      blueName.textContent = ''; redName.textContent = ''; score.textContent = '0';
      catWM?.classList.remove('lift', 'press');
      catTitles?.classList.remove('lift', 'press');

      tile500?.classList.remove('lift', 'flip');

      const correctButton =
        question?.querySelector('.answer-btn--correct');

      correctButton?.classList.remove('lift', 'press');
    }

    function type(el, text, id) {
      if (reduceMotion) { el.textContent = text; return Promise.resolve(); }
      let i = 0;
      return new Promise((resolve) => {
        const timer = setInterval(() => {
          if (id !== run || i >= text.length) { clearInterval(timer); resolve(); return; }
          el.textContent += text[i++];
        }, 75);
      });
    }

    async function play(stage, id) {
      if (reduceMotion) return;
      if (stage === 0) {
        await type(blueName, 'فريق الروك', id); await wait(150);
        if (id !== run) return; await type(redName, 'فريق سينا', id); await wait(150);
        if (id !== run) return; vs.classList.add('slam'); board.classList.add('shake');
      }
      if (stage === 1) {
        await wait(300);
        if (id !== run) return;

        setCursorVisible(true);

        await moveCursorTo(catWM, id);
        if (id !== run) return;

        catWM.classList.add('lift');

        await wait(180);
        if (id !== run) return;

        cursorClick();

        catWM.classList.remove('lift');
        catWM.classList.add('press');

        await wait(150);
        if (id !== run) return;

        catWM.classList.remove('press');
        catWM.classList.add('sel-blue');

        await wait(320);
        if (id !== run) return;

        await moveCursorTo(catTitles, id);
        if (id !== run) return;

        catTitles.classList.add('lift');

        await wait(180);
        if (id !== run) return;

        cursorClick();

        catTitles.classList.remove('lift');
        catTitles.classList.add('press');

        await wait(150);
        if (id !== run) return;

        catTitles.classList.remove('press');
        catTitles.classList.add('sel-red');

        await wait(260);

        setCursorVisible(false);
      }
      if (stage === 2) {
        await wait(280);
        if (id !== run) return;

        setCursorVisible(true);

        await moveCursorTo(tile500, id);
        if (id !== run) return;

        tile500.classList.add('lift');

        await wait(180);
        if (id !== run) return;

        cursorClick();

        tile500.classList.remove('lift');
        tile500.classList.add('flip');

        await wait(250);
        if (id !== run) return;

        values.classList.add('hide');
        question.classList.add('show');

        await wait(420);
        if (id !== run) return;

        const correctButton =
          question.querySelector('.answer-btn--correct');

        await moveCursorTo(correctButton, id);
        if (id !== run) return;

        correctButton.classList.add('lift');

        await wait(170);
        if (id !== run) return;

        cursorClick();

        correctButton.classList.remove('lift');
        correctButton.classList.add('press');

        await wait(170);

        setCursorVisible(false);
      }
      if (stage === 3) {
        for (const value of ['100', '300', '500']) { await wait(180); if (id !== run) return; score.textContent = value; }
        board.classList.add('shake'); redTeam.classList.add('wobble'); await wait(400);
        if (id === run) board.classList.add('to-winner');
      }
    }

    function show(stage) {
      reset();
      const id = ++run;
      stages[stage].classList.add('active'); copy[stage].classList.add('active');
      nodes.forEach((node, index) => node.classList.toggle('done', index < stage));
      nodes[stage].classList.add('active');
      if (stage > 0) { board.classList.add('has-scoreboard'); scoreboard.classList.add('show'); }
      if (reduceMotion && stage === 0) { blueName.textContent = 'فريق الروك'; redName.textContent = 'فريق سينا'; vs.classList.add('slam'); }
      if (reduceMotion && stage === 1) { catWM.classList.add('sel-blue'); catTitles.classList.add('sel-red'); }
      if (reduceMotion && stage === 2) { values.classList.add('hide'); question.classList.add('show'); }
      if (reduceMotion && stage === 3) { score.textContent = '500'; board.classList.add('to-winner'); }
      play(stage, id);
    }

    let tutorialStarted = false;

    function update() {
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, section.offsetHeight - innerHeight);
      const progress = clamp(-rect.top / travel, 0, 1);

      section.style.setProperty('--tut', progress.toFixed(3));

      // Wait until the How to Play section properly enters the viewport
      const triggerPoint = innerHeight * 0.75;

      if (!tutorialStarted) {
        if (rect.top > triggerPoint) return;

        tutorialStarted = true;
      }

      if (rect.bottom <= 0 || rect.top >= innerHeight) return;

      const next = Math.min(3, Math.floor(progress * 4));

      if (next !== active) {
        active = next;
        show(next);
      }
    }
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    update();
  }

  /* ============================================================
     INIT
     ============================================================ */
  /*==================================================
    CHALLENGE TERMINAL
==================================================*/

  function initChallengeTerminal() {

    const section = document.getElementById("challengeTerminal");

    if (!section) return;

    const machine = document.getElementById("terminalMachine");

    const cards = [...section.querySelectorAll(".terminal-card")];

    const screenCategory =
      document.getElementById("screenCategory");

    const screenStatus =
      section.querySelector(".screen-status");

    const reduceMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let played = false;

    const wait = (ms) =>
      new Promise(resolve => setTimeout(resolve, ms));

    async function playSequence() {

      if (played) return;

      played = true;

      section.classList.add("active");

      if (reduceMotion) {

        cards.forEach(card => card.classList.add("show"));

        screenStatus.textContent = "SELECT YOUR CATEGORY";

        return;
      }

      await wait(500);

      for (const card of cards) {

        card.classList.add("show");

        machine.classList.remove("bump");

        // force browser to restart animation
        void machine.offsetWidth;

        machine.classList.add("bump");

        await wait(180);
      }

      await wait(300);

      machine.classList.remove("bump");
      void machine.offsetWidth;
      machine.classList.add("bump");

      screenStatus.textContent =
        "SELECT YOUR CATEGORY";
    }

    const observer = new IntersectionObserver((entries) => {

      if (!entries[0].isIntersecting) return;

      playSequence();
      observer.disconnect();

    }, {

      threshold: 0.15

    });

    observer.observe(machine);

    cards.forEach(card => {

      card.addEventListener("mouseenter", () => {

        screenCategory.textContent =
          card.dataset.title;

      });

    });

  }
  function init() {
    initEntrance();
    initHeroCta();
    initHeaderCta();
    initTutorial();
    initChallengeTerminal();

    if (!isTouch) {
      window.addEventListener('mousemove', onMove, { passive: true });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    requestAnimationFrame(tick);

    // hero entrance shortly after load (after header settles or immediately if replayed)
    const delay = sessionStorage.getItem('kickout_hero_played') ? 200 : 700;
    setTimeout(() => {
      runHeroEntrance();
      try { sessionStorage.setItem('kickout_hero_played', '1'); } catch (e) { /* noop */ }
    }, reduceMotion ? 0 : delay);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
