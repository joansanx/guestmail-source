#!/usr/bin/env node
// guestmail: sets up a Stripe account (sandbox or live) the way the README's billing section asks. Safe to run again:
// it only creates what's missing. Never prints a secret: the webhook's signing secret goes to a 600 file.
//
//   STRIPE_SECRET_KEY=$(cat ~/.config/guestmail/stripe_test_secret_key) node scripts/stripe_setup.mjs
//   ... node scripts/stripe_setup.mjs --url https://theguestmail.com     (also the webhook and the portal's legal links)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Stripe from "stripe";
import { INTERVALS_ON_SALE, PLANS, getIntervalTerms, getLookupKey, getPrice } from "../lib/plans.js";

const WEBHOOK_EVENTS = [
	"checkout.session.completed",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
	"invoice.paid",
	"radar.early_fraud_warning.created",
];

const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
const mode = key.includes("_test_") ? "test" : "live";
const urlAt = process.argv.indexOf("--url");
const appUrl = urlAt > -1 ? process.argv[urlAt + 1]?.replace(/\/$/, "") : null;
if (urlAt > -1 && !/^https:\/\//.test(appUrl ?? "")) throw new Error("--url needs an https address");
const stripe = new Stripe(key);
console.log(`Stripe ${mode} mode`);

// 1. One product per plan and one price per interval on sale, found again by lookup key.
const wanted = PLANS.flatMap((plan) => INTERVALS_ON_SALE.map((interval) => ({ plan, interval, lookupKey: getLookupKey(plan.id, interval) })));
const { data: existing } = await stripe.prices.list({ lookup_keys: wanted.map(({ lookupKey }) => lookupKey), active: true, limit: 100 });
const prices = [];
for (const { plan, interval, lookupKey } of wanted) {
	const amount = getPrice(plan, interval) * 100;
	const { recurring } = getIntervalTerms(interval);
	let price = existing.find((item) => item.lookup_key === lookupKey);
	if (price) {
		const matches =
			price.currency === "usd" && price.unit_amount === amount && price.recurring?.interval === recurring.interval && price.recurring.interval_count === recurring.interval_count;
		if (!matches) throw new Error(`${lookupKey} exists as ${price.id} with another amount or interval: archive it in Stripe and run again`);
		console.log(`  ok       ${lookupKey} ${price.id}`);
	} else {
		const product = `guestmail_${plan.id}`;
		await stripe.products.create({ id: product, name: `GuestMail ${plan.name}`, metadata: { plan: plan.id } }).catch((error) => {
			if (error.code !== "resource_already_exists") throw error;
		});
		price = await stripe.prices.create({ product, currency: "usd", unit_amount: amount, recurring, lookup_key: lookupKey });
		console.log(`  created  ${lookupKey} ${price.id} (${amount / 100} USD every ${recurring.interval_count} ${recurring.interval})`);
	}
	prices.push(price);
}

// 2. The webhook endpoint, once the app has a public address. Its secret is only readable when it's created.
if (appUrl) {
	const url = `${appUrl}/api/webhooks/stripe`;
	const { data: endpoints } = await stripe.webhookEndpoints.list({ limit: 100 });
	const found = endpoints.find((endpoint) => endpoint.url === url);
	if (found) {
		console.log(`  ok       webhook ${found.id} ${url} (${found.status})`);
	} else {
		const created = await stripe.webhookEndpoints.create({ url, enabled_events: WEBHOOK_EVENTS, api_version: stripe.getApiField("version") });
		const file = path.join(os.homedir(), ".config/guestmail", `stripe_${mode}_webhook_secret`);
		fs.writeFileSync(file, created.secret, { mode: 0o600 });
		console.log(`  created  webhook ${created.id} ${url}, signing secret saved to ${file}`);
	}
}

// 3. The Customer Portal's default configuration: card, invoices, cancel at the end of the period, and plan changes
// between these prices, upgrades invoiced at once and downgrades scheduled for the end of the period.
const { data: portals } = await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 });
if (!portals[0]) {
	console.log(`  missing  the Customer Portal has no default yet: save its settings once in the Dashboard (Settings, Billing, Customer portal), then run this again`);
} else {
	const byProduct = Map.groupBy(prices, (price) => price.product);
	await stripe.billingPortal.configurations.update(portals[0].id, {
		...(appUrl && { business_profile: { privacy_policy_url: `${appUrl}/privacy`, terms_of_service_url: `${appUrl}/terms` } }),
		features: {
			payment_method_update: { enabled: true },
			invoice_history: { enabled: true },
			subscription_cancel: { enabled: true, mode: "at_period_end" },
			subscription_update: {
				enabled: true,
				default_allowed_updates: ["price"],
				proration_behavior: "always_invoice",
				products: [...byProduct].map(([product, items]) => ({ product, prices: items.map(({ id }) => id) })),
				schedule_at_period_end: { conditions: [{ type: "decreasing_item_amount" }, { type: "shortening_interval" }] },
			},
		},
	});
	console.log(`  ok       customer portal ${portals[0].id}: plan changes between ${prices.length} prices`);
}
