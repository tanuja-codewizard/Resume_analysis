"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 md:p-12 prose prose-stone dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mt-0 mb-4 text-foreground">1. Introduction</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Welcome to CareerAI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">2. The Data We Collect About You</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data</strong> includes email address and telephone numbers.</li>
                <li><strong>Document Data</strong> includes resumes, CVs, cover letters, and any text you provide for AI analysis.</li>
                <li><strong>Usage Data</strong> includes information about how you use our website and services.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">3. How We Process Your Resumes & AI Analysis</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                CareerAI uses advanced Artificial Intelligence (via OpenAI) to analyze your resumes and job descriptions. When you upload a resume:
                <br /><br />
                We extract the text and securely transmit it to our AI providers strictly for the purpose of generating ATS scores, matching keywords, and providing feedback. We do not use your personal documents to train our own foundational AI models, nor do we allow our AI partners (like OpenAI) to use your data for training their models, in accordance with their enterprise API terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">4. Data Security</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. We use secure databases (via Supabase) with row-level security ensuring your data is only accessible by you.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">5. Your Legal Rights</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">6. Contact Us</h2>
              <p className="text-muted-foreground mb-0 leading-relaxed">
                If you have any questions about this privacy policy or our privacy practices, please contact us at privacy@careerai.example.com.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
