import authRouter from "../routes/auth-routes"
import userRouter from "../routes/user-routes"
import chatRouter from "../routes/chat-routes"
import messageRouter from "../routes/message-routes"

export const router = [
    authRouter,
    userRouter,
    chatRouter,
    messageRouter,
]