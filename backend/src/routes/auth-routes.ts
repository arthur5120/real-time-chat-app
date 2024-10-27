import { Router } from 'express'

import { 
    conAuth, 
    conGetAuth, 
    conLogout,     
} from "../controllers/auth-controllers"

import {     
    midBodyParsers, 
    midCheckAuth,    
    midCSRFProtection,    
    midRateLimiter,     
} from '../utils/middleware'

const authRouter = Router()
const authRateLimiter = midRateLimiter()
const getAuthRateLimiter = midRateLimiter()

authRouter.post('/auth', midBodyParsers, authRateLimiter, midCSRFProtection, conAuth)
authRouter.post('/get-auth', midBodyParsers, getAuthRateLimiter, midCSRFProtection, conGetAuth)
authRouter.post('/logout', midBodyParsers, authRateLimiter, midCSRFProtection, midCheckAuth, conLogout)

export default authRouter