import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { midHashPassword } from "../utils/middleware";

const prisma = new PrismaClient()

export const modCreateUser = async (req : Request, res : Response) => {

    console.log('trying to create')

    const {password, ...newUser} = req.body
    
    const hashedPassword = await midHashPassword(password)    

    try {
        await prisma.user.create({
            data : {...newUser, password : hashedPassword}
        })
    } catch(e) {    
        return e
    }
}

export const modUpdateUser = async (req : Request, res : Response) => {

    const userId = req.params.id

    try {
        prisma.user.update({
            where : {id : userId},
            data : req.body
        })
    } catch(e) {
        return e
    }
}

export const modDeleteUser = async (req : Request, res : Response) => {

    const userId = req.params.id

    try {
        await prisma.user.delete({
            where : {id : userId}
        })
    } catch(e) {
        return e
    }
}

export const modGetUsers = async (req : Request, res : Response) => {

    try {
        const users = await prisma.user.findMany({
            select : {
                id : true,
                name : true,
                username : true,
                email : true
            }          
        })
        return await users
    } catch(e) {
        return e
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
                email : true
            }  
        })
        return await user
    } catch(e) {
        return e
    }
}

export const modGetUserByEmail = async (req : Request, res : Response) => {

    const userEmail = req.body.email

    try {
        const user = await prisma.user.findUnique({
            where : {email : userEmail}, 
            select : {
                id : true,
                name : true,
                username : true,
                email : true
            }  
        })
        return await user
    } catch(e) {
        return e
    }
}