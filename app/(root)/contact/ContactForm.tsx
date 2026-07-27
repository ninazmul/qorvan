"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitContactMessage } from "@/lib/actions/contact.actions";
import toast from "react-hot-toast";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Name, Email, and Message are required");
      return;
    }
    setLoading(true);
    const res = await submitContactMessage({
      name,
      email,
      phone,
      subject,
      message,
    });
    setLoading(false);
    if (res.success) {
      toast.success("Message sent successfully! We will get back to you soon.");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } else {
      toast.error(res.error || "Failed to send message");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Full Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your name"
          />
        </div>
        <div>
          <Label>Email Address *</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="email@example.com"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Phone Number</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+880..."
          />
        </div>
        <div>
          <Label>Subject</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Regarding..."
          />
        </div>
      </div>
      <div>
        <Label>Your Message *</Label>
        <Textarea
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          placeholder="Write your message here..."
        />
      </div>
      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-gray-700 text-white py-3 flex items-center justify-center gap-2"
      >
        <Send size={16} /> {loading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
