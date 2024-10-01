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
    midBodyParsers, 
    midCheckAllowed, 
    midCheckAuth,
    midRateLimiter,
} from "../utils/middleware"

import express from "express"

const chatRouter = express.Router()

chatRouter.post('/create-chat', midBodyParsers, midRateLimiter, conCreateChat)
chatRouter.post('/add-user-to-chat/:id', midBodyParsers, midRateLimiter, midCheckAuth, conAddUserToChat)
chatRouter.delete('/remove-user-from-chat/:id', midBodyParsers, midRateLimiter, midCheckAuth, conRemoveUserFromChat)
chatRouter.delete('/delete-chat/:id', midBodyParsers, midRateLimiter, midCheckAuth, midCheckAllowed, conDeleteChat)
chatRouter.delete('/delete-all-chats/', midBodyParsers, midRateLimiter, midCheckAuth, midCheckAllowed, conDeleteAllChats)
chatRouter.get('/chats', conGetChats)
chatRouter.get('/chats/:id', conGetChatById)
chatRouter.get('/chats/:id/users', midBodyParsers, midRateLimiter, midCheckAuth, midCheckAllowed, conGetUsersByChatId)
chatRouter.get('/users/:id/chats', midBodyParsers, midRateLimiter, midCheckAuth, conGetChatsByUserId)

export default chatRouter