import { 
    conCreateChat,
    conAddUserToChat,
    conDeleteChat,
    conRemoveUserFromChat,
    conGetChatById,
    conGetChats,
    conGetChatsByUserId,
} from "../controllers/chat-controllers";

import { 
    midBodyParsers, 
    midCheckAllowed, 
    midCheckAuth 
} from "../utils/middleware"

import express from "express"

const chatRouter = express.Router()

chatRouter.post('/create-chat', midBodyParsers, midCheckAuth, conCreateChat)
chatRouter.post('/add-user-to-chat/:id', midBodyParsers, midCheckAuth, conAddUserToChat)
chatRouter.delete('/remove-user-from-chat/:id', midBodyParsers, midCheckAuth, conRemoveUserFromChat)
chatRouter.delete('/delete-chat/:id', midBodyParsers, midCheckAuth, midCheckAllowed, conDeleteChat)
chatRouter.get('/chats', conGetChats)
chatRouter.get('/chats/:id', conGetChatById)
chatRouter.get('/users/:id/chats', midBodyParsers, midCheckAuth, conGetChatsByUserId)

export default chatRouter