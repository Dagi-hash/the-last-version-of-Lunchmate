'use strict';
const KEY = 'lunchmate.v1';
const CATS = ['Breakfast', 'Lunch', 'Snack', 'Dinner', 'Drink'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_AM = ['እሑድ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ'];
const MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MON_AM = ['መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት', 'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜ'];
const WD_ORDER = [1, 2, 3, 4, 5, 6, 0];
const svg = (p, w, extra) => `<svg viewBox="0 0 24 24" width="${w}" height="${w}" fill="none" stroke="currentColor" stroke-width="${extra || 2.2}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const CHECK = svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 14, 3.5);
const PILL = svg('<path d="M10.5 20.5l-7-7a4.95 4.95 0 117-7l7 7a4.95 4.95 0 11-7 7zM8.5 8.5l7 7"/>', 12);
const BELL = svg('<path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 004 0"/>', 11);
const TRASH = svg('<path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2M6 6l1 14a2 2 0 002 2h6a2 2 0 002-2l1-14M10 11v6M14 11v6"/>', 18, 2);
const CHEV = svg('<path d="M9 5l7 7-7 7"/>', 18, 2.4);
const BACK = svg('<path d="M15 5l-7 7 7 7"/>', 20, 2.4);
const BKSP = svg('<path d="M21 5H9l-6 7 6 7h12a1 1 0 001-1V6a1 1 0 00-1-1zM17 9.5l-5 5M12 9.5l5 5"/>', 26, 2);
const TICK = svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 28, 3);
const STAR = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 1.5 : 3.6; return (12 + r * Math.cos(a)).toFixed(2) + ',' + (12 + r * Math.sin(a)).toFixed(2); }).join(' ');
const FLAG_US = `<svg viewBox="0 0 24 24" width="24" height="24"><defs><clipPath id="cu"><circle cx="12" cy="12" r="12"/></clipPath></defs><g clip-path="url(#cu)"><rect width="24" height="24" fill="#fff"/>${[0, 2, 4, 6, 8, 10, 12].map(i => `<rect y="${(i * 24 / 13).toFixed(2)}" width="24" height="${(24 / 13).toFixed(2)}" fill="#B22234"/>`).join('')}<rect width="11" height="${(24 * 7 / 13).toFixed(2)}" fill="#3C3B6E"/>${[0, 1, 2].map(i => [0, 1, 2].map(j => `<circle cx="${(2.2 + i * 3.4).toFixed(1)}" cy="${(2 + j * 3.4).toFixed(1)}" r=".6" fill="#fff"/>`).join('')).join('')}</g></svg>`;
const FLAG_ET = `<svg viewBox="0 0 24 24" width="24" height="24"><defs><clipPath id="ce"><circle cx="12" cy="12" r="12"/></clipPath></defs><g clip-path="url(#ce)"><rect width="24" height="8" fill="#078930"/><rect y="8" width="24" height="8" fill="#FCDD09"/><rect y="16" width="24" height="8" fill="#DA121D"/><circle cx="12" cy="12" r="5.4" fill="#0F47AF"/><polygon points="${STAR}" fill="#FCDD09"/></g></svg>`;
const isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const P = isNative ? window.Capacitor.Plugins : {};

/* ---------- helpers ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const key = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const monday = d => addDays(d, -((d.getDay() + 6) % 7));
const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };

/* Gregorian -> Ethiopian calendar */
function toEth(d) {
    const a = Math.floor((14 - (d.getMonth() + 1)) / 12), yy = d.getFullYear() + 4800 - a, mm = d.getMonth() + 1 + 12 * a - 3;
    const jdn = d.getDate() + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
    const r = (jdn - 1723856) % 1461, n = (r % 365) + 365 * Math.floor(r / 1460);
    return { y: 4 * Math.floor((jdn - 1723856) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460), m: Math.floor(n / 30) + 1, d: (n % 30) + 1 };
}

/* ---------- state ---------- */
let S = null;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
S = Object.assign({ mode: 'weekly', offset: 0, meals: {}, extra: {}, hidden: [], days: {}, ensured: '', theme: 'light', pal: 'classic', lang: 'en', allergies: [], memory: {}, items: {}, nextId: 100 }, S || {});
if (S.satWeeks) { Object.keys(S.satWeeks).forEach(w => { S.extra[w] = Object.assign({}, S.extra[w], { 6: true }); }); delete S.satWeeks; }
if (!S.days || typeof S.days !== 'object') S.days = {};
if (S.theme !== 'dark') S.theme = 'light';
if (S.lang !== 'am') S.lang = 'en';
const PALS = {
    classic: { n: ['Lemon & Blue', 'ሎሚ እና ሰማያዊ'], bg: '#FAF0CA', sw: ['#FAF0CA', '#0D3B66'] },
    aqua: { n: ['Aqua', 'አኳ'], bg: '#46DFB1', sw: ['#80EE98', '#46DFB1', '#09D1C7', '#15919B', '#0C6478', '#213A58'] },
    rose: { n: ['Rose', 'ሮዝ'], bg: '#F7D6DC', sw: ['#F7D6DC', '#E07A94', '#CC5671', '#B23C59', '#8E2B44', '#6D1D32'] },
    plum: { n: ['Plum', 'ፕለም'], bg: '#EDE3FC', sw: ['#EDE3FC', '#CDB2F6', '#A87BEC', '#7B3FD6', '#542394', '#35145C'] },
    sand: { n: ['Sand', 'አሸዋ'], bg: '#F5EBE1', sw: ['#D7BDB0', '#E3D5CA', '#F5EBE1', '#D6CCC2', '#EDEEE9', '#3A302B'] }
};
if (!PALS[S.pal]) S.pal = 'classic';
const palBg = () => PALS[S.pal].bg;
const cutoff = key(addDays(today(), -60));
Object.keys(S.meals).forEach(k => { if (k < cutoff) delete S.meals[k]; });
let lang = S.lang;
let sel = null, modal = null, pending = null, lpT = null, lpX = 0, lpY = 0, lpFired = false, toastT = null;
let det = null, born = '', popId = 0, dd = null, kp = null, clrT = null, lastDay = key(today());

/* ---------- language ---------- */
const TX = {
    weekly: ['Weekly', 'ሳምንታዊ'], monthly: ['Monthly', 'ወርሃዊ'], today: ['Today', 'ዛሬ'],
    thisWeek: ['This Week', 'ይህ ሳምንት'], week: ['Week', 'ሳምንት'], fourWeeks: ['Four Weeks', 'አራት ሳምንታት'],
    allergies: ['Allergies', 'አለርጂዎች'], addDay: ['+ Add Day', '+ ቀን ጨምር'], addDayT: ['Add a day', 'ቀን ጨምር'],
    sumToday: [(a, b) => `Today ${a}/${b}`, (a, b) => `ዛሬ ${a}/${b}`],
    noMeals: ['No meals planned', 'ምንም ምግብ አልታቀደም'], tapAdd: ['Tap to add a meal', 'ምግብ ለመጨመር ይንኩ'],
    noDays: ['No days on this page yet. Tap “Add Day” to start.', 'በዚህ ገጽ ላይ ገና ቀን የለም። ለመጀመር “ቀን ጨምር” ይንኩ።'],
    edit: ['Edit', 'አርም'], del: ['Delete', 'ሰርዝ'], cancel: ['Cancel', 'ይቅር'], save: ['Save', 'አስቀምጥ'], close: ['Close', 'ዝጋ'], ok: ['OK', 'እሺ'],
    confirm: ['Confirm', 'ማረጋገጫ'], add: ['Add', 'ጨምር'], remove: ['Remove', 'አስወግድ'], saveAll: ['Save All', 'ሁሉንም አስቀምጥ'],
    selected: [n => `${n} selected`, n => `${n} ተመርጧል`],
    mealsN: [n => `${n} meal${n === 1 ? '' : 's'}`, n => `${n} ምግብ`],
    daysN: [n => `${n} day${n === 1 ? '' : 's'}`, n => `${n} ቀን`],
    doneN: [(a, b) => `${a}/${b} done`, (a, b) => `${a}/${b} ተጠናቋል`],
    cat_Breakfast: ['Breakfast', 'ቁርስ'], cat_Lunch: ['Lunch', 'ምሳ'], cat_Snack: ['Snack', 'መክሰስ'], cat_Dinner: ['Dinner', 'እራት'], cat_Drink: ['Drink', 'መጠጥ'],
    rem_off: ['Off', 'ጠፍቷል'], rem_evening: ['Evening before', 'ከቀኑ በፊት ማታ'], rem_morning: ['Morning of', 'በዕለቱ ጠዋት'],
    addMeal: ['Add Meal', 'ምግብ ጨምር'], editMeal: ['Edit Meal', 'ምግብ አርም'], category: ['Category', 'ምድብ'], food: ['Food items', 'የምግብ ዓይነቶች'],
    foodPh: ['e.g. Rice, chicken, apple', 'ለምሳሌ ሩዝ፣ ዶሮ፣ ፖም'], reminder: ['Reminder', 'ማስታወሻ'], remTime: ['Reminder time', 'የማስታወሻ ሰዓት'],
    medLbl: ['Medicine after this meal (optional)', 'ከዚህ ምግብ በኋላ መድኃኒት (አማራጭ)'], medPh: ['Medicine name, leave empty for none', 'የመድኃኒት ስም፣ ካልፈለጉ ባዶ ይተዉ'],
    remindAt: ['Remind me at', 'አስታውሰኝ በ'],
    contains: [a => `Contains ${a} · on your allergy list`, a => `${a} ይዟል · በአለርጂ ዝርዝርዎ ላይ ነው`],
    afterMeal: [c => `after ${c}`, c => `ከ${c} በኋላ`],
    addDayMsg: ['Choose a day to add to this week.', 'ወደዚህ ሳምንት የሚጨመር ቀን ይምረጡ።'],
    allDays: ['All seven days are already on this page.', 'ሁሉም ሰባቱ ቀናት ቀድሞ በዚህ ገጽ ላይ አሉ።'],
    dayAdded: [d => `${d} added`, d => `${d} ተጨምሯል`], dayAddedB: ['It now shows on this page.', 'አሁን በዚህ ገጽ ላይ ይታያል።'],
    delDayT: ['Delete Day', 'ቀን ሰርዝ'], delFull: ['Delete the full box', 'ሙሉውን ሳጥን ሰርዝ'],
    delFullS: ['Removes this day and all its meals from the page.', 'ይህን ቀን እና ምግቦቹን ሁሉ ከገጹ ያስወግዳል።'],
    delMeals: ['Delete meals only', 'ምግቦችን ብቻ ሰርዝ'],
    delMealsS: [n => `Keeps the day and clears its ${n} meal${n === 1 ? '' : 's'}.`, n => `ቀኑን ያቆያል፤ ${n} ምግብ ያጸዳል።`],
    delMealsNone: ['This day has no meals to delete.', 'ይህ ቀን የሚሰረዝ ምግብ የለውም።'],
    dayRemoved: ['Day removed', 'ቀን ተወግዷል'], mealsCleared: ['Meals cleared', 'ምግቦች ጸድተዋል'],
    dayGone: [d => `${d} was removed from this page.`, d => `${d} ከዚህ ገጽ ተወግዷል።`],
    dayEmpty: [d => `${d} is now empty.`, d => `${d} አሁን ባዶ ነው።`],
    alreadyEmpty: ['Already empty', 'ቀድሞ ባዶ ነው'],
    notAllowed: ['Not allowed', 'አይፈቀድም'],
    algBlock: [a => `"${a}" is on your allergy list, so this meal can't be added.`, a => `"${a}" በአለርጂ ዝርዝርዎ ላይ ስላለ ይህ ምግብ መጨመር አይችልም።`],
    algShort: [a => `"${a}" is on your allergy list. This meal can't be added.`, a => `"${a}" በአለርጂ ዝርዝርዎ ላይ ነው። ይህ ምግብ መጨመር አይችልም።`],
    algBulk: [a => `"${a}" is on your allergy list.`, a => `"${a}" በአለርጂ ዝርዝርዎ ላይ ነው።`],
    mealAdded: ['Meal added', 'ምግብ ተጨምሯል'], mealUpdated: ['Meal updated', 'ምግብ ተስተካክሏል'], mealsUpdated: ['Meals updated', 'ምግቦች ተስተካክለዋል'],
    nMealsSaved: [n => `${n} meal${n === 1 ? '' : 's'} saved`, n => `${n} ምግብ ተቀምጧል`],
    nothingEdit: ['Nothing to edit', 'ለማረም ምንም የለም'], daysNoMeals: ['The selected days have no meals.', 'የተመረጡት ቀናት ምግብ የላቸውም።'],
    bulkEdit: [n => `Bulk Edit · ${n} meal${n > 1 ? 's' : ''}`, n => `በጅምላ አርም · ${n} ምግብ`],
    deleted: ['Deleted', 'ተሰርዟል'], nRemoved: [n => `${n} meal${n === 1 ? '' : 's'} removed.`, n => `${n} ምግብ ተወግዷል።`],
    delSel: [n => `Delete ${n} selected meal${n === 1 ? '' : 's'}?`, n => `የተመረጡትን ${n} ምግብ ይሰረዙ?`],
    selEmpty: ['The selected day has no meals to delete.', 'የተመረጠው ቀን የሚሰረዝ ምግብ የለውም።'],
    medTaken: ['Medicine taken', 'መድኃኒት ተወስዷል'], medNot: ['Marked as not taken', 'አልተወሰደም ተብሎ ተመዝግቧል'],
    algSheetMsg: ['Write the foods that trigger your allergy. They can\'t be added to any meal.', 'አለርጂ የሚያስከትሉ ምግቦችን ይጻፉ። ወደ ማንኛውም ምግብ መጨመር አይችሉም።'],
    addFood: ['Add food', 'ምግብ ጨምር'], algPh: ['e.g. peanuts, shrimp', 'ለምሳሌ ኦቾሎኒ፣ ሽሪምፕ'],
    noAlg: ['No allergies saved yet', 'እስካሁን የተቀመጠ አለርጂ የለም'],
    nothingAdd: ['Nothing to add', 'የሚጨመር የለም'], typeFood: ['Type a food name first.', 'መጀመሪያ የምግብ ስም ይጻፉ።'],
    algSaved: ['Allergy saved', 'አለርጂ ተቀምጧል'],
    algMarked: [n => `${n} planned meal${n === 1 ? '' : 's'} already contain it and are marked in red.`, n => `${n} የታቀደ ምግብ ቀድሞ ይዘዋል፤ በቀይ ተመልክተዋል።`],
    algBlocked: [a => `${a} can no longer be added.`, a => `${a} ከዚህ በኋላ መጨመር አይችልም።`],
    removed: ['Removed', 'ተወግዷል'], algAgain: [a => `${a} can be added again.`, a => `${a} እንደገና መጨመር ይችላል።`],
    setTime: ['Set reminder time', 'የማስታወሻ ሰዓት ያስቀምጡ'], am: ['AM', 'ጠዋት'], pm: ['PM', 'ከሰዓት'],
    prepTomorrow: ['Prep for tomorrow', 'ለነገ ዝግጅት'], mealPrep: ['Meal prep today', 'የዛሬ ምግብ ዝግጅት'], medTime: ['Medicine time', 'የመድኃኒት ሰዓት'],
    snooze: ['Snooze', 'አሸልብ'], min: [n => `${n} min`, n => `${n} ደቂቃ`], snoozed: ['Snoozed', 'ተሸልቧል'],
    snoozedB: [n => `I'll remind you again in ${n} minutes.`, n => `ከ${n} ደቂቃ በኋላ እንደገና አስታውሳለሁ።`],
    selectDay: ['Select a day', 'ቀን ይምረጡ'],
    themeT: ['Choose a theme', 'ገጽታ ይምረጡ'], themeMsg: ['Tap a colour theme to use it in the app.', 'በመተግበሪያው ለመጠቀም የቀለም ገጽታ ይንኩ።'],
    setTimeBtn: ['Set time', 'ሰዓት ያስገቡ'],
    timeNeeded: ['Set a time', 'ሰዓት ያስገቡ'],
    timeNeededMeal: ['Choose the time you want to be reminded about this meal.', 'ስለዚህ ምግብ እንዲታወሱ የሚፈልጉበትን ሰዓት ያስገቡ።'],
    timeNeededMed: ['Choose the time you want to be reminded to take the medicine.', 'መድኃኒቱን እንዲታወሱ የሚፈልጉበትን ሰዓት ያስገቡ።'],
    infoT: ['Information', 'መረጃ'], devBy: ['Developed by', 'የተሠራው በ'], emailL: ['Email', 'ኢሜይል'], phoneL: ['Phone No', 'ስልክ ቁጥር'], companyL: ['Company', 'ኩባንያ'],
};
function t(k, ...a) { const e = TX[k]; if (!e) return k; const v = e[lang === 'am' ? 1 : 0]; return typeof v === 'function' ? v(...a) : v; }
const tc = c => t('cat_' + c);
const WK = [['First Week', 'Second Week', 'Third Week', 'Fourth Week'], ['የመጀመሪያ ሳምንት', 'ሁለተኛ ሳምንት', 'ሦስተኛ ሳምንት', 'አራተኛ ሳምንት']];
const wkName = i => WK[lang === 'am' ? 1 : 0][i];
const dayName = d => lang === 'am' ? DAYS_AM[d.getDay()] : DAYS_EN[d.getDay()];
const dayShort = d => lang === 'am' ? DAYS_AM[d.getDay()] : DAYS_EN[d.getDay()].slice(0, 3);
const fmtDay = d => { if (lang === 'am') { const e = toEth(d); return `${MON_AM[e.m - 1]} ${e.d}`; } return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); };
const monAbbr = d => lang === 'am' ? MON_AM[toEth(d).m - 1] : MON_EN[d.getMonth()];
const dnum = d => lang === 'am' ? toEth(d).d : d.getDate();
const yr = d => lang === 'am' ? toEth(d).y : d.getFullYear();
const fmtDayY = d => lang === 'am' ? `${fmtDay(d)}, ${yr(d)} ዓ.ም` : `${fmtDay(d)}, ${yr(d)}`;
function fmtRange(a, b) {
    const ya = yr(a), yb = yr(b);
    return ya === yb ? `${fmtDay(a)} – ${fmtDay(b)}, ${yb}` : `${fmtDay(a)}, ${ya} – ${fmtDay(b)}, ${yb}`;
}
function fmtTime(s) { const [h, m] = String(s).split(':').map(Number); return `${h % 12 || 12}:${pad(m)} ${h >= 12 ? t('pm') : t('am')}`; }
function applyLang() {
    document.documentElement.setAttribute('lang', lang === 'am' ? 'am' : 'en');
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    $('#lang').dataset.l = lang;
}

/* ---------- data ---------- */
function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    syncNative();
}
const meals = k => S.meals[k] || [];
function findMeal(id) {
    for (const k in S.meals) { const m = S.meals[k].find(x => x.id === id); if (m) return { k, m }; }
    return null;
}
function delIds(ids) {
    for (const k in S.meals) {
        S.meals[k] = S.meals[k].filter(m => !ids.has(m.id));
        if (!S.meals[k].length) delete S.meals[k];
    }
}
function selList() {
    const out = new Map();
    sel.forEach(s => {
        const v = s.slice(2);
        if (s[0] === 'd') meals(v).forEach(m => out.set(m.id, { k: v, m }));
        else { const f = findMeal(+v); if (f) out.set(f.m.id, f); }
    });
    return [...out.values()].sort((a, b) => a.k.localeCompare(b.k));
}

/* ---------- which days are on a week page ---------- */
function daysOf(ws) {
    const wk = key(ws);
    if (Array.isArray(S.days[wk])) return S.days[wk].slice();
    const ex = S.extra[wk] || {}, hid = S.hidden || [];
    let a = [1, 2, 3, 4, 5];
    [6, 0].forEach(wd => { if (ex[wd] || meals(key(addDays(ws, (wd + 6) % 7))).length) a.push(wd); });
    return a.filter(wd => !hid.includes(wd));
}
function setDays(ws, arr) { S.days[key(ws)] = arr; }
function orderDates(ws, arr) {
    const tk = key(today()), dates = arr.map(wd => addDays(ws, (wd + 6) % 7));
    const up = dates.filter(d => key(d) >= tk).sort((a, b) => a - b), pa = dates.filter(d => key(d) < tk).sort((a, b) => a - b);
    return up.concat(pa);
}
function ensureToday() {
    const td = today(), tk = key(td);
    if (S.ensured === tk) return;
    S.ensured = tk;
    const ws = monday(td), a = daysOf(ws);
    if (!a.includes(td.getDay())) { a.push(td.getDay()); setDays(ws, a); }
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
}
function curWs() {
    const base = monday(today());
    if (S.mode === 'weekly') return addDays(base, S.offset * 7);
    return addDays(addDays(base, S.offset * 28), (det || 0) * 7);
}
const weekView = () => S.mode === 'weekly' || det !== null;

/* ---------- rendering ---------- */
function entry(m, daySel) {
    const s = daySel || (sel && sel.has('e:' + m.id));
    return `<div class="en${m.done ? ' done' : ''}${s ? ' sel' : ''}${m.id === popId ? ' pop' : ''}" data-act="entry" data-id="${m.id}" data-lp="e:${m.id}">
        <div class="ck">${m.done ? CHECK : ''}</div>
        <div class="eb"><div class="cat">${esc(tc(m.cat))}${m.remind !== 'off' ? BELL : ''}</div><div class="tx">${esc(m.text)}</div>${extras(m)}</div>
        ${sel ? '' : `<button class="mini" data-act="edit" data-id="${m.id}">${t('edit')}</button>`}</div>`;
}
function dayCard(d, i, tk) {
    const k = key(d), list = meals(k), done = list.filter(m => m.done).length;
    const isSel = !!(sel && sel.has('d:' + k)), pct = list.length ? Math.round(done / list.length * 100) : 0;
    return `<div class="card day${isSel ? ' sel' : ''}${k === tk ? ' today' : ''}${k < tk ? ' past' : ''}${k === born ? ' born' : ''}" style="--i:${i}" data-act="day" data-k="${k}" data-day="${k}" data-lp="d:${k}">
        <div class="dh">
            <div class="tile"><span class="tm">${esc(monAbbr(d))}</span><span class="tn mono">${dnum(d)}</span></div>
            <div class="dl"><div class="dn">${esc(dayName(d))}${k === tk ? `<span class="tag">${t('today')}</span>` : ''}</div>
                <div class="dm"><span class="mono dd">${esc(fmtDayY(d))}</span>${list.length ? `<span class="mono cnt">${done}/${list.length}</span>` : ''}</div>
                ${list.length ? `<div class="bar"><i style="width:${pct}%"></i></div>` : ''}</div>
            ${sel ? '' : `<button class="trash" data-act="delday" data-k="${k}" aria-label="${esc(t('delDayT'))}">${TRASH}</button>`}
        </div>
        ${list.length ? list.map(m => entry(m, isSel)).join('') + `<div class="hint">${t('tapAdd')}</div>` : `<div class="empty">${t('noMeals')} · ${t('tapAdd')}</div>`}</div>`;
}
const CREDIT = '<div class="credit">© Developed by Dagim Bireda (Lilo Designs)</div>';
function weekPage(ws, tk) {
    const dates = orderDates(ws, daysOf(ws));
    return (dates.length ? dates.map((d, i) => dayCard(d, i, tk)).join('') : `<div class="nodays">${t('noDays')}</div>`) + CREDIT;
}
function monthPage(m0, tk) {
    let h = '';
    for (let w = 0; w < 4; w++) {
        const ws = addDays(m0, w * 7), ds = orderDates(ws, daysOf(ws));
        let total = 0, done = 0, cur = false;
        ds.forEach(d => { const l = meals(key(d)); total += l.length; done += l.filter(m => m.done).length; });
        for (let i = 0; i < 7; i++) if (key(addDays(ws, i)) === tk) cur = true;
        h += `<div class="card wcard${cur ? ' today' : ''}" style="--i:${w}" data-act="openweek" data-w="${w}">
            <div class="wb"><div class="wn">${esc(wkName(w))}${cur ? `<span class="tag">${t('thisWeek')}</span>` : ''}</div>
            <div class="mono wr">${esc(fmtRange(ws, addDays(ws, 6)))}</div>
            <div class="prog"><i style="width:${total ? Math.round(done / total * 100) : 0}%"></i></div>
            <div class="wsm">${esc(t('daysN', ds.length))} · ${total ? esc(t('doneN', done, total)) : esc(t('noMeals'))}</div></div>
            <div class="chev">${CHEV}</div></div>`;
    }
    return h + CREDIT;
}
function pageHtml(tdy) {
    const tk = key(tdy);
    if (S.mode === 'weekly') return weekPage(addDays(monday(tdy), S.offset * 7), tk);
    const m0 = addDays(monday(tdy), S.offset * 28);
    return det === null ? monthPage(m0, tk) : weekPage(addDays(m0, det * 7), tk);
}
function drawChrome(tdy) {
    $('#nav').dataset.i = S.mode === 'weekly' ? '0' : '1';
    document.querySelectorAll('.tab').forEach(b => b.classList.toggle('on', b.dataset.v === S.mode));
    let bar;
    if (S.mode === 'monthly' && det !== null) {
        const ws = curWs();
        bar = `<button class="ib" data-act="back" aria-label="Back">${BACK}</button><div id="range" class="mono"><small>${esc(wkName(det))}</small>${esc(fmtRange(ws, addDays(ws, 6)))}</div><span class="ib sp"></span>`;
    } else {
        let a, b, lbl;
        if (S.mode === 'weekly') { const ws = addDays(monday(tdy), S.offset * 7); a = ws; b = addDays(ws, 6); lbl = S.offset === 0 ? t('thisWeek') : t('week'); }
        else { const m0 = addDays(monday(tdy), S.offset * 28); a = m0; b = addDays(m0, 27); lbl = t('fourWeeks'); }
        bar = `<button class="ib" data-act="nav" data-v="-1">&#8249;</button><button id="range" class="mono" data-act="nav" data-v="0"><small>${esc(lbl)}</small>${esc(fmtRange(a, b))}</button><button class="ib" data-act="nav" data-v="1">&#8250;</button>`;
    }
    $('#bar').innerHTML = bar;
    const td = meals(key(tdy));
    $('#tools').innerHTML = `<button class="mini warn" data-act="allergy-open">${esc(t('allergies'))}${S.allergies.length ? ` (${S.allergies.length})` : ''}</button>${weekView() ? `<button class="mini" data-act="addday-open">${esc(t('addDay'))}</button>` : ''}<span id="sum" class="mono dd">${td.length ? esc(t('sumToday', td.filter(m => m.done).length, td.length)) : ''}</span>`;
    $('#nav').classList.toggle('off', !!sel);
    $('#selbar').classList.toggle('off', !sel);
    if (sel) $('#selbar').innerHTML = `<span class="mono">${esc(t('selected', sel.size))}</span><button class="btn ghost sm" data-act="sel-edit">${t('edit')}</button><button class="btn danger sm" data-act="sel-del">${t('del')}</button><button class="btn ghost sm" data-act="sel-cancel">${t('cancel')}</button>`;
}
function newPage(html) {
    const pg = document.createElement('div');
    pg.className = 'page';
    pg.innerHTML = `<div class="inner">${html}</div>`;
    attachBounce(pg);
    return pg;
}
function render(dir) {
    const tdy = today(), stage = $('#stage');
    drawChrome(tdy);
    const html = pageHtml(tdy);
    const last = stage.lastElementChild;
    if (dir === undefined || !last) {
        if (!last) stage.appendChild(newPage(html)); else last.firstElementChild.innerHTML = html;
        return;
    }
    while (stage.children.length > 1) stage.firstElementChild.remove();
    const old = stage.firstElementChild, pg = newPage(html);
    pg.classList.add('stag');
    stage.appendChild(pg);
    old.style.pointerEvents = 'none';
    try {
        if (dir === 0) {
            pg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'ease-out' });
            old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'ease-in', fill: 'forwards' });
        } else {
            pg.animate([{ transform: `translate3d(${dir * 34}%,0,0)`, opacity: 0 }, { transform: 'translate3d(0,0,0)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.2,.9,.25,1.08)' });
            old.animate([{ transform: 'translate3d(0,0,0)', opacity: 1 }, { transform: `translate3d(${-dir * 24}%,0,0)`, opacity: 0 }], { duration: 360, easing: 'cubic-bezier(.32,.72,0,1)', fill: 'forwards' });
        }
    } catch (e) {}
    setTimeout(() => old.remove(), 700);
    setTimeout(() => pg.classList.remove('stag'), 900);
}

/* ---------- rubber-band bounce scrolling ---------- */
function attachBounce(pg) {
    const inner = pg.firstElementChild;
    let prevY = 0, raw = 0, dirn = 0, active = false, touching = false, lastTop = 0, lastTs = 0, bumpAt = 0;
    const rubber = x => { const d = pg.clientHeight * .5 || 300; return (1 - 1 / (x * .55 / d + 1)) * d; };
    const springBack = from => {
        inner.style.transform = '';
        try { inner.animate([{ transform: `translate3d(0,${from}px,0)` }, { transform: 'translate3d(0,0,0)' }], { duration: 560, easing: 'cubic-bezier(.2,1.25,.4,1)' }); } catch (e) {}
    };
    pg.addEventListener('touchstart', e => {
        if (e.touches.length !== 1) return;
        touching = true; active = false; raw = 0; prevY = e.touches[0].clientY;
        inner.getAnimations && inner.getAnimations().forEach(a => a.cancel());
    }, { passive: true });
    pg.addEventListener('touchmove', e => {
        if (!touching) return;
        const y = e.touches[0].clientY, d = y - prevY; prevY = y;
        const atTop = pg.scrollTop <= 0, atBot = pg.scrollTop + pg.clientHeight >= pg.scrollHeight - 1;
        if (!active) {
            if ((atTop && d > 0) || (atBot && d < 0)) { active = true; dirn = d > 0 ? 1 : -1; raw = 0; } else return;
        }
        raw += d * dirn;
        if (raw <= 0) { active = false; raw = 0; inner.style.transform = ''; return; }
        inner.style.transform = `translate3d(0,${(dirn * rubber(raw)).toFixed(1)}px,0)`;
    }, { passive: true });
    const end = () => {
        touching = false;
        if (active) { active = false; const cur = dirn * rubber(raw); raw = 0; springBack(cur); }
    };
    pg.addEventListener('touchend', end, { passive: true });
    pg.addEventListener('touchcancel', end, { passive: true });
    pg.addEventListener('scroll', () => {
        const now = performance.now(), top = pg.scrollTop, dt = now - lastTs;
        if (dt > 0 && dt < 80 && !touching && now - bumpAt > 600) {
            const v = (top - lastTop) / dt;
            const atTop = top <= 0, atBot = top + pg.clientHeight >= pg.scrollHeight - 1;
            if (atTop && v < -.8) { bumpAt = now; springBack(Math.min(Math.abs(v) * 9, 28)); }
            else if (atBot && v > .8) { bumpAt = now; springBack(-Math.min(Math.abs(v) * 9, 28)); }
        }
        lastTop = top; lastTs = now;
    }, { passive: true });
}

/* ---------- sheets ---------- */
let openTok = 0, setT = null, setT2 = null, tok2 = 0;
function isOpen() { return $('#sheet').classList.contains('on'); }
function open(html) {
    clearTimeout(clrT);
    const sh = $('#sheet'), pn = $('#panel');
    pn.innerHTML = html;
    if (sh.classList.contains('on')) return;
    const tk = ++openTok;
    pn.classList.remove('settled');
    void pn.offsetHeight;
    requestAnimationFrame(() => {
        if (tk !== openTok) return;
        sh.classList.add('on');
        clearTimeout(setT); setT = setTimeout(() => { if (sh.classList.contains('on')) pn.classList.add('settled'); }, 620);
    });
}
function close() {
    openTok++; clearTimeout(setT);
    $('#sheet').classList.remove('on'); $('#panel').classList.remove('settled'); modal = null; pending = null; dd = null;
    clearTimeout(clrT);
    clrT = setTimeout(() => { if (!isOpen()) { $('#panel').innerHTML = ''; $('#panel').scrollTop = 0; } }, 650);
}
function show2() {
    const sh = $('#sheet2'), pn = $('#panel2'), tk = ++tok2;
    pn.classList.remove('settled');
    void pn.offsetHeight;
    requestAnimationFrame(() => {
        if (tk !== tok2) return;
        sh.classList.add('on');
        clearTimeout(setT2); setT2 = setTimeout(() => { if (sh.classList.contains('on')) pn.classList.add('settled'); }, 620);
    });
}
function ask(msg, label, fn) {
    pending = fn;
    open(`<div class="lbl">${t('confirm')}</div><p class="msg">${msg}</p><div class="row"><button class="btn ghost" data-act="close">${t('cancel')}</button><button class="btn danger" data-act="yes">${esc(label)}</button></div>`);
}
const remDefault = r => r === 'morning' ? '07:00' : '20:00';
function openMeal(o) {
    const f = o.id ? findMeal(o.id) : null, m = f && f.m;
    modal = { id: o.id || 0, k: f ? f.k : o.k, cat: m ? m.cat : 'Lunch', text: m ? m.text : '', remind: m ? m.remind : 'off',
              rt: m && m.rt ? m.rt : (m && m.remind !== 'off' ? remDefault(m.remind) : ''),
              medn: m && m.med ? m.med.name : '', medt: m && m.med ? m.med.t : '' };
    drawMeal();
}
function readForm() {
    const a = $('#f-text'); if (!a || !modal) return;
    modal.text = a.value; modal.medn = $('#f-medn').value;
}
function drawMeal() {
    const d = parse(modal.k);
    open(`<div class="lbl">${t(modal.id ? 'editMeal' : 'addMeal')} · ${esc(dayName(d))} ${esc(fmtDayY(d))}</div>
        <div class="fl">${t('category')}</div><div class="chips">${CATS.map(c => `<button class="chip${modal.cat === c ? ' on' : ''}" data-act="pickcat" data-v="${c}">${esc(tc(c))}</button>`).join('')}</div>
        <div class="fl">${t('food')}</div><input id="f-text" maxlength="140" autocomplete="off" placeholder="${esc(t('foodPh'))}" value="${esc(modal.text)}">
        <div id="f-err" class="err"></div><div id="sug" class="chips sug"></div>
        <div class="fl">${t('reminder')}</div><div class="chips">${['off', 'evening', 'morning'].map(v => `<button class="chip${modal.remind === v ? ' on' : ''}" data-act="pickrem" data-v="${v}">${esc(t('rem_' + v))}</button>`).join('')}</div>
        ${modal.remind !== 'off' ? `<div class="medrow"><span class="dd">${t('remTime')}</span><button class="timebtn" data-act="time" data-w="rem">${modal.rt ? esc(fmtTime(modal.rt)) : esc(t('setTimeBtn'))}</button></div>` : ''}
        <div class="fl">${t('medLbl')}</div>
        <input id="f-medn" maxlength="60" placeholder="${esc(t('medPh'))}" value="${esc(modal.medn)}">
        <div class="medrow"><span class="dd">${t('remindAt')}</span><button class="timebtn" data-act="time" data-w="med">${modal.medt ? esc(fmtTime(modal.medt)) : esc(t('setTimeBtn'))}</button></div>
        <div class="row"><button class="btn ghost" data-act="close">${t('cancel')}</button><button class="btn" data-act="save">${t('save')}</button></div>`);
    refreshSug();
}
function saveMeal() {
    readForm();
    const text = modal.text.trim();
    if (!text) { $('#f-text').focus(); return; }
    const bad = allergenIn(text);
    if (bad) { toast(t('notAllowed'), t('algBlock', bad), 4500); $('#f-text').focus(); return; }
    const medn = modal.medn.trim();
    if (modal.remind !== 'off' && !modal.rt) { toast(t('timeNeeded'), t('timeNeededMeal'), 3500); return; }
    if (medn && !modal.medt) { toast(t('timeNeeded'), t('timeNeededMed'), 3500); return; }
    let med = null;
    if (medn) {
        const old = modal.id ? findMeal(modal.id).m.med : null;
        med = old && old.name === medn && old.t === modal.medt ? old : { name: medn, t: modal.medt, taken: false, fired: false, snz: 0 };
    }
    learn(text, modal.cat);
    const rt = modal.remind === 'off' ? '' : modal.rt;
    if (modal.id) {
        const m = findMeal(modal.id).m;
        if (m.remind !== modal.remind || (m.rt || '') !== rt) { m.fired = false; m.snz = 0; }
        Object.assign(m, { cat: modal.cat, text, remind: modal.remind, rt, med });
    } else {
        (S.meals[modal.k] = S.meals[modal.k] || []).push({ id: S.nextId++, cat: modal.cat, text, done: false, remind: modal.remind, rt, fired: false, snz: 0, med });
    }
    const wasEdit = !!modal.id, dk = modal.k;
    close(); save(); render();
    toast(t(wasEdit ? 'mealUpdated' : 'mealAdded'), `${dayName(parse(dk))} ${fmtDayY(parse(dk))}`, 2200);
    checkReminders();
}
function openBulk() {
    const list = selList();
    if (!list.length) { toast(t('nothingEdit'), t('daysNoMeals')); return; }
    open(`<div class="lbl">${esc(t('bulkEdit', list.length))}</div>` + list.map(({ k, m }) =>
        `<div class="brow"><div class="mono dd">${esc(dayShort(parse(k)))} ${esc(fmtDayY(parse(k)))}</div>
        <select data-bc="${m.id}">${CATS.map(c => `<option value="${c}"${c === m.cat ? ' selected' : ''}>${esc(tc(c))}</option>`).join('')}</select>
        <input data-bt="${m.id}" value="${esc(m.text)}" maxlength="140"></div>`).join('') +
        `<div class="row"><button class="btn ghost" data-act="close">${t('cancel')}</button><button class="btn" data-act="bulksave">${t('saveAll')}</button></div>`);
}
function saveBulk() {
    const bad = selList().map(({ m }) => { const x = document.querySelector(`[data-bt="${m.id}"]`); return x ? allergenIn(x.value) : null; }).find(Boolean);
    if (bad) { toast(t('notAllowed'), t('algBulk', bad), 4500); return; }
    selList().forEach(({ m }) => {
        const c = document.querySelector(`[data-bc="${m.id}"]`), x = document.querySelector(`[data-bt="${m.id}"]`);
        if (c) m.cat = c.value;
        if (x && x.value.trim()) { m.text = x.value.trim(); learn(m.text, m.cat); }
    });
    const n = selList().length;
    close(); sel = null; save(); render();
    toast(t('mealsUpdated'), t('nMealsSaved', n), 2200);
}

/* ---------- add day / delete day ---------- */
function openAddDay() {
    const ws = curWs(), have = daysOf(ws), miss = WD_ORDER.filter(wd => !have.includes(wd));
    if (!miss.length) { toast(t('addDayT'), t('allDays'), 3000); return; }
    open(`<div class="lbl">${t('addDayT')}</div><p class="msg">${t('addDayMsg')}</p>` + miss.map(wd => {
        const d = addDays(ws, (wd + 6) % 7);
        return `<button class="pick" data-act="addday-pick" data-wd="${wd}"><span>${esc(dayName(d))}</span><span class="mono dd">${esc(fmtDayY(d))}</span></button>`;
    }).join('') + `<div class="row"><button class="btn ghost" data-act="close">${t('close')}</button></div>`);
}
function drawDel() {
    const d = parse(dd.k), n = meals(dd.k).length;
    open(`<div class="lbl">${t('delDayT')}</div><p class="msg">${esc(dayName(d))} · ${esc(fmtDayY(d))}</p>
        <div class="opt${dd.mode === 'box' ? ' on' : ''}" data-act="delopt" data-v="box"><span class="cb">${CHECK}</span><div><b>${t('delFull')}</b><small>${t('delFullS')}</small></div></div>
        <div class="opt${dd.mode === 'meals' ? ' on' : ''}${n ? '' : ' dis'}" data-act="delopt" data-v="meals"><span class="cb">${CHECK}</span><div><b>${t('delMeals')}</b><small>${n ? t('delMealsS', n) : t('delMealsNone')}</small></div></div>
        <div class="row"><button class="btn ghost" data-act="close">${t('cancel')}</button><button class="btn danger" data-act="delgo">${t('del')}</button></div>`);
}
function doDelete() {
    const k = dd.k, mode = dd.mode, d = parse(k), nm = `${dayName(d)} ${fmtDayY(d)}`;
    close();
    const el = document.querySelector(`.card[data-day="${k}"]`);
    const apply = () => {
        if (mode === 'box') {
            delete S.meals[k];
            const ws = monday(d); setDays(ws, daysOf(ws).filter(x => x !== d.getDay()));
        } else delete S.meals[k];
        save(); render();
        toast(t(mode === 'box' ? 'dayRemoved' : 'mealsCleared'), t(mode === 'box' ? 'dayGone' : 'dayEmpty', nm), 2800);
    };
    if (el && mode === 'box' && el.animate) {
        try { el.animate([{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.9) translateX(-36px)' }], { duration: 300, easing: 'ease-in', fill: 'forwards' }).finished.then(apply, apply); }
        catch (e) { apply(); }
    } else apply();
}

/* ---------- number keypad ---------- */
function kpParse(b) {
    const d = b.split('').map(Number);
    if (!d.length) return { H: '––', M: '––', ok: false, max: 4 };
    const big = d[0] >= 2, hn = big ? 1 : Math.min(2, d.length);
    const H = big ? '0' + d[0] : (d.slice(0, hn).join('') + '–').slice(0, 2);
    const mm = d.slice(hn).join('');
    return { H, M: (mm + '––').slice(0, 2), ok: (big || d.length >= 2) && mm.length === 2, max: big ? 3 : 4, hn, mm };
}
function kpAdd(n) {
    const b = kp.buf, d = b.split('').map(Number), info = kpParse(b);
    if (d.length && b.length >= info.max) return false;
    if (!d.length) { kp.buf = String(n); return true; }
    if (d[0] < 2 && d.length === 1) {
        if ((d[0] === 0 && n === 0) || (d[0] === 1 && n > 2)) return false;
        kp.buf += n; return true;
    }
    if (info.mm.length === 0 && n > 5) return false;
    kp.buf += n; return true;
}
function drawKp() {
    $('#panel2').innerHTML = `<div class="lbl">${t('setTime')}</div>
        <div class="tdisp"><div class="tdig" id="kp-d"></div><div class="ampm"><button class="chip" id="kp-am" data-act="kp-ap" data-v="0">${t('am')}</button><button class="chip" id="kp-pm" data-act="kp-ap" data-v="1">${t('pm')}</button></div></div>
        <div class="kp">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button class="key" data-act="kp-n" data-n="${n}">${n}</button>`).join('')}<button class="key" data-act="kp-bk" aria-label="Backspace">${BKSP}</button><button class="key" data-act="kp-n" data-n="0">0</button><button class="key go" id="kp-ok" data-act="kp-ok" aria-label="OK">${TICK}</button></div>
        <div class="row"><button class="btn ghost" data-act="kp-x">${t('cancel')}</button></div>`;
    updKp();
}
function updKp() {
    const p = kpParse(kp.buf);
    $('#kp-d').innerHTML = `<span>${p.H}</span><i>:</i><span>${p.M}</span>`;
    $('#kp-am').classList.toggle('on', !kp.pm); $('#kp-pm').classList.toggle('on', kp.pm);
    $('#kp-ok').classList.toggle('dis', !p.ok);
}
function openKeypad(w) {
    readForm();
    const cur = w === 'rem' ? modal.rt : modal.medt;
    if (cur) { const [h24, mi] = cur.split(':').map(Number), h12 = h24 % 12 || 12; kp = { w, pm: h24 >= 12, buf: (h12 >= 2 && h12 <= 9 ? String(h12) : pad(h12)) + pad(mi) }; }
    else kp = { w, pm: false, buf: '' };
    drawKp();
    show2();
}
function closeKp() { tok2++; clearTimeout(setT2); $('#sheet2').classList.remove('on'); $('#panel2').classList.remove('settled'); kp = null; }
function kpDone() {
    const p = kpParse(kp.buf); if (!p.ok) return;
    const h12 = +p.H, mi = +p.M, h24 = (h12 % 12) + (kp.pm ? 12 : 0), val = pad(h24) + ':' + pad(mi);
    if (kp.w === 'rem') modal.rt = val; else modal.medt = val;
    closeKp(); drawMeal();
}
function buzz(n) { try { if (navigator.vibrate) navigator.vibrate(n); } catch (e) {} }

/* ---------- sound ---------- */
let AC = null, ringT = null, ringN = 0;
function ac() {
    if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (AC && AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
    return AC;
}
function chime() {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + .03;
    [[659.25, 0], [783.99, .22], [1046.5, .44], [1318.5, .95]].forEach(([f, dl]) => {
        [[1, .5], [2, .16], [3, .06]].forEach(([mul, vol]) => {
            const o = c.createOscillator(), g = c.createGain(), s = t0 + dl;
            o.type = 'sine'; o.frequency.value = f * mul;
            g.gain.setValueAtTime(0.0001, s); g.gain.linearRampToValueAtTime(vol * .6, s + .012); g.gain.exponentialRampToValueAtTime(0.0001, s + 1.5);
            o.connect(g); g.connect(c.destination); o.start(s); o.stop(s + 1.6);
        });
    });
}
function startRing() {
    stopRing(); ringN = 0;
    const go = () => { try { chime(); } catch (e) {} buzz([180, 90, 180]); if (++ringN >= 5) { clearInterval(ringT); ringT = null; } };
    go(); ringT = setInterval(go, 3300);
}
function stopRing() { if (ringT) { clearInterval(ringT); ringT = null; } }
document.addEventListener('pointerdown', () => ac(), { once: true });

/* ---------- toast & reminder alerts (swipe to dismiss) ---------- */
function snap(el, fn) { el.style.transition = 'none'; fn(); void el.offsetHeight; el.style.transition = ''; }
function toast(title, body, ms = 4000) {
    const el = $('#toast');
    el.innerHTML = `<div><b>${esc(title)}</b>${esc(body)}</div><button data-act="toast-x">${t('ok')}</button>`;
    el.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), ms);
}
function swipe(el, gone) {
    let sx = 0, sy = 0, dx = 0, on = false, drag = false, pid = 0, t0 = 0;
    el.addEventListener('pointerdown', e => { if (!el.classList.contains('on')) return; sx = e.clientX; sy = e.clientY; dx = 0; on = true; drag = false; pid = e.pointerId; t0 = performance.now(); });
    el.addEventListener('pointermove', e => {
        if (!on) return;
        const mx = e.clientX - sx, my = e.clientY - sy;
        if (!drag) {
            if (Math.abs(mx) > 10 && Math.abs(mx) > Math.abs(my)) { drag = true; try { el.setPointerCapture(pid); } catch (x) {} el.style.transition = 'none'; }
            else if (Math.abs(my) > 14) { on = false; return; }
        }
        if (drag) { dx = mx; el.style.transform = `translate3d(${dx}px,0,0)`; el.style.opacity = String(1 - Math.min(.7, Math.abs(dx) / (el.offsetWidth || 300))); }
    });
    const end = () => {
        if (!on) return; on = false;
        if (!drag) return; drag = false;
        el.style.transition = '';
        const v = Math.abs(dx) / Math.max(1, performance.now() - t0);
        if (Math.abs(dx) > (el.offsetWidth || 300) * .3 || (v > .6 && Math.abs(dx) > 40)) {
            el.style.transform = `translate3d(${dx > 0 ? 130 : -130}%,0,0)`; el.style.opacity = '0';
            setTimeout(() => { snap(el, () => { el.classList.remove('on'); el.style.transform = ''; el.style.opacity = ''; }); gone(); }, 280);
        } else { el.style.transform = ''; el.style.opacity = ''; }
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}
let alerts = [], curAlert = null;
function pushAlert(a) { alerts.push(a); if (!curAlert) nextAlert(); }
function nextAlert() {
    curAlert = alerts.shift() || null;
    const el = $('#alert');
    if (!curAlert) { el.classList.remove('on'); stopRing(); return; }
    el.innerHTML = `<div class="at"><b>${esc(curAlert.title)}</b>${esc(curAlert.body)}</div>
        <div class="as"><span class="sl">${t('snooze')}</span>${[5, 10, 15].map(n => `<button class="zc" data-act="a-snz" data-n="${n}">${esc(t('min', n))}</button>`).join('')}<button class="zo" data-act="a-ok">${t('ok')}</button></div>`;
    el.classList.add('on');
    startRing();
}
function endAlert() {
    stopRing(); curAlert = null;
    $('#alert').classList.remove('on');
    if (alerts.length) setTimeout(() => { if (!curAlert) nextAlert(); }, 420);
}
swipe($('#toast'), () => clearTimeout(toastT));
swipe($('#alert'), () => { stopRing(); curAlert = null; if (alerts.length) setTimeout(() => { if (!curAlert) nextAlert(); }, 200); });

/* ---------- reminders ---------- */
function remindAt(k, r, rt) {
    const d = parse(k), [h, mi] = String(rt || remDefault(r)).split(':').map(Number);
    if (r === 'evening') d.setDate(d.getDate() - 1);
    d.setHours(h, mi, 0, 0);
    return d;
}
function medAt(k, tm) { const d = parse(k), [h, mi] = tm.split(':').map(Number); d.setHours(h, mi, 0, 0); return d; }
const mealTime = (k, m) => m.snz || remindAt(k, m.remind, m.rt).getTime();
const medTime = (k, m) => m.med.snz || medAt(k, m.med.t).getTime();
const mealTitle = m => t(m.remind === 'evening' ? 'prepTomorrow' : 'mealPrep');
function checkReminders() {
    const now = Date.now(); let changed = false;
    for (const k in S.meals) S.meals[k].forEach(m => {
        if (m.remind !== 'off' && !m.done && !m.fired) {
            const tm = mealTime(k, m);
            if (tm <= now) {
                m.fired = true; m.snz = 0; changed = true;
                if (now - tm < 6 * 3600e3) pushAlert({ kind: 'meal', id: m.id, title: mealTitle(m), body: `${tc(m.cat)}: ${m.text}` });
            }
        }
        if (m.med && !m.med.taken && !m.med.fired) {
            const tm = medTime(k, m);
            if (tm <= now) {
                m.med.fired = true; m.med.snz = 0; changed = true;
                if (now - tm < 6 * 3600e3) pushAlert({ kind: 'med', id: m.id, title: t('medTime'), body: `${m.med.name} · ${t('afterMeal', tc(m.cat))}` });
            }
        }
    });
    if (changed) { save(); render(); }
}
function snoozeItem(kind, id, n) {
    const f = findMeal(id); if (!f) return;
    const at = Date.now() + n * 60000;
    if (kind === 'med' && f.m.med) { f.m.med.snz = at; f.m.med.fired = false; }
    else { f.m.snz = at; f.m.fired = false; }
    alerts = alerts.filter(a => !(a.id === id && a.kind === kind));
    if (curAlert && curAlert.id === id && curAlert.kind === kind) endAlert();
    save();
}

/* ---------- native background reminders (Android) ---------- */
let nReady = false, nT = null;
function syncNative() { if (!P.LocalNotifications) return; clearTimeout(nT); nT = setTimeout(doSync, 400); }
async function doSync() {
    const LN = P.LocalNotifications;
    try {
        const list = [], now = Date.now();
        for (const k in S.meals) S.meals[k].forEach(m => {
            if (m.remind !== 'off' && !m.done && !m.fired) {
                const at = new Date(mealTime(k, m));
                if (at.getTime() > now) list.push({ id: m.id, title: mealTitle(m), body: `${tc(m.cat)}: ${m.text}`, channelId: 'reminders2', sound: 'reminder.wav', actionTypeId: 'REMINDER', extra: { kind: 'meal', id: m.id }, schedule: { at, allowWhileIdle: true } });
            }
            if (m.med && !m.med.taken && !m.med.fired) {
                const at = new Date(medTime(k, m));
                if (at.getTime() > now) list.push({ id: m.id + 1000000, title: t('medTime'), body: `${m.med.name} · ${t('afterMeal', tc(m.cat))}`, channelId: 'reminders2', sound: 'reminder.wav', actionTypeId: 'REMINDER', extra: { kind: 'med', id: m.id }, schedule: { at, allowWhileIdle: true } });
            }
        });
        let p = await LN.checkPermissions();
        if (p.display !== 'granted') { if (!list.length) return; p = await LN.requestPermissions(); if (p.display !== 'granted') return; }
        if (!nReady) { await LN.createChannel({ id: 'reminders2', name: 'Meal & medicine reminders', importance: 5, visibility: 1, vibration: true, sound: 'reminder.wav' }); nReady = true; }
        try { await LN.registerActionTypes({ types: [{ id: 'REMINDER', actions: [{ id: 'snooze', title: `${t('snooze')} · ${t('min', 10)}` }] }] }); } catch (e) {}
        const pend = await LN.getPending();
        if (pend.notifications.length) await LN.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
        if (list.length) await LN.schedule({ notifications: list });
    } catch (e) { console.error(e); }
}
try {
    if (P.LocalNotifications && P.LocalNotifications.addListener) {
        P.LocalNotifications.addListener('localNotificationActionPerformed', ev => {
            try { const x = (ev.notification && ev.notification.extra) || {}; if (ev.actionId === 'snooze' && x.id) snoozeItem(x.kind, +x.id, 10); } catch (e) {}
        });
    }
} catch (e) {}
function setStatusBar() {
    try {
        if (!P.NavBar) return;
        const light = S.theme === 'light';
        const r = P.NavBar.set({ color: light ? palBg() : '#000000', light });
        if (r && r.catch) r.catch(() => {});
    } catch (e) {}
}

/* ---------- theme (circular reveal) ---------- */
function applyTheme(th) {
    document.documentElement.setAttribute('data-theme', th);
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', th === 'light' ? palBg() : '#000000');
    S.theme = th;
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    setStatusBar();
}
let themeBusy = false;
function switchTheme(btn) {
    if (themeBusy) return;
    themeBusy = true;
    const next = S.theme === 'light' ? 'dark' : 'light';
    const r = btn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 8;
    const ov = document.createElement('div');
    ov.className = 'tov';
    ov.style.cssText = `left:${x - R}px;top:${y - R}px;width:${2 * R}px;height:${2 * R}px;background:${next === 'light' ? palBg() : '#000000'}`;
    document.body.appendChild(ov);
    const end = () => { ov.remove(); themeBusy = false; };
    const reveal = () => {
        applyTheme(next);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            try { ov.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, easing: 'ease-out', fill: 'forwards' }).finished.then(end, end); } catch (e) { end(); }
        }));
    };
    try {
        ov.animate([{ transform: 'scale(0)' }, { transform: 'scale(1)' }], { duration: 520, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' }).finished.then(reveal, () => { applyTheme(next); end(); });
    } catch (e) { applyTheme(next); end(); }
}

/* ---------- allergies, learning, suggestions ---------- */
const rxCache = {};
function allergenIn(text) {
    const tt = String(text).toLowerCase();
    return S.allergies.find(a => {
        try {
            const base = a.length > 3 ? a.replace(/(es|s)$/, '') : a;
            const rx = rxCache[base] || (rxCache[base] = new RegExp('(?<![\\p{L}\\p{N}])' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:s|es)?(?![\\p{L}\\p{N}])', 'u'));
            return rx.test(tt);
        } catch (e) { return tt.includes(a); }
    }) || null;
}
function learn(text, cat) {
    const bump = (map, x) => {
        const k = x.toLowerCase(), e = map[k] || { t: x, c: 0 };
        e.t = x; e.c++; e.ts = Date.now(); e.cat = cat; map[k] = e;
        const keys = Object.keys(map);
        if (keys.length > 300) keys.sort((a, b) => map[a].c - map[b].c || map[a].ts - map[b].ts).slice(0, 50).forEach(y => delete map[y]);
    };
    bump(S.memory, text);
    text.split(',').map(x => x.trim()).filter(x => x.length > 1).forEach(x => bump(S.items, x));
}
function suggestions(val) {
    const parts = val.split(','), seg = parts[parts.length - 1].trim().toLowerCase();
    if (seg.length < 2) return [];
    const typed = parts.slice(0, -1).map(x => x.trim().toLowerCase());
    const out = [];
    const add = (map, kind) => Object.keys(map).forEach(k => {
        const e = map[k];
        if (k !== seg && k.startsWith(seg) && !typed.includes(k) && !allergenIn(e.t)) out.push({ kind, e });
    });
    if (parts.length === 1) add(S.memory, 'm');
    add(S.items, 'i');
    out.sort((a, b) => b.e.c - a.e.c || b.e.ts - a.e.ts);
    const seen = new Set();
    return out.filter(x => { const k = x.e.t.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5);
}
function refreshSug() {
    const inp = $('#f-text'); if (!inp) return;
    const a = allergenIn(inp.value);
    $('#f-err').textContent = a ? t('algShort', a) : '';
    inp.classList.toggle('bad', !!a);
    $('#sug').innerHTML = suggestions(inp.value).map(({ kind, e }) =>
        `<button class="chip sg" data-act="sug" data-kind="${kind}" data-t="${esc(e.t)}" data-c="${esc(e.cat || '')}">${esc(e.t)}</button>`).join('');
}
function extras(m) {
    const a = allergenIn(m.text);
    let h = a ? `<div class="alg">${esc(t('contains', a))}</div>` : '';
    if (m.med) {
        const lbl = `${PILL}${esc(m.med.name)} · ${esc(fmtTime(m.med.t))}${m.med.taken ? ' ✓' : ''}`;
        h += sel ? `<span class="medb${m.med.taken ? ' ok' : ''}">${lbl}</span>`
                 : `<button class="medb${m.med.taken ? ' ok' : ''}" data-act="med" data-id="${m.id}">${lbl}</button>`;
    }
    return h;
}
function drawThemes() {
    open(`<div class="lbl">${t('themeT')}</div><p class="msg">${t('themeMsg')}</p>` + Object.keys(PALS).map(k =>
        `<div class="opt${S.pal === k ? ' on' : ''}" data-act="pal" data-v="${k}"><span class="cb">${CHECK}</span><div><b>${esc(PALS[k].n[lang === 'am' ? 1 : 0])}</b><span class="sw">${PALS[k].sw.map(c => `<i style="background:${c}"></i>`).join('')}</span></div></div>`).join('') +
        `<div class="row"><button class="btn ghost" data-act="close">${t('close')}</button></div>`);
}
function setPal(v) {
    if (!PALS[v]) return;
    const root = document.documentElement, wasDark = S.theme === 'dark';
    S.pal = v;
    if (v === 'classic') root.removeAttribute('data-pal'); else root.setAttribute('data-pal', v);
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    if (!wasDark) { root.classList.add('acc'); setTimeout(() => root.classList.remove('acc'), 480); }
    const m = document.querySelector('meta[name=theme-color]'); if (m && !wasDark) m.setAttribute('content', palBg());
    setStatusBar();
    drawThemes();
    setTimeout(close, 450);
    if (wasDark) switchTheme($('#theme'));
}
function openInfo() {
    open(`<div class="lbl">${t('infoT')}</div>
        <div class="irow"><span class="dd">${t('devBy')}</span><b>Dagim Bireda</b></div>
        <div class="irow"><span class="dd">${t('emailL')}</span><b class="sel-t">dagim22bireda@gmail.com</b></div>
        <div class="irow"><span class="dd">${t('phoneL')}</span><b class="sel-t">+251 929040636</b></div>
        <div class="irow"><span class="dd">${t('companyL')}</span><b>© Lilo Designs</b></div>
        <div class="row"><button class="btn ghost" data-act="close">${t('close')}</button></div>`);
}
function openAllergy() {
    open(`<div class="lbl">${t('allergies')}</div><p class="msg">${t('algSheetMsg')}</p>
        <div class="fl">${t('addFood')}</div><div class="addrow"><input id="f-alg" maxlength="40" placeholder="${esc(t('algPh'))}"><button class="btn sm" data-act="alg-add">${t('add')}</button></div>` +
        (S.allergies.length ? S.allergies.map(a => `<div class="hrow"><span>${esc(a)}</span><button class="btn danger sm" data-act="alg-del" data-t="${esc(a)}">${t('remove')}</button></div>`).join('') : `<div class="nodays" style="padding:18px 0 0">${t('noAlg')}</div>`) +
        `<div class="row"><button class="btn ghost" data-act="close">${t('close')}</button></div>`);
}

/* ---------- interaction ---------- */
function toggleSel(id) {
    sel = sel || new Set();
    sel.has(id) ? sel.delete(id) : sel.add(id);
    if (!sel.size) sel = null;
}
function setMode(v) {
    if (v === S.mode && det === null) return;
    const dir = v === S.mode ? -1 : (v === 'monthly' ? 1 : -1);
    S.mode = v; S.offset = 0; det = null; sel = null; save(); render(dir);
}
document.addEventListener('click', e => {
    if (lpFired) { lpFired = false; return; }
    if (e.target.id === 'sheet') { close(); return; }
    if (e.target.id === 'sheet2') { closeKp(); return; }
    const el = e.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, k = el.dataset.k, id = +el.dataset.id, v = el.dataset.v;
    switch (a) {
        case 'mode': setMode(v); break;
        case 'nav': { const nv = v === '0' ? 0 : S.offset + +v; if (nv === S.offset) break; const dr = v === '0' ? (S.offset > 0 ? -1 : 1) : +v; S.offset = nv; save(); render(dr); break; }
        case 'lang': lang = lang === 'en' ? 'am' : 'en'; S.lang = lang; applyLang(); save(); render(0); break;
        case 'theme': switchTheme(el); break;
        case 'info': openInfo(); break;
        case 'themes': drawThemes(); break;
        case 'pal': setPal(v); break;
        case 'openweek': det = +el.dataset.w; render(1); break;
        case 'back': det = null; render(-1); break;
        case 'day': if (sel) { toggleSel('d:' + k); render(); } else openMeal({ k }); break;
        case 'edit': openMeal({ id }); break;
        case 'entry': if (sel) toggleSel('e:' + id); else { const m = findMeal(id).m; m.done = !m.done; popId = m.done ? id : 0; save(); setTimeout(() => { popId = 0; }, 700); } render(); break;
        case 'delday': dd = { k, mode: 'box' }; drawDel(); break;
        case 'delopt': if (dd) { dd.mode = v; drawDel(); } break;
        case 'delgo': if (dd) { if (dd.mode === 'meals' && !meals(dd.k).length) { toast(t('alreadyEmpty'), t('delMealsNone'), 3000); break; } doDelete(); } break;
        case 'addday-open': openAddDay(); break;
        case 'addday-pick': {
            const ws = curWs(), wd = +el.dataset.wd, have = daysOf(ws);
            if (!have.includes(wd)) have.push(wd);
            setDays(ws, have); const d = addDays(ws, (wd + 6) % 7); born = key(d);
            close(); save(); render();
            setTimeout(() => { born = ''; }, 900);
            toast(t('dayAdded', dayName(d)), t('dayAddedB'), 2500);
            break;
        }
        case 'pickcat': readForm(); modal.cat = v; drawMeal(); break;
        case 'pickrem': readForm(); modal.remind = v; drawMeal(); break;
        case 'time': openKeypad(el.dataset.w); break;
        case 'kp-n': if (kp) { if (kpAdd(+el.dataset.n)) { buzz(8); updKp(); } else { const dg = $('#kp-d'); dg.classList.remove('shake'); void dg.offsetWidth; dg.classList.add('shake'); buzz(25); } } break;
        case 'kp-bk': if (kp) { kp.buf = kp.buf.slice(0, -1); buzz(8); updKp(); } break;
        case 'kp-ap': if (kp) { kp.pm = v === '1'; updKp(); } break;
        case 'kp-ok': kpDone(); break;
        case 'kp-x': closeKp(); break;
        case 'save': saveMeal(); break;
        case 'bulksave': saveBulk(); break;
        case 'close': close(); break;
        case 'yes': { const f = pending; if (f) f(); break; }
        case 'sel-cancel': sel = null; render(); break;
        case 'sel-edit': openBulk(); break;
        case 'sel-del': {
            const list = selList();
            if (!list.length) { toast(t('alreadyEmpty'), t('selEmpty'), 3500); break; }
            ask(esc(t('delSel', list.length)), t('del'), () => { delIds(new Set(list.map(x => x.m.id))); sel = null; close(); save(); render(); toast(t('deleted'), t('nRemoved', list.length), 2500); });
            break;
        }
        case 'sug': {
            readForm();
            if (el.dataset.kind === 'm') { modal.text = el.dataset.t; if (CATS.includes(el.dataset.c)) modal.cat = el.dataset.c; }
            else { const parts = modal.text.split(',').map(x => x.trim()); parts[parts.length - 1] = el.dataset.t; modal.text = parts.join(', '); }
            drawMeal();
            const inp = $('#f-text'); inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length);
            break;
        }
        case 'med': { const m = findMeal(id).m; m.med.taken = !m.med.taken; save(); render(); toast(t(m.med.taken ? 'medTaken' : 'medNot'), m.med.name, 2200); break; }
        case 'allergy-open': openAllergy(); break;
        case 'alg-add': {
            const added = $('#f-alg').value.split(/[,\n]/).map(x => x.trim().toLowerCase()).filter(x => x.length > 1 && !S.allergies.includes(x));
            if (!added.length) { toast(t('nothingAdd'), t('typeFood'), 2500); break; }
            S.allergies.push(...added); save(); render(); openAllergy();
            let n = 0; for (const kk in S.meals) S.meals[kk].forEach(m => { if (allergenIn(m.text)) n++; });
            toast(t('algSaved'), n ? t('algMarked', n) : t('algBlocked', added.join(', ')), 4000);
            break;
        }
        case 'alg-del': S.allergies = S.allergies.filter(x => x !== el.dataset.t); save(); render(); openAllergy(); toast(t('removed'), t('algAgain', el.dataset.t), 2500); break;
        case 'a-snz': { if (curAlert) { const n = +el.dataset.n; snoozeItem(curAlert.kind, curAlert.id, n); toast(t('snoozed'), t('snoozedB', n), 2600); } break; }
        case 'a-ok': endAlert(); break;
        case 'toast-x': clearTimeout(toastT); $('#toast').classList.remove('on'); break;
    }
});
/* press-and-hold on a meal or a day starts bulk selection */
document.addEventListener('pointerdown', e => {
    lpFired = false;
    const el = e.target.closest('[data-lp]');
    if (!el || e.target.closest('button') || isOpen()) return;
    lpX = e.clientX; lpY = e.clientY;
    lpT = setTimeout(() => { lpFired = true; toggleSel(el.dataset.lp); buzz(30); render(); }, 520);
});
['pointerup', 'pointercancel'].forEach(tp => document.addEventListener(tp, () => clearTimeout(lpT)));
document.addEventListener('pointermove', e => { if (lpT && Math.hypot(e.clientX - lpX, e.clientY - lpY) > 10) clearTimeout(lpT); });
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('input', e => { if (e.target.id === 'f-text') refreshSug(); });
function rollover() {
    const dk = key(today());
    if (dk !== lastDay) { lastDay = dk; ensureToday(); render(); }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) { rollover(); checkReminders(); render(); } });
if (P.App && P.App.addListener) {
    P.App.addListener('backButton', () => {
        if ($('#sheet2').classList.contains('on')) closeKp();
        else if (isOpen()) close();
        else if (sel) { sel = null; render(); }
        else if (S.mode === 'monthly' && det !== null) { det = null; render(-1); }
        else P.App.exitApp();
    });
}

/* ---------- header height + start ---------- */
function syncHH() { const h = $('#hdr').offsetHeight; if (h) document.documentElement.style.setProperty('--hh', h + 'px'); }
$('#fl-en').innerHTML = FLAG_US; $('#fl-am').innerHTML = FLAG_ET;
applyLang();
ensureToday();
setStatusBar();
render();
syncHH();
if (window.ResizeObserver) new ResizeObserver(syncHH).observe($('#hdr'));
window.addEventListener('resize', syncHH);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncHH);
checkReminders();
syncNative();
setInterval(() => { rollover(); checkReminders(); }, 30000);
