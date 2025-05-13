
export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  owner_id?: string;
  game?: string;
  captain?: string;
  members?: number;
  maxMembers?: number;
  tournaments?: number;
  wins?: number;
  active?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  joined: string;
}
