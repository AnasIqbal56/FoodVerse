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
export const sendDeliveryOtpMail = async ({user,otp}) => {
    await transporter.sendMail({
        from:process.env.EMAIL,
        to: user.email,
        subject:"Your Delivery OTP",
        html:`<p> Your OTP for Delivery is <b>${otp}</b>. It expires in 5 minutes.</p> `
    })
}

export const sendContactFormMail = async ({name, email, phone, message}) => {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: "foodverse124@gmail.com",
        subject: `New Contact Form from ${name}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #C1121F; margin-bottom: 20px;">New Contact Form</h2>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #3E2723;">Name:</strong>
                        <p style="margin: 5px 0; color: #555;">${name}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #3E2723;">Email:</strong>
                        <p style="margin: 5px 0; color: #555;">${email}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #3E2723;">Phone:</strong>
                        <p style="margin: 5px 0; color: #555;">${phone}</p>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #3E2723;">Message:</strong>
                        <p style="margin: 5px 0; color: #555; white-space: pre-wrap;">${message}</p>
                    </div>
                </div>
            </div>
        `
    })
}