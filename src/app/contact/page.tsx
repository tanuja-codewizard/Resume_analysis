"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
            >
              Get in Touch
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground"
            >
              Have a question about our ATS scoring? Want to partner with us? We'd love to hear from you.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardContent className="pt-8 pb-8">
                <Mail className="w-10 h-10 mx-auto text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">Email Us</h3>
                <p className="text-muted-foreground mb-4">For general inquiries and support.</p>
                <a href="mailto:hello@careerai.example.com" className="text-primary hover:underline font-medium">hello@careerai.example.com</a>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardContent className="pt-8 pb-8">
                <MessageSquare className="w-10 h-10 mx-auto text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">Press & Media</h3>
                <p className="text-muted-foreground mb-4">For press kits and interview requests.</p>
                <a href="mailto:press@careerai.example.com" className="text-primary hover:underline font-medium">press@careerai.example.com</a>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50 text-center">
              <CardContent className="pt-8 pb-8">
                <MapPin className="w-10 h-10 mx-auto text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">Office</h3>
                <p className="text-muted-foreground mb-4">We're a remote-first company.</p>
                <p className="text-foreground font-medium">San Francisco, CA (HQ)</p>
              </CardContent>
            </Card>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-xl shadow-primary/5">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you within 24 hours.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for reaching out! We'll get back to you soon."); }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" required className="bg-background/50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" required className="bg-background/50" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required className="bg-background/50" placeholder="you@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" required className="bg-background/50" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea 
                      id="message" 
                      required
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="How can we help?"
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-base">Send Message</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
