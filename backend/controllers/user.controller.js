import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js"
import { validationResult } from 'express-validator'
import redisClient from "../services/redis.service.js";

export const createUserController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const user = await userService.createUser(req.body);
        const token = await user.generateJWT();
        delete user._doc.password;
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).send(error.message)
    }
}

export const loginController = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                errors: 'Email and password are required'
            });
        }

        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        if (!user.password) {
            return res.status(401).json({
                errors: 'Account has no password set. Please contact support.'
            });
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                errors: 'Invalid credentials'
            })
        }

        const token = await user.generateJWT();
        delete user._doc.password;

        res.status(200).json({ user, token });

    } catch (err) {
        console.error('Login error:', err);
        res.status(400).json({
            errors: 'Login failed: ' + err.message
        });
    }
}

export const profileController = async (req, res) => {
    res.status(200).json({
        user: req.user
    })
}

export const logoutController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        redisClient.set(token, 'logout', 'EX', 60 * 60 * 24);

        res.status(200).json({
            message: "Logout successfull"
        });
    } catch (err) {
        res.status(400).send(err.message)
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await userModel.findOne({
            email: req.user.email
        })
        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({
            users: allUsers
        })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}

export const getCurrentUserController = async (req, res) => {
    try {
        // The user ID is now included in the JWT token
        const user = await userModel.findById(req.user._id).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error('Error getting current user:', err);
        res.status(500).json({
            error: 'Server error while fetching user data',
            details: err.message
        });
    }
};