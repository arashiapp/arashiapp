import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  setDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  serverTimestamp,
  addDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Match, Team, NotificationItem, MessageItem, Venue, Tournament, MatchType, MatchStatus } from '../types';
import { INITIAL_MATCHES, INITIAL_TEAMS, INITIAL_NOTIFICATIONS, INITIAL_VENUES, INITIAL_TOURNAMENTS } from '../data/initialData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured, subscribeToSupabaseRealtime } from '../lib/supabase';

interface AppContextType {
  matches: Match[];
  teams: Team[];
  notifications: NotificationItem[];
  messages: MessageItem[];
  venues: Venue[];
  tournaments: Tournament[];
  unreadNotificationsCount: number;
  activeToast: NotificationItem | null;
  dismissToast: () => void;
  // Match actions
  createMatch: (data: Omit<Match, 'id' | 'createdAt' | 'currentTeams' | 'targetTeams'>) => Promise<string>;
  joinMatch: (matchId: string, teamData: { teamId: string; teamName: string; captainName: string; captainPhone: string }) => Promise<void>;
  leaveMatch: (matchId: string, teamId: string) => Promise<void>;
  updateMatchStatus: (matchId: string, status: MatchStatus) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
  // Team actions
  myTeam: Team | undefined;
  updateTeam: (team: Team) => Promise<void>;
  addTeamMember: (teamId: string, member: { name: string; role: string; position: string; number?: number }) => Promise<void>;
  // Message actions
  sendMessage: (channelId: string, channelName: string, text: string) => Promise<void>;
  // Notification actions
  sendNotification: (title: string, message: string, type: NotificationItem['type'], relatedMatchId?: string) => Promise<void>;
  markNotificationAsRead: (notifId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [venues] = useState<Venue[]>(INITIAL_VENUES);
  const [tournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);
  
  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [hasInitializedListener, setHasInitializedListener] = useState(false);

  // Real-time synchronization with Firestore
useEffect(() => {
  if (!currentUser) return;

  // 1. Matches real-time listener
    const matchesRef = collection(db, 'matches');
    const unsubMatches = onSnapshot(
      matchesRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, seed with initial matches
          seedInitialData();
        } else {
          const list: Match[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Match, 'id'>) });
          });
          // Sort newest first
          setMatches(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'matches');
      }
    );

    // 2. Teams real-time listener
    const teamsRef = collection(db, 'teams');
    const unsubTeams = onSnapshot(
      teamsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: Team[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<Team, 'id'>) });
          });
          setTeams(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'teams');
      }
    );

    // 3. Notifications real-time listener
    const notifsRef = collection(db, 'notifications');
    const unsubNotifs = onSnapshot(
      notifsRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: NotificationItem[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...(docSnap.data() as Omit<NotificationItem, 'id'>) });
          });
          // sort desc by timestamp
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          
          // If new notification arrives while user is active, show banner toast
          if (hasInitializedListener && list.length > 0) {
            const newest = list[0];
            const isFresh = Date.now() - (newest.timestamp || 0) < 10000;
            if (isFresh) {
              setActiveToast(newest);
            }
          }
          setNotifications(list);
        }
        setHasInitializedListener(true);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    );

    // 4. Messages real-time listener
    const messagesRef = collection(db, 'messages');
    const unsubMessages = onSnapshot(
      messagesRef,
      (snapshot) => {
        const list: MessageItem[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...(docSnap.data() as Omit<MessageItem, 'id'>) });
        });
        list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );

    // 5. Supabase Real-Time Listener (When Supabase is configured)
    let unsubSupabaseMatches = () => {};
    let unsubSupabaseNotifs = () => {};
    let unsubSupabaseMessages = () => {};

    if (isSupabaseConfigured) {
      console.log('⚡ Supabase Real-time is enabled and syncing...');
      unsubSupabaseMatches = subscribeToSupabaseRealtime(
        'matches',
        (newRecord) => {
          setMatches((prev) => {
            if (prev.some((m) => m.id === newRecord.id)) return prev;
            return [newRecord, ...prev];
          });
        },
        (updatedRecord) => {
          setMatches((prev) => prev.map((m) => (m.id === updatedRecord.id ? { ...m, ...updatedRecord } : m)));
        },
        (deletedRecord) => {
          setMatches((prev) => prev.filter((m) => m.id !== deletedRecord.id));
        }
      );

      unsubSupabaseNotifs = subscribeToSupabaseRealtime(
        'notifications',
        (newNotif) => {
          setNotifications((prev) => [newNotif, ...prev]);
          setActiveToast(newNotif);
        }
      );

      unsubSupabaseMessages = subscribeToSupabaseRealtime(
        'messages',
        (newMsg) => {
          setMessages((prev) => [...prev, newMsg]);
        }
      );
    }

    return () => {
      unsubMatches();
      unsubTeams();
      unsubNotifs();
      unsubMessages();
      unsubSupabaseMatches();
      unsubSupabaseNotifs();
      unsubSupabaseMessages();
    };
  }, [currentUser?.uid, hasInitializedListener]);

  // Seed Firestore if brand new database
  const seedInitialData = async () => {
    try {
      for (const m of INITIAL_MATCHES) {
        await setDoc(doc(db, 'matches', m.id), m);
      }
      for (const t of INITIAL_TEAMS) {
        await setDoc(doc(db, 'teams', t.id), t);
      }
      for (const n of INITIAL_NOTIFICATIONS) {
        await setDoc(doc(db, 'notifications', n.id), n);
      }
      // Seed a couple messages
      await setDoc(doc(db, 'messages', 'msg-1'), {
        channelId: 'team-sukatani',
        channelName: 'Sukatani Squad',
        senderId: 'user-fajar',
        senderName: 'Fajar (Sukatani Squad)',
        text: 'Siap sparring besok? Lapangan Cibitung sudah kami konfirmasi.',
        createdAt: '19:24',
        timestamp: Date.now() - 3600000
      });
      await setDoc(doc(db, 'messages', 'msg-2'), {
        channelId: 'team-cibitung',
        channelName: 'Cibitung United',
        senderId: 'user-hendra',
        senderName: 'Hendra (Cibitung United)',
        text: 'Bisa sparring hari Sabtu malam di Grand Wisata?',
        createdAt: '16:10',
        timestamp: Date.now() - 7200000
      });
    } catch (err) {
      console.warn('Seeding notice:', err);
    }
  };

  const dismissToast = () => setActiveToast(null);

  // Send real-time notification
  const sendNotification = async (
    title: string, 
    message: string, 
    type: NotificationItem['type'], 
    relatedMatchId?: string
  ) => {
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNotif: NotificationItem = {
      id: notifId,
      title,
      message,
      type,
      relatedMatchId,
      createdAt: 'Baru saja',
      timestamp: Date.now(),
      readBy: []
    };
    try {
      await setDoc(doc(db, 'notifications', notifId), newNotif);
      setActiveToast(newNotif);

      // Dual-sync to Supabase if configured
      if (isSupabaseConfigured) {
        try {
          await supabase.from('notifications').insert({
            id: notifId,
            title,
            message,
            type,
            related_match_id: relatedMatchId || null
          });
        } catch (err) {
          console.warn('Supabase notif sync:', err);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'notifications');
    }
  };

  // Create match
  const createMatch = async (data: Omit<Match, 'id' | 'createdAt' | 'currentTeams' | 'targetTeams'>) => {
    const matchId = `match-${Date.now()}`;
    const newMatch: Match = {
      ...data,
      id: matchId,
      currentTeams: data.teams?.length || 1,
      targetTeams: 2,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'matches', matchId), newMatch);

      // Dual-sync to Supabase if configured
      if (isSupabaseConfigured) {
        try {
          await supabase.from('matches').insert({
            id: matchId,
            title: data.title,
            type: data.type,
            format: data.format,
            match_date: data.date,
            location: data.location,
            level: data.level,
            description: data.description,
            status: 'terbuka',
            target_teams: 2,
            current_teams: data.teams?.length || 1,
            created_by: currentUser?.uid || 'guest',
            creator_name: data.creatorName,
            creator_phone: data.creatorPhone
          });
        } catch (err) {
          console.warn('Supabase match sync:', err);
        }
      }

      // Broadcast real-time notification to all devices
      await sendNotification(
        'Pertandingan Baru Dibuat! ⚽',
        `${data.title} di ${data.location} (${data.format}) telah dibuka untuk pendaftaran.`,
        'match_created',
        matchId
      );
      return matchId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'matches');
      return '';
    }
  };

  // Join match
  const joinMatch = async (
    matchId: string, 
    teamData: { teamId: string; teamName: string; captainName: string; captainPhone: string }
  ) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    if (target.teams.some((t) => t.teamId === teamData.teamId)) {
      throw new Error('Tim Anda sudah terdaftar di pertandingan ini.');
    }

    if (target.teams.length >= 2) {
      throw new Error('Pertandingan ini sudah penuh.');
    }

    const updatedTeams = [
      ...target.teams,
      {
        ...teamData,
        slot: 2,
        joinedAt: 'Hari ini, baru saja'
      }
    ];

    const newStatus: MatchStatus = updatedTeams.length >= 2 ? 'penuh' : 'terbuka';

    try {
      const matchDocRef = doc(db, 'matches', matchId);
      await updateDoc(matchDocRef, {
        teams: updatedTeams,
        currentTeams: updatedTeams.length,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Broadcast real-time notification to opponent and all devices!
      await sendNotification(
        'Lawan Sparring Ditemukan! 🤝',
        `${teamData.teamName} telah bergabung ke pertandingan "${target.title}" di ${target.location}!`,
        'match_joined',
        matchId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `matches/${matchId}`);
    }
  };

  // Leave match
  const leaveMatch = async (matchId: string, teamId: string) => {
    const target = matches.find((m) => m.id === matchId);
    if (!target) return;

    const remaining = target.teams.filter((t) => t.teamId !== teamId);
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        teams: remaining,
        currentTeams: remaining.length,
        status: 'terbuka',
        updatedAt: new Date().toISOString()
      });

      await sendNotification(
        'Slot Pertandingan Tersedia Kembali 📢',
        `Satu slot di "${target.title}" kembali terbuka untuk ditantang sparring.`,
        'match_status',
        matchId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `matches/${matchId}`);
    }
  };

  // Update match status (Admin or Creator)
  const updateMatchStatus = async (matchId: string, status: MatchStatus) => {
    const target = matches.find((m) => m.id === matchId);
    try {
      await updateDoc(doc(db, 'matches', matchId), {
        status,
        updatedAt: new Date().toISOString()
      });

      const label = status === 'selesai' ? 'Telah Selesai' : status === 'dibatalkan' ? 'Dibatalkan' : status === 'penuh' ? 'Telah Penuh' : 'Terbuka';
      await sendNotification(
        `Status Pertandingan Diperbarui: ${label}`,
        `Pertandingan "${target?.title || 'Sparring'}" kini berstatus ${label}.`,
        'match_status',
        matchId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `matches/${matchId}`);
    }
  };

  // Delete match (Admin full access or Creator)
  const deleteMatch = async (matchId: string) => {
    const target = matches.find((m) => m.id === matchId);
    try {
      await deleteDoc(doc(db, 'matches', matchId));
      await sendNotification(
        'Pertandingan Dihapus 🗑️',
        `Pertandingan "${target?.title || 'Sparring'}" telah dihapus oleh ${isAdmin ? 'Admin' : 'Penyelenggara'}.`,
        'match_status'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `matches/${matchId}`);
    }
  };

  // User's default team
  const myTeam = teams.find((t) => t.id === currentUser?.teamId) || teams[0];

  // Update team
  const updateTeam = async (updatedTeam: Team) => {
    try {
      await setDoc(doc(db, 'teams', updatedTeam.id), {
        ...updatedTeam,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      await sendNotification(
        'Profil Tim Diperbarui ⚡',
        `Tim ${updatedTeam.name} telah memperbarui data skuad dan informasi profil.`,
        'team_update'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `teams/${updatedTeam.id}`);
    }
  };

  // Add team member
  const addTeamMember = async (teamId: string, member: { name: string; role: string; position: string; number?: number }) => {
    const target = teams.find((t) => t.id === teamId);
    if (!target) return;

    const newMember = {
      id: `m-${Date.now()}`,
      ...member
    };
    const updatedMembers = [...target.members, newMember];
    try {
      await updateDoc(doc(db, 'teams', teamId), {
        members: updatedMembers,
        membersCount: updatedMembers.length,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `teams/${teamId}`);
    }
  };

  // Send real-time chat message
  const sendMessage = async (channelId: string, channelName: string, text: string) => {
    const msgId = `msg-${Date.now()}`;
    const newMsg: MessageItem = {
      id: msgId,
      channelId,
      channelName,
      senderId: currentUser?.uid || 'guest',
      senderName: currentUser?.name || 'Pemain Arashi',
      senderRole: currentUser?.role || 'member',
      senderAvatar: currentUser?.avatarUrl,
      text,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    try {
      await setDoc(doc(db, 'messages', msgId), newMsg);

      // Dual-sync to Supabase if configured
      if (isSupabaseConfigured) {
        try {
          await supabase.from('messages').insert({
            id: msgId,
            channel_id: channelId,
            channel_name: channelName,
            sender_id: newMsg.senderId,
            sender_name: newMsg.senderName,
            sender_role: newMsg.senderRole || 'member',
            sender_avatar: newMsg.senderAvatar || null,
            text: newMsg.text
          });
        } catch (err) {
          console.warn('Supabase message sync:', err);
        }
      }

      // Also notify
      await sendNotification(
        `Pesan Baru dari ${newMsg.senderName}`,
        `"${text.length > 45 ? text.substring(0, 45) + '...' : text}"`,
        'chat_message'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
    }
  };

  // Notification read actions
  const markNotificationAsRead = async (notifId: string) => {
    const uid = currentUser?.uid || 'anonymous';
    const notif = notifications.find((n) => n.id === notifId);
    if (!notif) return;
    const currentReadBy = notif.readBy || [];
    if (!currentReadBy.includes(uid)) {
      try {
        await updateDoc(doc(db, 'notifications', notifId), {
          readBy: [...currentReadBy, uid]
        });
      } catch (err) {
        console.warn('Failed marking notif read:', err);
      }
    }
  };

  const markAllNotificationsAsRead = async () => {
    const uid = currentUser?.uid || 'anonymous';
    for (const n of notifications) {
      if (!n.readBy?.includes(uid)) {
        try {
          await updateDoc(doc(db, 'notifications', n.id), {
            readBy: [...(n.readBy || []), uid]
          });
        } catch {
          // ignore
        }
      }
    }
  };

  const clearAllNotifications = async () => {
    if (!isAdmin) return;
    for (const n of notifications) {
      try {
        await deleteDoc(doc(db, 'notifications', n.id));
      } catch {
        // ignore
      }
    }
  };

  // Unread count
  const unreadNotificationsCount = notifications.filter(
    (n) => !(n.readBy || []).includes(currentUser?.uid || '')
  ).length;

  return (
    <AppContext.Provider
      value={{
        matches,
        teams,
        notifications,
        messages,
        venues,
        tournaments,
        unreadNotificationsCount,
        activeToast,
        dismissToast,
        createMatch,
        joinMatch,
        leaveMatch,
        updateMatchStatus,
        deleteMatch,
        myTeam,
        updateTeam,
        addTeamMember,
        sendMessage,
        sendNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
