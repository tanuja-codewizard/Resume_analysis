const { execSync } = require('child_process');
const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const lines = envFile.split('\n');

for (const line of lines) {
  if (!line || line.startsWith('#') || !line.includes('=')) continue;
  
  const [key, ...rest] = line.split('=');
  let value = rest.join('=').trim();
  
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.substring(1, value.length - 1);
  }

  console.log(`Adding ${key} to production...`);
  try {
    execSync(`npx vercel env add ${key} production --yes`, {
      input: value,
      stdio: ['pipe', 'inherit', 'inherit']
    });
  } catch (err) {
    console.error(`Failed to add ${key}`);
  }
}
