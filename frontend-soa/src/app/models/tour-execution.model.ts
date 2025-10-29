export enum TourExecutionStatus {
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export interface TourExecution {
  id?: number;
  tourId: number;
  touristUsername: string;
  status: TourExecutionStatus;
  startTime: Date;
  endTime?: Date;
  currentLatitude: number;
  currentLongitude: number;
  lastActivityTime: Date;
  completedKeyPoints: number[];
}