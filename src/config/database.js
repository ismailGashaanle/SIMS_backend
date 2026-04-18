

const express = require("express")

const mongoose = require("mongoose");
  require("dotenv").config();

const connectDB = async()=>{
    await mongoose.connect(process.env.DATABASE_URL);
}


module.exports =connectDB

// const mongoose = require("mongoose");

// const express = require('express')
//  require("dotenv").config();



// const connectDB = async()=>{
//     await mongoose.connect(process.env.DATABASE_URL)
// }


// module.exports=connectDB;