import { Request, Response } from "express"

import { 
    modCreateUser, 
    modDeleteUser, 
    modGetUserById, 
    modGetUsers, 
    modUpdateUser 
} from "../models/user-model"

import { genGetErrorMessage } from "../utils/general-functions"

export const conCreateUser = async (req : Request, res : Response) => {

    try {
    
        await modCreateUser(req, res)
        return res.status(200).json({message : 'User Created Successfully'})

    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
    
}

export const conUpdateUser = async (req : Request, res : Response) => {

    try {
        await modUpdateUser(req, res)
        return res.status(200).json({message : 'User Updated Successfully'})

    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
}

export const conDeleteUser = async (req : Request, res : Response) => {

    try {
        await modDeleteUser(req, res)
        return res.status(200).json({message : 'User Delete Successfully'})
    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
}

export const conGetUserById = async (req : Request, res : Response) => {

    try {        
        const user = await modGetUserById(req, res)        
        return res.status(200).send(user)
    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
}

export const conGetUsers = async (req : Request, res : Response) => {

    try {
        const users = await modGetUsers(req, res)
        return res.status(200).send(users)
    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
}