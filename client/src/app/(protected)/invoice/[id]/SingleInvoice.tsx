import { ItemsHeader } from "@/components/ItemsHeader";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

const singleInvoice = {
	id: 1,
	status: "Paid",
	company: "The Company",
	email: "thecompany@company.com",
	invoiceDate: "12-10-2023",
	paymentDate: "12-10-2023",
	customer: "Dean",
	customerNo: "23490909090",
	customerEmail: "customer@customer.com",
	location: "Nigeria",
	itemsPurchased: [
		{
			name: "iPhone 12",
			qty: 2,
			price: 400,
			totalPrice: 800,
		},
		{
			name: "iPhone 13",
			qty: 1,
			price: 450,
			totalPrice: 450,
		},
		{
			name: "iPhone 14",
			qty: 3,
			price: 500,
			totalPrice: 1500,
		},
	],
	grandTotal: 2750,
};

interface ItemsProps {
	name: string;
	qty: number;
	price: number;
	totalPrice: number;
}

const InvoiceTable = ({ itemsPurchased }: { itemsPurchased: ItemsProps[] }) => (
	<Table className="bg-gray-100 rounded-lg p-6">
		<TableHeader>
			<TableRow className="border-b border-gray-200 pb-4 items-center text-sm md:text-base font-semibold">
				<TableHead className="md:flex-1">Product Name</TableHead>
				<TableHead className="md:flex-1 text-right">Qty</TableHead>
				<TableHead className="md:flex-1 text-right">Price (₦)</TableHead>
				<TableHead className="md:flex-1 text-right">Total Price (₦)</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			{itemsPurchased.map(item => (
				<TableRow
					key={item.name}
					className="border-b border-gray-200 py-4 items-center"
				>
					<TableCell className="md:flex-1 font-semibold">{item.name}</TableCell>
					<TableCell className="md:flex-1 text-right">{item.qty}</TableCell>
					<TableCell className="md:flex-1 text-right">{item.price}</TableCell>
					<TableCell className="md:flex-1 text-right">
						{item.totalPrice}
					</TableCell>
				</TableRow>
			))}
		</TableBody>
	</Table>
);

export const SingleInvoice = () => {
	return (
		<div className="w-full">
			<ItemsHeader routeTo="/invoice" />

			<div className="mt-4 space-y-4 md:space-y-6">
				<div className="bg-white/80 p-4 md:p-6 flex justify-between items-center rounded-lg border-2 border-gray-300">
					<div className="flex gap-3 items-center">
						<p className="font-semibold">Status</p>

						<p className="text-[#067647] bg-[#e3faec] border-[#a2edc0] px-2 md:px-4 py-1 md:py-2 text-sm rounded-lg">
							{/* Draft Style: text-[#B54708] bg-[#FFFAEB] rounded-3xl text-sm border border-[#FEDF89] */}
							{singleInvoice.status}
						</p>
					</div>

					<div className="flex gap-4">
						<Button className="bg-red-500 hover:bg-red-400">Delete</Button>
						<Button variant="outline">Mark as sold</Button>
					</div>
				</div>

				<div className="bg-white/80 p-4 md:p-6 rounded-lg border-2 border-gray-300 space-y-6">
					<div className="flex justify-between border-b border-gray-200 pb-4">
						<div>
							<h1 className="text-lg md:text-xl font-bold">
								{singleInvoice.id}
							</h1>
							<p className="font-semibold">Invoice ID</p>
						</div>

						<div className="space-y-1 font-semibold text-gray-400">
							<p>{singleInvoice.company}</p>
							<p>{singleInvoice.email}</p>
							<p>{singleInvoice.location}</p>
						</div>
					</div>

					<div className="flex justify-between border-b border-gray-200 pb-4">
						<div className="space-y-4">
							<div>
								<p className="font-[500] text-sm">Invoice Date</p>
								<h1 className="text-lg md:text-xl font-semibold">
									{format(singleInvoice.invoiceDate, "PPP")}
								</h1>
							</div>

							<div>
								<p className="font-[500] text-sm">Payment Date</p>
								<h1 className="text-lg md:text-xl font-semibold">
									{format(singleInvoice.paymentDate, "PPP")}
								</h1>
							</div>
						</div>

						<div className="font-semibold space-y-1">
							<p className="font-[500] text-sm">Bill To</p>
							<h1 className="text-lg md:text-xl">{singleInvoice.customer}</h1>
							<p className="text-sm md:text-base">{singleInvoice.customerNo}</p>
						</div>

						<div className="font-semibold space-y-1">
							<p className="font-[500] text-sm">Send To</p>
							<p className="text-sm md:text-base truncate w-[100px] md:w-full">
								{singleInvoice.customerEmail}
							</p>
						</div>
					</div>

					<div className="bg-gray-100 rounded-lg p-6">
						<InvoiceTable itemsPurchased={singleInvoice.itemsPurchased} />
					</div>

					<div className="bg-gray-300 text-lg rounded-lg p-6 flex justify-between font-semibold">
						<p>Grand Total</p>
						<p className="text-2xl">
							{formatCurrency(singleInvoice.grandTotal)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
