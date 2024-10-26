import { Request, Response } from "express"
import { genGetErrorMessage, obscureData, revealData } from "../utils/general-functions"

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

export const conGetCSRFToken = async (req: Request, res: Response) => { 
   try {            
    const token = req.csrfToken()
    return res.status(200).json({
        CSRFToken: token,  
    })    
   } catch (e) {
        console.log(e)
        return await res.status(500).json(genGetErrorMessage(e))
   }
}
 
export const conCheckCSRFToken = async (req: Request, res: Response) => {    
   try {          
       console.log(`valid token ${req.headers['x-csrf-token']}`)      
       return res.status(200).json({success : true})
   } catch (e) {
        console.log(e)
        return await res.status(500).json(genGetErrorMessage(e))
   }    
}

export const conObscureData = async (req : Request, res : Response) => {
    try {
        const {data} = req.body
        if(!data) {
            return res.status(404).json({success : false, message : `Invalid data`})
        }        
        const obscuredData = obscureData(data)
        return res.status(200).json({success : true, data : obscuredData})
    } catch(e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
}

export const conRevealData = async (req : Request, res : Response) => {
    try {
        const {data} = req.body
        if(!data) {
            return res.status(404).json({success : false, message : `Invalid data`})
        }        
        const revealedData = revealData(data)
        return res.status(200).json({success : true, data : revealedData})
    } catch(e) {
        console.log(e)
        return res.status(500).json(genGetErrorMessage(e))
    }
}