export interface Review {
  id: number;
  rating: number; // 1-5
  comment: string;
  touristName: string; // Ime turiste koji je ostavio recenziju
  tourId: number;
  dateVisited: Date;
  datePosted: Date;
  images?: string[]; // Niz URL-ova slika
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
  touristName: string; // Dodato
  tourId: number;
  dateVisited: string; // YYYY-MM-DD format
  images?: string[];
}