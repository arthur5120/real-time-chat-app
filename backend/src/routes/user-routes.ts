import express from 'express'

import { 
    conCreateUser,
    conDeleteUser,
    conGetUserById, 
    conGetUsers, 
    conUpdateUser,    
} from '../controllers/user-controller'

import { csrfProtection, midBodyParsers } from '../utils/middleware'

const userRouter = express.Router()

userRouter.post('/create-user', midBodyParsers, csrfProtection, conCreateUser)
userRouter.put('/update-user/:id', midBodyParsers, csrfProtection, conUpdateUser)
userRouter.delete('/delete-user/:id', midBodyParsers, csrfProtection, conDeleteUser)
userRouter.get('/users', midBodyParsers, conGetUsers)
userRouter.get('/users/:id', midBodyParsers, conGetUserById)

export default userRouter