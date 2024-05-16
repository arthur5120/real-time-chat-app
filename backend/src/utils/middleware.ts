import express, { Response, Request, NextFunction } from "express";
import Cors from "cors";
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser"

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
    cookieParser(),
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

export const midGenerateToken = (payload : Object) => {
    const Token = jwt.sign(payload, secretKey)
    return Token
}

export const getRandomName = () => {
    const name = Math.floor(Math.random() * 1000)
    return `Room Number ${JSON.stringify(name)}`
}