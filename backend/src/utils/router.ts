import authRouter from "../routes/auth-routes"
import userRouter from "../routes/user-routes"
import chatRouter from "../routes/chat-routes"
import messageRouter from "../routes/message-routes"
import utilsRouter  from "../routes/utils-routes"

export const router = [
    authRouter,
    userRouter,
    chatRouter,
    messageRouter,
    utilsRouter,
]