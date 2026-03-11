import jwt from 'jsonwebtoken'
import 'dotenv/config'

export async function authVerifyMiddleware(req, res, next) {
    
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })

        }
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY)
        if (!decode) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized'
            })
        }
        req.user = decode
        next()
    } catch (err) {
        console.log("jwt err",err);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized'
        })
        
    }
}