// Прототип плашки NEW для Типографа. Состояние «уже пользовался» хранится в localStorage
// отдельно для каждого варианта — чтобы можно было сравнивать варианты, не мешая друг другу.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const body = document.body;

  const DESC = {
    dvA: "<b>Вариант 1 · ДВ.</b> Плашка «Новое» на углу палочки. Наведите на палочку — через полсекунды появится подсказка. Нажмите — Типограф поправит текст, плашка исчезнет.",
    mvA: "<b>Вариант 1 · МВ.</b> Мигающая точка на «⋯». Откройте меню: «Типограф» внизу списка, «Новое» сразу после названия, справа «?» — по тапу на него подсказка. Точка мигает до первого тапа по «⋯», после — пропадает.",
    dvB: "<b>Десктоп.</b> Редактор открывается пустым, кнопки тулбара неактивны. Начните писать (или «Вставить пример текста») — кнопки станут активными, а после паузы в наборе под тулбаром плавно выедет строка «Новое» и стрелка к мигающей точке на палочке. Нажмите «Новое» — появится подсказка. Крестик прячет строку вместе с точкой.",
    mvB: "<b>Мобильная.</b> Редактор открывается пустым, кнопки неактивны. Начните писать — после паузы в наборе под тулбаром плавно выедет строка и стрелка к мигающей точке на «⋯». В меню «Типограф» внизу, «Новое» после названия, по тапу на «?» — подсказка. Крестик прячет строку вместе с точкой.",
    dv1: "<b>ДВ-1 · Бейдж NEW на углу иконки (рекомендую).</b> Плашка сидит на углу палочки, кнопка подсвечена. Нажмите на палочку — текст поправится, бейдж исчезнет навсегда.",
    dv2: "<b>ДВ-2 · Точка + тултип.</b> На иконке только зелёная точка, слово NEW и пояснение — в тултипе при наведении (через 0,5 с, как в библиотеке).",
    dv3: "<b>ДВ-3 · NEW рядом с иконкой.</b> Плашка стоит в строку справа от палочки и входит в кнопку. После первого нажатия тулбар возвращается к обычной ширине.",
    dv4: "<b>ДВ-4 · Кнопка с подписью.</b> На время запуска палочка — это кнопка «Типограф NEW». После первого нажатия сворачивается обратно в иконку.",
    dv5: "<b>ДВ-5 · Онбординг-подсказка (рекомендую вместе с ДВ-1).</b> Один раз: пульс вокруг кнопки и карточка. «Понятно» закрывает подсказку, бейдж остаётся до первого нажатия.",
    dv6: "<b>ДВ-6 · Анонс-строка под тулбаром.</b> «Попробовать» сразу применяет Типограф, крестик прячет строку навсегда.",
    mv1: "<b>МВ-1 · Как в макете.</b> Нажмите «⋯» в тулбаре: в шторке пункт «Типограф» подсвечен, NEW справа, при первом открытии — тултип. Нажмите на пункт — текст поправится.",
    mv2: "<b>МВ-2 · NEW сразу после названия.</b> То же, что МВ-1, но плашка стоит вплотную к слову «Типограф».",
    mv3: "<b>МВ-3 · Бейдж NEW на «⋯» (рекомендую).</b> Без него пункт с NEW не увидят, пока сами не откроют шторку. Бейдж на кнопке пропадает после первого открытия, NEW в пункте — после первого использования.",
    mv4: "<b>МВ-4 · Онбординг один раз после релиза.</b> Затемнение, пульс вокруг «⋯» и карточка с «Попробовать» (сразу поправит текст) и «Понятно». Дальше остаётся только бейдж на «⋯», как в МВ-3.",
    mv6: "<b>МВ-6 · Анонс-строка под тулбаром.</b> NEW + одна фраза + «Попробовать» + крестик прямо в редакторе. «Попробовать» сразу правит текст, крестик прячет строку навсегда.",
    mv5: "<b>МВ-5 · Снекбар внизу экрана.</b> Появляется через секунду и сам исчезает через 6 с. «Открыть» открывает шторку «⋯».",
  };

  // ---------- хранилище ----------
  const store = {
    get(k) { try { return localStorage.getItem("tn:" + k) === "1"; } catch { return false; } },
    set(k) { try { localStorage.setItem("tn:" + k, "1"); } catch {} },
    clear() { try { Object.keys(localStorage).filter((k) => k.startsWith("tn:")).forEach((k) => localStorage.removeItem(k)); } catch {} },
  };
  let v = "dvB";
  const AB = () => ["dvA", "mvA", "dvB", "mvB"].includes(v);
  const key = (name) => `${v}:${name}`;

  // ---------- типограф ----------
  const NB = " ";
  const RULES = [
    [/[ \t]+([,.!?:;…])/g, "$1"],                       // пробел перед знаком препинания
    [/\.\.\./g, "…"],                                    // многоточие
    [/ {2,}/g, " "],                                     // двойные пробелы
    [/(\d)\s*[-–]\s*(\d)/g, "$1–$2"],                    // диапазоны 3-4 → 3–4
    [/(\S)[  ]+-{1,2}[  ]+/g, `$1${NB}— `],    // дефис между словами → тире
    [/"([^"]*)"/g, "«$1»"],                              // кавычки-ёлочки
    [/(^|[\s(«])(в|во|и|к|ко|с|со|у|о|об|а|на|по|за|не|ни|из|от|до|но|же|я) (?=\S)/gi, `$1$2${NB}`], // неразрывный после коротких слов
    [/(\d) (?=[а-яё])/gi, `$1${NB}`],                    // число + единица
  ];
  function typograf(text) {
    let n = 0;
    for (const [re, to] of RULES) text = text.replace(re, (...m) => { n++; return to.replace(/\$(\d)/g, (_, i) => m[+i] ?? ""); });
    return [text, n];
  }
  function applyTo(els) {
    let total = 0;
    for (const el of els) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      let changed = 0;
      for (const t of nodes) { const [out, n] = typograf(t.nodeValue); if (n && out !== t.nodeValue) { t.nodeValue = out; changed += n; } }
      if (changed) { el.classList.remove("flash", "is-done"); void el.offsetWidth; el.classList.add("flash"); setTimeout(() => el.classList.add("is-done"), 60); setTimeout(() => el.classList.remove("flash", "is-done"), 1400); }
      total += changed;
    }
    return total;
  }
  function targets(scope) {
    const all = $$("[contenteditable]", scope);
    const sel = getSelection();
    if (sel && !sel.isCollapsed) { const hit = all.filter((el) => sel.containsNode(el, true)); if (hit.length) return hit; }
    return all;
  }
  function plural(n) { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? "место" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "места" : "мест"; }
  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 2400); }
  function runTypograf(scope) {
    const n = applyTo(targets(scope));
    toast(n ? `Типограф: исправлено ${n} ${plural(n)}` : "Типограф: текст уже в порядке ✓");
    store.set(key("used"));
    closeCoach();
    render();
  }

  // ---------- ДВ ----------
  const col = $("#dvCol"), tip = $("#tip"), typoBox = $("#typo"), typoBtn = $("#typoBtn");
  function offsetIn(el, anc) { let x = 0, y = 0; while (el && el !== anc) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return { x, y }; }
  let tipT;
  function showTip(el) {
    clearTimeout(tipT);
    tipT = setTimeout(() => {
      const isTypo = el === typoBtn;
      const isNew = body.classList.contains("is-new");
      tip.querySelector(".tip__c").innerHTML = isTypo
        ? (v === "dvA" || v === "dvB" ? "Типограф делает оформление текста аккуратнее: исправляет кавычки, тире и пробелы. Выделите текст и нажмите на кнопку." : v === "dv2" && isNew ? "<b>Типограф</b><i class='counter'>NEW</i><br>Исправит кавычки, тире и пробелы. Выделите текст и нажмите." : "Типограф: кавычки, тире и пробелы")
        : el.dataset.tip;
      const o = offsetIn(el, col);
      tip.style.left = "0px"; tip.classList.add("is-on");
      const w = tip.offsetWidth;
      tip.style.left = Math.round(o.x + el.offsetWidth / 2 - w / 2) + "px";
      tip.style.top = o.y + el.offsetHeight + 4 + "px"; // отступ от элемента 4 px — по описанию компонента tooltip
    }, 500);
  }
  function hideTip() { clearTimeout(tipT); tip.classList.remove("is-on"); }
  $$("#toolbar .bi").forEach((b) => { b.addEventListener("mouseenter", () => showTip(b)); b.addEventListener("mouseleave", hideTip); });
  typoBtn.addEventListener("mousedown", (e) => e.preventDefault()); // не сбрасываем выделение текста
  // наведение на «Новое» подсвечивает палочку и показывает её подсказку
  const hoverNew = (on) => { typoBtn.classList.toggle("is-hover", on); if (on) showTip(typoBtn); else hideTip(); };
  for (const el of [$(".typo__badge"), $("#annBNew")]) {
    el.addEventListener("mouseenter", () => hoverNew(true));
    el.addEventListener("mouseleave", () => hoverNew(false));
  }
  $(".typo__badge").addEventListener("click", () => { hideTip(); runTypograf($("#editor")); });
  typoBtn.addEventListener("click", () => { hideTip(); runTypograf($("#editor")); });

  const coach = $("#coach");
  function placeCoach() {
    const o = offsetIn(typoBox, col);
    const cx = o.x + typoBox.offsetWidth / 2;
    coach.style.left = Math.round(cx - (320 - 24 - 6)) + "px";
    coach.style.top = o.y + typoBox.offsetHeight + 14 + "px";
  }
  function closeCoach() { if (body.classList.contains("coach-open")) store.set(key("coach")); body.classList.remove("coach-open"); $("#mCoach").classList.remove("is-on"); $("#phone").classList.remove("coach-on"); }
  $("#coachOk").addEventListener("click", closeCoach);
  $("#coachTry").addEventListener("click", () => runTypograf($("#editor")));
  $("#announceTry").addEventListener("click", () => { store.set(key("announce")); runTypograf($("#editor")); });
  $("#announceClose").addEventListener("click", () => { store.set(key("announce")); render(); });
  $("#annBClose").addEventListener("click", () => { store.set(key("announce")); render(); });

  // масштаб ДВ на узких экранах — страница Пикабу рассчитана на 1020 + поля
  function fitDv() { const z = Math.min(1, innerWidth / 1100); $("#dvZoom").style.zoom = z < 1 ? z : ""; }
  addEventListener("resize", fitDv);

  // ---------- МВ ----------
  const phone = $("#phone"), sheet = $("#sheet"), sheetTip = $("#sheetTip"), more = $("#more"), snack = $("#snack");
  function openSheet() {
    snack.classList.remove("is-on");
    store.set(key("more"));
    const used = store.get(key("used"));
    const firstTip = !used && !store.get(key("tip")) && ["mv1", "mv2", "mv3"].includes(v);
    sheetTip.style.display = firstTip ? "" : "none";
    sheetTip.classList.toggle("is-on", firstTip);
    if (firstTip) store.set(key("tip"));
    $("#rowTip").classList.remove("is-on");
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
    render();
  }
  function closeSheet() { sheet.classList.remove("is-open"); sheet.setAttribute("aria-hidden", "true"); }
  more.addEventListener("click", () => { closeCoach(); openSheet(); });
  $("#sheetClose").addEventListener("click", closeSheet);
  sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });
  sheetTip.addEventListener("click", () => sheetTip.classList.remove("is-on"));
  $("#rowTip").addEventListener("click", () => $("#rowTip").classList.remove("is-on"));
  // нажатие на плашку «Новое»/NEW в меню открывает подсказку и не запускает Типограф
  $("#mTypoQ").addEventListener("click", (e) => {
    if (!AB()) return;
    e.stopPropagation();
    const rowTip = $("#rowTip"), row = $("#mTypo");
    const on = !rowTip.classList.contains("is-on");
    rowTip.classList.toggle("is-on", on);
    if (on) rowTip.style.top = row.offsetTop - rowTip.offsetHeight + 6 + "px";
  });
  // ДВ вариант 2: «Новое» в строке — подсказка под плашкой
  $("#annBNew").addEventListener("click", (e) => {
    e.stopPropagation();
    if (tip.classList.contains("is-on")) return; // уже показана наведением
    typoBtn.classList.add("is-hover");
    clearTimeout(tipT);
    showTip(typoBtn);
  });
  document.addEventListener("click", (e) => { if (!e.target.closest("#annBNew") && v === "dvB") { hideTip(); typoBtn.classList.remove("is-hover"); } });
  $("#mTypo").addEventListener("click", () => { closeSheet(); runTypograf($(".m-editor")); });
  $("#snackOpen").addEventListener("click", openSheet);
  $("#mCoachOk").addEventListener("click", closeCoach);
  $("#mCoachTry").addEventListener("click", () => { store.set(key("more")); runTypograf($(".m-editor")); });
  $("#mAnnounceTry").addEventListener("click", () => { store.set(key("announce")); runTypograf($(".m-editor")); });
  $("#mAnnounceClose").addEventListener("click", () => { store.set(key("announce")); render(); });
  $("#mAnnBClose").addEventListener("click", () => { store.set(key("announce")); render(); });

  function placeMCoach() {
    const ring = $(".m-coach__ring"), card = $(".coach--m");
    const pr = phone.getBoundingClientRect(), r = more.getBoundingClientRect();
    const cx = r.left - pr.left + r.width / 2, cy = r.top - pr.top + r.height / 2;
    ring.style.left = cx - 20 + "px"; ring.style.top = cy - 20 + "px";
    card.style.top = r.bottom - pr.top + 14 + "px";
    card.style.setProperty("--arrow", Math.max(12, pr.width - 16 - cx - 6) + "px");
  }

  // ---------- рендер состояния ----------
  let snackT1, snackT2;
  function render() {
    const used = store.get(key("used"));
    body.classList.toggle("is-new", !used);
    const showAnn = (v === "dvB" || v === "mvB") && hintReady && !used && !store.get(key("announce"));
    if (showAnn) { const w = $(v === "dvB" ? "#annBWrap" : "#mAnnBWrap"); w.style.setProperty("--annH", w.firstElementChild.offsetHeight + "px"); }
    body.classList.toggle("show-announce", showAnn);
    body.classList.toggle("more-new", !store.get(key("more")));
    body.classList.toggle("item-new", !used);
    body.classList.toggle("ann-closed", store.get(key("announce")));
  }
  // ---------- ввод текста: кнопки активны только когда в посте есть текст ----------
  // Подсказка о Типографе появляется не сразу, а когда человек начал писать и сделал паузу в наборе.
  let hintReady = false, typeT;
  const scopeEl = () => $(v === "dvB" ? "#editor" : ".m-editor");
  const hasText = () => $$("[contenteditable]", scopeEl()).some((el) => el.textContent.trim());
  function syncText() {
    const t = hasText();
    body.classList.toggle("no-text", !t);
    clearTimeout(typeT);
    if (t && !hintReady) typeT = setTimeout(() => { hintReady = true; render(); }, 900);
  }
  $$("[contenteditable]").forEach((el) => el.addEventListener("input", syncText));
  const SAMPLE_T = 'Как я "починил" старый велосипед';
  const SAMPLE_P = 'Всё началось в субботу - я нашёл в гараже свой первый велосипед . Цепь ржавая , колёса спущены...  Но я решил: "Сделаю за выходные!" В итоге ушло 3-4 дня и около 2000 рублей , зато теперь катаюсь  каждый вечер.';
  function clearText() { $$("[contenteditable]").forEach((el) => (el.textContent = "")); hintReady = false; clearTimeout(typeT); }
  $("#sample").addEventListener("click", () => {
    const sc = scopeEl(); $(".editor__title", sc).textContent = SAMPLE_T; $(".editor__p", sc).textContent = SAMPLE_P; syncText();
  });

  function start(next) {
    if (!DESC[next] || !/B$/.test(next)) next = next && next.startsWith("mv") ? "mvB" : "dvB";
    v = next;
    body.dataset.v = v;
    $$("[data-var]").forEach((b) => b.classList.toggle("is-on", v.endsWith(b.dataset.var)));
    $$("[data-view]").forEach((b) => b.classList.toggle("is-on", v.startsWith(b.dataset.view)));
    $("#desc").innerHTML = DESC[v];
    // подписи плашек и место «Типографа» в меню — как в макете выбранных вариантов
    $(".typo__badge").textContent = v === "dvA" ? "Новое" : "NEW";
    $(".nav-item__right").textContent = "NEW";
    $(".nav-item__inline").textContent = AB() ? "Новое" : "NEW";
    const box = $(".sheet__box"), row = $("#mTypo");
    if (AB()) box.insertBefore(row, $("#rowTip")); else box.prepend(row);
    $("#rowTip").classList.remove("is-on");
    hideTip(); closeSheet(); clearTimeout(snackT1); clearTimeout(snackT2); snack.classList.remove("is-on");
    body.classList.remove("coach-open"); $("#mCoach").classList.remove("is-on"); phone.classList.remove("coach-on");
    clearText(); syncText();
    render();
    const used = store.get(key("used"));
    if (v === "dv5" && !used && !store.get(key("coach"))) setTimeout(() => { placeCoach(); body.classList.add("coach-open"); }, 600);
    if (v === "mv4" && !used && !store.get(key("coach"))) setTimeout(() => { placeMCoach(); phone.classList.add("coach-on"); $("#mCoach").classList.add("is-on"); }, 600);
    if (v === "mv5" && !used) { snackT1 = setTimeout(() => snack.classList.add("is-on"), 1000); snackT2 = setTimeout(() => snack.classList.remove("is-on"), 7000); }
    document.documentElement.style.setProperty("--demo-h", $(".demo").offsetHeight + "px");
    fitDv();
  }
  const go = (next) => { history.replaceState(null, "", "#" + next); start(next); };
  // выбор варианта всегда открывает ДВ; ДВ/МВ переключает версию текущего варианта
  $$("[data-var]").forEach((b) => b.addEventListener("click", () => go("dv" + b.dataset.var)));
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => go(b.dataset.view + "B")));
  $("#reset").addEventListener("click", () => { store.clear(); start(v); toast("Редактор снова пустой — начните писать"); });
  addEventListener("resize", () => { document.documentElement.style.setProperty("--demo-h", $(".demo").offsetHeight + "px"); if (body.classList.contains("coach-open")) placeCoach(); });

  addEventListener("hashchange", () => start(location.hash.slice(1)));
  $("#desc").addEventListener("click", (e) => { e.currentTarget.classList.toggle("is-open"); document.documentElement.style.setProperty("--demo-h", $(".demo").offsetHeight + "px"); });
  const initial = location.hash.slice(1) || (matchMedia("(max-width: 700px)").matches ? "mvB" : "dvB");
  start(initial);
})();
