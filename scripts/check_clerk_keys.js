const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const hasPublishableKey = envContent.includes('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
    const hasSecretKey = envContent.includes('CLERK_SECRET_KEY');
    const hasSignInUrl = envContent.includes('NEXT_PUBLIC_CLERK_SIGN_IN_URL');
    const hasSignUpUrl = envContent.includes('NEXT_PUBLIC_CLERK_SIGN_UP_URL');

    console.log('Clerk Keys Check:');
    console.log('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:', hasPublishableKey ? 'Present' : 'MISSING');
    console.log('CLERK_SECRET_KEY:', hasSecretKey ? 'Present' : 'MISSING');
    console.log('NEXT_PUBLIC_CLERK_SIGN_IN_URL:', hasSignInUrl ? 'Present' : 'MISSING');
    console.log('NEXT_PUBLIC_CLERK_SIGN_UP_URL:', hasSignUpUrl ? 'Present' : 'MISSING');

} catch (e) {
    console.error('Error reading .env.local:', e.message);
}
