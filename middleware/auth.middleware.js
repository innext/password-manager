const jwt = require("jsonwebtoken")
const User = require("../models/user-model")
const { TOKEN_KEY } = require("../config/index")

class authorisation {
    static getToken(req)  {
        let { headers: { authorization }} = req
        if (typeof authorization === "undefined") {
            authorization = ""
            return "authorization needed"
        }
        if (authorization && authorization.split(" ")[0] === "Bearer" || authorization.split(' ')[0] === "Token") {
            return authorization.split(" ")[1]
        }
        return null
    }

    static async decodeToken( req, res, next ) {
        const token = await authorisation.getToken(req)
        try {
            const decoded = jwt.verify(token, TOKEN_KEY)
            const user = await User.findOne({"email": decoded.email})
            if (!user) throw Error("User Doesnt't Exist")
            if (user._id != decoded._id) throw Error("Wrong token, lier")
            req.user = user
            next()
            
        } catch (error) {
            next(error)
        }
    }

    static authJSON( user ) {
        return {
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            token: this.genToken(user)
        }
    }

    static genToken( user ) {
        return jwt.sign(
            {
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                _id: user._id
            },
            TOKEN_KEY,
            {
                expiresIn: 3600
            }
        )
    }
}
 
module.exports = authorisation