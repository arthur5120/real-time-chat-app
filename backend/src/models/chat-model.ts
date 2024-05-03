import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient()

export const modCreateChat = async (req : Request, res : Response) => {
    const newChat = req.body

    try {
        await prisma.chat.create({
            data : newChat
        })
    } catch (e) {
        throw e
    }

}

export const modUpdateChat = async (req : Request, res : Response) => {
    
    const newChat = req.body
    const chatId = req.params.id

    try {
        await prisma.chat.update({
            data : newChat,
            where : {id : chatId}
        })
    } catch (e) {
        throw e
    }

}

export const modDeleteChat = async (req : Request, res : Response) => {
    
    const chatId = req.params.id

    try {
        await prisma.chat.delete({
            where : {id : chatId}
        })
    } catch (e) {
        throw e
    }

}

export const modGetChats = async () => {    

    try {
        const chat = await prisma.chat.findMany()
        return chat
    } catch (e) {
        throw e
    }

}

export const modGetChatById = async (req : Request, res : Response) => {
    
    const chatId = req.params.id

    try {
        const chat = await prisma.chat.findUnique({
            where : {id : chatId}
        })
        return chat
    } catch (e) {
        throw e
    }

}