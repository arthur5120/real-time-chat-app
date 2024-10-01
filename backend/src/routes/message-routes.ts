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
} from '../utils/middleware'

const messageRouter = express.Router()
    
    messageRouter.post('/create-message', midBodyParsers, midCheckAuth, conCreateMessage)
    messageRouter.put('/update-message/:id', midBodyParsers, midCheckAuth, conUpdateMessage)
    messageRouter.delete('/delete-message/:id', midBodyParsers, midCheckAuth, conDeleteMessage)
    messageRouter.get('/messages', conGetMessages)
    messageRouter.get('/messages/:id', conGetMessageById)
    messageRouter.get('/users/:id/messages', conGetMessagesByUserId)

export default messageRouter
