// Password Rules
// Minimum 8 characters, Maximum 20
// Must Start with Alpha
// Must have mixed Alpha-Numeric
// Can have capital and small Anywhere and no necessary in the beginning [but not must]
// Can have special characters [but not must]

import { ZodError } from "zod"
import { userSchema } from "./validation-schemas"

type fieldType = keyof typeof userSchema

export const validateUser = (value : object) => {
    try {
        const result = userSchema.parse(value)
        return result
    } catch (e) {
        if (e instanceof ZodError) {
            return e.issues[0].message
        }
    }

}