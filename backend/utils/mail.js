import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465, //gmail k liye port number
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpMail = async ({to,otp}) => {
    await transporter.sendMail({
        from:process.env.EMAIL,
        to,// because the key value pair same hai tabhi is tarah likh sktay 
        subject:"Resetting Your Password",
        html:`<p> Your OTP for Password reset is <b>${otp}</b>. It expires in 5 minutes.</p> `
    })
}