-- ====================================================================
-- ARASHI SPARRINGHUB DATABASE SCHEMA (SQL DDL & SEED DML)
-- Compatible with PostgreSQL 13+ / Standard Relational SQL
-- ====================================================================

-- 1. EXTENSIONS & CUSTOM ENUM TYPES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('admin', 'member');
CREATE TYPE match_type AS ENUM ('futsal', 'mini_soccer', 'antar_kampung');
CREATE TYPE match_status AS ENUM ('terbuka', 'penuh', 'selesai', 'dibatalkan');
CREATE TYPE tournament_status AS ENUM ('Pendaftaran', 'Berlangsung', 'Selesai');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role user_role DEFAULT 'member',
    team_name VARCHAR(100),
    team_id VARCHAR(128),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    captain_id VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    captain_name VARCHAR(100) NOT NULL,
    captain_phone VARCHAR(30) NOT NULL,
    category match_type DEFAULT 'futsal',
    members_count INT DEFAULT 1,
    matches_played INT DEFAULT 0,
    matches_won INT DEFAULT 0,
    matches_drawn INT DEFAULT 0,
    matches_lost INT DEFAULT 0,
    logo TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TEAM MEMBERS TABLE
CREATE TABLE IF NOT EXISTS team_members (
    id VARCHAR(128) PRIMARY KEY,
    team_id VARCHAR(128) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'Pemain', -- 'Kapten', 'Wakil Kapten', 'Pemain', 'Kiper'
    position VARCHAR(50) DEFAULT 'Flank', -- 'Pivot', 'Flank', 'Anchor', 'Goalkeeper'
    jersey_number INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. MATCHES TABLE
CREATE TABLE IF NOT EXISTS matches (
    id VARCHAR(128) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    type match_type NOT NULL DEFAULT 'futsal',
    format VARCHAR(50) NOT NULL DEFAULT '5 vs 5',
    match_date VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    location_detail TEXT,
    map_url TEXT,
    level VARCHAR(50) DEFAULT 'Bebas',
    description TEXT,
    image_url TEXT,
    status match_status DEFAULT 'terbuka',
    target_teams INT DEFAULT 2,
    current_teams INT DEFAULT 1,
    created_by VARCHAR(128) REFERENCES users(id) ON DELETE SET NULL,
    creator_name VARCHAR(100),
    creator_phone VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. MATCH TEAMS (SLOT PARTICIPATION) TABLE
CREATE TABLE IF NOT EXISTS match_teams (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(128) NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    team_id VARCHAR(128) NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    team_name VARCHAR(100) NOT NULL,
    captain_name VARCHAR(100) NOT NULL,
    captain_phone VARCHAR(30) NOT NULL,
    slot INT NOT NULL CHECK (slot IN (1, 2)),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (match_id, slot),
    UNIQUE (match_id, team_id)
);

-- 7. MESSAGES (REAL-TIME SPARRING CHAT) TABLE
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(128) PRIMARY KEY,
    channel_id VARCHAR(128) NOT NULL,
    channel_name VARCHAR(100) NOT NULL,
    sender_id VARCHAR(128) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_name VARCHAR(100) NOT NULL,
    sender_role user_role DEFAULT 'member',
    sender_avatar TEXT,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. NOTIFICATIONS (REAL-TIME DATA UPDATES) TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(128) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'match_created', 'match_joined', 'match_status', 'announcement'
    related_match_id VARCHAR(128) REFERENCES matches(id) ON DELETE SET NULL,
    target_role VARCHAR(20) DEFAULT 'all', -- 'all', 'admin', 'member'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notification_reads (
    notification_id VARCHAR(128) REFERENCES notifications(id) ON DELETE CASCADE,
    user_id VARCHAR(128) REFERENCES users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (notification_id, user_id)
);

-- 9. VENUES (LAPANGAN TERDEKAT) TABLE
CREATE TABLE IF NOT EXISTS venues (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price_range VARCHAR(100) NOT NULL,
    rating NUMERIC(2, 1) DEFAULT 4.5,
    facilities TEXT[],
    phone VARCHAR(30) NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. TOURNAMENTS TABLE
CREATE TABLE IF NOT EXISTS tournaments (
    id VARCHAR(128) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    organizer VARCHAR(100) NOT NULL,
    category match_type DEFAULT 'futsal',
    prize VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    tournament_date VARCHAR(100) NOT NULL,
    teams_registered INT DEFAULT 0,
    max_teams INT DEFAULT 16,
    status tournament_status DEFAULT 'Pendaftaran',
    banner_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. INDEXES FOR HIGH-PERFORMANCE QUERYING
CREATE INDEX IF NOT EXISTS idx_matches_type ON matches(type);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);

-- ====================================================================
-- SEED DATA (INITIAL DATA INSERTION)
-- ====================================================================

-- Insert Initial Users (Admin & Captain)
INSERT INTO users (id, name, email, phone, role, team_name, team_id)
VALUES 
    ('admin-super', 'Administrator Arashi', 'ruswatai@gmail.com', '+62 811 9988 7766', 'admin', 'ARASHI FC', 'team-arashi'),
    ('user-dika', 'Dika Pratama', 'pemain@arashi.id', '+62 812 3456 7890', 'member', 'ARASHI FC', 'team-arashi'),
    ('user-fajar', 'Fajar Kurniawan', 'fajar@sukatani.id', '+62 813 9988 7766', 'member', 'Sukatani Squad', 'team-sukatani'),
    ('user-hendra', 'Hendra Wijaya', 'hendra@cibitung.id', '+62 819 0011 2233', 'member', 'Cibitung United', 'team-cibitung'),
    ('user-rizky', 'Rizky Ramadhan', 'rizky@karangtaruna.id', '+62 857 1122 3344', 'member', 'Karang Taruna FC', 'team-karang-taruna')
ON CONFLICT (id) DO NOTHING;

-- Insert Initial Teams
INSERT INTO teams (id, name, city, captain_id, captain_name, captain_phone, category, members_count, matches_played, matches_won, matches_drawn, matches_lost, logo, bio)
VALUES
    ('team-arashi', 'ARASHI FC', 'Bekasi', 'user-dika', 'Dika', '+6281234567890', 'futsal', 5, 14, 9, 3, 2, '⚡', 'Tim futsal santai tapi kompetitif asal Bekasi Timur. Menjunjung tinggi persaudaraan dan sportivitas.'),
    ('team-sukatani', 'Sukatani Squad', 'Cikarang', 'user-fajar', 'Fajar', '+6281399887766', 'antar_kampung', 12, 20, 13, 4, 3, '🛡️', 'Komunitas sepak bola dan sparring legendaris Sukatani Cikarang Utara.'),
    ('team-cibitung', 'Cibitung United', 'Cibitung', 'user-hendra', 'Hendra', '+6281900112233', 'mini_soccer', 8, 11, 6, 2, 3, '🦅', 'Skuad mini soccer Cibitung yang aktif sparing tiap akhir pekan.'),
    ('team-karang-taruna', 'Karang Taruna FC', 'Tambun', 'user-rizky', 'Rizky', '+6285711223344', 'futsal', 14, 16, 10, 1, 5, '🔥', 'Pemuda Karang Taruna gemar berolahraga futsal dan mini soccer.')
ON CONFLICT (id) DO NOTHING;

-- Insert Skuad Members
INSERT INTO team_members (id, team_id, name, role, position, jersey_number)
VALUES
    ('m1', 'team-arashi', 'Dika Pratama', 'Kapten', 'Anchor / Mid', 10),
    ('m2', 'team-arashi', 'Fajar Nugraha', 'Wakil Kapten', 'Flank', 7),
    ('m3', 'team-arashi', 'Rian Syahputra', 'Pemain', 'Pivot', 9),
    ('m4', 'team-arashi', 'Bagas Aditya', 'Pemain', 'Flank', 11),
    ('m5', 'team-arashi', 'Gilang Ramadhan', 'Kiper', 'Goalkeeper', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Matches
INSERT INTO matches (id, title, type, format, match_date, location, location_detail, map_url, level, description, image_url, status, target_teams, current_teams, created_by, creator_name, creator_phone)
VALUES
    ('match-1', 'Cari Lawan Sparring', 'futsal', '5 vs 5', 'Besok, 19:00', 'Gor Futsal Cibitung', 'Jl. Raya Teuku Umar No. 45, Cibitung (Lapangan Vinyl A)', 'https://maps.google.com/?q=Gor+Futsal+Cibitung', 'Bebas', 'Cari lawan sparring rutin, permainan santai tapi serius. Yang serius saja ya.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80', 'terbuka', 2, 2, 'user-dika', 'Dika (Arashi FC)', '+6281234567890'),
    ('match-2', 'Sparring Mini Soccer', 'mini_soccer', '7 vs 7', 'Sab, 25 Okt 2026, 18:00', 'Lapangan Grand Wisata', 'Kawasan Grand Wisata Blok AA, Tambun Selatan', 'https://maps.google.com/?q=Grand+Wisata+Bekasi', 'Menengah', 'Butuh 1 tim lawan mini soccer lapangan sintetis standar FIFA.', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80', 'terbuka', 2, 1, 'user-hendra', 'Hendra (Cibitung United)', '+6281900112233'),
    ('match-3', 'Antar Kampung Sukatani vs Wanasari', 'antar_kampung', '11 vs 11', 'Ming, 26 Okt 2026, 15:30', 'Lapangan Desa Sukatani', 'Jl. Sukatani Raya, samping Balai Desa Sukatani', 'https://maps.google.com/?q=Sukatani+Bekasi', 'Kompetitif', 'Ajang silaturahmi akbar sepak bola antar kampung.', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=900&q=80', 'terbuka', 2, 1, 'user-fajar', 'Fajar (Sukatani Squad)', '+6281399887766'),
    ('match-4', 'Sparring Rutin', 'futsal', '5 vs 5', 'Sen, 27 Okt 2026, 20:00', 'Gor Galaxy', 'Grand Galaxy City Blok RRG No 12, Bekasi Selatan', 'https://maps.google.com/?q=Galaxy+Bekasi', 'Bebas', 'Sparring santai malam Senin sehabis kerja.', 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=900&q=80', 'terbuka', 2, 1, 'user-rizky', 'Rizky (Karang Taruna FC)', '+6285711223344')
ON CONFLICT (id) DO NOTHING;

-- Insert Match Teams (Slots)
INSERT INTO match_teams (match_id, team_id, team_name, captain_name, captain_phone, slot)
VALUES
    ('match-1', 'team-arashi', 'Arashi FC', 'Dika', '+6281234567890', 1),
    ('match-1', 'team-sukatani', 'Sukatani Squad', 'Fajar', '+6281399887766', 2),
    ('match-2', 'team-cibitung', 'Cibitung United', 'Hendra', '+6281900112233', 1),
    ('match-3', 'team-sukatani', 'Sukatani Squad', 'Fajar', '+6281399887766', 1),
    ('match-4', 'team-karang-taruna', 'Karang Taruna FC', 'Rizky', '+6285711223344', 1)
ON CONFLICT DO NOTHING;

-- Insert Venues
INSERT INTO venues (id, name, address, city, category, price_range, rating, facilities, phone, image_url)
VALUES
    ('venue-1', 'Gor Futsal Cibitung', 'Jl. Raya Teuku Umar No. 45, Cibitung, Bekasi', 'Bekasi', 'Futsal (Vinyl & Interlock)', 'Rp 120.000 - 160.000 / jam', 4.8, ARRAY['Parkir Luas', 'Kantin / Kafe', 'Mushola', 'Kamar Mandi', 'Wi-Fi'], '+62 812-8877-6655', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'),
    ('venue-2', 'Lapangan Grand Wisata', 'Kawasan Grand Wisata Blok AA, Tambun Selatan', 'Bekasi', 'Mini Soccer (Rumput Sintetis FIFA)', 'Rp 350.000 - 550.000 / 2 jam', 4.9, ARRAY['Lampu Stadion LED', 'Tribun Penonton', 'Loker Pemain', 'Cafe & Resto', 'Wasit Berlisensi'], '+62 813-1122-3344', 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Insert Tournaments
INSERT INTO tournaments (id, title, organizer, category, prize, location, tournament_date, teams_registered, max_teams, status, banner_url)
VALUES
    ('tourney-1', 'Piala Kemerdekaan Bekasi 2026', 'Asosiasi Futsal Patriot', 'futsal', 'Total Hadiah Rp 25.000.000', 'Gor Patriot Candrabhaga', '10 - 15 November 2026', 28, 32, 'Pendaftaran', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80'),
    ('tourney-2', 'Bekasi Mini Soccer Championship Season 3', 'Grand Wisata Arena', 'mini_soccer', 'Total Hadiah Rp 15.000.000 + Trophy', 'Grand Wisata Stadium', '1 - 3 Desember 2026', 16, 16, 'Berlangsung', 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO NOTHING;

-- Insert Notifications
INSERT INTO notifications (id, title, message, type, related_match_id)
VALUES
    ('notif-1', 'Pertandingan Baru Tersedia! ⚽', 'Cari Lawan Sparring di Gor Futsal Cibitung (5 vs 5) dibuka untuk pendaftaran tim.', 'match_created', 'match-1'),
    ('notif-2', 'Lawan Sparring Ditemukan! 🤝', 'Sukatani Squad telah bergabung ke pertandingan Cari Lawan Sparring di Gor Futsal Cibitung!', 'match_joined', 'match-1'),
    ('notif-3', 'Pengumuman Admin 📢', 'Pembaruan server real-time aktif. Selamat datang di Arashi SparringHub!', 'announcement', NULL)
ON CONFLICT (id) DO NOTHING;
