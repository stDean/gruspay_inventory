import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InitialStateTypes {
	isSidebarCollapsed: boolean;
	isDarkMode: boolean;
	loggedInUser: false;
	token: "";
}

const initialState: InitialStateTypes = {
	isSidebarCollapsed: false,
	isDarkMode: false,
	loggedInUser: false,
	token: "",
};

export const globalSlice = createSlice({
	name: "global",
	initialState,
	reducers: {
		setIsSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
			state.isSidebarCollapsed = action.payload;
		},
		setIsDarkMode: (state, action: PayloadAction<boolean>) => {
			state.isDarkMode = action.payload;
		},
		setLoggedInUser: (state, action: PayloadAction<any>) => {
			state.loggedInUser = action.payload;
		},
		setToken: (state, action: PayloadAction<any>) => {
			state.token = action.payload;
		},
	},
});

export const {
	setIsSidebarCollapsed,
	setIsDarkMode,
	setLoggedInUser,
	setToken,
} = globalSlice.actions;

export default globalSlice.reducer;
