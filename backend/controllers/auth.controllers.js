import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import genToken from "../utils/token.js";
import { sendOtpMail } from "../utils/mail.js";

//Controller for signup
export const signUp = async (req, res) => {
    try {
        const {fullName, email, password, mobile, role} = req.body;
        let user= await User.findOne({email}) 
        if(user){
            return res.status(400).json({message:"User already exists"})
        }
    if(password.length < 6) {
        return res.status(400).json({message:"Password must be at least 6 characters"})

    }
    if(mobile.length<10){
        return res.status(400).json({message:"mobile no must be at least 10 digits"})
    }
    const hashedPassword=await bcrypt.hash(password,10)
    user=await User.create({
        fullName,
        email,
        role,
        mobile,
        password:hashedPassword  
    }
)
const token=await genToken(user._id)
res.cookie("token",token,{
    secure:false,
    sameSite:"strict",
    maxAge:7*24*3600*1000,
    httpOnly:true


})
return res.status(201).json(user)
    }
    catch(error)
     {
        return res.status(500).json(`sign up error ${error}`)

     }
        
    }


//Controller for sign in
export const signIn = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user= await User.findOne({email}) 
        if(!user){

            return res.status(400).json({message:"User does not exists"})
        }
        const isMatch= await bcrypt.compare(password,user.password)
        if(!isMatch){
            return res.status(400).json({message:"Incorrect Password"})
        }

        
const token=await genToken(user._id)
res.cookie("token",token,{
    secure:false,
    sameSite:"strict",
    maxAge:7*24*3600*1000,
    httpOnly:true


})
return res.status(200).json(user)
    }
    catch(error)
     {
        return res.status(500).json(`sign In error ${error}`)

     }
        
    }

//Controller for sign out
export const signOut = async (req,res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({message:"Logout Succesfully"})
    } catch (error){
                return res.status(500).json(`Sign out Error${error}`)

    }

}

//Controller for send otp

export const sendOtp=async (req,res) => {
    try {
        const{email}=req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User does not exists"})
        }

        const otp = Math.floor(1000+Math.random()*9000).toString()
        user.resetOtp=otp
        user.otpExpires=Date.now()+5*60*1000
        user.isOtpVerified=false
        await user.save()
        console.log("email received from client:", email)
        await sendOtpMail({to:email,otp})
        return res.status(200).json({message:"OTP sent successfully"})
    } catch (error) {
        return res.status(500).json(`OTP sending error ${error}`)    
    }
}

export const verifyOtp = async (req,res) => {

    try {
        const {email,otp}=req.body
        const user = await User.findOne({email})
        if(!user || user.resetOtp!= otp || user.otpExpires<Date.now()){
            return res.status(400).json({message:"Invalid/Expired OTP"})
        }
        user.isOtpVerified=true
        user.resetOtp=undefined
        user.otpExpires=undefined
        await user.save()
                return res.status(200).json({message:"OTP verified successfully"})

    } catch (error) {
                return res.status(500).json(`OTP Verifiication Error ${error}`)    

    }
}
//reset password controller
export const resetPassword = async (req,res) => {
    try {
        
        const {email,newpassword}=req.body
         const user = await User.findOne({email})
        if(!user || !user.isOtpVerified){
            return res.status(400).json({message:"User does not exists or OTP Verification failed"})
        }
        const hashedPassword= await bcrypt.hash(newpassword,10)
        user.password=hashedPassword
        user.isOtpVerified=false
        await user.save()
        return res.status(200).json({message:"Password Reset Successfully"})
    } catch (error) {
        return res.status(500).json(`Error Resetting Password ${error}`)    

    }
    
}
//Contrller foor Google authentication
// TRY 1 HAVING ERROR WITHOUT PASSWORD NOT AUTHENTICATING 
// export const googleauth = async (req,res) => {
//     try {
//         const{fullName,email,mobile,role} = req.body
//         let user = await User.findOne({email})
//         if(!user){
//             user =await User.create({fullName,email,mobile,role})
//         }
               
// const token=await genToken(user._id)
// res.cookie("token",token,{
//     secure:false,
//     sameSite:"strict",
//     maxAge:7*24*3600*1000,
//     httpOnly:true


// })
// return res.status(200).json(user)
    
        
//     } catch (error) {
//                 return res.status(500).json(`Google Authentication Error ${error}`)    

//     }
    
// }
//TRY 2 BACKEND IS CRASHING HERE
// export const googleauth = async (req, res) => {
//   try {
//     const { fullName, email, mobile, role } = req.body;

//     console.log("Received Google Auth payload:", req.body);

//     let user = await User.findOne({ email });
//     if (!user) {
//         const randomPassword = Math.random().toString(36).slice(-8); // generate random 8-char string
//       const hashedPassword = await bcrypt.hash(randomPassword, 10);
//       user = await User.create({ fullName, email, mobile, role ,password:hashedPassword});
//     }

//     const token = await genToken(user._id);
//     res.cookie("token", token, {
//       secure: false,
//       sameSite: "strict",
//       maxAge: 7 * 24 * 3600 * 1000,
//       httpOnly: true,
//     });

//     return res.status(200).json(user);
//   } catch (error) {
//     console.error("Google Authentication Error:", error);
//     return res.status(500).json({ message: `Google Authentication Error: ${error.message}` });
//   }
// };

// TRY3 
export const googleauth = async (req, res) => {
  try {
    const { fullName, email, mobile, role } = req.body;

    console.log("Received Google Auth payload:", req.body);

    // Check for missing fields
    if (!email) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let user = await User.findOne({ email });

    // If user doesn't exist, create a new one
    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await User.create({
        fullName,
        email,
        mobile,
        role,
        password: hashedPassword,
      });
    }

    // Generate token
    const token = await genToken(user._id);

    // Set token cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // change to true if using HTTPS
      sameSite: "strict",
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return res.status(200).json({
      message: "Google authentication successful",
      user,
    });

  } catch (error) {
    console.error("Google Authentication Error:", error);
    return res.status(500).json({
      message: `Google Authentication Error: ${error.message}`,
    });
  }
};

