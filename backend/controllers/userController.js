const catchAsyncError = require("../middleware/catchAsyncError");
const ErrorHandler = require("../utils/errorhandler");
//const ErrorHandler = require("../middleware/error.js");
const User=require("../models/userModel");
const sendToken=require("../utils/Jwttoken");
const sendEmail=require("../utils/sendEmail")
const crypto=require('crypto')
// Register a User

exports.registerUser=catchAsyncError(async(req,res,next)=>{

  const {name,email,password}=req.body;
  const user=await User.create({
    name,
    email,
    password,
    avatar:{
        public_id:"this is a sample id",
        url:"profilePicUrl"
    }
  });
sendToken(user,201,res)
})


//login a user
exports.loginUser=catchAsyncError(async(req,res,next)=>{
const{email,password}=req.body;
console.log("error");

//checking if user given the email and password both
if(!email ||!password){
  return next(new ErrorHandler("please enter email & password",400));
}

const user=await User.findOne({email}).select("+password");

if(!user){
   return next(new ErrorHandler("Invalid Email or Password"),401)
}

const isPasswordMatched=await user.comparePassword(password);
if(!isPasswordMatched){
  return next(new ErrorHandler("Invalid Email or Password",401))
  console.log("password doest not matched");
}
sendToken(user,200,res);
})

//logout user
exports.logout=catchAsyncError(async (req,res,next)=>{
  res.cookie("token",null,{
    expires:new Date(Date.now()),
    httpOnly:true
  })
  res.status(200).json({
    success:true,
    message:"logout"
  })
})

//forgot password

exports.forgotPassword= catchAsyncError(async(req,res,next)=>{
    const user=await User.findOne({email:req.body.email});

    if(!user){
    //  return next(new ErrorHandler("User not found",404))
    return res.status(404).json({
      success:false,
      message:"The user not found"
    })
    }

    //Get Reset Password Token
    const resetToken=user.getResetPasswordToken();
    console.log("error");
  await user.save({validateBeforeSave:false});
  console.log("error1");
  const resetPasswordUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`
  console.log("error3")
  const message=`your password reset token is:-\n\n ${resetPasswordUrl}\n\n if you not required this email then,please ignore it`;
  console.log("error4")
  try {
    console.log("error5 in try")
   await sendEmail({
    email:user.email,
    subject:`Ecommerce password recovery`,
    message
   })
   console.log("error6 after snd email")
   res.status(200).json({
    success:true,
    message:`Email sent to ${user.email} successfully`,
   })  
  } catch (error) {
    console.log("error in catch")
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save({validateBeforeSave:false});
    return next(new ErrorHandler(error.message,500));
  }
})


//reset password
exports.resetPassword= catchAsyncError(async(req,res,next)=>{

//creating token hash
const resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");

const user=await User.findOne({
  resetPasswordToken,
  resetPasswordExpire:{$gt:Date.now()}
})
if (!user){
  return next(
     new ErrorHandler(
      "Reset Password Token is invalid or has been expired",400
     )
  )
}

if(req.body.password !== req.body.confirmPassword){
  return next(new ErrorHandler("Password does not password",400));
}

user.password=req.body.password;
user.resetPasswordToken=undefined;
user.resetPasswordExpire=undefined;

await user.save();

sendToken(user,200,res)


})

//getuserdetail
exports.getUserDetails=catchAsyncError(async(req,res,next)=>{
  const user=await User.findById(req.user.id);
  res.status(200).json({
    success:true,
    user
  })
})

// update user password
exports.updatePassword=catchAsyncError(async(req,res,next)=>{
  const user=await User.findById(req.user.id).select("+password");

  const isPasswordMatched=await user.comparePassword(req.body.oldPassword);
  if(!isPasswordMatched){
    return next(new ErrorHandler("old password is incorrect",400));
  }
  if(req.body.newPassword !== req.body.confirmPassword){
    return next(new ErrorHandler("password does not match",400));
  }
  user.password=req.body.newPassword;
  await user.save();
  sendToken(user,200,res)
})

// update user profile
exports.updateProfile=catchAsyncError(async(req,res,next)=>{

 const newUserdata={
  name:req.body.name,
  email:req.body.email
 }
 
 // we will add clundinary

 const user=await User.findByIdAndUpdate(req.user.id,newUserdata,{
   
  new:true,
  runValidators:true,
  useFindAndModify:false
 })

 res.status(200).json({
  success:true
 })
})

// Get all users (admin)
exports.getAllUser=catchAsyncError(async(req,res,next)=>{
  
  const users=await User.find();
  res.status(200).json({
    success:true,
    users
  });

});

//Get Single user(admin)

exports.getSingleUser=catchAsyncError(async(req,res,next)=>{
  const user=await User.findById(req.params.id);
  if(!user){
    return next(
      new ErrorHandler(`user does not exist with id:${req.params.id}`)
    )
  }
  res.status(200).json({
    success:true,
    user
  })
})

// update user role by admin
exports.updateUserRole=catchAsyncError(async(req,res,next)=>{

  const newUserdata={
   name:req.body.name,
   email:req.body.email,
   role:req.body.role
  }
  
  
 
  const user=await User.findByIdAndUpdate(req.params.id,newUserdata,{
    
   new:true,
   runValidators:true,
   useFindAndModify:false
  })
 
  res.status(200).json({
   success:true
  })
 })
 
 // delete user (admin) 
exports.deleteProfile=catchAsyncError(async(req,res,next)=>{

 
  const user=await User.findById(req.params.id)
  if(!user){
    return next(
      new ErrorHandler(`user does not exist with id:${req.params.id}`)
    )
    
  }
  await user.remove();
 
  res.status(200).json({
   success:true,
   message:"User deleted succesfully"
  })
 })
 