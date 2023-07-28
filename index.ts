const container = document.getElementsByClassName('container')[0];
const selectDateButton = container.getElementsByClassName('select-date-div')[0];
const editScheduleButton = container.getElementsByClassName('edit-schedule-div')[0];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

let currentMonth = 0;
let currentDay = 0;

type Day = Record<string, string | undefined>;

type Month = Record<string, Day | undefined>;

type BlurType = { target: { value: string } };

function isDay(data: unknown): data is Day {
  return (
    !!data &&
    typeof data === 'object' &&
    Object.keys(data).every((key) => typeof key === 'string') &&
    Object.values(data).every((value) => ['string', 'undefined'].includes(typeof value))
  );
}

function isMonth(data: unknown): data is Month {
  return (
    !!data &&
    typeof data === 'object' &&
    Object.keys(data).every((key) => typeof key === 'string') &&
    Object.values(data).every((value) => isDay(value) || typeof value === 'undefined')
  );
}

function getTargetElement<T extends HTMLElement>(className: string, tagsList: HTMLCollectionOf<T>): T | undefined {
  const searchedElement = [...tagsList].find((el) => [...el.classList].includes(className));
  return searchedElement;
}

(function setDate() {
  if (localStorage.getItem('date')) {
    const date = localStorage.getItem('date')?.split(',');
    const title = getTargetElement('title', document.getElementsByTagName('h2'));
    if (title && date)
      title.innerText = `Your timeline of affairs for ${date[0].slice(2, -1)} ${date[1]}, ${date[2].slice(0, -1)}`;
  }
})();

function openModal(isEdit?: boolean) {
  const monthModal = createMonthModal(isEdit);
  if (monthModal) container.appendChild(monthModal);
}

selectDateButton.addEventListener('click', () => openModal());
editScheduleButton.addEventListener('click', () => openModal(true));

function removeModal() {
  const overlay = document.getElementsByClassName('overlay')[0];
  if (overlay) container.removeChild(overlay);
}

function createMonthModal(isEdit?: boolean) {
  if (document.getElementsByClassName('overlay')[0]) return;

  const overlay = document.createElement('div');
  overlay.addEventListener('click', removeModal);
  overlay.classList.add('overlay');

  const modal = document.createElement('div');
  modal.addEventListener('click', (e) => e.stopPropagation());
  modal.classList.add('month-modal');

  for (let i = 0; i < MONTHS.length; i++) {
    const div = document.createElement('div');

    div.addEventListener('click', () => {
      currentMonth = i;
      showDays(isEdit);
    });
    div.classList.add('month');
    div.innerText = MONTHS[i];

    modal.appendChild(div);
  }

  overlay.appendChild(modal);
  return overlay;
}

function showDays(isEdit?: boolean) {
  const modal = document.getElementsByClassName('month-modal')[0];
  modal.replaceChildren();

  const year = new Date().getFullYear();
  const lastDay = new Date(year, currentMonth + 1, 0).getDate();

  for (let i = 1; i <= lastDay; i++) {
    const day = document.createElement('div');

    if (isEdit)
      day.addEventListener('click', () => {
        currentDay = i;
        showHours();
      });
    else
      day.addEventListener('click', () => {
        currentDay = i;
        showDateInTitle(year);
      });

    day.innerText = i.toString();
    day.classList.add('day');

    modal.appendChild(day);
  }
}

function showDateInTitle(year: number) {
  const title = getTargetElement('title', document.getElementsByTagName('h2'));
  const date = [MONTHS[currentMonth], currentDay, year];
  if (title) title.innerText = `Your timeline of affairs for ${date[0]} ${date[1]}, ${date[2]}`;
  localStorage.setItem('date', JSON.stringify(date));
  removeModal();
}

function showHours() {
  const modal = document.getElementsByClassName('month-modal')[0];
  modal.classList.add('column');
  modal.replaceChildren();

  const storageMonthData = localStorage.getItem(MONTHS[currentMonth]);
  const parsedMonthData: unknown = storageMonthData ? JSON.parse(storageMonthData) : null;
  const monthData = isMonth(parsedMonthData) ? parsedMonthData : {};
  const dayData = monthData[currentDay];

  for (let i = 0; i <= 23; i++) {
    const note = document.createElement('div');
    note.classList.add('note');

    const hour = document.createElement('p');
    hour.classList.add('hour');
    hour.innerText = `${i}:00`;
    note.appendChild(hour);

    const inputNote = document.createElement('input');
    inputNote.addEventListener('blur', (e) => addNotesToLocalStorage(e, i));
    inputNote.classList.add('input-note');

    if (dayData && Object.keys(dayData).find((el) => el === `${i}:00`)) {
      inputNote.value = dayData[`${i}:00`] ?? '';
    }
    note.appendChild(inputNote);

    modal.appendChild(note);
  }

  const closeButton = document.createElement('div');
  closeButton.classList.add('close-button');
  closeButton.innerText = 'Close';
  closeButton.addEventListener('click', removeModal);
  modal.appendChild(closeButton);
}

function addNotesToLocalStorage(e: Event, hour: number) {
  const parsedEvent = e as unknown as BlurType;
  const { value } = parsedEvent.target;

  const storageMonthData = localStorage.getItem(MONTHS[currentMonth]);
  const parsedMonthData: unknown = storageMonthData ? JSON.parse(storageMonthData) : null;
  const monthData = isMonth(parsedMonthData) ? parsedMonthData : {};
  const dayData = monthData[currentDay] ?? {};
  dayData[`${hour}:00`] = value;

  localStorage.setItem(MONTHS[currentMonth], JSON.stringify({ ...monthData, [currentDay]: dayData }));
}
