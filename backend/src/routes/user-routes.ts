import { Router } from 'express'

import { 
    conCreateUser,
    conDeleteUser,
    conGetUserById, 
    conGetUsers, 
    conUpdateUser,    
} from '../controllers/user-controller'

import { midBodyParsers, midCSRFProtection, midRateLimiter } from '../utils/middleware'

const userRouter = Router()
const userRateLimiter = midRateLimiter()

userRouter.post('/create-user', midBodyParsers, userRateLimiter, midCSRFProtection, conCreateUser)
userRouter.put('/update-user/:id', midBodyParsers, userRateLimiter, midCSRFProtection, conUpdateUser)
userRouter.delete('/delete-user/:id', midBodyParsers, userRateLimiter, midCSRFProtection, conDeleteUser)
userRouter.get('/users', midBodyParsers, conGetUsers)
userRouter.get('/users/:id', midBodyParsers, conGetUserById)

export default userRouter