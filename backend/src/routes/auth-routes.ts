import express from 'express'

import { conAuth, conGetAuth, conLogout } from "../controllers/auth-controllers"
import { midBodyParsers, midCheckAuth } from '../utils/middleware'

const authRouter = express.Router()

authRouter.post('/auth', midBodyParsers, conAuth)
authRouter.post('/get-auth', midBodyParsers, conGetAuth)
authRouter.post('/logout', midBodyParsers, midCheckAuth, conLogout)

export default authRouter