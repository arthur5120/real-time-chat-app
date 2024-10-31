import express, { Response, Request, NextFunction, ErrorRequestHandler } from 'express'
import Cors from 'cors'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import csrf from 'csurf'
import rateLimit from 'express-rate-limit'
import { idempotency } from 'express-idempotency'

dotenv.config()

const secretKey = process.env.SECRET_KEY as string

export const midIdempotency = idempotency({
    idempotencyKeyHeader: 'Idempotency-Key',
})

export const midRateLimiter = (windowMs : number = 60 * 1000, max : number = 1000 ) => {

    const midRateLimiter = rateLimit({
        windowMs: windowMs, // time frame
        max: max, // number of requests
        message: "Too many requests from this IP, please try again later.",
    })

    return midRateLimiter
}

export const midCSRFGuard = csrf({     
    cookie: {
        key : `_csrf`,
        httpOnly: false,
        secure: false,
        sameSite: 'strict',
    }
})

export const midCSRFConditionalGuard = (req : Request, res : Response, next: NextFunction) => {

    const allowedRoutes = [`/obscure-data`,`/reveal-data`,]

    if (allowedRoutes.includes(req.path)) {
        return next()
    }
    
    midCSRFGuard(req, res, next)
}

export const midHandleErrors : ErrorRequestHandler = (err, req, res, next) => {    

    if (err.code === 'EBADCSRFTOKEN') {        
        console.log(`Middleware error : BAD CSRF Token`)        
        console.log('Token from Client:', req.headers['x-csrf-token'])
        return res.status(403).json({
            message: 'Something went wrong. Please refresh the page and try again.',
            success : false,
        })
    }

    if (err.message.includes('idempotency')) {
        console.log(`Middleware error : Duplicate request detected`)
        return res.status(400).json({
            message: 'Duplicate request detected.',
            success : false,
        })
    }

    if(res.headersSent) {
        return
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
    express.urlencoded({extended : true}),
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