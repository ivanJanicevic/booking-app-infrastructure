export interface Tour {
  id: number;
  naziv: string;
  opis: string;
  tagovi?: string;
  tezina: Difficulty;
  status: TourStatus;
  cijena: number;
  recenzijaId?: number;
  autorId: number;
  createdAt: string;
  updatedAt?: string;
  duzina?: number;
  vremeObjave?: string;
  vremeArhiviranja?: string;
  prevozi?: Record<string, number>;
}

export enum Prevoz {
  PESKE = 'PESKE',
  BICIKL = 'BICIKL',
  AUTOMOBIL = 'AUTOMOBIL'
}

export interface PublishTourRequest {
  prevozi: Record<string, number>;
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum TourStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

export interface CreateTourRequest {
  naziv: string;
  opis: string;
  tagovi?: string;
  tezina: Difficulty;
}

export interface TourStats {
  totalTours: number;
  draftTours: number;
  publishedTours: number;
  archivedTours: number;
}

