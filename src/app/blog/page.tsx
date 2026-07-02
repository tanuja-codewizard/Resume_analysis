"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen } from "lucide-react";

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 bg-muted/20 border-b border-border/50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">The CareerAI Blog</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Insights, tips, and data-driven strategies to help you land your dream job and accelerate your career.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input className="pl-10 h-12 bg-background" placeholder="Search articles..." />
              </div>
              <Button className="h-12 px-6">Subscribe</Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
            <Button variant="secondary" className="rounded-full">All Posts</Button>
            <Button variant="ghost" className="rounded-full">Resume Tips</Button>
            <Button variant="ghost" className="rounded-full">Interviewing</Button>
            <Button variant="ghost" className="rounded-full">Salary Negotiation</Button>
            <Button variant="ghost" className="rounded-full">Tech Industry</Button>
          </div>

          {/* Empty State */}
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No articles found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              We're currently preparing our first batch of expert career insights. Check back soon for in-depth articles.
            </p>
            <Button variant="outline">Clear Filters</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
