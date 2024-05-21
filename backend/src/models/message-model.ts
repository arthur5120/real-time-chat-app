import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

export const modCreateMessage = async (req : Request, res : Response) => {

    const newMessage = req.body
    
    try {
        await prisma.message.create({data : newMessage})
    } catch (e) {
        return e
    }

}

export const modUpdateMessage = async (req : Request, res : Response) => {

    const messageId = req.params.id
    const updatedMessage = req.body
    
    try {
        await prisma.message.update({
            data : updatedMessage, 
            where : {id : messageId}
        })
    } catch (e) {
        return e
    }
    
}

export const modDeleteMessage = async (req : Request, res : Response) => {

    const messageId = req.params.id
    
    try {
        await prisma.message.delete({where : {id : messageId}})
    } catch (e) {
        return e
    }
    
}

export const modGetMessages = async () => {    

    try {
        const message = await prisma.message.findMany()
        return message
    } catch (e) {
        return e
    }

}

export const modGetMessageById = async (req : Request, res : Response) => {

    const messageId = req.params.id
    
    try {
        const message = await prisma.message.findUnique({where : {id : messageId}})
        return message
    } catch (e) {
        return e
    }
    
}

export const modGetMessagesByUserId = async (req : Request, res : Response) => {

    const userId = req.params.id

    console.log('trying to get messages')
    
    try {

        const messages = await prisma.message.findMany({
            where : {
                senderId : userId
            }
        })

        return messages
        
    } catch (e) {
        return e
    }
    
}