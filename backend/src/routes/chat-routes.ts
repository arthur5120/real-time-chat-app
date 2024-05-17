import { 
    conCreateChat,
    conAddUserToChat,
    conDeleteChat,
    conRemoveUserFromChat,
    conGetChatById,
    conGetChats,
} from "../controllers/chat-controllers";

import { midBodyParsers, midCheckAuth } from "../utils/middleware";
import express from "express";

const chatRouter = express.Router()

chatRouter.post('/create-chat', midBodyParsers, midCheckAuth, conCreateChat) // Check Credentials
chatRouter.post('/add-user-to-chat/:id', midBodyParsers, midCheckAuth, conAddUserToChat) // Get User id on the body
chatRouter.delete('/remove-user-from-chat/:id', midBodyParsers, midCheckAuth, conRemoveUserFromChat) // Get User Id on the body
chatRouter.delete('/delete-chat/:id', midBodyParsers, midCheckAuth, conDeleteChat)
chatRouter.get('/chats', midBodyParsers, midCheckAuth, conGetChats)
chatRouter.get('/chat/:id',  midBodyParsers, midCheckAuth, conGetChatById)

export default chatRouter