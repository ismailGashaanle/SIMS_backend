
const express = require("express");
const app = express();
const connectDB = require("./config/database")
const cookieParser = require("cookie-parser")
const cors = require("cors")
 

// app.use(cors({
//     origin:[
//         "http://localhost:5173"
//     ],
//     credentials:true
// }))
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
 
const AuthRouter = require("./Routes/auth")
const profileRouter = require("./Routes/profile")
const ApplicationRouter = require("./Routes/Application")
const userDocumentRouter = require("./Routes/userDocument")
const AdminApplicationRouter = require("./Routes/AdminApplication")
 
app.use(express.json());        // Parses JSON data
app.use(express.urlencoded({ extended: true }));  // Parses form data
 
app.use(cookieParser())

    app.use("/",AuthRouter)
    app.use("/",profileRouter)
    app.use("/",ApplicationRouter)
    app.use("/",userDocumentRouter)
    app.use("/",AdminApplicationRouter)
 

connectDB().then(()=>{
 console.log("connected successfully database")
    app.listen(7000,(req,res)=>{
        
       console.log("running server")
    })

}).catch((err)=>{
    console.log(err.message)
    console.log("not connected database")
})
