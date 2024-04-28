import express from 'express'

import { conAuth } from "../controllers/auth-controllers"
import { midBodyParsers } from '../utils/middleware'

const authRouter = express.Router()

authRouter.post('/auth', midBodyParsers, conAuth)

export default authRouter