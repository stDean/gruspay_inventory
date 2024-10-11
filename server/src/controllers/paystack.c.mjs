import Paystack from "@paystack/paystack-sdk";
import { StatusCodes } from "http-status-codes";
const paystack = new Paystack(process.env.PAYSTACKSECRETKEY);
import { my_plans } from "../constants.mjs";

// TODO:ADD A PAY-STACK MIDDLEWARE I.E WEBHOOKS ==> add this to the paystack dashboard

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

// handled by pay stack just show a link
export const updateAccountInformation = () => {};

export const cancelSubscription = async ({ code, token }) => {
	// code === subscription code to cancel
	// token === email_token gotten from pay stack
	const disabledRes = await paystack.subscription.disable({ code, token });
	if (disabledRes.status === false) {
		return { error: disabledRes.message };
	}

	return { success: true };
};

export const getPlans = async () => {
	const plans = await paystack.plan.list({});

	if (plans.status === false) {
		return { error: "Something went wrong" };
	}

	const my_plans_array = Array.from(Object.values(my_plans));

	const matchedPlans = plans.data.filter(plan => {
		return my_plans_array.indexOf(plan.plan_code) !== -1;
	});

	return { matchedPlans };
};

export const getCustomer = async ({ email }) => {
	const customerRes = await paystack.customer.list({});
	if (customerRes.status === false) {
		return { error: "No customer with that email" };
	}

	const theCustomer = customerRes.data.find(
		customer => customer.email === email
	);

	const subscriptionRes = await paystack.subscription.list({
		customer: theCustomer.id,
	});

	const my_plans_array = Array.from(Object.values(my_plans));
	const subscriptions = subscriptionRes.data.filter(
		subscription =>
			subscription.status === "active" &&
			my_plans_array.indexOf(subscription.plan.plan_code) !== -1
	);

	const authorization = subscriptionRes.data[0].authorization;
	return { theCustomer, authorization, subscriptions };
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
			my_plans_array.indexOf(subscription.plan.plan_code) !== -1
	);

	// const subscriptions = customerSubscriptions.data.filter(
	// 	subscription =>
	// 		subscription.status === "active" ||
	// 		(subscription.status === "non-renewing" &&
	// 			my_plans_array.indexOf(subscription.plan.plan_code) !== -1)
	// );

	return { subscriptions };
};

export const PayStackController = {
	getPlans: async (req, res) => {
		const { error, matchedPlans } = await getPlans();
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: error.msg });
		}

		return res.status(StatusCodes.OK).json({
			msg: "Plans fetched successfully",
			success: true,
			matchedPlans,
			nbHits: matchedPlans.length,
		});
	},
	getCustomerActiveSubscriptions: async (req, res) => {
		const { customer_id } = req.params;

		const { error, subscriptions } = await getCustomerSubscriptions(
			customer_id
		);

		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: error });
		}

		return res.status(StatusCodes.OK).json({ subscriptions });
	},
	getCustomer: async (req, res) => {
		const { email } = req.params;
		const { error, theCustomer, authorization } = await getCustomer({ email });
		if (error) {
			return res.status(StatusCodes.BAD_REQUEST).json({ msg: error });
		}

		return res.status(StatusCodes.OK).json({ theCustomer, authorization });
	},
	// When you select the type of billing, you go to register screen
	// from there when you enter all details, you then call this route
	// when success call the the create subscription route
	// when successful call the sendOTP route
	initializeTransaction: async (req, res) => {
		const { email } = req.body;
		if (!email) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "Email address is required", success: false });
		}

		const { transaction, error } = await initializeSubscription({
			email,
			amount: "5000",
		});

		if (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error });
		}

		// refund the money
		return res.status(StatusCodes.OK).json({
			msg: "Transaction initialized successfully",
			success: true,
			transaction,
		});
	},
	createSubscription: async (req, res) => {
		const { customer, plan, start_date, authorization } = req.body;
		if (!customer || !plan || !start_date || !authorization) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "All fields are required", success: false });
		}

		const { subscription, error } = await createSubscription({
			customer,
			plan,
			start_date,
			authorization,
		});

		if (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error });
		}

		return res.status(StatusCodes.OK).json({
			msg: "Subscription created successfully",
			success: true,
			subscription,
		});
	},
	cancelSubscription: async (req, res) => {
		const { code, token } = req.body;
		if (!code || !token) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ msg: "All fields are required", success: false });
		}

		const { error, success } = await cancelSubscription({ code, token });

		if (error) {
			return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ msg: error });
		}

		return res.status(StatusCodes.OK).json({
			msg: "Subscription cancelled successfully",
		});
	},
};
