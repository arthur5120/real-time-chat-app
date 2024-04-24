import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient()

export const createUser = async (req : Request, res : Response) => {
    res.send('nothing')
}