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
    modGetUsersByChatId,    
} from "../models/chat-model"

import { genGetErrorMessage } from "../utils/general-functions"

export const conCreateChat = async (req : Request, res : Response) => {
    try {            
        await modCreateChat(req, res)      
    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
    if(!res.headersSent) {
        return res.status(200).json({message : 'Success'})
    }    
}

export const conAddUserToChat = async (req : Request, res : Response) => {

    try {
        await modAddUserToChat(req, res)        
    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
    if(!res.headersSent) {
        return res.status(200).json({message : 'Success'})
    } 
}

export const conDeleteChat = async (req : Request, res : Response) => {

    try {
        await modDeleteChat(req, res)        
    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
    if(!res.headersSent) {
        return res.status(200).json({message : 'Success'})
    } 
}

export const conDeleteAllChats = async (req : Request, res : Response) => {

    try {
        await modDeleteAllChats(req, res)        
    } catch (e) {
        console.log(e)        
        return res.status(500).json(genGetErrorMessage(e))        
    }
    if(!res.headersSent) {
        return res.status(200).json({message : 'Success'})
    } 
}

export const conRemoveUserFromChat = async (req : Request, res : Response) => {

    try {
        await modRemoveUserFromChat(req, res)        
    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
    if(!res.headersSent) {
        return res.status(200).json({message : 'Success'})
    } 
}

export const conGetChatById = async (req : Request, res : Response) => {

    try {
        const chat = await modGetChatById(req, res)
        if(!res.headersSent) {
            return res.status(200).send(chat)
        }
    } catch (e) {
        return res.status(500).json(genGetErrorMessage(e))
    }

}

export const conGetChatsByUserId = async (req : Request, res : Response) => {

    try {
        const chats = await getChatsByUserId(req, res)
        return res.status(200).send(chats)        
    } catch (e) {
        return res.status(500).json(genGetErrorMessage(e))
    }
    
}

export const conGetChats = async (req : Request, res : Response) => {

    try {
        const chats = await modGetChats(req, res)
        return res.status(200).send(chats)
    } catch (e) {
        return res.status(500).json(genGetErrorMessage(e))
    }

}

export const conGetUsersByChatId = async (req : Request, res : Response) => {

    try {
        const users = await modGetUsersByChatId(req, res)
        return res.status(200).send(users)
    } catch (e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }

}
