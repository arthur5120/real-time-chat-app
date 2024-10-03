import { Router } from 'express'
import { conCheckHealth } from '../controllers/health-controllers'

export const healthRouter = Router()

healthRouter.get(`/check-health`, conCheckHealth)