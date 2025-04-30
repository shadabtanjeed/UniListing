require('dotenv').config();
const nodemailer = require("nodemailer");

async function main() {
    console.log("Setting up Yahoo mail transport...");


    const transporter = nodemailer.createTransport({
        service: 'yahoo',
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    console.log("Sending email via Yahoo...");
    try {
        const info = await transporter.sendMail({
            from: `"UniListing" <${process.env.EMAIL_USER}>`,
            to: "stanjeed@gmail.com",
            subject: "Test Email from UniListing 2",
            text: "This is a test email from UniListing",
            html: "<b>This is a test email from UniListing</b>"
        });

        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

main().catch(console.error);