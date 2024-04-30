import express from 'express'

import { conAuth, conGetAuth, conLogout } from "../controllers/auth-controllers"
import { midBodyParsers } from '../utils/middleware'

const authRouter = express.Router()

authRouter.post('/auth', midBodyParsers, conAuth)
authRouter.post('/get-auth', midBodyParsers, conGetAuth)
authRouter.post('/logout', midBodyParsers, conLogout)

export default authRouter