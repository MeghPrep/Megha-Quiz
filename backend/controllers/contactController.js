import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    // 1. Create a transporter using your Gmail App Password configuration
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Draft the HTML template layout for your inbox notifications
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      replyTo: email, // Lets you hit reply to respond directly to the candidate
      subject: `Megha Quiz Support: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">New Support Ticket</h2>
          <p><strong>Candidate Name:</strong> ${name}</p>
          <p><strong>Reply Email Address:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 15px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    };

    // 3. Deliver the email message transport block securely
    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({
        success: true,
        message: "Your message has been sent successfully!",
      });
  } catch (error) {
    console.error("Nodemailer routing transmission error:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to deliver support request ticket.",
      });
  }
};
