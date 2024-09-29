import express, { Response, Request, NextFunction } from 'express'
import Cors from 'cors'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { v4 as uuidv4 } from 'uuid'
import { roomAdjectives, roomColors, roomCreatures, roomNames } from './other-resources'
import csrf from 'csurf'

dotenv.config()

const secretKey = process.env.SECRET_KEY as string
const secretSalt = parseInt(process.env.SECRET_SALT as string)

export const csrfProtection = csrf({ 
    cookie: {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
    }
})

export const midSetCors = Cors({
    origin : ['http://localhost:5173', 'http://localhost:3000'],
    credentials : true,
    methods : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders : ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-CSRF-Token']
})

export const midBodyParsers = [    
    cookieParser(),    
    express.json(),
    express.text(),
]

export const midHashPassword = async (password : string) => {
    const hashedPassword = await bcrypt.hash(password, secretSalt)
    return hashedPassword
}

export const midComparePasswrod = (password : string, hashedPassword : string) => {
    const result = bcrypt.compare(password, hashedPassword)
    return result
}

export const midGenerateToken = (payload : Object) => {
    const Token = jwt.sign(payload, secretKey)
    return Token
}

export const midGetRandomName = () => {

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

export const midCheckAuth = async (req : Request, res : Response, next : NextFunction) => {               
    try {
        const {auth} = req.cookies
        jwt.verify(auth, secretKey)      
        next()
    } catch (e) {             
        return res.status(403).json({message : 'Not Authenticated/Authorized'})
    }
}

export const midCheckAllowed = async (req : Request, res : Response, next : NextFunction) => { 

    try {

        const {auth} = req.cookies
        const authInfo = jwt.verify(auth, secretKey) as {role : 'User' | 'Admin'}

        if(authInfo.role == 'User') {
            return res.status(403).json({message : 'Not Authenticated/Authorized'})
        } else {
            next()
        }

    } catch (e) {             
        return res.status(403).json({message : 'Not Authenticated/Authorized'})
    }

}

export const midCheckDuplicated = (req : Request, requestKeys : string[]) => {  
    
    const {auth} = req.cookies
    const authInfo = jwt.verify(auth, secretKey) as {id : string}
    const receivedKey = req.headers['idempotency-key'] as string
    const idempotencyKey = `${authInfo.id}${receivedKey}`
    const isDuplicated = requestKeys.find(key => key == idempotencyKey)
 
    if(!isDuplicated) {
        requestKeys.push(idempotencyKey)
    }
    
    return isDuplicated

}

export const generateUniqueId = () => {
    const optimisticId = uuidv4()
    return optimisticId
}

export const expirationCheck = (expirationTime : number) => {
    const dateNow = Date.now()
    return (dateNow - expirationTime) >= 0
}