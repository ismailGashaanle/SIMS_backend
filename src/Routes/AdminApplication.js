
const express = require("express");

const AdminApplicationRouter=express.Router();

const UserAuth = require("../middlewares/Auth");
const ApplicationModel = require("../models/CreateApplication")
const userDocumentModel = require("../models/UserDocument")
const User = require("../models/user")



AdminApplicationRouter.get("/All/Application",UserAuth,async(req,res)=>{

  try{

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10
    const skip= (page - 1) * limit;
    if(limit >50){
        limit =10
    }

      const  application = await ApplicationModel.find({}).skip(skip).limit(limit);

      const logginUser = req.user;
      if(logginUser.role!=="admin"){
        throw new Error("access denied only admin can access ")
      }

    if(!application){
        throw new Error("not found applications")
    }

    res.json({
        message:"all  applications is here",
         page,
        limit,
        data:application
    })


  }catch(err){
    res.json({
        message:err.message
    })
  }



})



AdminApplicationRouter.get("/search/application/phone/:phone",UserAuth,async(req,res)=>{

    try{

        const logginUser= req.user;
        if(logginUser.role !== "admin"){
            throw new Error("access deneid , only access Admin")
        }
        const {email}=req.params
        const {phone}=req.params

        const phoneSearch =  await  ApplicationModel.findOne(
            {phone:phone}
        ).populate("userId").populate('documents')
        // const application =  await  ApplicationModel.findOne({email:email});

        if(!phoneSearch){
            throw new Error(`not found this phone number `)
        }

        

        res.json({
               message: "Application found",
        data:phoneSearch
        })



    }catch(err){
        res.json({
            message:err.message
        })
    }

})

AdminApplicationRouter.get("/search/application/email/:email",UserAuth,async(req,res)=>{

    try{

        const logginUser=req.user;
       const {email}=req.params
        if(logginUser.role !== "admin"){
            throw new Error("access deneid only can Access Admin");
        }
        const searchEmail = await ApplicationModel.findOne({email:email}).populate("documents")

        if(!searchEmail){
            throw new Error("email not found")
        }


        res.json({
          message:"Application found",
          data:searchEmail
        })

       

    }catch(err){
        res.json({
            message:err.message
        })
    }
})


AdminApplicationRouter.get("/search/application/passportNumber/:passportNumber",UserAuth,async(req,res)=>{


    try{

        const logginUser=req.user;
        const {passportNumber} = req.params
        if(logginUser.role !=="admin"){
            throw new Error("admin can access only")
        }


        const passportSearch = await ApplicationModel.findOne({
            passportNumber:passportNumber
        })
        if(!passportNumber){
            throw new Error ("not found application")
        }

        res.json({
            data:passportSearch
        })

    }catch(err){
        res.status(400).json({
             message:err.message
        })
    }

})




AdminApplicationRouter.patch("/Admin/verifeied/Document/id/:id",UserAuth,async(req,res)=>{

    try{

        const logginUser = req.user;
        if(logginUser.role !== "admin"){
            throw new Error("access denied only Can Access Admin")
        }

        let {id} = req.params
        const applicationPhone = await userDocumentModel.findOne({_id:id})
        if(!applicationPhone){
            throw new Error("application document not found");
        }
        
        
        const verifeiedDocument = await userDocumentModel.updateMany(
            // {ApplicationId:applicationPhone._id,status:"pending"},
             { ApplicationId: applicationPhone.ApplicationId, status: "pending" },
           
            {
                $set:{
                    status:"verified",
                    verifiedBy:logginUser._id,
                    verifiedAt:new Date()
                }
            }
        )

       const checkveriyDocumentStatus = await userDocumentModel.findOne({
  ApplicationId: applicationPhone.ApplicationId,
  status: "verified"
});

// if (checkveriyDocumentStatus) {
//   await ApplicationModel.findOneAndUpdate(
//     { _id: applicationPhone.ApplicationId },
//     { status: "verified" }
//   );
// }

if (checkveriyDocumentStatus) {
  const application = await ApplicationModel.findById(applicationPhone.ApplicationId);

  // ✅ create letter
  const letter = `
REPUBLIC OF SOMALILAND
MINISTRY OF INTERIOR
DEPARTMENT OF IMMIGRATION

VISA APPROVAL LETTER

Name: ${application.fullName}
Passport: ${application.passportNumber}
Nationality: ${application.nationality}

Status: APPROVED
Valid: 90 Days

`;

  // ✅ save in DB
  application.approvalLetter = letter;
  await application.save();
}
        
        res.json({
            message:"verified Document Application User",
            data:verifeiedDocument
        })

    }catch(err){
        res.status(400).json({
            message:err.message
        })
    }

})

AdminApplicationRouter.patch("/Admin/rejected/Document/id/:id",UserAuth,async(req,res)=>{

    try{
        const logginUser = req.user
        const {id}=req.params

        if(logginUser.role !=="admin"){
            throw new Error("access denied only can access Admin")
        }

        const AppliactionRejected = await userDocumentModel.findOne({_id:id})

        if(!AppliactionRejected){
            throw new Error("not found this application to rejected")
        }


        // const RejectedDocument= await userDocumentModel.updateMany(

        //     {ApplicationId:AppliactionRejected.ApplicationId ,status:"pending"},

        //     {
        //         $set:{
        //             status:"rejected",
        //             verifiedBy:logginUser._id,
        //             verifiedAt:new Date()
        //         }
        //     }

        // )

        const RejectedDocument = await userDocumentModel.updateMany(
      { ApplicationId: AppliactionRejected.ApplicationId, status: "pending" },
      {
        $set: {
          status: "rejected",
          verifiedBy: logginUser._id,
          verifiedAt: new Date()
        }
      }
    );


        res.json({
            message:"rejected application",
            data:RejectedDocument
        })




    }catch(err){
        res.status(400).json({
            message:err.message
        })
    }

})




AdminApplicationRouter.get("/admin/report/dashboard", UserAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "admin only" });
    }

    const totalUsers = await User.countDocuments();
    const totalApplications = await ApplicationModel.countDocuments();
    const totalDocuments = await userDocumentModel.countDocuments();

    const verifiedDocuments = await userDocumentModel.countDocuments({ status: "verified" });
    const pendingDocuments = await userDocumentModel.countDocuments({ status: "pending" });
    const rejectedDocuments = await userDocumentModel.countDocuments({ status: "rejected" });

    res.json({
      totalUsers,
      totalApplications,
      totalDocuments,
      verifiedDocuments,
      pendingDocuments,
      rejectedDocuments
    });

  } catch (err) {
    res.json({ message: err.message });
  }
});


AdminApplicationRouter.post("/user/block/email/:email/",UserAuth, async(req,res)=>{

   try{
     const logginUser = req.user;
    if(logginUser.role !=="admin"){
        throw new Error("access denied only can access ADMIN")
    }
    let {email}=req.params;

    // let userBlocked= await User.updateOne({email:email},{
    //     status:"block"
    // });

   const currentUser = await User.findOne({ email });

    // ❗ FIX 1: handle user not found
    if (!currentUser) {
      throw new Error("User not found");
    }

    // ❗ FIX 2: correct toggle logic
    let newStatus =
      currentUser.status === "block" ? "active" : "block";

    let userBlocked = await User.updateOne(
      { email: email },
      { status: newStatus }
    );

    //   userBlocked = await  User({
    //     status:"block"
    //   })

      res.json({
        message:"blocked user",
        data:userBlocked
      })
   }catch(err){
    res.json({
        message:err.message
    })
   }
})


AdminApplicationRouter.delete("/admin/application/id/:id",UserAuth, async(req,res)=>{

    try{

        const logginUser = req.user
         const {id}=req.params

        if(logginUser.role !=="admin"){
            throw new Error("access denied only can access Admin")
        }

        const deletedApplicationUser = await ApplicationModel.findByIdAndDelete(id)
        if(!deletedApplicationUser){
            throw new Error("not found this user")
        }
        res.json({
            message:"successfuly deleted user",
            data:ApplicationModel
        })


    }catch(err){
         res.status(400).json({
        message:err.message
    })
    }
   

})


// // AdminApplicationRouter.get("/admin/report/dashboard", UserAuth, async (req, res) => {
// //   try {
// //     if (req.user.role !== "admin") {
// //       return res.status(403).json({ message: "admin only" });
// //     }

// //     const totalUsers = await User.countDocuments();
// //     const totalApplications = await ApplicationModel.countDocuments();
// //     const totalDocuments = await userDocumentModel.countDocuments();

// //     const verifiedDocuments = await userDocumentModel.countDocuments({ status: "verified" }); // ✅ FIX
// //     const pendingDocuments = await userDocumentModel.countDocuments({ status: "pending" });
// //     const rejectedDocuments = await userDocumentModel.countDocuments({ status: "rejected" });

// //     res.json({
// //       totalUsers,
// //       totalApplications,
// //       totalDocuments,
// //       verifiedDocuments,
// //       pendingDocuments,
// //       rejectedDocuments
// //     });

// //   } catch (err) {
// //     res.json({ message: err.message });
// //   }
// // });


// AdminApplicationRouter.get("/admin/full-report", UserAuth, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Admin only" });
//     }

//     // ===============================
//     // BASIC COUNTS
//     // ===============================
//     const totalUsers = await User.countDocuments();
//     const activeUsers = await User.countDocuments({ status: "active" });
//     const blockedUsers = await User.countDocuments({ status: "block" });

//     const totalApplications = await Application.countDocuments();

//     const approvedApps = await Application.countDocuments({ status: "verified" });
//     const pendingApps = await Application.countDocuments({ status: "pending" });
//     const rejectedApps = await Application.countDocuments({ status: "rejected" });

//     const totalDocuments = await Document.countDocuments();

//     // ===============================
//     // 📌 APPLICATION BY COUNTRY
//     // ===============================
//     const nationalityStats = await Application.aggregate([
//       {
//         $group: {
//           _id: "$nationality",
//           total: { $sum: 1 },
//           approved: {
//             $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] }
//           },
//           rejected: {
//             $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
//           }
//         }
//       },
//       { $sort: { total: -1 } }
//     ]);

//     // ===============================
//     // 📌 VISA TYPE ANALYSIS
//     // ===============================
//     const visaTypeStats = await Application.aggregate([
//       {
//         $group: {
//           _id: "$ApplicationType",
//           total: { $sum: 1 }
//         }
//       }
//     ]);

//     // ===============================
//     // 📌 DOCUMENT TYPE ANALYSIS
//     // ===============================
//     const documentStats = await Document.aggregate([
//       {
//         $group: {
//           _id: "$DocumentType",
//           total: { $sum: 1 },
//           verified: {
//             $sum: { $cond: [{ $eq: ["$status", "verified"] }, 1, 0] }
//           },
//           rejected: {
//             $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
//           }
//         }
//       }
//     ]);

//     // ===============================
//     // 📌 REJECTION REASONS
//     // ===============================
//     const rejectionReasons = await Document.aggregate([
//       {
//         $match: { status: "rejected" }
//       },
//       {
//         $group: {
//           _id: "$rejectionReason",
//           total: { $sum: 1 }
//         }
//       }
//     ]);

//     // ===============================
//     // 📌 MONTHLY APPLICATION TREND
//     // ===============================
//     const monthlyApplications = await Application.aggregate([
//       {
//         $group: {
//           _id: {
//             month: { $month: "$createdAt" },
//             year: { $year: "$createdAt" }
//           },
//           total: { $sum: 1 }
//         }
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } }
//     ]);

//     // ===============================
//     // 📌 APPROVAL RATE
//     // ===============================
//     const approvalRate =
//       totalApplications === 0
//         ? 0
//         : ((approvedApps / totalApplications) * 100).toFixed(2);

//     // ===============================
//     // FINAL RESPONSE
//     // ===============================
//     res.json({
//       summary: {
//         users: { totalUsers, activeUsers, blockedUsers },
//         applications: {
//           totalApplications,
//           approvedApps,
//           pendingApps,
//           rejectedApps,
//           approvalRate: approvalRate + "%"
//         },
//         documents: { totalDocuments }
//       },

//       nationalityStats,
//       visaTypeStats,
//       documentStats,
//       rejectionReasons,
//       monthlyApplications
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// AdminApplicationRouter.get("/admin/report/full", UserAuth, async (req, res) => {
//   try {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ message: "Admin only" });
//     }

//     const Application = ApplicationModel;
//     const Document = userDocumentModel;

//     // =========================
//     // 1. BASIC COUNTS (FAST)
//     // =========================
//     const [
//       totalUsers,
//       totalApplications,
//       totalDocuments
//     ] = await Promise.all([
//       User.countDocuments(),
//       Application.countDocuments(),
//       Document.countDocuments()
//     ]);

//     // =========================
//     // 2. APPLICATION STATUS
//     // =========================
//     const applicationStatusAgg = await Application.aggregate([
//       {
//         $group: {
//           _id: { $toLower: "$status" },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const applicationStatus = {};
//     applicationStatusAgg.forEach(i => {
//       applicationStatus[i._id || "unknown"] = i.count;
//     });

//     // =========================
//     // 3. VISA TYPE ANALYSIS
//     // =========================
//     const visaTypeAgg = await Application.aggregate([
//       {
//         $group: {
//           _id: "$ApplicationType",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const visaType = {};
//     visaTypeAgg.forEach(i => {
//       visaType[i._id || "unknown"] = i.count;
//     });

//     // =========================
//     // 4. COUNTRY / NATIONALITY
//     // =========================
//     const countryAgg = await Application.aggregate([
//       {
//         $group: {
//           _id: "$nationality",
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);

//     const countryStats = {};
//     countryAgg.forEach(i => {
//       countryStats[i._id || "unknown"] = i.count;
//     });

//     // =========================
//     // 5. DOCUMENT TYPE
//     // =========================
//     const documentAgg = await Document.aggregate([
//       {
//         $group: {
//           _id: "$DocumentType",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const documentType = {};
//     documentAgg.forEach(i => {
//       documentType[i._id || "unknown"] = i.count;
//     });

//     // =========================
//     // 6. DOCUMENT STATUS
//     // =========================
//     const docStatusAgg = await Document.aggregate([
//       {
//         $group: {
//           _id: { $toLower: "$status" },
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const documentStatus = {};
//     docStatusAgg.forEach(i => {
//       documentStatus[i._id || "unknown"] = i.count;
//     });

//     // =========================
//     // 7. REJECTION REASONS
//     // =========================
//     const rejectionAgg = await Document.aggregate([
//       { $match: { status: "rejected" } },
//       {
//         $group: {
//           _id: "$rejectionReason",
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     const rejectionMap = {};
//     rejectionAgg.forEach(i => {
//       rejectionMap[i._id || "unknown"] = i.count;
//     });

//     // =========================
//     // 8. MONTHLY TREND (IMPORTANT FOR CHARTS)
//     // =========================
//     const monthlyAgg = await Application.aggregate([
//       {
//         $group: {
//           _id: {
//             year: { $year: "$createdAt" },
//             month: { $month: "$createdAt" }
//           },
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { "_id.year": 1, "_id.month": 1 } }
//     ]);

//     const monthlyTrend = monthlyAgg.map(i => ({
//       label: `${i._id.year}-${i._id.month}`,
//       count: i.count
//     }));

//     // =========================
//     // 9. APPROVAL RATE
//     // =========================
//     const approved = applicationStatus["verified"] || 0;
//     const approvalRate =
//       totalApplications === 0
//         ? 0
//         : ((approved / totalApplications) * 100).toFixed(2);

//     // =========================
//     // RESPONSE (FRONTEND READY)
//     // =========================
//     res.json({
//       summary: {
//         totalUsers,
//         totalApplications,
//         totalDocuments,
//         approvalRate: approvalRate + "%"
//       },

//       charts: {
//         applicationStatus,
//         visaType,
//         countryStats,
//         documentType,
//         documentStatus,
//         rejectionMap,
//         monthlyTrend
//       }
//     });

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

AdminApplicationRouter.get("/admin/report/full", UserAuth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }

    const type = req.query.type || "summary";

    // ================= USERS =================
    if (type === "users") {
      const users = await User.find().select("firstName lastName email role createdAt");
      return res.json({
        type: "users",
        data: users,
      });
    }

    // ================= APPLICATIONS =================
    if (type === "applications") {
      const applications = await ApplicationModel.find().select(
        "userId status ApplicationType createdAt  approvalLetter      nationality passportNumber passportExpireDate  passportDateIssue"
      );
      return res.json({
        type: "applications",
        data: applications,
      });
    }

    // ================= DOCUMENTS =================
    if (type === "documents") {
      const documents = await userDocumentModel.find().select(
        "DocumentType status rejectionReason createdAt ApplicationId verifiedAt      verifiedBy  orginalName  fullName filePath"
      );
      return res.json({
        type: "documents",
        data: documents,
      });
    }

    // ================= SUMMARY DASHBOARD =================
  // ================= SUMMARY DASHBOARD =================
const [
  totalUsers,
  totalApplications,
  totalDocuments,
  applications,
  documents,
] = await Promise.all([
  User.countDocuments(),
  ApplicationModel.countDocuments(),
  userDocumentModel.countDocuments(),
  ApplicationModel.find(),
  userDocumentModel.find(),
]);

// ✅ application status count
const applicationStatus = {};
applications.forEach((a) => {
  const key = a.status || "unknown";
  applicationStatus[key] = (applicationStatus[key] || 0) + 1;
});

// ✅ document status count
const documentStatus = {};
documents.forEach((d) => {
  const key = d.status || "unknown";
  documentStatus[key] = (documentStatus[key] || 0) + 1;
});

return res.json({
  summary: {
    totalUsers,
    totalApplications,
    totalDocuments,
  },
  charts: {
    applicationStatus,
    documentStatus,
    visaType: {},      // keep empty if not ready
    countryStats: {},  // keep empty if not ready
    monthlyTrend: [],  // keep empty if not ready
  },
});
    // return res.json({
    //   summary: {
    //     totalUsers,
    //     totalApplications,
    //     totalDocuments,
    //   },
    //   charts: {}, // keep empty if not needed now
    // });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports=AdminApplicationRouter