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
        return e
    }

}

export const modAddUserToChat = async (req : Request, res : Response) => {    

    const chatId = req.params.id
    const userId = req.body.userId

    console.log(`Adding user id ${userId} to chat ${chatId}`)

    try {

        await prisma.userChat.create({
            data : {
                userId : userId,
                chatId : chatId,
            } 
        })

    } catch (e) {
        return e
    }

}
export const modRemoveUserFromChat = async (req : Request, res : Response) => {

    const chatId = req.params.id
    const userId = req.body.userId

    console.log(`Removing user id ${userId} to chat ${chatId}`)

    try {
        
        await prisma.userChat.delete({
            where: {
                userId_chatId: {
                    userId: userId,
                    chatId: chatId
                }
            }
        });

    } catch (e) {
        return e
    }

}

export const modDeleteChat = async (req : Request, res : Response) => {

    const chatId = req.params.id

    console.log(`Trying to delete : ${chatId}`)

    try {
        await prisma.chat.delete({
            where : {
                id : chatId
            }
        })
    } catch (e)     {
        return e
    }

}

export const modGetChats = async (req : Request, res : Response) => {

    try {

        const chats = await prisma.chat.findMany()
        return chats

    } catch (e) {
        return e
    }

}

export const modGetChatById = async (req : Request, res : Response) => {

    const chatId = req.params.id

    try {

        const chat = await prisma.chat.findUnique({
            where : {
                id : chatId
            }
        })

        return chat

    } catch (e) {
        return e
    }

}