import { midGenerateToken } from "../utils/middleware";
import { Request, Response } from "express";

export const conAuth = async (req : Request, res : Response) => {
    try {        
        const token = midGenerateToken(req.body)
        res.cookie('auth', token).json({message : 'Authenticated'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }
}