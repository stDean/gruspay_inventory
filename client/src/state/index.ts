import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InitialStateTypes {
	isSidebarCollapsed: boolean;
	loggedInUser: false;
	token: "";
	email: "";
}

const initialState: InitialStateTypes = {
	isSidebarCollapsed: false,
	loggedInUser: false,
	token: "",
	email: "",
};

export const globalSlice = createSlice({
	name: "global",
	initialState,
	reducers: {
		setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
			state.isSidebarCollapsed = action.payload;
		},

		setLoggedInUser: (state, action: PayloadAction<any>) => {
			state.loggedInUser = action.payload;
		},
		setToken: (state, action: PayloadAction<any>) => {
			state.token = action.payload;
		},
		setEmail: (state, action: PayloadAction<any>) => {
			state.email = action.payload;
		},
	},
});

export const { setIsSidebarCollapsed, setLoggedInUser, setToken, setEmail } =
	globalSlice.actions;

export default globalSlice.reducer;
