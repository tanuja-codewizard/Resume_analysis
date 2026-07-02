"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Cookie Policy</h1>
          <p className="text-muted-foreground text-lg mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardContent className="p-8 md:p-12 prose prose-stone dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mt-0 mb-4 text-foreground">1. What are cookies?</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">2. How we use cookies</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                CareerAI uses cookies for the following purposes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-2">
                <li><strong>Essential Cookies:</strong> These are required for the operation of our Service. They include, for example, cookies that enable you to log into secure areas of our website (e.g., Supabase authentication tokens).</li>
                <li><strong>Analytical/Performance Cookies:</strong> They allow us to recognize and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works.</li>
                <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences (e.g., your choice of language or dark/light mode).</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">3. Third-Party Cookies</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the Service and deliver targeted advertisements. 
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">4. Managing Cookies</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.
                <br /><br />
                Please note that if you disable essential cookies, some parts of the CareerAI platform (such as your dashboard and secure authentication) may not function properly.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
