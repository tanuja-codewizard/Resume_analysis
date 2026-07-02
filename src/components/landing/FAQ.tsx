"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What happens to my resume data? Is it secure?",
    answer: "Your privacy is our top priority. We use enterprise-grade encryption to protect your data. Your resumes are never sold to third parties and we only use them to provide you with personalized career insights. You can delete your account and all associated data at any time."
  },
  {
    question: "How accurate is the AI ATS scoring?",
    answer: "Our AI models are trained on the same parsing algorithms and keyword weighting logic used by the top 10 most popular Applicant Tracking Systems (such as Workday, Greenhouse, and Lever). While no tool can guarantee a 100% match to every custom ATS setup, our 89% pass rate indicates highly reliable optimization."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes! We offer a 7-day free trial on our Pro plan. You can test out the ATS resume scanner, try a mock AI interview, and explore personalized job matches. No commitment required—cancel anytime before the trial ends and you won't be charged."
  },
  {
    question: "Can I cancel my subscription at any time?",
    answer: "Absolutely. You can cancel your subscription with a single click from your billing dashboard. You'll retain access to all premium features until the end of your current billing cycle."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleOpen = (index: number) => {
    // If clicking the currently open item, close it by setting to null. Otherwise open the new one.
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about CareerAI. Can't find the answer you're looking for? Reach out to our support team.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div 
                key={index} 
                className={cn(
                  "border border-border/50 rounded-2xl overflow-hidden transition-colors duration-300",
                  isOpen ? "bg-muted/30 border-primary/20 shadow-sm" : "bg-card hover:bg-muted/20"
                )}
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-lg pr-8 text-foreground">{faq.question}</span>
                  <div className={cn(
                    "w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-transform duration-300",
                    isOpen ? "rotate-180" : "rotate-0"
                  )}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 pt-0 text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
