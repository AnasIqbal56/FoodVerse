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

export const sendPaymentConfirmationMail = async ({to, orderId, amount, customerName, items}) => {
    const itemsList = items && items.length > 0 
        ? items.map(item => `<li>${item.name} x ${item.quantity} - R${item.price}</li>`).join('')
        : '<li>Order items</li>';
    
    await transporter.sendMail({
        from: process.env.EMAIL,
        to,
        subject: `Payment Successful - Order #${orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f7f7f7;">
                <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #10B981; margin-bottom: 20px;">✓ Payment Successful!</h2>
                    <p style="color: #555; font-size: 16px;">Hi ${customerName},</p>
                    <p style="color: #555; margin-bottom: 20px;">Thank you for your payment. Your order has been confirmed.</p>
                    
                    <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #3E2723; margin-top: 0;">Order Details</h3>
                        <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
                        <p style="margin: 5px 0;"><strong>Amount Paid:</strong> R${amount}</p>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <h3 style="color: #3E2723;">Items:</h3>
                        <ul style="color: #555;">
                            ${itemsList}
                        </ul>
                    </div>
                    
                    <p style="color: #555; margin-top: 30px;">Your food is being prepared and will be delivered soon!</p>
                    <p style="color: #888; font-size: 14px; margin-top: 20px;">If you have any questions, please contact our support.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
                        <p style="color: #888; font-size: 12px;">© FoodVerse - Delicious food delivered to your door</p>
                    </div>
                </div>
            </div>
        `
    });
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