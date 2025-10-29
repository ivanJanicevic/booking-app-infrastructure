export interface KeyPoint {
  id: number;
  naziv: string;
  opis: string;
  latitude: number;
  longitude: number;
  slikaUrl?: string;
  tourId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateKeyPointRequest {
  naziv: string;
  opis: string;
  latitude: number;
  longitude: number;
  slikaUrl?: string;
  tourId: number;
}

export interface KeyPointStats {
  totalKeyPoints: number;
  keyPointsByTour: { [tourId: number]: number };
}



