import Link from "next/link";
import { Briefcase, Globe, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight">CareerAI</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Elevate your career with AI-powered insights, resume analysis, and personalized roadmaps.
            </p>
            <div className="flex items-center gap-4 mt-6 text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors"><Globe className="h-5 w-5" /></a>
              <a href="#" className="hover:text-foreground transition-colors"><Mail className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Resume Analysis</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">ATS Scoring</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Interview Prep</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Career Roadmaps</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CareerAI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Made with precision</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
