export type RaceType = 
  | "Run - 5km"
  | "Run - 10km"
  | "Run - Half Marathon"
  | "Run - Marathon"
  | "Triathlon - Sprint"
  | "Triathlon - Olympic"
  | "Triathlon - 70.3"
  | "Triathlon - Full";

export interface Race {
  id: string;
  user_id: string;
  race_type: RaceType;
  race_date: string; // YYYY-MM-DD format
  created_at?: string;
  updated_at?: string;
}

export interface CreateRaceRequest {
  user_id: string;
  race_type: RaceType;
  race_date: string;
}

export interface UpdateRaceRequest {
  race_type?: RaceType;
  race_date?: string;
}

export interface RaceWithCountdown extends Race {
  daysUntilRace: number;
  isPast: boolean;
}

export const RACE_CATEGORIES = {
  Running: [
    "Run - 5km",
    "Run - 10km", 
    "Run - Half Marathon",
    "Run - Marathon"
  ] as const,
  Triathlon: [
    "Triathlon - Sprint",
    "Triathlon - Olympic",
    "Triathlon - 70.3",
    "Triathlon - Full"
  ] as const
} as const;

export const RACE_TYPE_ICONS = {
  "Run - 5km": "🏃",
  "Run - 10km": "🏃",
  "Run - Half Marathon": "🏃‍♂️",
  "Run - Marathon": "🏃‍♂️",
  "Triathlon - Sprint": "🏊‍♂️🚴‍♂️🏃‍♂️",
  "Triathlon - Olympic": "🏊‍♂️🚴‍♂️🏃‍♂️",
  "Triathlon - 70.3": "🏊‍♂️🚴‍♂️🏃‍♂️",
  "Triathlon - Full": "🏊‍♂️🚴‍♂️🏃‍♂️"
} as const;