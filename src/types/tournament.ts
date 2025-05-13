
export interface Tournament {
  id: string;
  name: string;
  game: string;
  date?: string;
  status: string;
  max_teams: number;
  prize_pool: number;
  winner?: string;
  secondPlace?: string;
  thirdPlace?: string;
  start_date: string;
  entry_fee?: number;
}
