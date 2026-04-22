export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  body: string;
  verified: boolean;
}
