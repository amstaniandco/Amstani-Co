export type OrderStatus =
  | "Incoming"
  | "Accepted"
  | "Rejected"
  | "On Hold"
  | "Dispatched"
  | "Shipped"
  | "Delivered";

export type StatusTone = "green" | "gray" | "amber" | "blue" | "red";

export type Address = {
  fullName: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
};

export type OrderLineItem = {
  sku: string;
  name: string;
  variant: string;
  quantity: number;
  unitPrice: number;
};

export type OrderTimelineStep = {
  label: string;
  dateTime: string;
  complete: boolean;
};

export type OrderRow = {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: string;
  status: OrderStatus;
  statusTone: StatusTone;
  paymentStatus: "Paid" | "Pending";
  paymentMethod: string;
  transactionId: string;
  shippingMethod: string;
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  billingAddress: Address;
  shippingAddress: Address;
  notes: string;
  items: OrderLineItem[];
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  timeline: OrderTimelineStep[];
};

export const orders: OrderRow[] = [
  {
    id: "#AM-9921",
    customer: "Eleanor Shellstrop",
    email: "eleanor.s@example.com",
    date: "Oct 24, 2023",
    total: "$450.00",
    status: "Incoming",
    statusTone: "green",
    paymentStatus: "Paid",
    paymentMethod: "Visa •••• 2048",
    transactionId: "TXN-847129-A",
    shippingMethod: "Express Delivery",
    carrier: "DHL",
    trackingNumber: "DHL-889129231",
    estimatedDelivery: "Oct 26, 2023",
    billingAddress: {
      fullName: "Eleanor Shellstrop",
      line1: "28 Cedar Grove Ave",
      city: "Tempe",
      state: "AZ",
      zip: "85281",
      country: "United States",
      phone: "+1 (602) 555-0108",
    },
    shippingAddress: {
      fullName: "Eleanor Shellstrop",
      line1: "102 Harbor Street",
      city: "Phoenix",
      state: "AZ",
      zip: "85004",
      country: "United States",
      phone: "+1 (602) 555-0191",
    },
    notes: "Customer requested gift wrap and contactless delivery.",
    items: [
      { sku: "WCH-AX1", name: "Aurora Chronograph", variant: "Silver / 40mm", quantity: 1, unitPrice: 320 },
      { sku: "STR-512", name: "Leather Strap", variant: "Brown", quantity: 2, unitPrice: 65 },
    ],
    discountAmount: 20,
    shippingFee: 12,
    taxAmount: 8,
    timeline: [
      { label: "Order Placed", dateTime: "Oct 24, 2023 - 10:12 AM", complete: true },
      { label: "Payment Confirmed", dateTime: "Oct 24, 2023 - 10:13 AM", complete: true },
      { label: "Packed", dateTime: "Oct 24, 2023 - 12:45 PM", complete: true },
      { label: "Dispatched", dateTime: "Pending", complete: false },
    ],
  },
  {
    id: "#AM-9922",
    customer: "Chidi Anagonye",
    email: "chidi.a@university.edu",
    date: "Oct 24, 2023",
    total: "$1,200.00",
    status: "Accepted",
    statusTone: "gray",
    paymentStatus: "Paid",
    paymentMethod: "Mastercard •••• 6612",
    transactionId: "TXN-884210-C",
    shippingMethod: "Priority Delivery",
    carrier: "FedEx",
    trackingNumber: "FDX-220944111",
    estimatedDelivery: "Oct 27, 2023",
    billingAddress: {
      fullName: "Chidi Anagonye",
      line1: "44 University Lane",
      city: "Sydney",
      state: "NSW",
      zip: "2000",
      country: "Australia",
      phone: "+61 2 5550 6120",
    },
    shippingAddress: {
      fullName: "Chidi Anagonye",
      line1: "44 University Lane",
      city: "Sydney",
      state: "NSW",
      zip: "2000",
      country: "Australia",
      phone: "+61 2 5550 6120",
    },
    notes: "Deliver between 9am and 4pm.",
    items: [
      { sku: "WCH-GR9", name: "Graphite Royale", variant: "Matte Black / 42mm", quantity: 2, unitPrice: 560 },
    ],
    discountAmount: 0,
    shippingFee: 30,
    taxAmount: 50,
    timeline: [
      { label: "Order Placed", dateTime: "Oct 24, 2023 - 08:08 AM", complete: true },
      { label: "Payment Confirmed", dateTime: "Oct 24, 2023 - 08:10 AM", complete: true },
      { label: "Packed", dateTime: "Oct 24, 2023 - 11:32 AM", complete: true },
      { label: "Dispatched", dateTime: "Pending", complete: false },
    ],
  },
  {
    id: "#AM-9923",
    customer: "Tahani Al-Jamil",
    email: "tahani@aljamil.co.uk",
    date: "Oct 23, 2023",
    total: "$890.00",
    status: "On Hold",
    statusTone: "amber",
    paymentStatus: "Pending",
    paymentMethod: "Amex •••• 9974",
    transactionId: "TXN-771004-H",
    shippingMethod: "Standard Delivery",
    carrier: "UPS",
    trackingNumber: "UPS-130991211",
    estimatedDelivery: "Awaiting Payment Confirmation",
    billingAddress: {
      fullName: "Tahani Al-Jamil",
      line1: "77 Belgrave Square",
      city: "London",
      state: "Greater London",
      zip: "SW1X 8PN",
      country: "United Kingdom",
      phone: "+44 20 7946 0991",
    },
    shippingAddress: {
      fullName: "Tahani Al-Jamil",
      line1: "77 Belgrave Square",
      city: "London",
      state: "Greater London",
      zip: "SW1X 8PN",
      country: "United Kingdom",
      phone: "+44 20 7946 0991",
    },
    notes: "Payment gateway flagged high-value verification.",
    items: [
      { sku: "WCH-LX7", name: "Luxe Meridian", variant: "Rose Gold / 38mm", quantity: 1, unitPrice: 780 },
      { sku: "ACC-903", name: "Extended Warranty", variant: "24 Months", quantity: 1, unitPrice: 90 },
    ],
    discountAmount: 0,
    shippingFee: 20,
    taxAmount: 0,
    timeline: [
      { label: "Order Placed", dateTime: "Oct 23, 2023 - 03:21 PM", complete: true },
      { label: "Payment Pending", dateTime: "Oct 23, 2023 - 03:22 PM", complete: false },
      { label: "Packed", dateTime: "Pending", complete: false },
      { label: "Dispatched", dateTime: "Pending", complete: false },
    ],
  },
  {
    id: "#AM-9924",
    customer: "Jason Mendoza",
    email: "bortles.fan@jax.com",
    date: "Oct 22, 2023",
    total: "$120.00",
    status: "Shipped",
    statusTone: "blue",
    paymentStatus: "Paid",
    paymentMethod: "Apple Pay",
    transactionId: "TXN-550991-S",
    shippingMethod: "Economy",
    carrier: "USPS",
    trackingNumber: "USPS-554218799",
    estimatedDelivery: "Oct 25, 2023",
    billingAddress: {
      fullName: "Jason Mendoza",
      line1: "14 Duval Street",
      city: "Jacksonville",
      state: "FL",
      zip: "32202",
      country: "United States",
      phone: "+1 (904) 555-0117",
    },
    shippingAddress: {
      fullName: "Jason Mendoza",
      line1: "14 Duval Street",
      city: "Jacksonville",
      state: "FL",
      zip: "32202",
      country: "United States",
      phone: "+1 (904) 555-0117",
    },
    notes: "Leave package at front desk.",
    items: [{ sku: "STR-512", name: "Leather Strap", variant: "Brown", quantity: 1, unitPrice: 95 }],
    discountAmount: 0,
    shippingFee: 15,
    taxAmount: 10,
    timeline: [
      { label: "Order Placed", dateTime: "Oct 22, 2023 - 09:10 AM", complete: true },
      { label: "Payment Confirmed", dateTime: "Oct 22, 2023 - 09:11 AM", complete: true },
      { label: "Packed", dateTime: "Oct 22, 2023 - 02:44 PM", complete: true },
      { label: "Dispatched", dateTime: "Oct 23, 2023 - 09:06 AM", complete: true },
    ],
  },
];

export const statusStyles: Record<StatusTone, string> = {
  green: "bg-green-100 text-green-700",
  gray: "bg-slate-200 text-slate-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
  red: "bg-red-100 text-red-700",
};

export function getStatusTone(status: OrderStatus): StatusTone {
  if (status === "Incoming") {
    return "green";
  }

  if (status === "Accepted") {
    return "gray";
  }

  if (status === "On Hold") {
    return "amber";
  }

  if (status === "Rejected") {
    return "red";
  }

  return "blue";
}

export const ownerStatusOptions: OrderStatus[] = [
  "Incoming",
  "Accepted",
  "Rejected",
  "On Hold",
  "Dispatched",
  "Shipped",
  "Delivered",
];

export const filters = ["All", "Incoming", "Accepted", "Rejected", "On Hold", "Dispatched"];
