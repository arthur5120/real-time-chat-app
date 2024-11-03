import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { roomAdjectives, roomColors, roomCreatures, roomNames } from './other-resources'

dotenv.config()

const secretKey = process.env.SECRET_KEY as string
const secretSalt = parseInt(process.env.SECRET_SALT as string)
const obString = process.env.OB_STRING as string
const obInterval = parseInt(process.env.OB_INTERVAL as string)

export const genGenerateToken = (payload : Object) => {
    const Token = jwt.sign(payload, secretKey)
    return Token
}

export const genHashPassword = async (password : string) => {
    const hashedPassword = await bcrypt.hash(password, secretSalt)
    return hashedPassword
}

export const genComparePassword = (password : string, hashedPassword : string) => {
    const result = bcrypt.compare(password, hashedPassword)    
    return result
}

export const genGenerateUniqueId = () => {
    const optimisticId = uuidv4()
    return optimisticId
}

export const genExpirationCheck = (expirationTime : number) => {
    const dateNow = Date.now()
    return (dateNow - expirationTime) >= 0
}

export const genGetRandomName = () => {

    const randomNumber = Math.floor(Math.random() * 999)
    const randomRoomNumber = Math.floor(Math.random() * (roomNames.length - 1))
    const roomName = roomNames[randomRoomNumber]
    
    const generatedName = `
      ${roomAdjectives[randomNumber % 10]}
      ${roomColors[Math.floor(randomNumber / 10) % 10]}  
      ${roomCreatures[Math.floor(randomNumber / 100) % 10]} 
      ${roomName}
    `

    return `${generatedName}`
}

export const genGetError = (desc ? : string) => {    
    const newError = new Error(desc || `Unknown Error`)
    newError.name = `CustomError`
    return newError
}

export const genGetErrorMessage = (e ? : unknown, statusCode : number = 500) => {   
    
    const isObjectWithMessage = e && typeof e === 'object' && 'message' in e
    
    const defaultError = {
        error : `Internal Error`,
        success : false,        
        message : `Something went wrong`,
        timestamp: new Date().toISOString(),
        statusCode: statusCode,
    }
    
    if (e instanceof Error || isObjectWithMessage) {
        return { 
            ...defaultError, 
            message: e.message || `Something went wrong`,            
        }
    }

    return defaultError
}

export const obscureData = (rawString : string, salt : string = obString, interval : number = obInterval) => {
    let obscuredString = ``, j = 0
    const salt_l = salt.length, rawString_l = Math.min(rawString.length, 200)
    for(let i = 0 ; i < rawString_l; i++) {
      const shouldAdd = j >= interval
      const randomLetter = shouldAdd ? salt[Math.random() * salt_l | 0] : ``                
      obscuredString = `${obscuredString}${rawString[i]}${randomLetter}`
      j = j >= interval ? 0 : j + 1
    }
    return obscuredString
  }

export const revealData = (obscuredString : string, interval : number = obInterval) => {
    let revealedString = ``, j = 0
    const obscuredString_l = Math.min(obscuredString.length, 200)
    for(let i = 0 ; i < obscuredString_l; i++) {                  
      if (j <= interval) {
        revealedString = `${revealedString}${obscuredString[i]}`                
      }
      j = j >= interval + 1 ? 0 : j + 1
    }
    return revealedString
}