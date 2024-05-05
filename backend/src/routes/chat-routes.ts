import { 
    conCreateChat,
    conAddUserToChat,
    conDeleteChat,
    conRemoveUserFromChat,
    conGetChatById,
    conGetChats,
} from "../controllers/chat-controllers";

import { midBodyParsers } from "../utils/middleware";
import express from "express";

const chatRouter = express.Router()

chatRouter.post('/create-chat', midBodyParsers, conCreateChat) // Check Credentials
chatRouter.post('/add-user-to-chat/:id', midBodyParsers, conAddUserToChat) // Get User id on the body
chatRouter.delete('/remove-user-from-chat/:id', midBodyParsers, conRemoveUserFromChat) // Get User Id on the body
chatRouter.delete('/delete-chat/:id', conDeleteChat)
chatRouter.get('/chats', conGetChats)
chatRouter.get('/chat/:id', conGetChatById)

export default chatRouter