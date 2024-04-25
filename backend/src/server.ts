import express from 'express'
import dotenv from 'dotenv'
import router from './routes/user-routes'
import { midSetCors } from './utils/middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(
    midSetCors,
    router,
)

app.listen(PORT, () => {
    console.log(`Server Running on ${PORT}`)
})