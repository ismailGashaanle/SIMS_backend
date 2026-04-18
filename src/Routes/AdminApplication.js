
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




AdminApplicationRouter.patch("/Admin/verifeied/Document/phone/:phone",UserAuth,async(req,res)=>{

    try{

        const logginUser = req.user;
        if(logginUser.role !== "admin"){
            throw new Error("access denied only Can Access Admin")
        }

        let {phone} = req.params
        const applicationPhone = await ApplicationModel.findOne({phone})
        if(!applicationPhone){
            throw new Error("application phone not found");
        }
        

        const verifeiedDocument = await userDocumentModel.updateMany(
            {ApplicationId:applicationPhone._id,status:"pending"},
           
            {
                $set:{
                    status:"verfied",
                    verifiedBy:logginUser._id,
                    verifiedAt:new Date()
                }
            }
        )

        
        res.json({
            message:"verified Document Application User",
            data:verifeiedDocument
        })

    }catch(err){
        res.json({
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

    let userBlocked= await User.updateOne({email:email},{
        status:"block"
    });
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



module.exports=AdminApplicationRouter