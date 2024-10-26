import { Router } from 'express'
import { midBodyParsers } from '../utils/middleware'

import { 
    conCheckCSRFToken,
    conCheckHealth,
    conGetCSRFToken,
    conObscureData,
    conRevealData,
} from '../controllers/utils-controllers'

const utilsRouter = Router()

utilsRouter.get(`/check-health`, conCheckHealth)
utilsRouter.get('/get-csrf-token', midBodyParsers, conGetCSRFToken)
utilsRouter.post(`/obscure-data`, midBodyParsers, conObscureData)
utilsRouter.post(`/reveal-data`, midBodyParsers, conRevealData)
utilsRouter.post('/check-csrf-token', midBodyParsers, conCheckCSRFToken)

export default utilsRouter