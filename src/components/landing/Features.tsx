"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Target, FileText, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "AI Resume Analyzer",
    description: "Instantly score your resume against industry-standard ATS algorithms and receive line-by-line feedback to improve your match rate.",
    icon: FileText,
    benefits: ["Line-by-line keyword suggestions", "Format checking", "ATS compatibility score"],
    color: "from-blue-500/20 to-cyan-500/20"
  },
  {
    title: "Smart Job Matcher",
    description: "Stop scrolling endlessly. Our AI curates high-probability job matches based on your unique skills, experience, and career trajectory.",
    icon: Target,
    benefits: ["Personalized daily job feed", "Skill gap analysis", "Direct application links"],
    color: "from-violet-500/20 to-purple-500/20"
  },
  {
    title: "Mock Interview Copilot",
    description: "Practice with a hyper-realistic AI interviewer tailored to the specific role and company you are targeting. Get real-time feedback.",
    icon: BrainCircuit,
    benefits: ["Company-specific questions", "Real-time speech analysis", "Behavioral & technical rounds"],
    color: "from-emerald-500/20 to-teal-500/20"
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            Supercharge your job hunt
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground"
          >
            We provide the tools you need to stand out, prepare perfectly, and land the role you deserve.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <Card className="h-full border-border/50 bg-card/40 backdrop-blur-sm p-8 hover:border-primary/50 transition-all duration-300 relative overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`} />
                
                <div className="bg-background/80 p-3 rounded-2xl w-fit mb-6 shadow-sm border border-border/50">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.benefits.map((benefit, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
