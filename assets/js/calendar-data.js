const API_BASE = window.API_BASE;
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const errMsg = body.error || 'Permintaan API gagal'; if (window.showToast) window.showToast(errMsg, 'error'); throw new Error(errMsg);
  }
  if (options && options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method.toUpperCase())) { let msg = 'Berhasil menyimpan data'; if (options.method.toUpperCase() === 'POST') msg = 'Berhasil menambahkan data'; if (options.method.toUpperCase() === 'DELETE') msg = 'Berhasil menghapus data'; if (window.showToast) window.showToast(msg, 'success'); if (window.syncChannel) window.syncChannel.postMessage('REFRESH'); } return response.status === 204 ? null : response.json();
}


// Global Calendar State
let currentView = 'month'; // 'month' | 'week' | 'day' | 'agenda'
let selectedDate = new Date();
let currentFilter = 'all';
let dashboardEvents = [];

const CATEGORY_STYLES = {
  tugas: {
    label: 'Tugas Kuliah',
    bg: 'bg-secondary/20',
    text: 'text-secondary',
    dot: 'bg-secondary',
    border: 'border-secondary/40'
  },
  ujian: {
    label: 'Ujian / Kuis',
    bg: 'bg-error/20',
    text: 'text-error',
    dot: 'bg-error',
    border: 'border-error/40'
  },
  kelas: {
    label: 'Jadwal Kelas',
    bg: 'bg-tertiary/20',
    text: 'text-tertiary',
    dot: 'bg-tertiary',
    border: 'border-tertiary/40'
  },
  acara: {
    label: 'Acara Kampus',
    bg: 'bg-secondary-fixed/20',
    text: 'text-secondary-fixed',
    dot: 'bg-secondary-fixed',
    border: 'border-secondary-fixed/40'
  },
  default: {
    label: 'Agenda',
    bg: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    dot: 'bg-outline',
    border: 'border-outline/40'
  }
};

function getCategoryStyle(category) {
  const key = (category || '').toLowerCase();
  return CATEGORY_STYLES[key] || CATEGORY_STYLES.default;
}

function getFilteredEvents() {
  if (currentFilter === 'all') return dashboardEvents;
  return dashboardEvents.filter(e => (e.category || '').toLowerCase() === currentFilter.toLowerCase());
}

// Formatters
const idMonthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'long' });
const idFullDateFormatter = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' });
const idTimeFormatter = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' });

function updateHeaderLabels() {
  const monthLabel = document.getElementById('calendar-month-label');
  const yearLabel = document.getElementById('calendar-year-label');
  const viewIndicator = document.getElementById('calendar-view-indicator');
  const badge = document.getElementById('agenda-count-badge');

  if (badge) badge.textContent = String(dashboardEvents.length);

  const year = selectedDate.getFullYear();

  if (currentView === 'month') {
    if (monthLabel) monthLabel.textContent = idMonthFormatter.format(selectedDate);
    if (yearLabel) yearLabel.textContent = String(year);
    if (viewIndicator) viewIndicator.textContent = 'Tampilan Bulan Aktif';
  } else if (currentView === 'week') {
    const monday = getMondayOfWeek(selectedDate);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const monStr = monday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    const sunStr = sunday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

    if (monthLabel) monthLabel.textContent = `${monStr} - ${sunStr}`;
    if (yearLabel) yearLabel.textContent = String(year);
    if (viewIndicator) viewIndicator.textContent = 'Tampilan Minggu Aktif';
  } else if (currentView === 'day') {
    const dayName = selectedDate.toLocaleDateString('id-ID', { weekday: 'long' });
    const dayDate = selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    if (monthLabel) monthLabel.textContent = `${dayName}, ${dayDate}`;
    if (yearLabel) yearLabel.textContent = String(year);
    if (viewIndicator) viewIndicator.textContent = 'Tampilan Hari Aktif';
  } else if (currentView === 'agenda') {
    if (monthLabel) monthLabel.textContent = 'Daftar Agenda';
    if (yearLabel) yearLabel.textContent = String(year);
    if (viewIndicator) viewIndicator.textContent = 'Tampilan Agenda List Aktif';
  }
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

// -------------------------------------------------------------
// View Renderers
// -------------------------------------------------------------

function renderCalendar() {
  const container = document.getElementById('calendar-view-content');
  if (!container) return;
  container.replaceChildren();

  updateHeaderLabels();
  const events = getFilteredEvents();

  if (currentView === 'month') {
    renderMonthView(container, events);
  } else if (currentView === 'week') {
    renderWeekView(container, events);
  } else if (currentView === 'day') {
    renderDayView(container, events);
  } else if (currentView === 'agenda') {
    renderAgendaListView(container, events);
  }

  renderSelectedDate(dashboardEvents);
}

// 1. MONTH VIEW
function renderMonthView(container, events) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flex flex-col w-full';

  // Weekday Headers
  const weekdayHeader = document.createElement('div');
  weekdayHeader.className = 'grid grid-cols-7 bg-surface-container-lowest py-space-sm px-space-xs text-center font-label-md text-label-md text-outline tracking-wider uppercase';
  const weekdays = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  weekdays.forEach((day, idx) => {
    const d = document.createElement('div');
    if (idx === 6) d.className = 'text-error font-semibold';
    else if (idx === 5) d.className = 'text-secondary font-semibold';
    else d.className = 'text-on-surface';
    d.textContent = day;
    weekdayHeader.appendChild(d);
  });
  wrapper.appendChild(weekdayHeader);

  // Month Grid
  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-7 gap-1 bg-surface-container-lowest/40 p-1 font-body-sm text-body-sm min-h-[480px]';

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Monday-first offset: 0 for Mon, 6 for Sun
  const firstDayIndex = (firstDay.getDay() + 6) % 7;

  // Previous month overflow days
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex; i > 0; i--) {
    const prevDateNum = prevMonthLastDate - i + 1;
    const cell = document.createElement('div');
    cell.className = 'min-h-[105px] p-1.5 bg-surface-container-low/30 rounded-lg opacity-30 flex flex-col justify-between cursor-pointer hover:opacity-50 transition-opacity';
    cell.innerHTML = `<span class="font-code-sm text-code-sm">${prevDateNum}</span>`;
    cell.addEventListener('click', () => {
      selectedDate = new Date(year, month - 1, prevDateNum);
      renderCalendar();
    });
    grid.appendChild(cell);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(year, month, day);
    const isSelected = isSameDay(cellDate, selectedDate);
    const isToday = isSameDay(cellDate, new Date());

    const cell = document.createElement('div');
    cell.className = `calendar-cell min-h-[105px] p-1.5 rounded-lg flex flex-col justify-between transition-all cursor-pointer group ${
      isSelected
        ? 'bg-surface-container-highest/90 ring-1 ring-primary shadow-md shadow-primary/10'
        : 'bg-surface-container hover:bg-surface-container-high'
    }`;

    // Header inside cell
    const cellHead = document.createElement('div');
    cellHead.className = 'flex items-center justify-between';

    const numBadge = document.createElement('span');
    if (isToday) {
      numBadge.className = 'w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-code-sm text-code-sm font-bold shadow-sm';
    } else if (isSelected) {
      numBadge.className = 'w-6 h-6 rounded-full bg-primary/40 text-on-surface flex items-center justify-center font-code-sm text-code-sm font-semibold';
    } else {
      numBadge.className = 'font-code-sm text-code-sm text-on-surface font-semibold group-hover:text-primary';
    }
    numBadge.textContent = String(day).padStart(2, '0');
    cellHead.appendChild(numBadge);

    if (isToday) {
      const todayTag = document.createElement('span');
      todayTag.className = 'text-[9px] px-1 rounded bg-primary/20 text-primary font-bold uppercase';
      todayTag.textContent = 'Hari Ini';
      cellHead.appendChild(todayTag);
    }
    cell.appendChild(cellHead);

    // Filter events for this day
    const dayEvents = events.filter(e => isSameDay(new Date(e.event_date), cellDate));

    if (dayEvents.length > 0) {
      const eventList = document.createElement('div');
      eventList.className = 'mt-1 space-y-1 flex-1 flex flex-col justify-end';

      dayEvents.slice(0, 2).forEach(ev => {
        const style = getCategoryStyle(ev.category);
        const item = document.createElement('div');
        item.className = `p-1 rounded ${style.bg} ${style.text} font-label-sm text-[11px] truncate flex items-center gap-1`;
        item.innerHTML = `<span class="w-1.5 h-1.5 rounded-full ${style.dot} shrink-0"></span> <span class="truncate">${escapeHtml(ev.title)}</span>`;
        eventList.appendChild(item);
      });

      if (dayEvents.length > 2) {
        const moreTag = document.createElement('div');
        moreTag.className = 'text-[10px] text-outline font-code-sm px-1';
        moreTag.textContent = `+${dayEvents.length - 2} lainnya`;
        eventList.appendChild(moreTag);
      }

      cell.appendChild(eventList);
    }

    cell.addEventListener('click', () => {
      selectedDate = cellDate;
      renderCalendar();
    });

    grid.appendChild(cell);
  }

  // Next month trailing overflow to complete rows (7 cols)
  const totalRendered = firstDayIndex + daysInMonth;
  const trailingDays = (7 - (totalRendered % 7)) % 7;
  for (let d = 1; d <= trailingDays; d++) {
    const cell = document.createElement('div');
    cell.className = 'min-h-[105px] p-1.5 bg-surface-container-low/30 rounded-lg opacity-30 flex flex-col justify-between cursor-pointer hover:opacity-50 transition-opacity';
    cell.innerHTML = `<span class="font-code-sm text-code-sm">${String(d).padStart(2, '0')}</span>`;
    cell.addEventListener('click', () => {
      selectedDate = new Date(year, month + 1, d);
      renderCalendar();
    });
    grid.appendChild(cell);
  }

  wrapper.appendChild(grid);
  container.appendChild(wrapper);
}

// 2. WEEK VIEW
function renderWeekView(container, events) {
  const monday = getMondayOfWeek(selectedDate);
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-1 md:grid-cols-7 gap-2 bg-surface-container-lowest/40 p-2 min-h-[500px]';

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  weekDays.forEach((dateObj, idx) => {
    const isSelected = isSameDay(dateObj, selectedDate);
    const isToday = isSameDay(dateObj, new Date());
    const dayEvents = events.filter(e => isSameDay(new Date(e.event_date), dateObj));

    const col = document.createElement('div');
    col.className = `flex flex-col rounded-xl p-2.5 transition-all cursor-pointer ${
      isSelected
        ? 'bg-surface-container-highest/90 ring-1 ring-primary shadow-lg shadow-primary/10'
        : 'bg-surface-container hover:bg-surface-container-high'
    }`;

    // Column Header
    const colHeader = document.createElement('div');
    colHeader.className = 'flex items-center justify-between pb-2 mb-2 border-b border-surface-container-high';
    colHeader.innerHTML = `
      <div class="flex flex-col">
        <span class="font-label-sm text-label-sm uppercase tracking-wider ${idx === 6 ? 'text-error' : idx === 5 ? 'text-secondary' : 'text-outline'}">${dayNames[idx]}</span>
        <span class="font-headline-sm text-headline-sm text-on-surface font-bold">${dateObj.getDate()}</span>
      </div>
      ${isToday ? '<span class="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-code-sm text-[10px] font-bold">Hari Ini</span>' : ''}
    `;
    col.appendChild(colHeader);

    // Column Events
    const list = document.createElement('div');
    list.className = 'flex-1 flex flex-col gap-2 overflow-y-auto max-h-[460px] pr-1';

    if (dayEvents.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'h-24 flex items-center justify-center text-[11px] text-outline text-center p-2 rounded-lg bg-surface-container-lowest/40 border border-dashed border-outline-variant/30';
      empty.textContent = 'Kosong';
      list.appendChild(empty);
    } else {
      dayEvents.forEach(ev => {
        const style = getCategoryStyle(ev.category);
        const evDate = new Date(ev.event_date);
        const timeStr = idTimeFormatter.format(evDate);

        const item = document.createElement('div');
        item.className = `p-2 rounded-lg ${style.bg} border-l-2 ${style.border} flex flex-col gap-1 transition-transform hover:scale-[1.02] shadow-sm`;
        item.innerHTML = `
          <div class="flex items-center justify-between gap-1 text-[10px] font-code-sm">
            <span class="${style.text} font-bold">${timeStr} WIB</span>
            <span class="px-1 rounded bg-surface-container-lowest/60 text-outline text-[9px] uppercase">${escapeHtml(ev.category || 'Event')}</span>
          </div>
          <span class="font-label-md text-label-md text-on-surface font-semibold line-clamp-2 leading-tight">${escapeHtml(ev.title)}</span>
          ${ev.description ? `<p class="text-[11px] text-outline line-clamp-2">${escapeHtml(ev.description)}</p>` : ''}
        `;
        list.appendChild(item);
      });
    }

    col.appendChild(list);

    col.addEventListener('click', () => {
      selectedDate = dateObj;
      renderCalendar();
    });

    grid.appendChild(col);
  });

  container.appendChild(grid);
}

// 3. DAY VIEW
function renderDayView(container, events) {
  const isToday = isSameDay(selectedDate, new Date());
  const dayEvents = events.filter(e => isSameDay(new Date(e.event_date), selectedDate))
    .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  const wrapper = document.createElement('div');
  wrapper.className = 'p-space-md flex flex-col gap-space-md min-h-[500px]';

  // Hero Card
  const hero = document.createElement('div');
  hero.className = 'bg-surface-container p-space-md rounded-xl flex items-center justify-between shadow-md border border-outline-variant/20';
  hero.innerHTML = `
    <div class="flex flex-col">
      <div class="flex items-center gap-space-xs">
        <span class="font-label-sm text-label-sm text-tertiary uppercase tracking-wider font-bold">
          ${isToday ? 'Hari Ini' : selectedDate.toLocaleDateString('id-ID', { weekday: 'long' })}
        </span>
        <span class="text-outline">•</span>
        <span class="font-label-sm text-label-sm text-outline">Minggu ke-${Math.ceil(selectedDate.getDate() / 7)}</span>
      </div>
      <h2 class="font-headline-lg text-headline-lg text-on-surface font-bold mt-1">
        ${idFullDateFormatter.format(selectedDate)}
      </h2>
    </div>
    <div class="flex items-center gap-space-sm">
      <span class="px-space-md py-space-xs rounded-full bg-primary-container text-on-primary-container font-code-sm text-code-sm font-semibold shadow-sm">
        ${dayEvents.length} Agenda
      </span>
    </div>
  `;
  wrapper.appendChild(hero);

  // Day Agenda Stream
  const agendaList = document.createElement('div');
  agendaList.className = 'flex flex-col gap-space-sm';

  if (dayEvents.length === 0) {
    const emptyBox = document.createElement('div');
    emptyBox.className = 'p-space-xl bg-surface-container rounded-xl flex flex-col items-center justify-center text-center gap-space-sm border border-dashed border-outline-variant/40 my-4';
    emptyBox.innerHTML = `
      <div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
        <span class="material-symbols-outlined text-[24px]">event_busy</span>
      </div>
      <div class="flex flex-col">
        <span class="font-title-md text-title-md text-on-surface font-semibold">Tidak ada jadwal pada tanggal ini</span>
        <span class="text-body-sm text-body-sm text-outline">Gunakan form di samping kanan atau tombol di atas untuk menambahkan tugas atau agenda baru.</span>
      </div>
    `;
    agendaList.appendChild(emptyBox);
  } else {
    dayEvents.forEach(ev => {
      const style = getCategoryStyle(ev.category);
      const evDate = new Date(ev.event_date);
      const timeStr = idTimeFormatter.format(evDate);

      const card = document.createElement('div');
      card.className = 'p-space-md bg-surface-container hover:bg-surface-container-high rounded-xl transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-space-md border border-outline-variant/20 group';
      card.innerHTML = `
        <div class="flex items-start gap-space-md min-w-0">
          <div class="w-12 h-12 rounded-xl ${style.bg} ${style.text} flex flex-col items-center justify-center font-code-sm text-code-sm font-bold shrink-0">
            <span class="text-[10px] uppercase">JAM</span>
            <span class="text-[13px]">${timeStr}</span>
          </div>
          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-space-xs flex-wrap">
              <span class="font-title-md text-title-md text-on-surface font-semibold truncate">${escapeHtml(ev.title)}</span>
              <span class="px-space-xs py-space-3xs rounded-full ${style.bg} ${style.text} font-label-sm text-[11px] font-semibold">${style.label}</span>
            </div>
            ${ev.description ? `<p class="font-body-sm text-body-sm text-outline mt-1 leading-relaxed">${escapeHtml(ev.description)}</p>` : ''}
          </div>
        </div>
        <div class="flex items-center gap-space-xs shrink-0 self-end md:self-auto">
          <button class="w-9 h-9 rounded-lg bg-surface-container-highest/60 text-outline hover:text-error hover:bg-error/20 flex items-center justify-center transition-colors opacity-80 group-hover:opacity-100" title="Hapus Agenda" data-delete-event="${ev.id}">
            <span class="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      `;
      agendaList.appendChild(card);
    });
  }

  wrapper.appendChild(agendaList);
  container.appendChild(wrapper);
}

// 4. AGENDA LIST VIEW
function renderAgendaListView(container, events) {
  const wrapper = document.createElement('div');
  wrapper.className = 'p-space-md flex flex-col gap-space-md min-h-[500px]';

  const sortedEvents = [...events].sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

  if (sortedEvents.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'p-space-xl bg-surface-container rounded-xl text-center text-outline border border-dashed border-outline-variant/40';
    empty.textContent = 'Belum ada agenda atau tugas tersimpan.';
    wrapper.appendChild(empty);
  } else {
    // Group by Date String
    const grouped = {};
    sortedEvents.forEach(ev => {
      const dateKey = new Date(ev.event_date).toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(ev);
    });

    Object.entries(grouped).forEach(([dateStr, items]) => {
      const dateObj = new Date(dateStr);
      const isToday = isSameDay(dateObj, new Date());

      const groupBlock = document.createElement('div');
      groupBlock.className = 'flex flex-col gap-space-xs';

      const groupHead = document.createElement('div');
      groupHead.className = 'flex items-center gap-space-xs pb-1 border-b border-surface-container-high';
      groupHead.innerHTML = `
        <span class="font-label-md text-label-md text-on-surface font-bold">${idFullDateFormatter.format(dateObj)}</span>
        ${isToday ? '<span class="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-code-sm text-[10px] font-bold">Hari Ini</span>' : ''}
        <span class="text-outline font-code-sm text-[11px] ml-auto">${items.length} Agenda</span>
      `;
      groupBlock.appendChild(groupHead);

      const itemsList = document.createElement('div');
      itemsList.className = 'space-y-space-xs';

      items.forEach(ev => {
        const style = getCategoryStyle(ev.category);
        const timeStr = idTimeFormatter.format(new Date(ev.event_date));

        const row = document.createElement('div');
        row.className = 'p-space-sm bg-surface-container rounded-xl flex items-center justify-between gap-space-sm hover:bg-surface-container-high transition-all shadow-sm';
        row.innerHTML = `
          <div class="flex items-center gap-space-sm min-w-0">
            <span class="w-2 h-2 rounded-full ${style.dot} shrink-0"></span>
            <span class="font-code-sm text-code-sm text-outline font-semibold shrink-0">${timeStr}</span>
            <span class="font-title-md text-title-md text-on-surface font-semibold truncate">${escapeHtml(ev.title)}</span>
            <span class="px-space-xs py-space-3xs rounded ${style.bg} ${style.text} font-label-sm text-[10px] shrink-0">${style.label}</span>
          </div>
          <button class="text-outline hover:text-error transition-colors p-1" title="Hapus Agenda" data-delete-event="${ev.id}">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        `;
        itemsList.appendChild(row);
      });

      groupBlock.appendChild(itemsList);
      wrapper.appendChild(groupBlock);
    });
  }

  container.appendChild(wrapper);
}

// -------------------------------------------------------------
// Selected Date Details (Right Drawer)
// -------------------------------------------------------------

function renderSelectedDate(events) {
  const title = document.getElementById('selected-date-title');
  const week = document.getElementById('selected-date-week');
  const summary = document.getElementById('selected-date-summary');
  const container = document.getElementById('agenda-items-container');
  const count = document.getElementById('agenda-count');

  if (!title || !container) return;

  title.textContent = idFullDateFormatter.format(selectedDate);
  if (week) week.textContent = `Minggu ke-${Math.ceil(selectedDate.getDate() / 7)}`;

  const selectedEvents = events.filter(e => isSameDay(new Date(e.event_date), selectedDate));

  if (count) count.textContent = `${selectedEvents.length} Acara`;
  if (summary) {
    summary.textContent = selectedEvents.length
      ? `${selectedEvents.length} agenda tersimpan pada tanggal ini.`
      : 'Belum ada agenda pada tanggal ini.';
  }

  container.replaceChildren();

  if (!selectedEvents.length) {
    const empty = document.createElement('div');
    empty.className = 'text-body-sm text-body-sm text-outline p-space-sm bg-surface-container rounded-xl';
    empty.textContent = 'Belum ada agenda pada tanggal ini.';
    container.appendChild(empty);
    return;
  }

  selectedEvents.forEach((event) => {
    const style = getCategoryStyle(event.category);
    const timeStr = idTimeFormatter.format(new Date(event.event_date));

    const item = document.createElement('div');
    item.className = 'group p-space-sm bg-surface-container rounded-xl flex items-start gap-space-sm hover:bg-surface-container-high transition-all shadow-sm';

    item.innerHTML = `
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-1">
          <span class="task-title font-title-md text-title-md text-on-surface truncate font-semibold">${escapeHtml(event.title)}</span>
          <span class="px-2 py-0.5 rounded-full ${style.bg} ${style.text} font-label-sm text-[10px] uppercase font-bold shrink-0">${style.label}</span>
        </div>
        <div class="flex items-center gap-space-sm text-on-surface-variant font-body-sm text-body-sm mt-1">
          <span class="flex items-center gap-1 ${style.text}">
            <span class="material-symbols-outlined text-[15px]">schedule</span> ${timeStr} WIB
          </span>
          ${event.subject_name ? `
            <span class="flex items-center gap-1 text-${event.color_theme || 'primary'}">
              <span class="material-symbols-outlined text-[15px]">school</span> ${escapeHtml(event.subject_name)}
            </span>
          ` : ''}
        </div>
        ${event.description ? `
          <div class="mt-2 p-2 rounded-lg bg-surface-container-lowest font-body-sm text-body-sm text-on-surface-variant">
            ${escapeHtml(event.description)}
          </div>
        ` : ''}
      </div>
      <button class="opacity-0 group-hover:opacity-100 text-outline hover:text-error transition-all p-1" title="Hapus Agenda" data-delete-event="${event.id}">
        <span class="material-symbols-outlined text-[16px]">delete</span>
      </button>
    `;

    container.appendChild(item);
  });
}

// -------------------------------------------------------------
// Navigation & Control Handlers
// -------------------------------------------------------------

function navigateCalendar(direction) {
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const currentDay = selectedDate.getDate();

  if (currentView === 'month' || currentView === 'agenda') {
    selectedDate = new Date(currentYear, currentMonth + direction, Math.min(currentDay, new Date(currentYear, currentMonth + direction + 1, 0).getDate()));
  } else if (currentView === 'week') {
    selectedDate = new Date(currentYear, currentMonth, currentDay + (direction * 7));
  } else if (currentView === 'day') {
    selectedDate = new Date(currentYear, currentMonth, currentDay + direction);
  }
  renderCalendar();
}

async function loadEvents() {
  try {
    dashboardEvents = await apiRequest('/events');
    renderCalendar();
  } catch (error) {
    console.error('Gagal memuat agenda kalender:', error);
  }
}


// -------------------------------------------------------------
// DOM Initialization
// -------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Buttons
  const prevBtn = document.getElementById('prev-month-btn');
  const nextBtn = document.getElementById('next-month-btn');
  const todayBtn = document.getElementById('today-btn');

  prevBtn?.addEventListener('click', () => navigateCalendar(-1));
  nextBtn?.addEventListener('click', () => navigateCalendar(1));
  todayBtn?.addEventListener('click', () => {
    selectedDate = new Date();
    renderCalendar();
  });

  // View Switcher Buttons
  const viewPills = document.querySelectorAll('.view-pill');
  viewPills.forEach(pill => {
    pill.addEventListener('click', () => {
      viewPills.forEach(p => {
        p.classList.remove('bg-primary-container', 'text-on-primary-container', 'shadow-md');
        p.classList.add('text-on-surface-variant');
      });
      pill.classList.add('bg-primary-container', 'text-on-primary-container', 'shadow-md');
      pill.classList.remove('text-on-surface-variant');

      const view = pill.getAttribute('data-view');
      if (view) {
        currentView = view;
        renderCalendar();
      }
    });
  });

  // Category Filter Pills
  const filterPills = document.querySelectorAll('.filter-pill');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('bg-primary', 'text-on-primary');
        p.classList.add('bg-surface-container-high', 'text-on-surface-variant');
      });
      pill.classList.remove('bg-surface-container-high', 'text-on-surface-variant');
      pill.classList.add('bg-primary', 'text-on-primary');

      currentFilter = pill.getAttribute('data-category') || 'all';
      renderCalendar();
    });
  });

  // Global Delete Event Delegation
  document.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('[data-delete-event]');
    if (!deleteBtn) return;
    const eventId = deleteBtn.getAttribute('data-delete-event');
    if (!eventId) return;

    if (confirm('Hapus agenda ini dari kalender?')) {
      try {
        await apiRequest(`/events/${eventId}`, { method: 'DELETE' });
        await loadEvents();
      } catch (err) {
        alert(`Gagal menghapus agenda: ${err.message}`);
      }
    }
  });

  // Quick Add Inline Form
  const quickForm = document.getElementById('quick-add-form');
  if (quickForm) {
    quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = quickForm.querySelector('button[type="submit"]');
      let originalText = '';
      if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Menyimpan...';
      }

      try {
        const title = quickForm.elements.title?.value?.trim();
        const date = quickForm.elements.event_date?.value;
        const time = quickForm.elements.start_time?.value || '08:00';
        const category = quickForm.elements.category?.value || 'tugas';
        const priority = quickForm.elements.priority?.value || 'medium';
        const description = quickForm.elements.description?.value?.trim() || '';

        if (!title || !date) {
          alert('Judul dan tanggal wajib diisi');
          return;
        }

        await apiRequest('/events', {
          method: 'POST',
          body: JSON.stringify({
            title,
            event_date: `${date}T${time}:00`,
            category,
            priority,
            description
          })
        });

        quickForm.reset();
        await loadEvents();
      } catch (err) {
        alert(`Gagal menyimpan agenda: ${err.message}`);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
    });
  }

  // Modal Add Event
  const confirmModalBtn = document.getElementById('confirm-modal-btn');
  const modalContainer = document.getElementById('modal-container');
  confirmModalBtn?.addEventListener('click', async () => {
    const titleInput = document.getElementById('modal-title');
    const dateInput = document.getElementById('modal-date');
    const timeInput = document.getElementById('modal-time');
    const categoryInput = document.getElementById('modal-category');
    const priorityInput = document.getElementById('modal-priority');
    const descInput = document.getElementById('modal-description');

    const title = titleInput?.value?.trim();
    const date = dateInput?.value;
    const time = timeInput?.value || '10:00';
    const category = categoryInput?.value || 'tugas';
    const priority = priorityInput?.value || 'medium';
    const description = descInput?.value?.trim() || '';

    if (!title || !date) {
      alert('Nama agenda dan tanggal mulai wajib diisi');
      return;
    }

    confirmModalBtn.disabled = true;
    confirmModalBtn.textContent = 'Menyimpan...';

    try {
      await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          event_date: `${date}T${time}:00`,
          category,
          priority,
          description
        })
      });

      // Reset & close
      if (titleInput) titleInput.value = '';
      if (descInput) descInput.value = '';
      modalContainer?.classList.add('opacity-0', 'pointer-events-none');
      await loadEvents();
    } catch (err) {
      alert(`Gagal menyimpan agenda: ${err.message}`);
    } finally {
      confirmModalBtn.disabled = false;
      confirmModalBtn.textContent = 'Simpan ke Kalender';
    }
  });

  renderHeaderDate();
  loadEvents();
  window.setInterval(() => { if (!document.hidden) loadEvents(); }, 5000);
});




if (!window.syncChannel) {
  window.syncChannel = new BroadcastChannel('academiq_sync');
  window.syncChannel.onmessage = (event) => {
    if (event.data === 'REFRESH') {
      if (typeof loadDashboardData === 'function') loadDashboardData().catch(()=>{});
      if (typeof loadEvents === 'function') loadEvents().catch(()=>{});
      if (typeof loadSubjects === 'function') loadSubjects().catch(()=>{});
      if (typeof loadNotes === 'function') loadNotes().catch(()=>{});
      if (typeof loadTasks === 'function') loadTasks().catch(()=>{});
      if (typeof loadAllTasks === 'function') loadAllTasks().catch(()=>{});
    }
  };
}
