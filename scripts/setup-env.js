#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const isProduction = process.argv.includes('--prod');
const environment = isProduction ? 'production' : 'development';

console.log(`🔧 Setting up environment for: ${environment}`);

// Environment-specific configuration
const config = {
  development: {
    VITE_APP_MAIN_URL: 'http://localhost:5173',
    VITE_APP_REELCV_URL: 'http://localhost:5174',
    VITE_APP_REELHUNTER_URL: 'http://localhost:5176',
    VITE_APP_REELPERSONA_URL: 'http://localhost:5177',
    VITE_APP_REELPROJECT_URL: 'http://localhost:5178',
    VITE_APP_REELSKILLS_URL: 'http://localhost:5179',
    NODE_ENV: 'development'
  },
  production: {
    VITE_APP_MAIN_URL: 'https://www.reelapps.co.za',
    VITE_APP_REELCV_URL: 'https://www.reelcv.co.za',
    VITE_APP_REELHUNTER_URL: 'https://www.reelhunter.co.za',
    VITE_APP_REELPERSONA_URL: 'https://www.reelpersona.co.za',
    VITE_APP_REELPROJECT_URL: 'https://www.reelprojects.co.za',
    VITE_APP_REELSKILLS_URL: 'https://www.reelskills.co.za',
    NODE_ENV: 'production'
  }
};

// Read existing .env file to preserve other variables
const envPath = path.join(process.cwd(), '.env');
let existingEnv = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      if (key && valueParts.length > 0) {
        existingEnv[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
}

// Merge with new environment-specific config
const finalConfig = {
  ...existingEnv,
  ...config[environment]
};

// Generate .env content
const envContent = Object.entries(finalConfig)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

// Write to .env file
fs.writeFileSync(envPath, envContent);

console.log('✅ Environment configuration updated:');
console.log('📍 Main URL:', finalConfig.VITE_APP_MAIN_URL);
console.log('🔗 ReelCV URL:', finalConfig.VITE_APP_REELCV_URL);
console.log('🔗 ReelHunter URL:', finalConfig.VITE_APP_REELHUNTER_URL);
console.log('🔗 ReelPersona URL:', finalConfig.VITE_APP_REELPERSONA_URL);
console.log('🔗 ReelProject URL:', finalConfig.VITE_APP_REELPROJECT_URL);
console.log('🔗 ReelSkills URL:', finalConfig.VITE_APP_REELSKILLS_URL);

if (environment === 'development') {
  console.log('\n💡 Make sure to start your dev servers on the correct ports:');
     console.log('   - Home (main): npm run dev (port 5173)');
   console.log('   - ReelCV: npm run dev --filter @reelapps/reelcv (port 5174)');
   console.log('   - ReelHunter: npm run dev --filter @reelapps/reelhunter (port 5176)');
   console.log('   - ReelPersona: npm run dev --filter @reelapps/reelpersona (port 5177)');
   console.log('   - ReelProject: npm run dev --filter @reelapps/reelproject (port 5178)');
   console.log('   - ReelSkills: npm run dev --filter @reelapps/reelskills (port 5179)');
} 