import { modGetUserByEmail } from "../models/user-model";
import { midGenerateToken } from "../utils/middleware";
import { Request, Response } from "express";

export const conAuth = async (req : Request, res : Response) => {    
    try {
        const user = await modGetUserByEmail(req, res)
        const token = midGenerateToken(req.body)
        return res.status(200).cookie('auth', token).send(user)
    } catch (e) {
        return res.status(404).send(null)
    }
}