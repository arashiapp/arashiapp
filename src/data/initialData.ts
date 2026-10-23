import { Match, Team, Venue, Tournament, NotificationItem } from '../types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'team-arashi',
    name: 'ARASHI FC',
    city: 'Bekasi',
    captainId: 'user-dika',
    captainName: 'Dika',
    captainPhone: '+6281234567890',
    category: 'futsal',
    membersCount: 5,
    stats: { played: 14, won: 9, drawn: 3, lost: 2 },
    logo: '⚡',
    bio: 'Tim futsal santai tapi kompetitif asal Bekasi Timur. Menjunjung tinggi persaudaraan dan sportivitas.',
    createdAt: new Date().toISOString(),
    members: [
      { id: 'm1', name: 'Dika Pratama', role: 'Kapten', position: 'Anchor / Mid', number: 10 },
      { id: 'm2', name: 'Fajar Nugraha', role: 'Wakil Kapten', position: 'Flank', number: 7 },
      { id: 'm3', name: 'Rian Syahputra', role: 'Pemain', position: 'Pivot', number: 9 },
      { id: 'm4', name: 'Bagas Aditya', role: 'Pemain', position: 'Flank', number: 11 },
      { id: 'm5', name: 'Gilang Ramadhan', role: 'Kiper', position: 'Goalkeeper', number: 1 }
    ]
  },
  {
    id: 'team-sukatani',
    name: 'Sukatani Squad',
    city: 'Cikarang',
    captainId: 'user-fajar',
    captainName: 'Fajar',
    captainPhone: '+6281399887766',
    category: 'antar_kampung',
    membersCount: 12,
    stats: { played: 20, won: 13, drawn: 4, lost: 3 },
    logo: '🛡️',
    bio: 'Komunitas sepak bola dan sparring legendaris Sukatani Cikarang Utara.',
    createdAt: new Date().toISOString(),
    members: [
      { id: 'm21', name: 'Fajar Kurniawan', role: 'Kapten', position: 'Striker', number: 9 },
      { id: 'm22', name: 'Dimas Setiawan', role: 'Pemain', position: 'Midfielder', number: 8 },
      { id: 'm23', name: 'Arief Budiman', role: 'Pemain', position: 'Defender', number: 4 }
    ]
  },
  {
    id: 'team-cibitung',
    name: 'Cibitung United',
    city: 'Cibitung',
    captainId: 'user-hendra',
    captainName: 'Hendra',
    captainPhone: '+6281900112233',
    category: 'mini_soccer',
    membersCount: 8,
    stats: { played: 11, won: 6, drawn: 2, lost: 3 },
    logo: '🦅',
    bio: 'Skuad mini soccer Cibitung yang aktif sparing tiap akhir pekan.',
    createdAt: new Date().toISOString(),
    members: [
      { id: 'm31', name: 'Hendra Wijaya', role: 'Kapten', position: 'Midfielder', number: 6 },
      { id: 'm32', name: 'Lukman Hakim', role: 'Pemain', position: 'Defender', number: 5 }
    ]
  },
  {
    id: 'team-karang-taruna',
    name: 'Karang Taruna FC',
    city: 'Tambun',
    captainId: 'user-rizky',
    captainName: 'Rizky',
    captainPhone: '+6285711223344',
    category: 'futsal',
    membersCount: 14,
    stats: { played: 16, won: 10, drawn: 1, lost: 5 },
    logo: '🔥',
    bio: 'Pemuda Karang Taruna gemar berolahraga futsal dan mini soccer.',
    createdAt: new Date().toISOString(),
    members: [
      { id: 'm41', name: 'Rizky Ramadhan', role: 'Kapten', position: 'Anchor', number: 4 }
    ]
  },
  {
    id: 'team-minisoccer-bekasi',
    name: 'Mini Soccer Bekasi',
    city: 'Bekasi Barat',
    captainId: 'user-bayu',
    captainName: 'Bayu',
    captainPhone: '+6282112344556',
    category: 'mini_soccer',
    membersCount: 10,
    stats: { played: 9, won: 5, drawn: 3, lost: 1 },
    logo: '⚽',
    bio: 'Komunitas mini soccer silaturahmi Kota Patriot Bekasi.',
    createdAt: new Date().toISOString(),
    members: [
      { id: 'm51', name: 'Bayu Segara', role: 'Kapten', position: 'Playmaker', number: 10 }
    ]
  }
];

export const INITIAL_MATCHES: Match[] = [
  {
    id: 'match-1',
    title: 'Cari Lawan Sparring',
    type: 'futsal',
    format: '5 vs 5',
    date: 'Besok, 19:00',
    location: 'Gor Futsal Cibitung',
    locationDetail: 'Jl. Raya Teuku Umar No. 45, Cibitung (Lapangan Vinyl A)',
    mapUrl: 'https://maps.google.com/?q=Gor+Futsal+Cibitung',
    level: 'Bebas',
    description: 'Cari lawan sparring rutin, permainan santai tapi serius. Yang serius saja ya. Biaya sewa lapangan dibagi rata 50:50.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
    status: 'terbuka',
    targetTeams: 2,
    currentTeams: 2,
    teams: [
      {
        teamId: 'team-arashi',
        teamName: 'Arashi FC',
        captainName: 'Dika',
        captainPhone: '+6281234567890',
        slot: 1,
        joinedAt: 'Hari ini, 10:00'
      },
      {
        teamId: 'team-sukatani',
        teamName: 'Sukatani Squad',
        captainName: 'Fajar',
        captainPhone: '+6281399887766',
        slot: 2,
        joinedAt: 'Hari ini, 14:30'
      }
    ],
    createdBy: 'user-dika',
    creatorName: 'Dika (Arashi FC)',
    creatorPhone: '+6281234567890',
    createdAt: new Date().toISOString()
  },
  {
    id: 'match-2',
    title: 'Sparring Mini Soccer',
    type: 'mini_soccer',
    format: '7 vs 7',
    date: 'Sab, 25 Okt 2026, 18:00',
    location: 'Lapangan Grand Wisata',
    locationDetail: 'Kawasan Grand Wisata Blok AA, Tambun Selatan',
    mapUrl: 'https://maps.google.com/?q=Grand+Wisata+Bekasi',
    level: 'Menengah',
    description: 'Butuh 1 tim lawan mini soccer lapangan sintetis standar FIFA. Lampu terang, wasit resmi disediakan tuan rumah.',
    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
    status: 'terbuka',
    targetTeams: 2,
    currentTeams: 1,
    teams: [
      {
        teamId: 'team-cibitung',
        teamName: 'Cibitung United',
        captainName: 'Hendra',
        captainPhone: '+6281900112233',
        slot: 1,
        joinedAt: 'Kemarin'
      }
    ],
    createdBy: 'user-hendra',
    creatorName: 'Hendra (Cibitung United)',
    creatorPhone: '+6281900112233',
    createdAt: new Date().toISOString()
  },
  {
    id: 'match-3',
    title: 'Antar Kampung Sukatani vs Wanasari',
    type: 'antar_kampung',
    format: '11 vs 11',
    date: 'Ming, 26 Okt 2026, 15:30',
    location: 'Lapangan Desa Sukatani',
    locationDetail: 'Jl. Sukatani Raya, samping Balai Desa Sukatani',
    mapUrl: 'https://maps.google.com/?q=Sukatani+Bekasi',
    level: 'Kompetitif',
    description: 'Ajang silaturahmi akbar sepak bola antar kampung. Memperebutkan piala bergilir desa dan persahabatan antar warga.',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80',
    status: 'terbuka',
    targetTeams: 2,
    currentTeams: 1,
    teams: [
      {
        teamId: 'team-sukatani',
        teamName: 'Sukatani Squad',
        captainName: 'Fajar',
        captainPhone: '+6281399887766',
        slot: 1,
        joinedAt: '2 hari lalu'
      }
    ],
    createdBy: 'user-fajar',
    creatorName: 'Fajar (Sukatani Squad)',
    creatorPhone: '+6281399887766',
    createdAt: new Date().toISOString()
  },
  {
    id: 'match-4',
    title: 'Sparring Rutin',
    type: 'futsal',
    format: '5 vs 5',
    date: 'Sen, 27 Okt 2026, 20:00',
    location: 'Gor Galaxy',
    locationDetail: 'Grand Galaxy City Blok RRG No 12, Bekasi Selatan',
    mapUrl: 'https://maps.google.com/?q=Galaxy+Bekasi',
    level: 'Bebas',
    description: 'Sparring santai malam Senin sehabis kerja. Menjaga kebugaran dan silaturahmi pemain futsal.',
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80',
    status: 'terbuka',
    targetTeams: 2,
    currentTeams: 1,
    teams: [
      {
        teamId: 'team-karang-taruna',
        teamName: 'Karang Taruna FC',
        captainName: 'Rizky',
        captainPhone: '+6285711223344',
        slot: 1,
        joinedAt: 'Kemarin'
      }
    ],
    createdBy: 'user-rizky',
    creatorName: 'Rizky (Karang Taruna FC)',
    creatorPhone: '+6285711223344',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-1',
    name: 'Gor Futsal Cibitung',
    address: 'Jl. Raya Teuku Umar No. 45, Cibitung, Bekasi',
    city: 'Bekasi',
    category: 'Futsal (Vinyl & Interlock)',
    priceRange: 'Rp 120.000 - 160.000 / jam',
    rating: 4.8,
    facilities: ['Parkir Luas', 'Kantin / Kafe', 'Mushola', 'Kamar Mandi & Shower', 'Wi-Fi'],
    phone: '+62 812-8877-6655',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'venue-2',
    name: 'Lapangan Grand Wisata',
    address: 'Kawasan Grand Wisata Blok AA, Tambun Selatan, Bekasi',
    city: 'Bekasi',
    category: 'Mini Soccer (Rumput Sintetis FIFA)',
    priceRange: 'Rp 350.000 - 550.000 / 2 jam',
    rating: 4.9,
    facilities: ['Lampu Stadion LED', 'Tribun Penonton', 'Loker Pemain', 'Cafe & Resto', 'Wasit Berlisensi'],
    phone: '+62 813-1122-3344',
    imageUrl: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'venue-3',
    name: 'Gor Galaxy Sport Center',
    address: 'Grand Galaxy City Blok RRG No 12, Bekasi Selatan',
    city: 'Bekasi',
    category: 'Futsal & Badminton Indoor',
    priceRange: 'Rp 130.000 - 180.000 / jam',
    rating: 4.7,
    facilities: ['AC Lounge', 'Full Sound System', 'Papan Skor Digital', 'Parkir Mobil/Motor'],
    phone: '+62 821-4455-6677',
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'venue-4',
    name: 'Lapangan Desa Sukatani',
    address: 'Jl. Raya Sukatani Km 12, Cikarang Utara',
    city: 'Bekasi / Cikarang',
    category: 'Sepak Bola Rumput Alami (11 vs 11)',
    priceRange: 'Rp 150.000 / pertandingan',
    rating: 4.6,
    facilities: ['Gawang Standar PSSI', 'Kios UMKM Warga', 'Air Bersih', 'Area Lapang'],
    phone: '+62 858-9988-1122',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80'
  }
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tourney-1',
    title: 'Piala Kemerdekaan Bekasi 2026',
    organizer: 'Asosiasi Futsal Patriot',
    category: 'futsal',
    prize: 'Total Hadiah Rp 25.000.000',
    location: 'Gor Patriot Candrabhaga',
    date: '10 - 15 November 2026',
    teamsRegistered: 28,
    maxTeams: 32,
    status: 'Pendaftaran',
    bannerUrl: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'tourney-2',
    title: 'Bekasi Mini Soccer Championship Season 3',
    organizer: 'Grand Wisata Arena',
    category: 'mini_soccer',
    prize: 'Total Hadiah Rp 15.000.000 + Trophy',
    location: 'Grand Wisata Stadium',
    date: '1 - 3 Desember 2026',
    teamsRegistered: 16,
    maxTeams: 16,
    status: 'Berlangsung',
    bannerUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pertandingan Baru Tersedia!',
    message: 'Cari Lawan Sparring di Gor Futsal Cibitung (5 vs 5) dibuka untuk pendaftaran tim.',
    type: 'match_created',
    relatedMatchId: 'match-1',
    createdAt: '10 menit lalu',
    timestamp: Date.now() - 1000 * 60 * 10,
    readBy: []
  },
  {
    id: 'notif-2',
    title: 'Tim Bergabung',
    message: 'Sukatani Squad telah bergabung ke pertandingan Cari Lawan Sparring di Gor Futsal Cibitung!',
    type: 'match_joined',
    relatedMatchId: 'match-1',
    createdAt: '25 menit lalu',
    timestamp: Date.now() - 1000 * 60 * 25,
    readBy: []
  },
  {
    id: 'notif-3',
    title: 'Pengumuman Admin',
    message: 'Pembaruan server real-time aktif. Selamat datang di Arashi SparringHub!',
    type: 'announcement',
    createdAt: '1 jam lalu',
    timestamp: Date.now() - 1000 * 60 * 60,
    readBy: []
  }
];
