import express, { Response, Request, NextFunction, ErrorRequestHandler } from 'express'
import Cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import csrf from 'csurf'
import rateLimit from 'express-rate-limit'

dotenv.config()

const secretKey = process.env.SECRET_KEY as string

export const midRateLimiter = (windowMs : number = 60 * 1000, max : number = 1000 ) => {

    const midRateLimiter = rateLimit({
        windowMs: windowMs, // time frame
        max: max, // number of requests
        message: "Too many requests from this IP, please try again later.",
    })

    return midRateLimiter
}

export const midCSRFProtection = csrf({ 
    cookie: {
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
    }
})

export const midHandleCSRFError : ErrorRequestHandler = (err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {        
        return res.status(403).json({
            message: 'Something went wrong. Please refresh the page and try again.'
        })
    }
    next(err)
}

export const midSetCors = Cors({
    origin : ['http://localhost:5173', 'http://localhost:3000'],
    credentials : true,
    methods : ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders : ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-CSRF-Token']
})

export const midBodyParsers = [        
    express.json(),
    express.text(),
]

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

export const midCheckDuplicate = (req : Request, requestKeys : string[]) => {  
    
    const {auth} = req.cookies
    const authInfo = jwt.verify(auth, secretKey) as {id : string}
    const receivedKey = req.headers['idempotency-key'] as string
    const idempotencyKey = `${authInfo.id}${receivedKey}`
    const isDuplicate = requestKeys.find(key => key == idempotencyKey)
 
    if(!isDuplicate) {
        requestKeys.push(idempotencyKey)
    }
    
    return isDuplicate

}

