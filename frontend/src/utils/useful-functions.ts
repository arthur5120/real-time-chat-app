import { TChatMessage } from "./types";

import { v4 as uuidv4 } from "uuid";

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

    const timeString = `${timeDays > 0 ? timeDays + 'd' : ''}
    ${timeHours > 0 ? timeHours + 'h' : ''}
    ${timeMinutes > 0 ? timeMinutes + 'm' : ''}
    ${timeSeconds > 0 ? timeSeconds + 's' : ''}
    ${diff < 1000 ? 'Now' : 'ago'}`

    return timeString.trim()
}

export const convertDatetimeToMilliseconds = (dateString : string) => { // Datetime To Milliseconds
    const date = new Date(dateString)
    const milliseconds = date.getTime()
    return milliseconds
}

export const sortByMilliseconds = (unsorted : TChatMessage[]) => {
    const sorted = unsorted.sort((a, b) => a.created_at - b.created_at)
    return sorted
}

export const sortByAlphabeticalOrder = <T extends { name: string }>(unsorted: T[]) => {
    const sorted = unsorted.sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
    })
    return sorted
}

export const generateUniqueId = () => {
    const optimisticId = uuidv4()
    return optimisticId
}

export const getConfig = (uuid : string) => {
    return {headers: {'Idempotency-Key': uuid}}
}

export const cropMessage = (msg : string, limit : number = 20) => {
    const croppedMessage = msg.trim().slice(0, limit)
    return msg.length <= limit ? croppedMessage : `${croppedMessage}...`
}