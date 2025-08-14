const { initialize } = require("passport");
const prisma = require("./client/prisma")
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy

function initilizePassort (passport){
    passport.use(new LocalStrategy({usernameField: "email"}, async (email , password, done) => {
        try{
          const user = await prisma.user.findUnique({
            where: {email: email}
          })
          if(!user){
              done(null, false, {message: "User not found"})
          }
          const isMatch = await bcrypt.compare(password, user.password);
          if(!isMatch){
            done(null, false, {message: "Incorrect password"})
          }
          done(null, user)

        }catch(err){
            done(err)
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    });

    passport.deserialzeUser(async (id, done) => {
        try{
            const user = await prisma.user.findUnique({
                where: {id: id}
            })
            done(null, user)

        }catch(err){
            console.error(err)
            done(err)

        }
    })

}

module.exports = initilizePassort