import express from 'express'
import { conCheckHealth } from '../controllers/health-controllers'

export const healthRouter = express.Router()

healthRouter.get(`/check-health`, conCheckHealth)