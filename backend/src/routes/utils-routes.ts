import { Router } from 'express'
import { midBodyParsers, midCSRFGuard, midRateLimiter } from '../utils/middleware'

import { 
    conCheckCSRFToken,
    conCheckHealth,
    conGetCSRFToken,
    conObscureData,
    conRevealData,
} from '../controllers/utils-controllers'

const utilsRouter = Router()
const utilsRatelimiter = midRateLimiter()

utilsRouter.get(`/check-health`, conCheckHealth)
utilsRouter.get('/get-csrf-token', midBodyParsers, conGetCSRFToken)
utilsRouter.post('/check-csrf-token', midBodyParsers, conCheckCSRFToken)
utilsRouter.post(`/obscure-data`, midBodyParsers, utilsRatelimiter, conObscureData)
utilsRouter.post(`/reveal-data`, midBodyParsers, utilsRatelimiter, conRevealData)

export default utilsRouter