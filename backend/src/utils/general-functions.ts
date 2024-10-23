import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { roomAdjectives, roomColors, roomCreatures, roomNames } from './other-resources'

dotenv.config()

const secretKey = process.env.SECRET_KEY as string
const secretSalt = parseInt(process.env.SECRET_SALT as string)

export const genGenerateToken = (payload : Object) => {
    const Token = jwt.sign(payload, secretKey)
    return Token
}

export const genHashPassword = async (password : string) => {
    const hashedPassword = await bcrypt.hash(password, secretSalt)
    return hashedPassword
}

export const genComparePasswrod = (password : string, hashedPassword : string) => {
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

export const genGetErrorMessage = (e ? : unknown) => {    
    
    const defaultError = {
        error : `Internal Error`,
        success : false,        
        message : `Something went wrong`,
        timestamp: new Date().toISOString(),
        statusCode: 500,
    }
    
    if (e instanceof Error) {
        return { 
            ...defaultError, 
            message: e.message || `Something went wrong`,            
        }
    }

    return defaultError
}