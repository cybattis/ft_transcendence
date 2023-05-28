export interface Decoded {
  id: string;
}

export interface LeaderboardItemProps {
  rank: number;
  avatar: string;
  nickname: string;
  winrate: number;
  gamePlayed: number;
  elo: number;
}
