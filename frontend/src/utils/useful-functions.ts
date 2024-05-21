import { TChatMessage } from "./types";

export const capitalizeFirst = (string : string) : string => {
    const newString = string.charAt(0).toUpperCase() + string.slice(1);
    return newString
}

export const getTime = (value: number) => {

    const timeNow = Date.now()
    const diff = timeNow - value

    const timeSeconds = Math.floor((diff / 1000) % 60)
    const timeMinutes = Math.floor((diff / 60000) % 60)
    const timeHours = Math.floor((diff / 3600000) % 24)
    const timeDays = Math.floor(diff / 86400000)

    return `
    ${timeDays > 0 ? timeDays + 'd' : ''}
    ${timeHours > 0 ? timeHours + 'h' : ''}
    ${timeMinutes > 0 ? timeMinutes + 'm' : ''}
    ${timeSeconds > 0 ? timeSeconds + 's' : ''}
    ${diff < 1000 ? 'Now' : 'ago'}
    `
}

export const convertDatetimeToMilliseconds = (dateString : string) => { // Datetime To Milliseconds
    const date = new Date(dateString)
    const milliseconds = date.getTime()
    return milliseconds
}

export const sortByMilliseconds = (unsorted : TChatMessage[]) => {
    const sorted = unsorted.sort((a, b) => a.when - b.when)
    return sorted
}