"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for getting started with your job search.",
    features: ["1 Resume Analysis per month", "Basic Job Matches", "Community Support"],
    button: "Get Started",
    popular: false
  },
  {
    name: "Pro",
    price: "$19",
    period: "/mo",
    description: "Everything you need to land your dream role.",
    features: ["Unlimited Resume Analyses", "Advanced Job Matching", "5 Mock Interviews per month", "Priority Email Support", "Personalized Roadmap"],
    button: "Upgrade to Pro",
    popular: true
  },
  {
    name: "Elite",
    price: "$49",
    period: "/mo",
    description: "For serious candidates wanting the competitive edge.",
    features: ["Everything in Pro", "Unlimited Mock Interviews", "1-on-1 Expert Review", "Salary Negotiation Guide", "24/7 Premium Support"],
    button: "Go Elite",
    popular: false
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
            Choose the plan that best fits your career goals. Cancel anytime.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative ${plan.popular ? '-mt-4 mb-4' : ''}`}
            >
              <Card className={`h-full p-8 flex flex-col ${plan.popular ? 'border-primary shadow-lg shadow-primary/10 relative overflow-hidden bg-card/80 backdrop-blur-sm' : 'border-border/50 bg-card/40 backdrop-blur-sm'}`}>
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6 h-10">{plan.description}</p>
                
                <div className="mb-8 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground font-medium">{plan.period}</span>}
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.button}
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
