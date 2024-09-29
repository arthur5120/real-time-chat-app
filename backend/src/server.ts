import express from 'express'
import dotenv from 'dotenv'
import { midSetCors } from './utils/middleware'
import { router } from './utils/router'

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(
    midSetCors,    
    ...router
)

app.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`)
})