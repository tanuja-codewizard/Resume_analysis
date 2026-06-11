import { Briefcase } from "lucide-react";
import Link from "next/link";

export default function CareersPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="bg-primary/10 p-4 rounded-full">
        <Briefcase className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">Careers</h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        This page is coming soon. We are working hard to bring you the best content.
      </p>
      <Link href="/" className="text-primary hover:underline font-semibold mt-4 block">
        &larr; Back to Home
      </Link>
    </div>
  );
}
