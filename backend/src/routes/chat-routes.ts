import { 
    conCreateChat,
    conAddUserToChat,
    conDeleteChat,
    conRemoveUserFromChat,
    conGetChatById,
    conGetChats,
    conGetChatsByUserId,
    conDeleteAllChats,
} from "../controllers/chat-controllers";

import { 
    midBodyParsers, 
    midCheckAllowed, 
    midCheckAuth 
} from "../utils/middleware"

import express from "express"

const chatRouter = express.Router()

chatRouter.post('/create-chat', midBodyParsers, conCreateChat)
chatRouter.post('/add-user-to-chat/:id', midBodyParsers, midCheckAuth, conAddUserToChat)
chatRouter.delete('/remove-user-from-chat/:id', midBodyParsers, midCheckAuth, conRemoveUserFromChat)
chatRouter.delete('/delete-chat/:id', midBodyParsers, midCheckAuth, midCheckAllowed, conDeleteChat)
chatRouter.delete('/delete-all-chats/', midBodyParsers, midCheckAuth, midCheckAllowed, conDeleteAllChats)
chatRouter.get('/chats', conGetChats)
chatRouter.get('/chats/:id', conGetChatById)
chatRouter.get('/users/:id/chats', midBodyParsers, midCheckAuth, conGetChatsByUserId)

export default chatRouter