import { Request, Response } from "express"

import { 
    modCreateChat,
    modAddUserToChat,
    modDeleteChat,
    modRemoveUserFromChat,
    modGetChatById,
    modGetChats,
    getChatsByUserId,
    modDeleteAllChats,    
} from "../models/chat-model"

 import { midCheckDuplicated } from "../utils/middleware"

 const requestKeys : string[] = [] 

export const conCreateChat = async (req : Request, res : Response) => {

    try {
    
        const isDuplicated = midCheckDuplicated(req, requestKeys)

        if(isDuplicated) {                        
            return res.status(400).json({message : `Duplicated Request`})
        }
    
        await modCreateChat(req, res)
        return res.status(200).json({message : 'Success'})

    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }
    
}

export const conAddUserToChat = async (req : Request, res : Response) => {

    try {
        await modAddUserToChat(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conDeleteChat = async (req : Request, res : Response) => {

    try {
        await modDeleteChat(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conDeleteAllChats = async (req : Request, res : Response) => {

    try {
        await modDeleteAllChats(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conRemoveUserFromChat = async (req : Request, res : Response) => {

    try {
        await modRemoveUserFromChat(req, res)
        return res.status(200).json({message : 'Success'})
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
        return res.status(500).json({message : 'Internal Error'})
    }

}

export const conGetChatsByUserId = async (req : Request, res : Response) => {

    try {

        const chats = await getChatsByUserId(req, res)
        return res.status(200).send(chats)
        
    } catch (e) {
        return res.status(500).json({message : 'Internal Error'})
    }
    
}

export const conGetChats = async (req : Request, res : Response) => {

    try {

        const chats = await modGetChats(req, res)
        return res.status(200).send(chats)

    } catch (e) {
        return res.status(500).json({message : 'Internal Error'})
    }

}
