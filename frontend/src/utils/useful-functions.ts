export const capitilizeFirst = (string : string) : string => {
    const newString = string.charAt(0).toUpperCase() + string.slice(1);
    return newString
}

export const getTime = (value : number) => {
    const timeNow = Date.now()
    const diff = timeNow - value
    const timeSeconds = Math.min((diff) / 1000, 59) | 0
    const timeMinutes = Math.min((diff) / 60000, 59) | 0
    const timeHours = Math.min((diff) / 3600000, 23) | 0
    const timeDays = Math.floor((diff) / 86400000) | 0
    return `
    ${timeHours > 0 ? timeHours + 'h' : ''}
    ${timeMinutes > 0 ? timeMinutes + 'm' : ''}
    ${timeSeconds > 0 ? timeSeconds + 's' : ''}
    ${timeDays > 0 ? timeDays + 'd' : ''}
    ${ (diff < 1000) ? 'Now' : 'ago'}`
}