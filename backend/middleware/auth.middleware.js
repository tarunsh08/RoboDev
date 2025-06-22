import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
    try {
        // Improved token extraction
        let token;
        
        // Check Authorization header first (common for APIs)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        } 
        // Then check cookies
        else if (req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({ 
                error: 'Authentication required',
                details: 'No token provided in headers or cookies'
            });
        }

        // Check Redis blacklist
        const isBlackListed = await redisClient.get(token);
        if (isBlackListed) {
            res.clearCookie('token');
            return res.status(401).json({
                error: "Session expired",
                details: "Token has been invalidated"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        // More specific error handling
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                details: 'The provided token is malformed or invalid'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                details: 'Please log in again'
            });
        }
        
        console.error('Authentication error:', error);
        res.status(401).json({
            error: 'Authentication failed',
            details: error.message
        });
    }
}