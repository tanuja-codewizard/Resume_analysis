"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircleQuestion } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function InterviewQuestionsPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="py-24 bg-primary/5 border-b border-border/50">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Interview Question Bank</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Master your next interview with our curated database of real questions asked by top tech companies.
            </p>
            
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input className="pl-12 h-14 text-lg bg-background shadow-lg shadow-primary/5 rounded-full" placeholder="Search by role, company, or topic..." />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-64 space-y-8 shrink-0">
              <div>
                <h3 className="font-bold mb-4">Categories</h3>
                <div className="space-y-2 flex flex-col">
                  <Button variant="secondary" className="justify-start">All Categories</Button>
                  <Button variant="ghost" className="justify-start">Technical / Coding</Button>
                  <Button variant="ghost" className="justify-start">System Design</Button>
                  <Button variant="ghost" className="justify-start">Behavioral / Leadership</Button>
                  <Button variant="ghost" className="justify-start">Product Management</Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-4">Difficulty</h3>
                <div className="space-y-2 flex flex-col">
                  <Button variant="ghost" className="justify-start text-emerald-600 dark:text-emerald-400">Easy</Button>
                  <Button variant="ghost" className="justify-start text-yellow-600 dark:text-yellow-400">Medium</Button>
                  <Button variant="ghost" className="justify-start text-red-600 dark:text-red-400">Hard</Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">Showing 0 results</p>
                <select className="bg-background border border-border rounded-md px-3 py-1.5 text-sm outline-none">
                  <option>Most Recent</option>
                  <option>Most Popular</option>
                  <option>Highest Difficulty</option>
                </select>
              </div>

              <Card className="bg-muted/10 border-dashed border-2 shadow-none">
                <CardContent className="py-24 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                    <MessageCircleQuestion className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No questions found</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                    There are currently no interview questions matching your selected filters. 
                  </p>
                  <Button variant="outline">Clear All Filters</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
