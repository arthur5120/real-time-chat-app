import { Request, Response } from "express";

import { 
    modCreateMessage, 
    modUpdateMessage,
    modDeleteMessage, 
    modGetMessages,
    modGetMessageById,
    modGetMessagesByUserId, 
} from "../models/message-model";

const requestKeys : string[] = []

export const conCreateMessage = async (req : Request, res : Response) => {    

    const idempotencyKey = req.headers['idempotency-key'] as string
    const isDuplicated = requestKeys.find(key => key == idempotencyKey)

    if(isDuplicated) {        
        return res.send('Duplicated Request.')
    }

    requestKeys.push(idempotencyKey)

    try {
        await modCreateMessage(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conUpdateMessage = async (req : Request, res : Response) => {

    try {
        await modUpdateMessage(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conDeleteMessage = async (req : Request, res : Response) => {

    try {
        const msg = await modDeleteMessage(req, res)
        return res.status(200).send(msg)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conGetMessages = async (req : Request, res : Response) => {

    try {
        const msg = await modGetMessages()
        return res.status(200).send(msg)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conGetMessageById = async (req : Request, res : Response) => {

    try {
        const msg = await modGetMessageById(req, res)
        return res.status(200).send(msg)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conGetMessagesByUserId = async (req : Request, res : Response) => {

    try {
        const msg = await modGetMessagesByUserId(req, res)
        return res.status(200).send(msg)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}