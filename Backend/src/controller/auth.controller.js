import userModel from "../models/user.model.js";
import sendEmail from "../services/email.service.js";

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
        //NOTE - now send professional mail to user for verification
        let html = `<p>Click <a href="http://localhost:3000/api/auth/verify/${userResponse._id}">here</a> to verify your email</p>`;
        console.log(html);

        // Send email (non-blocking, don't await to prevent crash)
        sendEmail(email, 'Email verification', 'Please verify your email', html).catch(err => {
            console.error('Email sending failed:', err.message);
        });


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

