const express = require("express");
const userDocumentRouter = express.Router();
const userAuth = require("../middlewares/Auth")
const User = require("../models/user")
const Application = require("../models/CreateApplication");
const userDocumentModel = require("../models/UserDocument");
const ApplicationModel = require("../models/CreateApplication");


const DocumentSavedData=["ApplicationId",
            "DocumentType",
            "orginalName",
            "fullName",
            "filePath",
            "fileSize",
            "mimeType",
            "status",
            "verifiedBy",
            "verifiedAt",
            "rejectionReason",
            "uploadedAt"]

userDocumentRouter.post("/uploadDocument",userAuth,async(req,res)=>{

    
    try{
        const {
            userId,
            ApplicationId,
            DocumentType,
            orginalName,
            fullName,
            filePath,
            fileSize,
            mimeType,
            status,
            verifiedBy,
            verifiedAt,
            rejectionReason,
            uploadedAt} = req.body;

        const logginUser=req.user

        const ApplicationModel = await Application.findById(ApplicationId)

 
if(!ApplicationModel){
    throw new Error("application ID not found")
}
        const newDocument = new  userDocumentModel({
            userId:logginUser?._id,
            ApplicationId:ApplicationModel._id,
            DocumentType,
            orginalName,
            fullName,
            filePath,
            fileSize,
            mimeType,
            status,
            verifiedBy:null,
            verifiedAt,
            rejectionReason,
            uploadedAt
        })


        const exitingDocument = await userDocumentModel.findOne({
            ApplicationId:ApplicationModel._id,
            DocumentType:DocumentType,
            userId: logginUser._id
        })
        if (!DocumentType) {
    throw new Error("DocumentType is required");
}

        if(exitingDocument){
            throw new Error("al ready uploaded your document exting ")
        }


   await newDocument.save();
        res.json({
            message:"uploaded document",
            data:newDocument
        })

    }catch(err){
        res.json({
            message:err.message

        })
    }

})

userDocumentRouter.get("/view/Document",userAuth,async(req,res)=>{
    try{
     
        const logginUser=req.user
        const ViewDocument = await  userDocumentModel.find({userId:logginUser._id})
        
  
        if (!ViewDocument || ViewDocument.length === 0) {
            return res.json({
                message: "No documents found",
                data: []
            });
        }
        res.json({
            message:"your document ",
            data:ViewDocument
        })


    }catch(err){
        res.json({
            message:err.message
        })
    }
})


userDocumentRouter.get("/track/status",userAuth,async(req,res)=>{

    try{
        

        const statusTrack = await userDocumentModel.findOne()
        res.json({
            message:"your status  : " + statusTrack.status,
            data:statusTrack.status
        })

 

    }catch(err){
        res.json({
            message:err.message
        })
    }

})


userDocumentRouter.get("/get/view/applicationInfo",userAuth,async(req,res)=>{

    try{
        const logginUser= req.user;

        if(logginUser.role!=="admin"){
            throw new Error("access denied only can ACCESS Admin")
        }
       
        // const infoUserData= await userDocumentModel.findOne().populate("userId",["firstName","lastName","email"]).populate("ApplicationId").select(DocumentSavedData)
 

        const infoUserData = await userDocumentModel.find({
    
})
.populate("userId", "firstName lastName email role")
.populate("ApplicationId")
.populate("verifiedBy", "firstName lastName");


        res.json({
            data:infoUserData
        })
    }catch(err){
        res.json({
            message:err.message
        })
    }


})

module.exports=userDocumentRouter;