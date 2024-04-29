import {z} from 'zod'

const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%\^&*()_?+\-=])[a-zA-Z0-9!@#$%\^&*()_?+\-=]{8,15}$/;
const nameRegex = /^[a-zA-Z0-9 ]+$/;

const passwordMessage = `
    Password must be between 8 and 20 characters,
    start with an alphabetic character, and contain a mix of uppercase, 
    lowercase, and numeric characters, with optional special characters.
`

export const userSchema = z.object({
    name  : z.string().trim().min(3).max(50).regex(nameRegex),
    username : z.string().trim().min(3).max(50),
    email : z.string().email().min(1),
    password  : z.string().min(8).max(20).regex(passwordRegex, {message : passwordMessage}),
})