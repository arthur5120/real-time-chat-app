import { modGetUserByEmail } from "../models/user-model";
import { midGenerateToken } from "../utils/middleware";
import { Request, Response } from "express";

export const conAuth = async (req : Request, res : Response) => {    

    try {

        const user = await modGetUserByEmail(req, res)
        const token = midGenerateToken(req.body)

        return (
            res.status(200).send(user).cookie('auth', token, {
                expires: new Date(Date.now() + 1000 * 60 * 5),
                httpOnly: true, 
                maxAge: 1000 * 60 * 5,
                sameSite: 'strict'
            })
        )

    } catch (e) {
        return res.status(404).send(null)
    }
    
}