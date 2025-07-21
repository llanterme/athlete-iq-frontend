export interface StravaAthlete {
  id: number;
  username?: string;
  firstname: string;
  lastname: string;
  bio?: string;
  city?: string;
  state?: string;
  country?: string;
  sex?: string;
  premium: boolean;
  summit: boolean;
  created_at: string;
  updated_at: string;
  profile_medium?: string;
  profile?: string;
  friend_count?: number;
  follower_count?: number;
  mutual_friend_count?: number;
  measurement_preference: string;
  weight?: number;
}

export interface ActivityStats {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

export interface StravaStats {
  biggest_ride_distance?: number;
  biggest_climb_elevation_gain?: number;
  recent_ride_totals?: ActivityStats;
  recent_run_totals?: ActivityStats;
  recent_swim_totals?: ActivityStats;
  ytd_ride_totals?: ActivityStats;
  ytd_run_totals?: ActivityStats;
  ytd_swim_totals?: ActivityStats;
  all_ride_totals?: ActivityStats;
  all_run_totals?: ActivityStats;
  all_swim_totals?: ActivityStats;
}

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  token_type: string;
  scope: string;
}