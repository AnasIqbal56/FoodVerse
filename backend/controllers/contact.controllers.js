import { sendContactFormMail } from "../utils/mail.js";

export const submitContactForm = async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        // Validation
        if (!name || !email || !phone || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Send email
        await sendContactFormMail({ name, email, phone, message });

        res.status(200).json({
            success: true,
            message: "Thank you for contacting us! We'll get back to you soon."
        });
    } catch (error) {
        console.error("Contact form error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message. Please try again later."
        });
    }
};
