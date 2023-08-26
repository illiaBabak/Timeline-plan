"use strict";
const container = document.getElementsByClassName('container')[0];
const main = container.getElementsByClassName('main')[0];
const selectDateButton = container.getElementsByClassName('select-date-div')[0];
const editScheduleButton = container.getElementsByClassName('edit-schedule-div')[0];
const { body: bodyTag } = document;
const LINE_DELAY_DURATION = 1.5;
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
];
let currentMonth = 0;
let currentDay = 0;
function isDayObject(data) {
    return (!!data &&
        typeof data === 'object' &&
        Object.keys(data).every((key) => typeof key === 'string') &&
        Object.values(data).every((value) => ['string', 'undefined'].includes(typeof value)));
}
function isMonth(data) {
    return (!!data &&
        typeof data === 'object' &&
        Object.keys(data).every((key) => typeof key === 'string') &&
        Object.values(data).every((value) => isDayObject(value) || typeof value === 'undefined'));
}
function isDay(data) {
    return Array.isArray(data) && data.every((value) => ['string', 'number'].includes(typeof value));
}
function getTargetElement(className, tagsList) {
    const searchedElement = [...tagsList].find((el) => [...el.classList].includes(className));
    return searchedElement;
}
function showDate() {
    const date = localStorage.getItem('date');
    if (date) {
        const parsedDate = JSON.parse(date);
        const validDate = isDay(parsedDate) ? parsedDate : [];
        const title = getTargetElement('title', document.getElementsByTagName('h2'));
        if (title && validDate.length) {
            title.innerText = `Your timeline of affairs for ${validDate.join(', ')}`;
        }
    }
}
showDate();
function openModal(isEdit) {
    bodyTag.classList.add('hide-scroll');
    const monthModal = createMonthModal(isEdit);
    if (monthModal)
        container.appendChild(monthModal);
}
selectDateButton.addEventListener('click', () => openModal());
editScheduleButton.addEventListener('click', () => openModal(true));
function removeModal() {
    drawGraph();
    bodyTag.classList.remove('hide-scroll');
    const overlay = document.getElementsByClassName('overlay')[0];
    if (overlay)
        container.removeChild(overlay);
}
function createMonthModal(isEdit) {
    if (document.getElementsByClassName('overlay')[0])
        return;
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
function showDays(isEdit) {
    const modal = document.getElementsByClassName('month-modal')[0];
    modal.replaceChildren();
    const year = new Date().getFullYear();
    const lastDay = new Date(year, currentMonth + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
        const day = document.createElement('div');
        day.innerText = i.toString();
        day.classList.add('day');
        if (isEdit)
            day.addEventListener('click', () => {
                currentDay = i;
                showHours();
            });
        else
            day.addEventListener('click', () => {
                currentDay = i;
                const date = JSON.stringify([MONTHS[currentMonth], currentDay, year]);
                localStorage.setItem('date', date);
                showDate();
                drawGraph();
                removeModal();
            });
        modal.appendChild(day);
    }
}
function showHours() {
    const modal = document.getElementsByClassName('month-modal')[0];
    modal.classList.add('column');
    modal.replaceChildren();
    const storageMonthData = localStorage.getItem(MONTHS[currentMonth]);
    const parsedMonthData = storageMonthData ? JSON.parse(storageMonthData) : null;
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
function addNotesToLocalStorage(e, hour) {
    const parsedEvent = e;
    const { value } = parsedEvent.target;
    const storageMonthData = localStorage.getItem(MONTHS[currentMonth]);
    const parsedMonthData = storageMonthData ? JSON.parse(storageMonthData) : null;
    const monthData = isMonth(parsedMonthData) ? parsedMonthData : {};
    const dayData = monthData[currentDay] ?? {};
    dayData[`${hour}:00`] = value;
    localStorage.setItem(MONTHS[currentMonth], JSON.stringify({ ...monthData, [currentDay]: dayData }));
}
function drawGraph() {
    const date = localStorage.getItem('date');
    const parsedDate = date ? JSON.parse(date) : null;
    const validDate = isDay(parsedDate) ? parsedDate : [];
    if (validDate && typeof validDate[0] === 'string') {
        const storageMonthData = localStorage.getItem(validDate[0]);
        const parsedMonthData = storageMonthData ? JSON.parse(storageMonthData) : null;
        const monthData = isMonth(parsedMonthData) ? parsedMonthData : {};
        const dayData = monthData[Number(validDate[1])];
        if (isDayObject(dayData)) {
            const sortedKeys = Object.keys(dayData).sort((a, b) => {
                const hourA = Number(a.split(':')[0]);
                const hourB = Number(b.split(':')[0]);
                return hourA - hourB;
            });
            if (dayData) {
                const sortedDayData = {};
                sortedKeys.forEach((key) => {
                    sortedDayData[key] = dayData[key] ?? '';
                });
                createGraph(sortedDayData);
            }
        }
        else
            main.replaceChildren();
    }
}
drawGraph();
function addZero(time) {
    return parseInt(time, 10) < 10 ? `0${time}` : time;
}
function createGraph(data) {
    main.replaceChildren();
    for (let i = 0; i < Object.keys(data).length; i++) {
        const graphBlock = document.createElement('div');
        const firstCol = document.createElement('div');
        firstCol.classList.add('first-col');
        const line = document.createElement('div');
        line.classList.add('line');
        line.style.animationDelay = `${i * LINE_DELAY_DURATION}s`;
        firstCol.appendChild(line);
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.style.animationDelay = `${i * LINE_DELAY_DURATION + 0.5}s`;
        firstCol.appendChild(circle);
        const secondCol = document.createElement('div');
        secondCol.style.animationDelay = `${i * LINE_DELAY_DURATION + 1}s`;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message-div');
        const message = document.createElement('div');
        message.classList.add('message');
        secondCol.appendChild(messageDiv);
        const title = document.createElement('h3');
        title.classList.add('title-message');
        title.innerText = addZero(Object.keys(data)[i]);
        message.appendChild(title);
        const description = document.createElement('p');
        description.classList.add('description');
        description.innerText = Object.values(data)[i];
        message.appendChild(description);
        const triangle = document.createElement('div');
        triangle.classList.add('triangle');
        messageDiv.appendChild(triangle);
        messageDiv.appendChild(message);
        if (i % 2 == 0) {
            secondCol.classList.add('second-col-rotate');
            graphBlock.classList.add('graph-block-left');
            graphBlock.appendChild(secondCol);
            graphBlock.appendChild(firstCol);
        }
        else {
            secondCol.classList.add('second-col');
            graphBlock.classList.add('graph-block-right');
            graphBlock.appendChild(firstCol);
            graphBlock.appendChild(secondCol);
        }
        main.appendChild(graphBlock);
    }
}
