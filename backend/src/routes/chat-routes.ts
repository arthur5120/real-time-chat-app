import { 
    modCreateChat, 
    modUpdateChat,
    modDeleteChat, 
    modGetChats,
    modGetChatById,
} from "../models/chat-model";

import { midBodyParsers } from "../utils/middleware";
import express from "express";

const chatRouter = express.Router()

chatRouter.post('/create-chat', midBodyParsers, modCreateChat)
chatRouter.put('/update-chat/:id', midBodyParsers, modUpdateChat)
chatRouter.delete('/delete-chat', modDeleteChat)
chatRouter.get('/chats', modGetChats)
chatRouter.get('/chat/:id', modGetChatById)

export default chatRouter