export interface Category {
  id: string;
  name: string;
  description: string;
  emoji: string;
  order: number;
  createdAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageUrl: string;
  inStock: boolean;
  order: number;
  createdAt?: Date;
}
