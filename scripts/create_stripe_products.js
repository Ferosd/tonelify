// Run this script once to create Stripe products and prices
// node scripts/create_stripe_products.js

const Stripe = require("stripe");
require("dotenv").config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
    console.log("Creating Stripe products and prices...\n");

    // Create Guitarist product
    const guitaristProduct = await stripe.products.create({
        name: "Tonelify Guitarist",
        description: "100 tone matches per month, advanced settings, unlimited saved tones",
    });
    console.log("✅ Guitarist product created:", guitaristProduct.id);

    const guitaristMonthly = await stripe.prices.create({
        product: guitaristProduct.id,
        unit_amount: 899, // $8.99
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: "guitarist_monthly",
    });
    console.log("   Monthly price:", guitaristMonthly.id, "($8.99/mo)");

    const guitaristAnnual = await stripe.prices.create({
        product: guitaristProduct.id,
        unit_amount: 7188, // $71.88/year ($5.99/mo)
        currency: "usd",
        recurring: { interval: "year" },
        lookup_key: "guitarist_annual",
    });
    console.log("   Annual price:", guitaristAnnual.id, "($71.88/yr)");

    // Create Pro product
    const proProduct = await stripe.products.create({
        name: "Tonelify Pro",
        description: "Unlimited tone matches, premium AI analysis, priority support",
    });
    console.log("\n✅ Pro product created:", proProduct.id);

    const proMonthly = await stripe.prices.create({
        product: proProduct.id,
        unit_amount: 1599, // $15.99
        currency: "usd",
        recurring: { interval: "month" },
        lookup_key: "pro_monthly",
    });
    console.log("   Monthly price:", proMonthly.id, "($15.99/mo)");

    const proAnnual = await stripe.prices.create({
        product: proProduct.id,
        unit_amount: 13188, // $131.88/year ($10.99/mo)
        currency: "usd",
        recurring: { interval: "year" },
        lookup_key: "pro_annual",
    });
    console.log("   Annual price:", proAnnual.id, "($131.88/yr)");

    console.log("\n\n=== Copy these Price IDs to lib/stripe.ts ===\n");
    console.log(`guitarist: {`);
    console.log(`    stripePriceIdMonthly: "${guitaristMonthly.id}",`);
    console.log(`    stripePriceIdAnnual: "${guitaristAnnual.id}",`);
    console.log(`},`);
    console.log(`pro: {`);
    console.log(`    stripePriceIdMonthly: "${proMonthly.id}",`);
    console.log(`    stripePriceIdAnnual: "${proAnnual.id}",`);
    console.log(`},`);
}

createProducts().catch(console.error);
