export interface StoreData {
  _id: string;
  name: string;
  status: "pending" | "active" | "suspended";
  shortId?: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  reviewCount?: number;
  monthlyRevenue?: number;
  monthlyOrders?: number;
  productCount?: number;
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

export async function deleteStore(storeId: string): Promise<void> {
  const response = await fetch("/api/admin/stores", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ storeId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Failed to delete store: ${response.statusText}`);
  }
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
