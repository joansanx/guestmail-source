import { formatCompact, formatNumber, formatUsd, formatUsdCents } from "./format.js";
import { INTERVALS_ON_SALE, PLANS, getCheckoutPath, getIntervalTerms, getPrice, getPricePerThousand } from "./plans.js";

// What SliderPricing shows, on the pricing pages, the billing page and the paywall: the plans ready to
// display, with a price for each billing period on sale, starting on the given plan. plans: the ones on sale.
export function getPricing(initialPlanId = PLANS[0].id, plans = PLANS) {
	const largest = plans.at(-1).emailsPerMonth;
	const stops = plans.map((plan) => ({
		id: plan.id,
		name: plan.name,
		emails: formatNumber(plan.emailsPerMonth),
		emailsShort: formatCompact(plan.emailsPerMonth),
		subscribers: formatNumber(plan.subscribers),
		// A fourth root keeps the smaller plans' bars tall enough to read, and apart, next to one 250 times bigger.
		bar: (plan.emailsPerMonth / largest) ** 0.25,
		prices: Object.fromEntries(
			INTERVALS_ON_SALE.map((interval) => [
				interval,
				{
					price: formatUsd(getPrice(plan, interval)),
					monthly: formatMonthly(getPrice(plan, interval) / getIntervalTerms(interval).months),
					perThousand: formatUsdCents(getPricePerThousand(plan, interval)),
					href: getCheckoutPath(plan.id, interval),
				},
			])
		),
	}));
	return { plans: stops, initialIndex: Math.max(0, plans.findIndex(({ id }) => id === initialPlanId)) };
}

// "$19", or "$15.83" when a year's price doesn't split into whole dollars.
function formatMonthly(value) {
	return Number.isInteger(value) ? formatUsd(value) : formatUsdCents(value);
}
