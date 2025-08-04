"use client";
import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{1,15}$/;
    const linkRegex = /https?:\/\/|www\./i;

    if (!nameRegex.test(form.name)) {
      return "❌ Name must contain only letters and spaces.";
    }
    if (!emailRegex.test(form.email)) {
      return "❌ Invalid email address.";
    }
    if (!phoneRegex.test(form.phone)) {
      return "❌ Phone number must be digits only (max 15).";
    }
    if (linkRegex.test(form.message)) {
      return "❌ Message must not contain links.";
    }
    return null;
  };

  const sendMail = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    const error = validateForm();
    if (error) {
      setStatus(error);
      return;
    }

    try {
      const res = await fetch("/api/send-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("✅ Email sent successfully!");
        setForm({
          name: "",
          email: "",
          phone: "",
          to: "",
          cc: "",
          bcc: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus(`❌ ${data.error}`);
      }
    } catch (error) {
      setStatus("❌ Failed to send email");
    }
  };

  return (
    <form onSubmit={sendMail}>
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={form.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Your Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="phone"
        placeholder="Your Phone"
        value={form.phone}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="to"
        placeholder="To (comma-separated)"
        value={form.to}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="cc"
        placeholder="CC (optional)"
        value={form.cc}
        onChange={handleChange}
      />
      <input
        type="text"
        name="bcc"
        placeholder="BCC (optional)"
        value={form.bcc}
        onChange={handleChange}
      />
      <input
        type="text"
        name="subject"
        placeholder="Subject"
        value={form.subject}
        onChange={handleChange}
        required
      />
      <textarea
        name="message"
        placeholder="Message"
        value={form.message}
        onChange={handleChange}
        required
      />
      <button type="submit">Send Email</button>
      {status && <p>{status}</p>}
    </form>
  );
}
