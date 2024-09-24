"use client";

import { Tab } from "@/components/Tab";
import { CustomersTable } from "@/components/table/CustomersTable";
import { EmployeeTable } from "@/components/table/EmployeeTable";
import { SuppliersTable } from "@/components/table/SuppliersTable";
import { Button } from "@/components/ui/button";
import useAddUserModal from "@/hook/useAddUserModal";
import { useState } from "react";

export const UserContent = () => {
	const userModal = useAddUserModal();
	const [tab, setTab] = useState<{
		employees: boolean;
		customers: boolean;
		suppliers: boolean;
	}>({ employees: true, customers: false, suppliers: false });

	return (
		<div className="flex flex-col gap-3">
			<div className="flex justify-between items-center">
				<div className="space-y-3">
					<h1 className="font-semibold text-xl md:text-2xl">Users</h1>

					<div className="flex text-xs bg-white text-[#344054] rounded-md border border-[#D0D5DD] cursor-pointer items-center w-fit">
						<Tab
							first
							title="Employee"
							handleTab={() => {
								setTab({ employees: true, customers: false, suppliers: false });
							}}
							val={tab.employees}
							styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] border-r rounded-l-md"
						/>
						<Tab
							title="Customers"
							handleTab={() => {
								setTab({ customers: true, employees: false, suppliers: false });
							}}
							val={tab.customers}
							styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] border-r"
						/>
						<Tab
							title="Suppliers"
							handleTab={() => {
								setTab({ suppliers: true, customers: false, employees: false });
							}}
							val={tab.suppliers}
							styles="bg-[#F5F8FF] border-[#0D039D] text-[#0D039D] rounded-r-md"
						/>
					</div>
				</div>

				{tab.employees && (
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
		</div>
	);
};
