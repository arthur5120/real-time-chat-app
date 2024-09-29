import express from 'express'

import { conAuth, conGetAuth, conLogout, getCSRFToken } from "../controllers/auth-controllers"
import { csrfProtection, midBodyParsers, midCheckAuth } from '../utils/middleware'

const authRouter = express.Router()

authRouter.post('/auth', midBodyParsers, conAuth)
authRouter.post('/get-auth', midBodyParsers, conGetAuth)
authRouter.post('/logout', midBodyParsers, midCheckAuth, conLogout)
authRouter.get('/get-csrf-token', midBodyParsers, csrfProtection, getCSRFToken)

export default authRouter