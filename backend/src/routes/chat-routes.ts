import { Router } from "express"

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

const chatRouter = Router()
const chatRateLimiter = midRateLimiter()

chatRouter.post('/create-chat', midBodyParsers, chatRateLimiter, conCreateChat)
chatRouter.post('/add-user-to-chat/:id', midBodyParsers, chatRateLimiter, midCheckAuth, conAddUserToChat)
chatRouter.delete('/remove-user-from-chat/:id', midBodyParsers, chatRateLimiter, midCheckAuth, conRemoveUserFromChat)
chatRouter.delete('/delete-chat/:id', midBodyParsers, chatRateLimiter, midCheckAuth, midCheckAllowed, conDeleteChat)
chatRouter.delete('/delete-all-chats/', midBodyParsers, chatRateLimiter, midCheckAuth, midCheckAllowed, conDeleteAllChats)
chatRouter.get('/chats', conGetChats)
chatRouter.get('/chats/:id', conGetChatById)
chatRouter.get('/chats/:id/users', midBodyParsers, chatRateLimiter, midCheckAuth, conGetUsersByChatId) // Check if user is in room.
chatRouter.get('/users/:id/chats', midBodyParsers, chatRateLimiter, midCheckAuth, conGetChatsByUserId)

export default chatRouter