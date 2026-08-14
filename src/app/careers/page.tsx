"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, MapPin, Clock } from "lucide-react";
import Link from "next/link";

const openRoles = [
  {
    title: "Senior AI Engineer",
    department: "Engineering",
    location: "Remote (US)",
    type: "Full-time",
    description: "Lead the development of our core LLM integration and resume parsing engines."
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "Remote (Global)",
    type: "Full-time",
    description: "Shape the future of our user experience, making complex AI tools feel simple and intuitive."
  },
  {
    title: "Career Expert / Content Lead",
    department: "Marketing",
    location: "New York / Remote",
    type: "Full-time",
    description: "Create industry-leading guides on interviewing, salary negotiation, and resume building."
  }
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Build the Future of Work</h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              Join a fast-growing, passionate team dedicated to changing how people navigate their careers. We're remote-first, transparent, and obsessed with our users.
            </p>
            <Link href="#open-roles" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base shadow-lg shadow-primary/20")}>
              View Open Roles
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="font-bold text-xl mb-2">Remote First</h4>
              <p className="text-muted-foreground text-sm">Work from anywhere.</p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-2">Unlimited PTO</h4>
              <p className="text-muted-foreground text-sm">Take the time you need.</p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-2">Health & Wellness</h4>
              <p className="text-muted-foreground text-sm">Comprehensive global coverage.</p>
            </div>
            <div>
              <h4 className="font-bold text-xl mb-2">Learning Stipend</h4>
              <p className="text-muted-foreground text-sm">$1,000/yr for your growth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Open Roles */}
      <section id="open-roles" className="py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-8">Open Roles</h2>
          
          <div className="space-y-6">
            {openRoles.map((role, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group">
                  <CardHeader className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 pb-4">
                    <div>
                      <div className="text-sm font-semibold text-primary mb-2 tracking-wider uppercase">{role.department}</div>
                      <CardTitle className="text-2xl">{role.title}</CardTitle>
                    </div>
                    <Button variant="outline" className="w-full md:w-auto group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      Apply Now <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base mb-4 text-foreground/80">
                      {role.description}
                    </CardDescription>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {role.location}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {role.type}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center p-8 bg-muted/30 rounded-2xl border border-border/50">
            <h3 className="font-semibold text-lg mb-2">Don't see a fit?</h3>
            <p className="text-muted-foreground mb-4">We're always looking for talented people. Send your resume to careers@careerai.example.com</p>
          </div>
        </div>
      </section>
    </div>
  );
}
