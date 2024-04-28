import {z} from 'zod'

const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%\^&*()_?+\-=])[a-zA-Z0-9!@#$%\^&*()_?+\-=]{8,15}$/;
const nameRegex = /^[a-zA-Z0-9 ]+$/;

export const userSchema = z.object({
    name  : z.string().trim().min(3).max(50).regex(nameRegex),
    username : z.string().trim().min(3).max(50),
    email : z.string().email().min(1),
    password  : z.string().min(8).max(20).regex(passwordRegex, {message : 'Custom password message'}),
})