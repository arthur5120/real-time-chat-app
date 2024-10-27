import { Router } from 'express'
import { midBodyParsers, midCSRFProtection, midRateLimiter } from '../utils/middleware'

import { 
    conCheckCSRFToken,
    conCheckHealth,
    conGetCSRFToken,
    conObscureData,
    conRevealData,
} from '../controllers/utils-controllers'

const utilsRouter = Router()
const utilRateLimiter = midRateLimiter(1000, 5)

utilsRouter.get(`/check-health`, conCheckHealth)
utilsRouter.get('/get-csrf-token', midBodyParsers, midCSRFProtection, conGetCSRFToken)
utilsRouter.post('/check-csrf-token', midBodyParsers, midCSRFProtection, conCheckCSRFToken)
utilsRouter.post(`/obscure-data`, midBodyParsers, utilRateLimiter, conObscureData)
utilsRouter.post(`/reveal-data`, midBodyParsers, utilRateLimiter, conRevealData)

export default utilsRouter