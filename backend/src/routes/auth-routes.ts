import { Router } from 'express'

import { 
    conAuth, 
    conGetAuth, 
    conLogout, 
    conGetCSRFToken 
} from "../controllers/auth-controllers"

import { 
    midCSRFProtection, 
    midBodyParsers, 
    midCheckAuth,
    midRateLimiter,     
} from '../utils/middleware'

const authRouter = Router()
const authRateLimiter = midRateLimiter()
const getAuthRateLimiter = midRateLimiter()

authRouter.post('/auth', midBodyParsers, authRateLimiter, conAuth)
authRouter.post('/get-auth', midBodyParsers, getAuthRateLimiter, conGetAuth)
authRouter.post('/logout', midBodyParsers, authRateLimiter, midCheckAuth, conLogout)
authRouter.get('/get-csrf-token', midBodyParsers, midCSRFProtection, conGetCSRFToken)

export default authRouter