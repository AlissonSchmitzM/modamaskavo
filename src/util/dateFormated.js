function getDateCurrent() {
    const d = new Date();
    return `${(`0${d.getDate()}`).slice(-2)}-${(`0${d.getMonth() + 1}`)
        .slice(-2)}-${d.getFullYear()}`;
}

function getTimeCurrent() {
    const d = new Date();
    return `${(`0${d.getHours()}`).slice(-2)}:${(`0${d.getMinutes()}`).slice(-2)}`;
}

function toISOFormat(dateString) {
    const [DD, MM, YYYY] = dateString.split('-');

    return `${YYYY}-${MM}-${DD}`;
}

export default { getDateCurrent, getTimeCurrent, toISOFormat };
