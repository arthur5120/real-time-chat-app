import { Router } from 'express'

import { 
    conCreateUser,
    conDeleteUser,
    conGetUserById, 
    conGetUsers, 
    conUpdateUser,    
} from '../controllers/user-controller'

import { midBodyParsers, midRateLimiter } from '../utils/middleware'

const userRouter = Router()
const userRateLimiter = midRateLimiter()

userRouter.post('/create-user', midBodyParsers, userRateLimiter, conCreateUser)
userRouter.put('/update-user/:id', midBodyParsers, userRateLimiter, conUpdateUser)
userRouter.delete('/delete-user/:id', midBodyParsers, userRateLimiter, conDeleteUser)
userRouter.get('/users', midBodyParsers, conGetUsers)
userRouter.get('/users/:id', midBodyParsers, conGetUserById)

export default userRouter