"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Briefcase, 
  LayoutDashboard, 
  FileText, 
  Target, 
  BrainCircuit, 
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarNavItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Resume Analysis", href: "/dashboard/resume", icon: FileText },
  { title: "Job Matches", href: "/dashboard/jobs", icon: Target },
  { title: "Interview Prep", href: "/dashboard/interview", icon: BrainCircuit },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/30 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-lg border border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">CareerAI</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden",
                  isActive 
                    ? "text-primary bg-primary/10 border border-primary/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                )}
                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                {item.title}
                {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Futuristic Grid Background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-10" />
        
        {/* Topbar for mobile could go here */}
        
        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
