const express = require("express");
const userDocumentRouter = express.Router();
const userAuth = require("../middlewares/Auth")
const User = require("../models/user")
const Application = require("../models/CreateApplication");
const userDocumentModel = require("../models/UserDocument");
const ApplicationModel = require("../models/CreateApplication");
const upload = require("../middlewares/upload");

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

        
 
 

// userDocumentRouter.post("/uploadDocument",userAuth,async(req,res)=>{

    
//     try{
//         const {
//             userId,
//             ApplicationId,
//             DocumentType,
//             orginalName,
//             fullName,
//             filePath,
//             fileSize,
//             mimeType,
//             status,
//             verifiedBy,
//             verifiedAt,
//             rejectionReason,
//             uploadedAt} = req.body;

//         const logginUser=req.user

//         const ApplicationModel = await Application.findById(ApplicationId)

 
// if(!ApplicationModel){
//     throw new Error("application ID not found")
// }
//         const newDocument = new  userDocumentModel({
//             userId:logginUser?._id,
//             ApplicationId:ApplicationModel._id,
//             DocumentType,
//             orginalName,
//             fullName,
//             filePath,
//             fileSize,
//             mimeType,
//             status,
//             verifiedBy:null,
//             verifiedAt,
//             rejectionReason,
//             uploadedAt
//         })


//         const exitingDocument = await userDocumentModel.findOne({
//             ApplicationId:ApplicationModel._id,
//             DocumentType:DocumentType,
//             userId: logginUser._id
//         })
//         if (!DocumentType) {
//     throw new Error("DocumentType is required");
// }

//         if(exitingDocument){
//             throw new Error("al ready uploaded your document exting ")
//         }


//    await newDocument.save();
//         res.json({
//             message:"uploaded document",
//             data:newDocument
//         })

//     }catch(err){
//         res.json({
//             message:err.message

//         })
//     }

// })

// userDocumentRouter.post("/uploadDocument", userAuth, async (req, res) => {

//   try {

//     const {
//       DocumentType,
//       orginalName,
//       fullName,
//       filePath,
//       fileSize,
//       mimeType,
//       status,
//       verifiedAt,
//       rejectionReason,
//       uploadedAt
//     } = req.body;

//     const logginUser = req.user;

//     if (!DocumentType) {
//       throw new Error("DocumentType is required");
//     }

//     // ✅ AUTO get user's application
//     const applicationDoc = await Application.findOne({
//       userId: logginUser._id
//     });

//     if (!applicationDoc) {
//       throw new Error("please create application first");
//     }

//     // ✅ prevent duplicate upload
//     const exitingDocument = await userDocumentModel.findOne({
//       ApplicationId: applicationDoc._id,
//       DocumentType,
//       userId: logginUser._id
//     });

//     if (exitingDocument) {
//       throw new Error("already uploaded this document");
//     }

//     // ✅ create document
//     const newDocument = new userDocumentModel({
//       userId: logginUser._id,
//       ApplicationId: applicationDoc._id,
//       DocumentType,
//       orginalName,
//       fullName,
//       filePath,
//       fileSize,
//       mimeType,
//       status,
//       verifiedBy: null,
//       verifiedAt,
//       rejectionReason,
//       uploadedAt
//     });

//     await newDocument.save();

//     res.json({
//       message: "uploaded document",
//       data: newDocument
//     });

//   } catch (err) {
//     res.status(400).json({
//       message: err.message
//     });
//   }
// });



// ADD THIS TEMP ROUTE
userDocumentRouter.get("/fix-paths", async (req, res) => {
  try {
    const docs = await userDocumentModel.find();

    for (let doc of docs) {
      if (doc.filePath.includes("\\")) {
        const filename = doc.filePath.split("\\").pop();

        doc.filePath = `/uploads/${filename}`;
        await doc.save();
      }
    }

    res.send("✅ All file paths fixed");
  } catch (err) {
    res.send(err.message);
  }
});


userDocumentRouter.post(
  "/uploadDocument",
  userAuth,
  upload.single("file"), // 👈 file field name
  async (req, res) => {
    try {
      const { DocumentType, fullName } = req.body;
      const logginUser = req.user;

      // ✅ get user's application automatically
      const application = await Application.findOne({
        userId: logginUser._id,
      });

      if (!application) {
        throw new Error("No application found");
      }

      if (!req.file) {
        throw new Error("File is required");
      }

      // ✅ check duplicate
      const existing = await userDocumentModel.findOne({
        ApplicationId: application._id,
        DocumentType,
        userId: logginUser._id,
      });

      if (existing) {
        throw new Error("Document already uploaded");
      }

      const newDocument = new userDocumentModel({
        userId: logginUser._id,
        ApplicationId: application._id,
        DocumentType,
        orginalName: req.file.originalname,
        fullName,
        // filePath: req.file.path,
        filePath: `/uploads/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      });

      await newDocument.save();

      res.json({
        message: "uploaded document",
        data: newDocument,
      });
    } catch (err) {
      res.status(400).json({
        message: err.message,
      });
    }
  }
);




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



// userDocumentRouter.get("/track/status",userAuth,async(req,res)=>{

//     try{
        

//         const statusTrack = await userDocumentModel.findOne()
//         res.json({
//             message:"your status  : " + statusTrack.status,
//             data:statusTrack.status
//         })

 

//     }catch(err){
//         res.status(400).json({
//             message:err.message
//         })
//     }

// })

userDocumentRouter.get("/track/status", userAuth, async (req, res) => {
  try {


    const logginUser = req.user
    const statusTrack = await userDocumentModel.findOne();

    // ✅ FIX: handle empty DB case
    if (!statusTrack) {
      return res.json({
        message: "No application found",
        data: "no application Found"
      });
    }

    res.json({
      message: "your status : " + statusTrack.status,
      data: statusTrack.status
    });

  } catch (err) {
    res.status(400).json({
      message: err.message
    });
  }
});


userDocumentRouter.get("/get/view/applicationInfo",userAuth,async(req,res)=>{

    try{
        const logginUser= req.user;

        if(logginUser.role!=="admin"){
            throw new Error("access denied only can ACCESS")
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