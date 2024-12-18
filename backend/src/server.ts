import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { router } from './utils/router'
import {     
    midSetCors, 
    midHandleErrors, 
    midIdempotency, 
    midCSRFConditionalGuard,    
} from './utils/middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(
    midSetCors,
    cookieParser(),
    midCSRFConditionalGuard,
    midIdempotency,    
    ...router,
    midHandleErrors,
)

app.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`)
})
