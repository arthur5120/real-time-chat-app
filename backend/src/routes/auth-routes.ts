import { Router } from 'express'

import { 
    conAuth, 
    conGetAuth, 
    conLogout, 
    conGetCSRFToken, 
    conCheckCSRFToken
} from "../controllers/auth-controllers"

import {     
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
authRouter.post('/check-csrf-token', midBodyParsers, conCheckCSRFToken)
authRouter.get('/get-csrf-token', midBodyParsers, conGetCSRFToken)

export default authRouter