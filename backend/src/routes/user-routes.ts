import express from 'express'

import { 
    conCreateUser, 
    conDeleteUser, 
    conGetUserById, 
    conGetUsers, 
    conUpdateUser 
} from '../controllers/user-controller'

import { midBodyParsers } from '../utils/middleware'

const userRouter = express.Router()

userRouter.get('/get-users', conGetUsers)
userRouter.get('/get-user/:id', conGetUserById)
userRouter.post('/create-user', midBodyParsers, conCreateUser)
userRouter.put('/update-user/:id', midBodyParsers, conUpdateUser)
userRouter.delete('/delete-user/:id', conDeleteUser)

export default userRouter