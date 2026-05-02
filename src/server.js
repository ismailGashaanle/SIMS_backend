
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
const userRouter = require("./Routes/userRoutes")

const fs = require("fs");
const path = require("path");
const http = require("http");
const server = http.createServer(app);
const uploadPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
 
const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
});

app.use(express.json());        // Parses JSON data
app.use(express.urlencoded({ extended: true }));  // Parses form data
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser())

    app.use("/",AuthRouter)
    app.use("/",profileRouter)
    app.use("/",ApplicationRouter)
    app.use("/",userDocumentRouter)
    app.use("/",AdminApplicationRouter)
    app.use("/",userRouter)
 

connectDB().then(()=>{
 console.log("connected successfully database")
    app.listen(7000,(req,res)=>{
        
       console.log("running server")
    })

}).catch((err)=>{
    console.log(err.message)
    console.log("not connected database")
})
