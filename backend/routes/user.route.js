import { Router } from 'express'
import * as userController from '../controllers/user.controller.js'
import { body } from 'express-validator'

const router = Router()

router.post('/register', 
    body('email').isEmail().withMessage('Email must be valid'),
    body('password').isLength({min:4}).withMessage('Give a valid password'),
    userController.createUserController);

export default router