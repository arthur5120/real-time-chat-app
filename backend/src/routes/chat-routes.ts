import { 
    conCreateChat,
    conAddUserToChat,
    conDeleteChat,
    conRemoveUserFromChat,
    conGetChatById,
    conGetChats,
    conGetChatsByUserId,
    conDeleteAllChats,
    conGetUsersByChatId,
} from "../controllers/chat-controllers"

import { 
    csrfProtection,
    midBodyParsers, 
    midCheckAllowed, 
    midCheckAuth 
} from "../utils/middleware"

import express from "express"

const chatRouter = express.Router()

chatRouter.post('/create-chat', midBodyParsers, csrfProtection, conCreateChat)
chatRouter.post('/add-user-to-chat/:id', midBodyParsers, csrfProtection, midCheckAuth, conAddUserToChat)
chatRouter.delete('/remove-user-from-chat/:id', midBodyParsers, csrfProtection, midCheckAuth, conRemoveUserFromChat)
chatRouter.delete('/delete-chat/:id', midBodyParsers, csrfProtection, midCheckAuth, midCheckAllowed, conDeleteChat)
chatRouter.delete('/delete-all-chats/', midBodyParsers, csrfProtection, midCheckAuth, midCheckAllowed, conDeleteAllChats)
chatRouter.get('/chats', conGetChats)
chatRouter.get('/chats/:id', conGetChatById)
chatRouter.get('/chats/:id/users', midBodyParsers, midCheckAuth, midCheckAllowed, conGetUsersByChatId)
chatRouter.get('/users/:id/chats', midBodyParsers, midCheckAuth, conGetChatsByUserId)

export default chatRouter