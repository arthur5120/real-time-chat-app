import express from 'express'
import dotenv from 'dotenv'
import { midCSRFProtection, midSetCors, midHandleCSRFError } from './utils/middleware'
import { router } from './utils/router'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(
    midSetCors,
    cookieParser(),
    midCSRFProtection,
    ...router,
    midHandleCSRFError,    
)

app.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`)
})
