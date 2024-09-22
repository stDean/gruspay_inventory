"use client";

import { getUser } from "@/actions/user";
import { useAppDispatch } from "@/app/redux";
import { useReduxState } from "@/hook/useRedux";
import { setUser } from "@/state";
import { useCallback, useEffect } from "react";

export default function Dashboard() {
	const dispatch = useAppDispatch();
	const { token, user } = useReduxState();

	const setUserState = useCallback(async () => {
		const { data } = await getUser({ token });
		dispatch(setUser(data.userInDb));
	}, [token, user]);

	useEffect(() => {
		setUserState();
	}, []);

	console.log({ inDash: user });

	return (
		<div>
			<h1>Hello Dashboard</h1>
		</div>
	);
}
