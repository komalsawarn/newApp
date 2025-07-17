// Policy and Product interfaces

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrice: number;
  createdAt: string;
}

export interface Policy {
  id: string;
  customerName: string;
  productId: string;
  startDate: string;
  endDate: string;
  premium: number;
  status: string;
  createdAt: string;
}
