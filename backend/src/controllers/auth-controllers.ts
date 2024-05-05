import { modGetUserByEmail } from "../models/user-model";
import { midGenerateToken } from "../utils/middleware";
import { Request, Response } from "express";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const secretKey = process.env.SECRET_KEY as string

export const conAuth = async (req : Request, res : Response) => {    

    try {

        const user = await modGetUserByEmail(req, res) as Object
        const token = midGenerateToken(user)

        return res.status(200).cookie('auth', token, {
                expires: new Date(Date.now() + 1000 * 60 * 5),
                httpOnly: true,
                maxAge: 1000 * 60 * 5,
                sameSite: 'strict'
            }).json({success : true})
                    
    } catch (e) {
        return res.status(404).json({success : false})
    }
    
}

export const conGetAuth = async (req : Request, res : Response) => {   

    const {auth} = req.cookies         

    try {

        const verifiedUser = jwt.verify(auth, secretKey) as {id : string, role : string} | null 
        res.json({
            id : verifiedUser?.id,
            authenticated:true, 
            role:verifiedUser?.role
        })

    } catch (e) {     

        res.json({
            id : 'none',
            authenticated:false, 
            role:'none'
        })

    }

}

export const conLogout = async (req : Request, res : Response) => {
    try {
        return await res.clearCookie('auth').json({'message':'logged off'})
    } catch (e) {
        console.log(e)
        return await res.json({'message' : 'Something went wrong'})
    }
}