import Paystack from "@paystack/paystack-sdk";
import { my_plans } from "../utils/constants.mjs";
const paystack = new Paystack(process.env.PAYSTACKSECRETKEY);

// this makes you get the customer and authorization keys from pay-stack
// charge this with like #50
export const initializeSubscription = async ({ email, amount }) => {
	let initializeTransactionRes = await paystack.transaction.initialize({
		email,
		amount,
		channels: ["card"],
		callback_url: "http://localhost:3000/code",
	});

	if (initializeTransactionRes.status === false) {
		return { error: initializeTransactionRes.message, transaction: null };
	}

	return { transaction: initializeTransactionRes.data, error: null };
};

// this is the main way we want to create a subscription we just use the above to get customer details
export const createSubscription = async ({
	plan,
	authorization,
	customer,
	start_date,
}) => {
	const createSubRes = await paystack.subscription.create({
		customer,
		plan,
		authorization,
		start_date,
	});

	if (createSubRes.status === false) {
		return { error: createSubRes.message, subscription: null };
	}

	return { subscription: createSubRes.data, error: null };
};

export const cancelSubscription = async ({ code, token }) => {
	// code === subscription code to cancel
	// token === email_token gotten from pay stack
	const disabledRes = await paystack.subscription.disable({ code, token });
	if (disabledRes.status === false) {
		return { error: disabledRes.message };
	}

	return { success: true };
};

export const getCustomer = async ({ email }) => {
	const customerRes = await paystack.customer.list({});
	if (customerRes.status === false) {
		return { error: "No customer with that email" };
	}

	const theCustomer = customerRes.data.find(
		customer => customer.email === email
	);

	return { theCustomer };
};

export const getCustomerSubscriptions = async customer_id => {
	const customerSubscriptions = await paystack.subscription.list({
		customer: customer_id,
	});

	if (customerSubscriptions.status === false) {
		return { error: "Something went wrong" };
	}

	const my_plans_array = Array.from(Object.values(my_plans));

	const subscriptions = customerSubscriptions.data.filter(
		subscription =>
			subscription.status === "active" ||
			(subscription.status === "non-renewing" &&
				my_plans_array.indexOf(subscription.plan.plan_code) !== -1)
	);

	return { subscriptions };
};
