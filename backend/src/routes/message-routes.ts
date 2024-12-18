import { Router } from 'express'

import { 
    conCreateMessage, 
    conUpdateMessage,
    conDeleteMessage, 
    conGetMessages,
    conGetMessageById,
    conGetMessagesByUserId, 
} from '../controllers/message-controllers'

import {     
    midBodyParsers, 
    midCheckAuth,
    midRateLimiter,    
} from '../utils/middleware'

const messageRouter = Router()
const messageRateLimiter = midRateLimiter()
    
messageRouter.post('/create-message', midBodyParsers, messageRateLimiter, midCheckAuth, conCreateMessage)
messageRouter.put('/update-message/:id', midBodyParsers, messageRateLimiter, midCheckAuth, conUpdateMessage)
messageRouter.delete('/delete-message/:id', midBodyParsers, messageRateLimiter, midCheckAuth, conDeleteMessage)
messageRouter.get('/messages', conGetMessages)
messageRouter.get('/messages/:id', conGetMessageById)
messageRouter.get('/users/:id/messages', conGetMessagesByUserId)

export default messageRouter
