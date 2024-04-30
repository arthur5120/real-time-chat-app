// Password Rules
// Minimum 8 characters, Maximum 20
// Must Start with Alpha
// Must have mixed Alpha-Numeric
// Can have capital and small Anywhere and no necessary in the beginning [but not must]
// Can have special characters [but not must]

import { ZodError } from "zod"
import { userSchema } from "./validation-schemas"
import { TUser } from "./types"
import { TResponse } from "./types"

export const validateUser = (value : TUser) : TResponse => {

    try {  

        const result : TResponse = {
            success : true, 
            message : `success`,
            body : userSchema.parse(value)
        }     

        return result

    } catch (e) {

        const result : TResponse = (e instanceof ZodError) ? {
            success : false, 
            message : e.issues[0].message
        } : {
            success : false, 
            message : 'unknown error'
        }

        return result

    }

}