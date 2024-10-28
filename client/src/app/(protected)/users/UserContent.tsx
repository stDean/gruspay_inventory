"use client";

import { getUsers } from "@/actions/user";
import { Tab } from "@/components/Tab";
import { CreditorsTable } from "@/components/table/CreditorsTable";
import { CustomersTable } from "@/components/table/CustomersTable";
import { EmployeeTable } from "@/components/table/EmployeeTable";
import { SuppliersTable } from "@/components/table/SuppliersTable";
import { Button } from "@/components/ui/button";
import useAddUserModal from "@/hook/useAddUserModal";
import { useReduxState } from "@/hook/useRedux";
import { useCallback, useEffect, useState, useTransition } from "react";
import { UserProps } from "@/lib/types";
import { toast } from "sonner";
import useModifyRoleModal from "@/hook/useUpdateRoleModal";

export const UserContent = () => {
	const { companyDetails, user, token } = useReduxState();
	const userModal = useAddUserModal();
	const modifyModal = useModifyRoleModal();
	const [tab, setTab] = useState<{
		employees: boolean;
		customers: boolean;
		suppliers: boolean;
		debtors: boolean;
	}>({
		employees: user?.role === "ADMIN",
		customers: false,
		suppliers: user?.role !== "ADMIN",
		debtors: false,
	});

	const [users, setUsers] = useState<Array<UserProps>>([]);
	const [isPending, startTransition] = useTransition();

	const getAllUsers = useCallback(() => {
		startTransition(async () => {
			const res = await getUsers({ token });

			if (res?.error) {
				toast.error("Error", { description: res?.error });
				return;
			}

			setUsers(res?.data.users);
		});
	}, [token]);

	useEffect(() => {
		getAllUsers();
	}, [userModal.isOpen, modifyModal.isOpen, getAllUsers]);

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-between items-center">
				<div className="space-y-3">
					<h1 className="font-semibold text-xl md:text-2xl">Manage Users</h1>

					{companyDetails?.billingPlan !== "PERSONAL" &&
						companyDetails?.paymentStatus === "ACTIVE" && (
							<div className="flex text-xs bg-white text-[#344054] rounded-md border border-[#D0D5DD] cursor-pointer items-center w-fit">
								{user?.role === "ADMIN" && (
									<Tab
										first
										title="Employee"
										handleTab={() => {
											setTab({
												employees: true,
												customers: false,
												suppliers: false,
												debtors: false,
											});
										}}
										val={tab.employees}
										styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] border-r rounded-l-md"
									/>
								)}
								<Tab
									title="Suppliers"
									first={user?.role !== "ADMIN"}
									handleTab={() => {
										setTab({
											suppliers: true,
											customers: false,
											employees: false,
											debtors: false,
										});
									}}
									val={tab.suppliers}
									styles={`bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] ${
										companyDetails?.billingPlan === "ENTERPRISE"
											? "border-r"
											: "rounded-r-md"
									}`}
								/>

								{companyDetails?.billingPlan === "ENTERPRISE" &&
									companyDetails?.paymentStatus === "ACTIVE" && (
										<>
											<Tab
												title="Customers"
												handleTab={() => {
													setTab({
														customers: true,
														employees: false,
														suppliers: false,
														debtors: false,
													});
												}}
												val={tab.customers}
												styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] border-r"
											/>
											<Tab
												title="Debtors"
												handleTab={() => {
													setTab({
														customers: false,
														employees: false,
														suppliers: false,
														debtors: true,
													});
												}}
												val={tab.debtors}
												styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] rounded-r-md"
											/>
										</>
									)}
							</div>
						)}
				</div>

				{tab.employees &&
					companyDetails?.paymentStatus === "ACTIVE" &&
					user?.role === "ADMIN" && (
						<>
							<Button
								className="text-sm md:text-base md:px-6 md:py-5 hover:opacity-90"
								onClick={userModal.onOpen}
								disabled={
									(companyDetails?.billingPlan === "ENTERPRISE" &&
										users.length === 10) ||
									(companyDetails?.billingPlan === "TEAM" &&
										users.length === 5) ||
									(companyDetails?.billingPlan === "PERSONAL" &&
										users.length === 2)
								}
							>
								Add User
							</Button>
						</>
					)}
			</div>

			{tab.employees && user?.role === "ADMIN" && (
				<EmployeeTable isPending={isPending} users={users} />
			)}
			{tab.customers && <CustomersTable />}
			{tab.suppliers && <SuppliersTable />}
			{tab.debtors && <CreditorsTable />}
		</div>
	);
};
