
// const User = require("../models/user")
// const jwt = require('jsonwebtoken')
// const UserAuth=async(req,res,next)=>{

//     try{

//         const cookies = req.cookies
//         const {token}=cookies;

//         if(!token){
//            res.status(401).json("please login ")
//         }
//      const decoded = await  jwt.verify(token,process.env.SIMS_Secret);
//      const {_id}=decoded;

//       const user =  await User.findById(_id);
//       if(!user){
//         throw new Error("user not found")
//       }

//       req.user = user
//       next();

//     }catch(err){
//         res.json({
//             message:err.message
//         })
//     }

// }


// module.exports=UserAuth

const User = require("../models/user");
const jwt = require("jsonwebtoken");

const UserAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "please login" });
    }

    const decoded = jwt.verify(token, process.env.SIMS_Secret);
    const { _id } = decoded;

    const user = await User.findById(_id);

    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      message: err.message || "unauthorized",
    });
  }
};

module.exports = UserAuth;