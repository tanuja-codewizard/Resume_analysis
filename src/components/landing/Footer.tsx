import Link from "next/link";
import { Briefcase, Globe, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary/10 p-1.5 rounded-lg">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight">CareerAI</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Empowering job seekers with AI-driven tools to land their dream roles faster and smarter.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard/resume" className="text-muted-foreground hover:text-foreground transition-colors">Resume Analyzer</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">Mock Interviews</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="/career-guides" className="text-muted-foreground hover:text-foreground transition-colors">Career Guides</Link></li>
              <li><Link href="/interview-questions" className="text-muted-foreground hover:text-foreground transition-colors">Interview Questions</Link></li>
              <li><Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">Help Center</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CareerAI. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Made with precision</span>
            <span>Designed for success</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
