const bcrypt = require("bcryptjs");
const passport = require("passport");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()

exports.getRegister = (req,res) => {
    res.render("register", {title: "Register"})
};

exports.postRegister = async (req,res) => {
    const {name, email, password} = req.body;
    try{
        const existingUser = await prisma.user.findUnique({where: {email: email}});
        if(existingUser) {
            req.flash("error", "Email already in use");
            return res.redirect("/register")
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({data: {name: name, password: hashedPassword, email: email}})

        req.flash("Success", "Account created please log in")
        res.redirect("/login")

    }catch(err){
       console.error(err)
       req.flash("Error", "Something went wrong. Please retry");
       res.redirect("/register")
    }
}

exports.getLogin = (req,res) => {
    res.render("login", {title: "Login"})
};

exports.postLogin = passport.authenticate("local", {
    successRedirect: "/dahsboard",
    failureRedirect: "/login",
    failureFlash: true
})

exports.logout = (req,res, next) => {
    req.logout(err => {
        if(err){
            next(err)
        }
        req.flash("Success" , "You have logged out");
        res.redirect("/")
    })
}