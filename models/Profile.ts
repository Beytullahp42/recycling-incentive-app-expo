export class Profile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  username: string;
  bio: string | null;
  birth_date: string;
  points: number;
  created_at: string;
  updated_at: string;

  constructor(data: {
    id: number;
    user_id: number;
    first_name: string;
    last_name: string;
    username: string;
    bio: string | null;
    birth_date: string;
    points: number;
    created_at: string;
    updated_at: string;
  }) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.username = data.username;
    this.bio = data.bio;
    this.birth_date = data.birth_date;
    this.points = data.points;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}
