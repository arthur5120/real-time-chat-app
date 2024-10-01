import express from 'express'

import { 
    conCreateUser,
    conDeleteUser,
    conGetUserById, 
    conGetUsers, 
    conUpdateUser,    
} from '../controllers/user-controller'

import { midBodyParsers, midRateLimiter } from '../utils/middleware'

const userRouter = express.Router()

userRouter.post('/create-user', midBodyParsers, midRateLimiter, conCreateUser)
userRouter.put('/update-user/:id', midBodyParsers, midRateLimiter, conUpdateUser)
userRouter.delete('/delete-user/:id', midBodyParsers, midRateLimiter, conDeleteUser)
userRouter.get('/users', midBodyParsers, conGetUsers)
userRouter.get('/users/:id', midBodyParsers, conGetUserById)

export default userRouter