import { Request, Response } from "express"

import { 
    modCreateChat, 
    modDeleteChat, 
    modUpdateChat,
    modGetChats,
    modGetChatById,
} from "../models/chat-model"

export const conCreateChat = async (req : Request, res : Response) => {
    try {
        await modCreateChat(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }
}

export const conUpdateChat = async (req : Request, res : Response) => {
    try {
        await modDeleteChat(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }
}


export const conDeleteChat = async (req : Request, res : Response) => {
    try {
        await modUpdateChat(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }
}

export const conGetChats = async (req : Request, res : Response) => {
    try {
        const chat = await modGetChats()
        return res.status(200).send(chat)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }
}

export const conGetChatById = async (req : Request, res : Response) => {
    try {
        const chat = await modGetChatById(req, res)
        return res.status(200).send(chat)
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }
}