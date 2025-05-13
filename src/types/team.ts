
export interface Team {
  id: string;
  name: string;
  game?: string;
  created_at: string;
  updated_at?: string;
  owner_id?: string;
  captain?: string;
  active?: boolean;
  members?: number;
  maxMembers?: number;
  tournaments?: number;
  wins?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  joined: string;
}
