import nodemailer from "nodemailer";

export async function POST(req) {
  const allowedDomains = process.env.ALLOWED_DOMAINS?.split(",").map(d => d.trim());

  const origin = req.headers.get("origin") || req.headers.get("referer");

  if (!origin || !allowedDomains.some(d => origin.startsWith(d))) {
    return new Response(JSON.stringify({ error: "Unauthorized domain" }), {
      status: 403,
    });
  }

  const data = await req.json();
  const { name, email, phone, message, subject, to, cc, bcc } = data;

  // === VALIDATIONS ===
  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{1,15}$/;
  const linkRegex = /https?:\/\/|www\./i;

  if (!name || !nameRegex.test(name)) {
    return new Response(JSON.stringify({ error: "Invalid name. Only text allowed." }), { status: 400 });
  }

  if (!email || !emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email address." }), { status: 400 });
  }

  if (!phone || !phoneRegex.test(phone)) {
    return new Response(JSON.stringify({ error: "Invalid phone number. Only digits up to 15 characters." }), { status: 400 });
  }

  if (!message || linkRegex.test(message)) {
    return new Response(JSON.stringify({ error: "Invalid message." }), { status: 400 });
  }

  if (!to || !subject) {
    return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    const mailOptions = {
      from: `"Noreply" <${process.env.GMAIL_USER}>`,
      to: to.split(",").map(email => email.trim()),
      cc: cc ? cc.split(",").map(email => email.trim()) : undefined,
      bcc: bcc ? bcc.split(",").map(email => email.trim()) : undefined,
      subject,
      html: `
        <h3>New Message Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
    });
  }
}
