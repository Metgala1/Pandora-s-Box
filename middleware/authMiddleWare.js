const prisma = require("../client/prisma");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.isAuthenticated = async (req, res, next)=> {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith("Bearer")){
        res.status(401).json({message: "You must login first"})
        }
        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.SESSION_SECRET);

        const user = await prisma.user.findUnique({
            where: {
                id: decoded.id
            }
        })
        req.user = user;// attack user info to the request
        next()

    }catch(err){
        console.error("Auth check failed")
       return res.status(401).json({message: "Authentication failed"})
    }

}