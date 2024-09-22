import { ProductProps, UserProps } from "@/lib/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InitialStateTypes {
	isSidebarCollapsed: boolean;
	loggedInUser: false;
	token: "";
	email: "";
	previewProducts: [];
	singleData: ProductProps | null;
	user: UserProps | null;
}

const initialState: InitialStateTypes = {
	isSidebarCollapsed: false,
	loggedInUser: false,
	token: "",
	email: "",
	previewProducts: [],
	singleData: null,
	user: null,
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
		setPreviewProducts: (state, action: PayloadAction<any>) => {
			state.previewProducts = action.payload;
		},
		setSingleData: (state, action: PayloadAction<any>) => {
			state.singleData = action.payload;
		},
		setUser: (state, action: PayloadAction<any>) => {
			state.user = action.payload;
		},
	},
});

export const {
	setIsSidebarCollapsed,
	setLoggedInUser,
	setToken,
	setEmail,
	setPreviewProducts,
	setSingleData,
	setUser,
} = globalSlice.actions;

export default globalSlice.reducer;
