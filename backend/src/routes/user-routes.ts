import express from 'express'

import { 
    conCreateUser, 
    conDeleteUser, 
    conGetUserById, 
    conGetUsers, 
    conUpdateUser 
} from '../controllers/user-controller'

const router = express.Router()

router.get('/get-users', conGetUsers)
router.get('/get-user/:id', conGetUserById)
router.post('/create-user', ...conCreateUser)
router.put('/update-user/:id', ...conUpdateUser)
router.delete('/delete-user/:id', conDeleteUser)

export default router