import { Request, Response } from "express"

import { 
    modCreateMessage, 
    modUpdateMessage,
    modDeleteMessage, 
    modGetMessages,
    modGetMessageById,
    modGetMessagesByUserId, 
} from "../models/message-model"

import { 
    getErrorMessage 
} from "../utils/other-resources"

import { 
    midCheckDuplicate 
} from "../utils/middleware"

const requestKeys : string[] = []

export const conCreateMessage = async (req : Request, res : Response) => {      

    try {

        const isDuplicate = midCheckDuplicate(req, requestKeys)

        if(isDuplicate) {        
            return res.status(400).json({message : `Duplicate Request`})
        }

        const newMessageId = await modCreateMessage(req, res)
        return res.status(200).send(newMessageId)
        
    } catch (e) {
        console.log(e)
        return res.status(500).json(getErrorMessage(e))
    }

}

export const conUpdateMessage = async (req : Request, res : Response) => {

    try {
        await modUpdateMessage(req, res)
        return res.status(200).json({message : 'Success'})
    } catch (e) {
        console.log(e)
        return res.status(500).json(getErrorMessage(e))
    }

}

export const conDeleteMessage = async (req : Request, res : Response) => {    

    try {
        const msg = await modDeleteMessage(req, res)
        return res.status(200).send(msg)
    } catch (e) {
        console.log(e)
        return res.status(500).json(getErrorMessage(e))
    }

}

export const conGetMessages = async (req : Request, res : Response) => {

    try {
        const msg = await modGetMessages()
        return res.status(200).send(msg)
    } catch (e) {
        console.log(e)
        return res.status(500).json(getErrorMessage(e))
    }

}

export const conGetMessageById = async (req : Request, res : Response) => {

    try {
        const msg = await modGetMessageById(req, res)
        return res.status(200).send(msg)
    } catch (e) {
        console.log(e)
        return res.status(500).json(getErrorMessage(e))
    }

}

export const conGetMessagesByUserId = async (req : Request, res : Response) => {

    try {
        const msg = await modGetMessagesByUserId(req, res)
        return res.status(200).send(msg)
    } catch (e) {
        console.log(e)
        return res.status(500).json(getErrorMessage(e))
    }

}