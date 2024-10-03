import { Request, Response } from "express"

export const conCheckHealth = async (req : Request, res : Response) => {
    try {
        return res.status(200).json({
            status : true,
            message : `Server is Running.`,
        })
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            status : false,
            message : `Internal Error`,
        })
    }
}