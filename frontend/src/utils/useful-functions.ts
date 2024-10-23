import { TChatMessage } from "./types"
import { v4 as uuidv4 } from "uuid"
import Cookies from 'js-cookie'
import { checkCSRFToken } from "./axios-functions";

export const capitalizeFirst = (string : string) : string => {
    const newString = string.charAt(0).toUpperCase() + string.slice(1);
    return newString
}

export const getTimeElapsed = (value: number) => {

    const timeNow = Date.now()
    const diff = timeNow - value

    const timeSeconds = Math.floor((diff / 1000) % 60)
    const timeMinutes = Math.floor((diff / 60000) % 60)
    const timeHours = Math.floor((diff / 3600000) % 24)
    const timeDays = Math.floor(diff / 86400000)    
    const timeYears = Math.floor(timeDays / 365)
    const timeMonths = Math.floor((timeDays % 365) / 30)
    
    const timeYearsStr = timeYears > 0 ? `${timeYears}y` : ``
    const timeMonthsStr = timeMonths > 0 ? `${timeMonths}mo` : ``
    const timeDaysStr = timeDays > 0 ? `${timeDays}d` : ``
    const timeHoursStr = timeHours > 0 ? `${timeHours}h` : ``
    const timeMinutesStr = timeMinutes > 0 ? `${timeMinutes}m` : ``
    const timeSecondsStr = timeSeconds > 0 ? `${timeSeconds}s` : ``
    
    const timeString = `${timeYearsStr} ${timeMonthsStr} ${timeDaysStr} ${timeHoursStr} ${timeMinutesStr} ${timeSecondsStr} ${diff < 1000 ? 'Now' : 'ago'}`
    
    return timeString.trim()
}

export const getFormattedDate = (localDate ? : Date) => {
    const currentDate = localDate || new Date()
    const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`
    return formattedDate
}

export const getFormattedTime = (localDate ? : Date): string => {
    const currentDate = localDate || new Date()
    const currentHours = currentDate.getHours().toString().padStart(2, '0')
    const currentMinutes = currentDate.getMinutes().toString().padStart(2, '0')
    const currentSeconds = currentDate.getSeconds().toString().padStart(2, '0')
    const formattedTime = `${currentHours}:${currentMinutes}:${currentSeconds}`
    return formattedTime
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

export const sortAlphabeticallyByName = <T extends { name : string }>(unsorted: T[]) => {
    const sorted = unsorted.sort((a, b) => {
        if (a.name.trim().toLocaleLowerCase().replace(/\s+/g, ' ') < b.name.trim().toLocaleLowerCase().replace(/\s+/g, ' ')) return -1
        if (a.name.trim().toLocaleLowerCase().replace(/\s+/g, ' ') > b.name.trim().toLocaleLowerCase().replace(/\s+/g, ' ')) return 1
        return 0
    })
    return sorted
}

export const sortAlphabeticallyByAny = <T extends {[index: string]: string}>(unsorted: T[], property ? : string, reverse ? : boolean) => {
    const sorted = unsorted.sort((a, b) => {
        if (!property || !a[property] || !b[property]) return 0
        if (a[property].trim().toLocaleLowerCase().replace(/\s+/g, ' ') < b[property].trim().toLocaleLowerCase().replace(/\s+/g, ' ')) return -1
        if (a[property].trim().toLocaleLowerCase().replace(/\s+/g, ' ') > b[property].trim().toLocaleLowerCase().replace(/\s+/g, ' ')) return 1
        return 0
    })
    return reverse ? sorted.reverse() : sorted
}

export const sortChronogicallyByAny = <T extends {[index: string]: string}>(unsorted: T[], property : string, reverse ? : boolean) => {    
    try {
        const sorted = unsorted.sort((a, b) => {
            const dateA = a[property] ? new Date(a[property]) : null
            const dateB = b[property] ? new Date(b[property]) : null
            if (!dateA || !dateB) {return 0}
            if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {return 0}
            if (dateA.getTime() < dateB.getTime()) return -1
            if (dateA.getTime() > dateB.getTime()) return 1
            return 0
        })        
        return reverse ? sorted.reverse() : sorted
    } catch(e) {
        return []
    }
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

export const  getItemFromString = (str : string, arr : string[]) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    hash = (hash & 0x7FFFFFFF) % arr.length
    return arr[hash]
}

export const isThingValid = (input : string | number | object | any[] | undefined | null) : boolean => {
    try { // Accepts empty arrays
         if (input == undefined || input == null) {
             return false
         }
         if (typeof input == `string` && input?.trim() == ``) {
             return false
         }
         if (typeof input == `number` && isNaN(input)) {
             return false
         }
         if (typeof input == `object` && Object.keys(input).length == 0) {
             return false
         }
         return true
    } catch (e) {
         return false
    }   
 }

export const isThingValidSpecific = (input : any) : boolean => {
   try {
        if (input == undefined || input == null) {
            return false
        }
        if (typeof input == `string` && input?.trim() == ``) {
            return false
        }
        if (typeof input == `string` && input?.trim() == `0`) {
            return false
        }
        if (typeof input == `string` && input?.trim() == `-1`) {
            return false
        }        
        if (typeof input == `number` && input <= 0) {
            return false
        }
        if (typeof input == `number` && isNaN(input)) {
            return false
        }
        if (typeof input == `object` && Object.keys(input).length == 0) {
            return false
        }
        if (Array.isArray(input) && input.length == 0) {
            return false
        }
        return true
   } catch (e) {
        return false
   }   
}

export const getCSRFCookie = (csrfCookieName ? : string) => {
    const res = csrfCookieName ? Cookies.get(csrfCookieName) : Cookies.get(`_csrf`)
    return res
}

export const verifyCSRFToken = async (csrfToken ? : string) => {
    try {
        const res = await checkCSRFToken(csrfToken)
        return res.success
    } catch(e) {
        return false
    }
}
