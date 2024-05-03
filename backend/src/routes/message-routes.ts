import express from 'express'

import { 
    conCreateMessage, 
    conUpdateMessage,
    conDeleteMessage, 
    conGetMessages,
    conGetMessageById, 
} from '../controllers/message-controllers'

import { midBodyParsers } from '../utils/middleware'

const messageRouter = express.Router()

    messageRouter.post ('/create-message', midBodyParsers, conCreateMessage)
    messageRouter.put ('/update-message', midBodyParsers, conUpdateMessage)
    messageRouter.delete ('/delete-message', conDeleteMessage)
    messageRouter.get ('/messages', conGetMessages)
    messageRouter.get ('/message/:id', conGetMessageById)

export default messageRouter
