import express from 'express'

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

const messageRouter = express.Router()
    
    messageRouter.post('/create-message', midBodyParsers, midRateLimiter, midCheckAuth, conCreateMessage)
    messageRouter.put('/update-message/:id', midBodyParsers, midRateLimiter, midCheckAuth, conUpdateMessage)
    messageRouter.delete('/delete-message/:id', midBodyParsers, midRateLimiter, midCheckAuth, conDeleteMessage)
    messageRouter.get('/messages', conGetMessages)
    messageRouter.get('/messages/:id', conGetMessageById)
    messageRouter.get('/users/:id/messages', conGetMessagesByUserId)

export default messageRouter
