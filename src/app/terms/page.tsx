"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-lg mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 md:p-12 prose prose-stone dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mt-0 mb-4 text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                By accessing or using CareerAI ("the Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the Service.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">2. Description of Service</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                CareerAI provides an AI-powered platform for resume analysis, ATS scoring, mock interviews, and career guidance. The Service utilizes large language models to generate feedback and suggestions based on user-provided inputs.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">3. User Responsibilities</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
                <br /><br />
                You agree not to upload any documents containing sensitive personal information (such as social security numbers, banking details, or health information) that is not relevant to a standard job application.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">4. AI Accuracy and Limitations Disclaimer</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Our Service relies on Artificial Intelligence. While we strive for high quality, AI-generated content (including ATS scores, resume feedback, and interview questions) may occasionally produce inaccurate, misleading, or inappropriate results. 
                <br /><br />
                <strong>CareerAI provides suggestions for informational purposes only. We do not guarantee that using our Service will result in job interviews or employment offers.</strong> You are solely responsible for reviewing and verifying any AI-generated feedback before applying it to your professional career.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">5. Intellectual Property</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                The Service and its original content, features, and functionality are and will remain the exclusive property of CareerAI and its licensors. You retain all rights to the personal documents (e.g., resumes) you upload to the Service.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">6. Termination</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
