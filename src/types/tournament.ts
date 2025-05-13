
export interface Tournament {
  id: string;
  name: string;
  game: string;
  description?: string;
  date?: string;
  status: string;
  max_teams: number;
  prize_pool: number;
  winner?: string;
  secondPlace?: string;
  thirdPlace?: string;
  start_date: string;
  end_date?: string;
  entry_fee?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
