"use strict";
const container = document.getElementsByClassName('container')[0];
const selectDateButton = container.getElementsByClassName('select-date-div')[0];
function getTargetElement(className, tagsList) {
    const searchedElement = [...tagsList].find((el) => [...el.classList].includes(className));
    return searchedElement;
}
const months = [
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
function removeModal() {
    const overlay = document.getElementsByClassName('overlay')[0];
    if (overlay)
        container.removeChild(overlay);
}
function createMonthModal() {
    if (document.getElementsByClassName('overlay')[0])
        return;
    const overlay = document.createElement('div');
    overlay.addEventListener('click', removeModal);
    overlay.classList.add('overlay');
    const modal = document.createElement('div');
    modal.addEventListener('click', (e) => e.stopPropagation());
    modal.classList.add('month-modal');
    for (let i = 0; i < months.length; i++) {
        const div = document.createElement('div');
        div.addEventListener('click', () => showDays(i));
        div.classList.add('month');
        div.innerText = months[i];
        modal.appendChild(div);
    }
    overlay.appendChild(modal);
    return overlay;
}
function showDays(monthIndex) {
    const modal = document.getElementsByClassName('month-modal')[0];
    modal.replaceChildren();
    const year = new Date().getFullYear();
    const lastDay = new Date(year, monthIndex + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
        const day = document.createElement('div');
        day.addEventListener('click', () => addDate(year, monthIndex, i));
        day.innerText = i.toString();
        day.classList.add('day');
        modal.appendChild(day);
    }
}
function addDate(year, monthIndex, dayNumber) {
    const title = getTargetElement('title', document.getElementsByTagName('h2'));
    if (title)
        title.innerText = `Your timeline of affairs for ${months[monthIndex]} ${dayNumber}, ${year}`;
    removeModal();
}
function selectDate() {
    const monthModal = createMonthModal();
    if (monthModal)
        container.appendChild(monthModal);
}
selectDateButton.addEventListener('click', selectDate);
