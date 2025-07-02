const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const jwt_secret_key = process.env.JWT_SECRET;

const authenticateToken = (req,res,next)=> {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    if(!token){
        return res.status(401).json({
            message: "Access denied. No token provided."
        });
    }
    jwt.verify(token,jwt_secret_key, (err,user)=>{
        if(err){
            console.log("Error! Invalid token");
            return res.status(403).json({ message: 'Invalid or expired token.' });
            
        }
        req.user = user;
        next(); //to forward control to the next function in the api route
    });
}
module.exports = authenticateToken;