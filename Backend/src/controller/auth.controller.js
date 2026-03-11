import userModel from "../models/user.model.js";
import sendEmail from "../services/email.service.js";
import jwt from "jsonwebtoken";
import 'dotenv/config';
/**
 * Controller for user registration
 * @function
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 * @throws {Error} - If user already exists
 */
export async function registerController(req, res) {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await userModel.findOne({
            $or: [{ email: email.toLowerCase() }, { username: username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: existingUser.email === email.toLowerCase()
                    ? 'Email already registered'
                    : 'Username already taken'
            });
        }

        // Create new user
        const userResponse = await userModel.create({
            username: username,
            email: email.toLowerCase(),
            password: password
        });

        //NOTE - creaing a verification token
        const verificaitonToken = jwt.sign({
            email: userResponse.email,
            id: userResponse._id
        }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })
        //NOTE - now send professional mail to user for verification
        let html = `
        <p>Hi ${userResponse.username},</p>
        <p>Click <a href="http://localhost:5000/api/auth/verify-email?token=${verificaitonToken}">here</a> to verify your email.</p>
        <p>Thank you for registering with us.</p>
        <p>Best regards,</p>
        <p>The Team</p>
        `;


        // Send email (non-blocking, don't await to prevent crash)
        try {
            sendEmail(email, 'Email verification', 'Please verify your email', html)
        } catch (err) {
            console.error('Email sending failed:', err.message);
        }


        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: userResponse
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
}

/**
 * 
 * @description - verify email
 * @method - GET
 * @route - /api/auth/verify-email
 * @access - Public
 * 
 */
export async function verifyEmailController(req, res, next) {
    try {
        // Get token from query parameter
        const token = req.query.token?.trim();

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Token is required'
            });
        }
        // Verify token
        let decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!decode) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token'
            });
        }
        // Check if user exists
        const user = await userModel.findOne({ email: decode.email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if user is already verified
        if (user.verified) {
            return res.status(400).json({
                success: false,
                message: 'User is already verified'
            });
        }
        user.verified = true
        await user.save()

        return res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
    } catch (err) {
        // Handle error
        console.error('Email verification error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error during email verification'
        })
    }
}

/**!SECTION
 * 
 * @description - user login 
 * @method - POST
 * @route - /api/auth/login
 * @access - Public
 * 
 */

export async function userLoginController(req, res, next) {
    try {
        const { username, email, password } = req.body
        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }
        // Check if user exists
        const user = await userModel.findOne({ email: email.toLowerCase() }).select('+password')
        //! Check if user exists and is verified
        if (!user || !user.verified) {
            return res.status(400).json({
                success: false,
                message: 'User not found or not verified'
            });
        }
        // Check if password is correct
        if (!await user.comparePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid password'

            })
        }
        // Create token
        const token = jwt.sign({
            email: user.email,
            id: user._id
        }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' })
        // Set token in cookie
        res.cookie('token', token, {
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        })
        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                username: user.username,
                email: user.email,

            }
        })
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
}
/**
 * 
 * @description - get me
 * @method - GET
 * @route - /api/auth/me
 * @access - Private
 */
export async function getMeUserController(req, res, next) {
    try {
        const user = await userModel.findById(req.user.id)
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            })
        }
        return res.status(200).json({
            success: true,
            message: 'User found',
            user: {
                username: user.username,
                email: user.email,
            }
        })
    } catch (err) {
        console.error('Get me error:', err);
        res.status(500).json({
            success: false,
            message: 'Server error during get me'
        });
    }
}