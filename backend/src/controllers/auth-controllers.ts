import { modGetUserByEmail } from "../models/user-model"
import { midGenerateToken } from "../utils/middleware"
import { Request, Response, NextFunction } from "express"
import { generateUniqueId } from "../utils/middleware"
import { expirationCheck } from "../utils/middleware"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()
const secretKey = process.env.SECRET_KEY as string

type TUsers = {userId : string, guid : string, expirationTime : number}
let onlineUsers : TUsers[] = []
let usersToLogout : TUsers[] = []
let nextExpirationCheck = -1

setInterval(() => {
    const dateNow = Date.now()
    if (expirationCheck(nextExpirationCheck) || nextExpirationCheck == -1) {
        console.log(`Running Expiration Check`)        
        nextExpirationCheck = dateNow + (60 * 1000 * 5)
        if(onlineUsers.length > 0) {
            const newList = onlineUsers.filter((user) => !expirationCheck(user.expirationTime))
            onlineUsers = newList
        }
    }
    console.log(`Currently Online : ${onlineUsers.length}. \n Users to Logout : ${usersToLogout.length}. \n Next expiration check : ${((nextExpirationCheck - dateNow) / (1000 * 60)) | 0}m.`)
}, 5000)

export const conAuth = async (req : Request, res : Response) => {

    try {

        const user = await modGetUserByEmail(req, res) as {id : string}
        const guid = generateUniqueId()
        const payload = {...user, guid : guid}
        const token = midGenerateToken(payload)
        const expirationTime = Date.now() + 1000 * 60 * 15

        const onlineUserId = onlineUsers.findIndex((u) => u.userId == user?.id)
        const usersToLogoutId = onlineUserId != -1 ? usersToLogout.findIndex((u) => u.userId == user?.id) : 0

        if (onlineUserId != -1 && usersToLogoutId == -1) {
            usersToLogout.push(onlineUsers[onlineUserId])
            onlineUsers.splice(onlineUserId, 1)
        }

        onlineUsers.push({userId : user.id, guid : guid, expirationTime : expirationTime})

        return res.status(200).cookie('auth', token, {
                expires: new Date(Date.now() + 1000 * 60 * 15),
                httpOnly: true,
                maxAge: 1000 * 60 * 15,                
                sameSite: 'strict'
            }).json({success : true})
                    
    } catch (e) {
        return res.status(404).json({success : false, message : `Invalid email or password.`})
    }
    
}

export const conGetAuth = async (req : Request, res : Response) => {    
    
    const noAuthResponse = {
        id : 'none',
        authenticated:false,
        role:'none'
    }

    try {

        const {auth} = req.cookies
        const verifiedUser = jwt.verify(auth, secretKey) as {id : string, role : string, guid : string} | null                
        const usersToLogoutId = usersToLogout.findIndex((u) => u.guid == verifiedUser?.guid)
        
        if (usersToLogoutId != -1) {            
            usersToLogout.splice(usersToLogoutId, 1)
            return await res.status(200).clearCookie('auth').json(noAuthResponse)
        }

        res.json({
            id : verifiedUser?.id,
            authenticated:true,
            role:verifiedUser?.role
        })        

    } catch (e) {     
        res.json(noAuthResponse)
    }

}

export const conLogout = async (req : Request, res : Response) => {
    try {

        const {auth} = req.cookies
        const verifiedUser = jwt.verify(auth, secretKey) as {id : string, role : string, guid : string} | null
        const onlineUserId = onlineUsers.findIndex((u) => u.userId == verifiedUser?.id)
        
        if (verifiedUser?.id) {
            onlineUserId != -1 ? onlineUsers.splice(onlineUserId, 1) : ''
            return await res.status(200).clearCookie('auth').json({message:'logged off'})
        } else {
            return await res.status(500).json({message : 'Something went wrong'})    
        }

    } catch (e) {
        console.log(e)
        return await res.status(500).json({message : 'Something went wrong'})
    }
}

export const conGetCSRFToken = async (req: Request, res: Response) => {    
   try {        
        return res.status(200).json({ 
            CSRFToken: req.csrfToken()
        })
   } catch (e) {
        console.log(e)
        return await res.status(500).json({message : 'Something went wrong'})
   }
}