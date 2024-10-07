"use client";

import { Tab } from "@/components/Tab";
import { CreditorsTable } from "@/components/table/CreditorsTable";
import { CustomersTable } from "@/components/table/CustomersTable";
import { EmployeeTable } from "@/components/table/EmployeeTable";
import { SuppliersTable } from "@/components/table/SuppliersTable";
import { Button } from "@/components/ui/button";
import useAddUserModal from "@/hook/useAddUserModal";
import { useReduxState } from "@/hook/useRedux";
import { useState } from "react";

export const UserContent = () => {
	const { companyDetails } = useReduxState();
	const userModal = useAddUserModal();
	const [tab, setTab] = useState<{
		employees: boolean;
		customers: boolean;
		suppliers: boolean;
		creditors: boolean;
	}>({ employees: true, customers: false, suppliers: false, creditors: false });

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-between items-center">
				<div className="space-y-3">
					<h1 className="font-semibold text-xl md:text-2xl">Manage Users</h1>

					{companyDetails?.payment_plan !== "PERSONAL" && (
						<div className="flex text-xs bg-white text-[#344054] rounded-md border border-[#D0D5DD] cursor-pointer items-center w-fit">
							<Tab
								first
								title="Employee"
								handleTab={() => {
									setTab({
										employees: true,
										customers: false,
										suppliers: false,
										creditors: false,
									});
								}}
								val={tab.employees}
								styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] border-r rounded-l-md"
							/>
							<Tab
								title="Suppliers"
								handleTab={() => {
									setTab({
										suppliers: true,
										customers: false,
										employees: false,
										creditors: false,
									});
								}}
								val={tab.suppliers}
								styles={`bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] ${
									companyDetails?.payment_plan === "ENTERPRISE"
										? "border-r"
										: "rounded-r-md"
								}`}
							/>

							{companyDetails?.payment_plan === "ENTERPRISE" && (
								<>
									<Tab
										title="Customers"
										handleTab={() => {
											setTab({
												customers: true,
												employees: false,
												suppliers: false,
												creditors: false,
											});
										}}
										val={tab.customers}
										styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] border-r"
									/>
									<Tab
										title="Creditors"
										handleTab={() => {
											setTab({
												customers: false,
												employees: false,
												suppliers: false,
												creditors: true,
											});
										}}
										val={tab.creditors}
										styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] rounded-r-md"
									/>
								</>
							)}
						</div>
					)}
				</div>

				{tab.employees && companyDetails?.payment_plan !== "PERSONAL" && (
					<>
						<Button
							className="px-6 py-5 hover:opacity-90"
							onClick={userModal.onOpen}
						>
							Add User
						</Button>
					</>
				)}
			</div>

			{tab.employees && <EmployeeTable />}
			{tab.customers && <CustomersTable />}
			{tab.suppliers && <SuppliersTable />}
			{tab.creditors && <CreditorsTable />}
		</div>
	);
};
