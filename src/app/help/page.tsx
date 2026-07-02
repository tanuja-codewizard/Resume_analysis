"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FileText, Settings, CreditCard, Shield } from "lucide-react";
import Link from "next/link";

const categories = [
  { icon: FileText, title: "Resume Scoring", desc: "How ATS parsing works and how to improve your score.", link: "#resume-scoring" },
  { icon: Settings, title: "Account & Profile", desc: "Managing your account details and job preferences.", link: "#account" },
  { icon: CreditCard, title: "Billing & Plans", desc: "Upgrades, cancellations, and payment methods.", link: "#billing" },
  { icon: Shield, title: "Privacy & Data", desc: "How we protect your resumes and personal info.", link: "#privacy" }
];

const faqs = [
  { q: "How accurate is the ATS scoring?", a: "We use an enterprise-grade parsing engine similar to those used by Workday and Greenhouse to simulate how your resume is read. Our AI then maps your skills against the job description using vector similarity, achieving a highly accurate prediction." },
  { q: "Why did my resume score so low?", a: "Most low scores are caused by complex formatting (like columns or tables) that ATS systems cannot read. Try switching to a single-column, simple text format." },
  { q: "Is my data used to train your AI?", a: "No. We transmit your resume data securely via API to OpenAI for analysis, and their enterprise policy strictly prohibits using our API data to train their foundational models." },
  { q: "Can I cancel my subscription anytime?", a: "Yes, you can downgrade to the free tier at any time from your billing dashboard. You will retain premium access until the end of your billing cycle." }
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 bg-primary/5">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">How can we help?</h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input 
                className="h-14 pl-12 pr-4 text-lg bg-background shadow-lg shadow-primary/5 rounded-full border-border/50" 
                placeholder="Search for articles, guides, or keywords..." 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={cat.link}>
                  <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
                    <CardHeader>
                      <cat.icon className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
                      <CardTitle className="text-lg">{cat.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="bg-background border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg leading-relaxed">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">Still need help?</p>
            <Link href="/contact" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Contact Support &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
