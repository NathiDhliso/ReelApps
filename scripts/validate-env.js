const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

let missingVars = [];

console.log('Checking for required environment variables...');

for (const v of requiredVars) {
  if (!process.env[v]) {
    missingVars.push(v);
  }
}

if (missingVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Missing required environment variables:');
  console.error('\x1b[31m%s\x1b[0m', missingVars.join(', '));
  console.error('\x1b[33m%s\x1b[0m', 'Please ensure these variables are set in your Netlify project settings.');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✅ All required environment variables are present.');
process.exit(0); 