import { Request, Response } from "express";
import { midBodyParsers } from "../utils/middleware";

import { 
    modCreateUser, 
    modDeleteUser, 
    modGetUserById, 
    modGetUsers, 
    modUpdateUser 
} from "../models/user-model";

export const conCreateUser = [midBodyParsers, async (req : Request, res : Response) => {
    try {
        await modCreateUser(req, res)
        res.status(200).json({message : 'User Created Successfully'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message : 'Internal Error'            
        })
    }
}]

export const conUpdateUser = [midBodyParsers, async (req : Request, res : Response) => {

    try {
        await modUpdateUser(req, res)
        res.status(200).json({message : 'User Updated Successfully'})

    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message : 'Internal Error'            
        })
    }
}]

export const conDeleteUser = async (req : Request, res : Response) => {

    try {
        await modDeleteUser(req, res)
        res.status(200).json({message : 'User Delete Successfully'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message : 'Internal Error'            
        })
    }
}

export const conGetUserById = async (req : Request, res : Response) => {

    try {        
        const user = await modGetUserById(req, res)        
        res.status(200).send(user)
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message : 'Internal Error'            
        })
    }
}

export const conGetUsers = async (req : Request, res : Response) => {

    try {
        const users = await modGetUsers(req, res)
        res.status(200).send(users)
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message : 'Internal Error'            
        })
    }
}