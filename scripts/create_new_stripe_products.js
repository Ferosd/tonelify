// Script to create new Stripe products and prices for Beginner/Expert plans
// Run with: node scripts/create_new_stripe_products.js

require('dotenv').config({ path: '.env.local' });
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
    console.log('Creating new Stripe products and prices...\n');

    // --- BEGINNER PLAN ---
    const beginnerProduct = await stripe.products.create({
        name: 'Tonelify Beginner',
        description: '20 custom tone adaptations per month, 15 saved tones, gear presets',
    });
    console.log('✅ Created Beginner product:', beginnerProduct.id);

    // Beginner Monthly: $5.99/mo
    const beginnerMonthly = await stripe.prices.create({
        product: beginnerProduct.id,
        unit_amount: 599,
        currency: 'usd',
        recurring: { interval: 'month' },
        lookup_key: 'beginner_monthly',
    });
    console.log('  Monthly price ($5.99/mo):', beginnerMonthly.id);

    // Beginner Annual: $29.99/yr ($2.50/mo equivalent)
    const beginnerAnnual = await stripe.prices.create({
        product: beginnerProduct.id,
        unit_amount: 2999,
        currency: 'usd',
        recurring: { interval: 'year' },
        lookup_key: 'beginner_annual',
    });
    console.log('  Annual price ($29.99/yr):', beginnerAnnual.id);

    // --- EXPERT PLAN ---
    const expertProduct = await stripe.products.create({
        name: 'Tonelify Expert',
        description: 'Unlimited custom tone adaptations, unlimited saved tones, gear presets, priority support',
    });
    console.log('\n✅ Created Expert product:', expertProduct.id);

    // Expert Monthly: $9.99/mo
    const expertMonthly = await stripe.prices.create({
        product: expertProduct.id,
        unit_amount: 999,
        currency: 'usd',
        recurring: { interval: 'month' },
        lookup_key: 'expert_monthly',
    });
    console.log('  Monthly price ($9.99/mo):', expertMonthly.id);

    // Expert Annual: $44.99/yr ($3.75/mo equivalent)
    const expertAnnual = await stripe.prices.create({
        product: expertProduct.id,
        unit_amount: 4499,
        currency: 'usd',
        recurring: { interval: 'year' },
        lookup_key: 'expert_annual',
    });
    console.log('  Annual price ($44.99/yr):', expertAnnual.id);

    console.log('\n🎉 All products created! Update lib/stripe.ts with these price IDs:\n');
    console.log(`PLANS = {
    beginner: {
        name: "Beginner",
        matchLimit: 20,
        savedToneLimit: 15,
        stripePriceIdMonthly: "${beginnerMonthly.id}",
        stripePriceIdAnnual: "${beginnerAnnual.id}",
    },
    expert: {
        name: "Expert",
        matchLimit: Infinity,
        savedToneLimit: Infinity,
        stripePriceIdMonthly: "${expertMonthly.id}",
        stripePriceIdAnnual: "${expertAnnual.id}",
    },
}`);
}

createProducts().catch(console.error);
