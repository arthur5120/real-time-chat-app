import express, { Response, Request, NextFunction } from "express";
import Cors from "cors";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

dotenv.config()

const secretKey = process.env.SECRET_KEY as string
const secretSalt = parseInt(process.env.SECRET_SALT as string)

export const midSetCors = Cors({
    origin : 'http://localhost:5173',
    credentials : true,
    methods : 'POST, PUT, DELETE, UPDATE', 
    allowedHeaders : 'Content-Type',  
})

export const midBodyParsers = [    
    express.json(),
    express.text()
]

export const midHashPassword = async (password : string) => {
    const hashedPassword = await bcrypt.hash(password, secretSalt)
    return hashedPassword
}

export const midComparePasswrod = (password : string, hashedPassword : string) => {
    const result = bcrypt.compare(password, hashedPassword)
    return result
}

export const test = (payload : Object) => {
    jwt.sign(payload, secretKey, {
        expiresIn : 1000 * 60 * 5,
            
    })
}