const fs = require('fs');
const path = require('path');

const routes = [
  'blog',
  'career-guides',
  'interview-questions',
  'help',
  'privacy',
  'terms',
  'cookies',
  'about',
  'careers',
  'contact'
];

routes.forEach(route => {
  const dirPath = path.join(__dirname, 'src', 'app', route);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const title = route.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const content = `import { Briefcase } from "lucide-react";
import Link from "next/link";

export default function ${title.replace(/\s+/g, '')}Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center space-y-6">
      <div className="bg-primary/10 p-4 rounded-full">
        <Briefcase className="h-12 w-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight">${title}</h1>
      <p className="text-xl text-muted-foreground max-w-2xl">
        This page is coming soon. We are working hard to bring you the best content.
      </p>
      <Link href="/" className="text-primary hover:underline font-semibold mt-4 block">
        &larr; Back to Home
      </Link>
    </div>
  );
}
`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
});

console.log("Stubs created successfully.");
