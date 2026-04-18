const express = require ("express");

const ApplicationRouter= express.Router();
const userAuth = require("../middlewares/Auth");
const applicationModel= require ("../models/CreateApplication");
const User = require("../models/user")
 

ApplicationRouter.post("/application",userAuth,async(req,res)=>{

   const {ApplicationValidate} = require("../utils/CheckValidate")

    try{
    if(!ApplicationValidate(req)){
        throw new Error("invalid new application");
    }
const logginUser=req.user
    //   const userRole= await User.find(logginUser._id)
   
      if(logginUser.role==="admin"){
        throw new Error("you are admin role not able to document upload or create new application")
      }
       
        const { userId, fullName,
           ApplicationType,
           email,
           phone,
           dateOfBirth,
           nationality,
           passportNumber,
           passportDateIssue,
           passportExpireDate,
           purposeOfTravel,
           intendedDepartureDate,
           addressInDestination}=req.body;
        

      

        const application=await applicationModel({
          userId:logginUser,
           fullName,
           ApplicationType,
           email,
           phone,
           dateOfBirth,
           nationality,
           passportNumber,
           passportDateIssue,
           passportExpireDate,
           purposeOfTravel,
           intendedDepartureDate,
           addressInDestination


        })



        await application.save()

        res.json({
            message:"successfuly created new application",
            data:application
            
        })
        

    }catch(err){
        res.json({
            message:err.message
        })
    }

})


ApplicationRouter.get("/getMyApplication",userAuth,async(req,res)=>{

    try{
 const userId = req.user._id
        const application= await applicationModel.find({userId:userId})
       
        if(!application){
            throw new Error("application not found ")
        }
        res.json({
            message:"succesfuly get your application",
            data:application
        })

    }catch(err){
        res.json({
            message:err.message
        })
    }

})

ApplicationRouter.delete("/cancel/application/:applicationid",userAuth,async(req,res)=>{

    try{

        const {applicationid}=req.params
        if(!applicationid){
            throw new Error("not found application ID")
        }
        const cancelApplicatipon= await applicationModel.findByIdAndDelete(applicationid)

 if(!cancelApplicatipon){
    throw new Error("not found application to delete")
 }
     
//  await applicationModel.save();

        res.json({
           message:"delete successfuly",
        //    data:cancelApplicatipon
        })


    }catch(err){
        res.json({
            message:err.message
        })
    }

})


module.exports= ApplicationRouter;