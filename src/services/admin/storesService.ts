export interface StoreData {
  _id: string;
  name: string;
  status: "pending" | "active" | "suspended";
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: {
    name?: string;
    email?: string;
    phone?: string;
    state?: string;
  };
}

export interface StoreDetailsData extends StoreData {
  monthlyOrders?: number;
  fulfillmentRate?: number;
  returnRate?: number;
  escalationRisk?: "Low" | "Medium" | "High";
  revenue?: string;
  rating?: number;
}

export async function fetchAllStores(): Promise<StoreData[]> {
  const response = await fetch("/api/admin/stores", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stores: ${response.statusText}`);
  }

  const data = await response.json();
  return data.stores || [];
}

export async function updateStoreStatus(
  storeId: string,
  status: "pending" | "active" | "suspended"
): Promise<void> {
  const response = await fetch("/api/admin/stores", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storeId, status }),
  });

  if (!response.ok) {
    throw new Error(`Failed to update store status: ${response.statusText}`);
  }
}
