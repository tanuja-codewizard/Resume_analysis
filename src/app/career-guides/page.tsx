"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookMarked, Download } from "lucide-react";

export default function CareerGuidesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 bg-muted/20 border-b border-border/50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Career Guides & Playbooks</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Deep dive into comprehensive, step-by-step guides for every stage of your career journey. Downloadable PDFs and interactive workbooks.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content (Empty State) */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <BookMarked className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold mb-4">New Guides Coming Soon</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our career experts are currently putting the finishing touches on our first comprehensive playbooks: "The 2024 Tech Resume Format" and "Cracking the Behavioral Interview".
          </p>
          
          <div className="max-w-md mx-auto bg-card border border-border/50 rounded-xl p-6 shadow-lg shadow-primary/5">
            <h3 className="font-semibold text-lg mb-2">Get notified when we launch</h3>
            <p className="text-sm text-muted-foreground mb-4">Join 10,000+ others getting early access to our premium guides.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
              <Button>Notify Me</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
