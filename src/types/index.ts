export type MatchType = 'futsal' | 'mini_soccer' | 'antar_kampung';

export type MatchStatus = 'terbuka' | 'penuh' | 'selesai' | 'dibatalkan';

export interface MatchTeam {
  teamId: string;
  teamName: string;
  captainName: string;
  captainPhone: string;
  slot: number; // 1 or 2
  joinedAt: string;
  logoUrl?: string;
}

export interface Match {
  id: string;
  title: string;
  type: MatchType;
  format: string; // "5 vs 5", "7 vs 7", "11 vs 11"
  date: string; // "Besok, 19:00", etc.
  timestamp?: number;
  location: string;
  locationDetail?: string;
  mapUrl?: string;
  level: string; // "Bebas", "Menengah", "Pemula", "Kompetitif"
  description: string;
  imageUrl: string;
  status: MatchStatus;
  targetTeams: number; // usually 2
  currentTeams: number; // 1 or 2
  teams: MatchTeam[];
  createdBy: string;
  creatorName: string;
  creatorPhone: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string; // "Kapten", "Wakil Kapten", "Pemain", "Kiper"
  position: string; // "Forward", "Midfielder", "Defender", "Goalkeeper"
  number?: number;
}

export interface TeamStats {
  played: number;
  won: number;
  drawn: number;
  lost: number;
}

export interface Team {
  id: string;
  name: string;
  city: string;
  captainId: string;
  captainName: string;
  captainPhone: string;
  category: MatchType;
  membersCount: number;
  members: TeamMember[];
  stats: TeamStats;
  logo: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'match_created' | 'match_joined' | 'match_status' | 'chat_message' | 'announcement' | 'team_update';
  relatedMatchId?: string;
  createdAt: string;
  timestamp: number;
  readBy: string[]; // array of userIds who read this
  targetRole?: 'all' | 'admin' | 'member';
}

export interface MessageItem {
  id: string;
  channelId: string; // e.g. "match_<id>" or team slug
  channelName: string;
  senderId: string;
  senderName: string;
  senderRole?: 'admin' | 'member';
  senderAvatar?: string;
  text: string;
  createdAt: string;
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'member';
  teamId?: string;
  teamName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  category: string;
  priceRange: string;
  rating: number;
  facilities: string[];
  phone: string;
  imageUrl: string;
}

export interface Tournament {
  id: string;
  title: string;
  organizer: string;
  category: MatchType;
  prize: string;
  location: string;
  date: string;
  teamsRegistered: number;
  maxTeams: number;
  status: 'Pendaftaran' | 'Berlangsung' | 'Selesai';
  bannerUrl: string;
}
