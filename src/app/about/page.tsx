"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Rocket } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Empowering Your Career Journey</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              We believe that everyone deserves a fair shot at their dream job. Our mission is to level the playing field by providing enterprise-grade AI tools to individual job seekers.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Precision</h3>
                <p className="text-muted-foreground">Our ATS algorithms mirror what top Fortune 500 companies use, ensuring you never get filtered out by accident.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <Rocket className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Innovation</h3>
                <p className="text-muted-foreground">We constantly evolve our AI models to stay ahead of the curve in a rapidly changing hiring landscape.</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-bold mb-2">Accessibility</h3>
                <p className="text-muted-foreground">High-end career coaching shouldn't be a luxury. We make expert-level feedback accessible to everyone.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold mb-6">Our Story</h2>
          <div className="prose prose-stone dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed space-y-6">
            <p>
              CareerAI was born out of frustration. After seeing countless highly qualified candidates get rejected simply because their resumes weren't parsed correctly by legacy ATS systems, we knew something had to change.
            </p>
            <p>
              What started as a simple script to test resume readability has evolved into a comprehensive suite of career acceleration tools. Today, we're proud to help thousands of professionals optimize their applications, ace their interviews, and negotiate better offers.
            </p>
            <p>
              We're a small, passionate team of engineers, recruiters, and AI researchers working remotely across the globe to build the future of hiring.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
