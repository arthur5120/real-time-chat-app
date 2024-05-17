import express from 'express'

import { 
    conCreateMessage, 
    conUpdateMessage,
    conDeleteMessage, 
    conGetMessages,
    conGetMessageById, 
} from '../controllers/message-controllers'

import { midBodyParsers, midCheckAuth } from '../utils/middleware'

const messageRouter = express.Router()
    
    messageRouter.post ('/create-message', midBodyParsers, midCheckAuth, conCreateMessage)
    messageRouter.put ('/update-message', midBodyParsers, midCheckAuth, conUpdateMessage)
    messageRouter.delete ('/delete-message', midBodyParsers, midCheckAuth, conDeleteMessage)
    messageRouter.get ('/messages', conGetMessages)
    messageRouter.get ('/message/:id', conGetMessageById)

export default messageRouter
