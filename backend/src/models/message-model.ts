import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { genGenerateUniqueId, genGetError } from "../utils/general-functions"

const prisma = new PrismaClient()

export const modCreateMessage = async (req : Request, res : Response) => {            

    const newMessageId = genGenerateUniqueId()
    const newMessage = {id : newMessageId, ...req.body}
    
    try {
        await prisma.message.create({data : newMessage})
        return newMessageId
    } catch (e) {
        console.log(e)
        throw genGetError(`Failed to Create Message`)
    }

}

export const modUpdateMessage = async (req : Request, res : Response) => {

    const messageId = req.params.id
    const updatedMessage = req.body
    const now = new Date()
    const dateTimeNow = now.toISOString()    
    
    try {
        await prisma.message.update({
            data : {...updatedMessage, updated_at : dateTimeNow}, 
            where : {id : messageId}
        })
    } catch (e) {
        console.log(e)
        throw genGetError(`Failed to Update Message`)
    }
    
}

export const modDeleteMessage = async (req : Request, res : Response) => {    

    const messageId = req.params.id
    
    try {
        await prisma.message.delete({where : {id : messageId}})
    } catch (e) {
        console.log(e)
        throw genGetError(`Failed to Delete Message`)
    }
    
}

export const modGetMessages = async () => {    

    try {
        const message = await prisma.message.findMany()
        return message
    } catch (e) {
        console.log(e)
        throw genGetError(`Failed to Get Messages`)
    }

}

export const modGetMessageById = async (req : Request, res : Response) => {

    const messageId = req.params.id
    
    try {
        const message = await prisma.message.findUnique({where : {id : messageId}})
        return message
    } catch (e) {
        console.log(e) // throw new Error('Database retrieval error')
        throw genGetError(`Failed to Get Message`)
    }
    
}

export const modGetMessagesByUserId = async (req : Request, res : Response) => {

    const userId = req.params.id    
    
    try {

        const messages = await prisma.message.findMany({
            where : {
                senderId : userId
            }
        })

        return messages
        
    } catch (e) {
        console.log(e)
        throw genGetError(`Failed to Get Messages`)
    }
    
}