import { PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import { genHashPassword, genGetError } from "../utils/general-functions"

const prisma = new PrismaClient()

export const modCreateUser = async (req : Request, res : Response) => {  
    
    const {password, ...newUser} = req.body
    const hashedPassword = await genHashPassword(password)       

    try {
        await prisma.user.create({
            data : {...newUser, password : hashedPassword}
        })
    } catch(e) {    
        console.log(e)
        throw genGetError(`Failed to Create User`)
    }

}

export const modUpdateUser = async (req : Request, res : Response) => {

    const userId = req.params.id

    try {        
        await prisma.user.update({
            where : {id : userId},
            data : req.body
        })
    } catch(e) {
        console.log(e)
        throw genGetError(`Failed to Update User`)
    }
}

export const modDeleteUser = async (req : Request, res : Response) => {

    const userId = req.params.id

    try {
        await prisma.user.delete({
            where : {id : userId}
        })
    } catch(e) {
        console.log(e)
        throw genGetError(`Failed to Delete User`)
    }
}

export const modGetUsers = async (req : Request, res : Response) => {    

    try {
        const users = await prisma.user.findMany({
            select : {
                id : true,
                name : true,
                username : true,
                email : true,
                role : true,
                created_at : true,                
            }          
        })
        return await users
    } catch(e) {
        console.log(e)
        throw genGetError(`Failed to Get Users`)
    }
}

export const modGetUserById = async (req : Request, res : Response) => {

    const userId = req.params.id

    try {
        const user = await prisma.user.findUnique({
            where : {id : userId}, 
            select : {
                id : true,
                name : true,
                username : true,
                email : true,
                role : true,
                created_at : true,
            }  
        })
        return await user
    } catch(e) {
        console.log(e)
        throw genGetError(`Failed to Get User`)
    }
}

export const modGetUserByEmail = async (req : Request, res : Response) => { // Returns encrypted password

    const userEmail = req.body.email

    try {
        const user = await prisma.user.findUnique({
            where : {email : userEmail}, 
            select : {
                id : true,
                password : true,        
                name : true,
                username : true,
                email : true,
                role : true
            }  
        })
        return await user
    } catch(e) {
        console.log(e)
        throw genGetError(`Failed to Get User`)
    }
}