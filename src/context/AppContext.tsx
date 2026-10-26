
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  Match,
  Team,
  NotificationItem,
  MessageItem,
  Venue,
  Tournament,
  MatchStatus
} from '../types';
import {
  INITIAL_MATCHES,
  INITIAL_TEAMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_VENUES,
  INITIAL_TOURNAMENTS
} from '../data/initialData';
import { useAuth } from './AuthContext';
import {
  supabase,
  isSupabaseConfigured,
  subscribeToSupabaseRealtime
} from '../lib/supabase';

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

  createMatch: (
    data: Omit<Match, 'id' | 'createdAt' | 'currentTeams' | 'targetTeams'>
  ) => Promise<string>;

  joinMatch: (
    matchId: string,
    teamData: {
      teamId: string;
      teamName: string;
      captainName: string;
      captainPhone: string;
    }
  ) => Promise<void>;

  leaveMatch: (matchId: string, teamId: string) => Promise<void>;
  updateMatchStatus: (matchId: string, status: MatchStatus) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;

  myTeam: Team | undefined;
  updateTeam: (team: Team) => Promise<void>;

  addTeamMember: (
    teamId: string,
    member: {
      name: string;
      role: string;
      position: string;
      number?: number;
    }
  ) => Promise<void>;

  sendMessage: (
    channelId: string,
    channelName: string,
    text: string
  ) => Promise<void>;

  sendNotification: (
    title: string,
    message: string,
    type: NotificationItem['type'],
    relatedMatchId?: string
  ) => Promise<void>;

  markNotificationAsRead: (notifId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { currentUser, isAdmin } = useAuth();

  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [venues] = useState<Venue[]>(INITIAL_VENUES);
  const [tournaments] = useState<Tournament[]>(INITIAL_TOURNAMENTS);

  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);
  const [hasInitializedListener, setHasInitializedListener] = useState(false);

  // Real-time synchronization with Firebase and Supabase.
  useEffect(() => {
    if (!currentUser) return;

    const unsubMatches = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        if (snapshot.empty) {
          void seedInitialData();
          return;
        }

        const list: Match[] = [];

        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Match, 'id'>)
          });
        });

        list.sort((a, b) => {
          const dateA = Date.parse(a.createdAt || '') || 0;
          const dateB = Date.parse(b.createdAt || '') || 0;
          return dateB - dateA;
        });

        setMatches(list);
      },
      (error) => {
        console.error('Gagal memuat pertandingan Firebase:', error);
        handleFirestoreError(error, OperationType.LIST, 'matches');
      }
    );

    const unsubTeams = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        if (snapshot.empty) return;

        const list: Team[] = [];

        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<Team, 'id'>)
          });
        });

        setTeams(list);
      },
      (error) => {
        console.error('Gagal memuat tim:', error);
        handleFirestoreError(error, OperationType.LIST, 'teams');
      }
    );

    const unsubNotifs = onSnapshot(
      collection(db, 'notifications'),
      (snapshot) => {
        const list: NotificationItem[] = [];

        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<NotificationItem, 'id'>)
          });
        });

        list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (hasInitializedListener && list.length > 0) {
          const newest = list[0];
          const isFresh =
            Date.now() - (newest.timestamp || 0) < 10000;

          if (isFresh) {
            setActiveToast(newest);
          }
        }

        setNotifications(list);
        setHasInitializedListener(true);
      },
      (error) => {
        console.error('Gagal memuat notifikasi:', error);
        handleFirestoreError(error, OperationType.LIST, 'notifications');
      }
    );

    const unsubMessages = onSnapshot(
      collection(db, 'messages'),
      (snapshot) => {
        const list: MessageItem[] = [];

        snapshot.forEach((docSnap) => {
          list.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<MessageItem, 'id'>)
          });
        });

        list.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        setMessages(list);
      },
      (error) => {
        console.error('Gagal memuat pesan:', error);
        handleFirestoreError(error, OperationType.LIST, 'messages');
      }
    );

    let unsubSupabaseMatches = () => {};
    let unsubSupabaseNotifs = () => {};
    let unsubSupabaseMessages = () => {};

    if (isSupabaseConfigured) {
      unsubSupabaseMatches = subscribeToSupabaseRealtime(
        'matches',
        (newRecord) => {
          setMatches((previous) => {
            const exists = previous.some((match) => match.id === newRecord.id);

            if (exists) {
              return previous.map((match) =>
                match.id === newRecord.id
                  ? { ...match, ...newRecord }
                  : match
              );
            }

            return [newRecord, ...previous];
          });
        },
        (updatedRecord) => {
          setMatches((previous) =>
            previous.map((match) =>
              match.id === updatedRecord.id
                ? { ...match, ...updatedRecord }
                : match
            )
          );
        },
        (deletedRecord) => {
          setMatches((previous) =>
            previous.filter((match) => match.id !== deletedRecord.id)
          );
        }
      );

      unsubSupabaseNotifs = subscribeToSupabaseRealtime(
        'notifications',
        (newNotif) => {
          setNotifications((previous) => [
            newNotif,
            ...previous.filter((item) => item.id !== newNotif.id)
          ]);
          setActiveToast(newNotif);
        }
      );

      unsubSupabaseMessages = subscribeToSupabaseRealtime(
        'messages',
        (newMsg) => {
          setMessages((previous) => {
            if (previous.some((item) => item.id === newMsg.id)) {
              return previous;
            }

            return [...previous, newMsg];
          });
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

  // Seed Firebase only when the matches collection is empty.
  const seedInitialData = async () => {
    try {
      for (const match of INITIAL_MATCHES) {
        await setDoc(doc(db, 'matches', match.id), match);
      }

      for (const team of INITIAL_TEAMS) {
        await setDoc(doc(db, 'teams', team.id), team);
      }

      for (const notification of INITIAL_NOTIFICATIONS) {
        await setDoc(
          doc(db, 'notifications', notification.id),
          notification
        );
      }

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
    } catch (error) {
      console.error('Gagal menyiapkan data awal:', error);
    }
  };

  const dismissToast = () => setActiveToast(null);

  // Send notification.
  const sendNotification = async (
    title: string,
    message: string,
    type: NotificationItem['type'],
    relatedMatchId?: string
  ) => {
    const notifId = `notif-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 6)}`;

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

    // Firebase is the primary notification store.
    await setDoc(doc(db, 'notifications', notifId), newNotif);
    setActiveToast(newNotif);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('notifications').insert({
          id: notifId,
          title,
          message,
          type,
          related_match_id: relatedMatchId || null
        });

        if (error) {
          console.warn('Sinkronisasi notifikasi Supabase gagal:', error.message);
        }
      } catch (error) {
        console.warn('Kesalahan sinkronisasi notifikasi:', error);
      }
    }
  };

  // Create match.
  const createMatch = async (
    data: Omit<Match, 'id' | 'createdAt' | 'currentTeams' | 'targetTeams'>
  ): Promise<string> => {
    const matchId = `match-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}`;

    const newMatch: Match = {
      ...data,
      id: matchId,
      currentTeams: data.teams?.length || 1,
      targetTeams: 2,
      createdAt: new Date().toISOString()
    };

    // Save to Firebase first.
    try {
      await setDoc(doc(db, 'matches', matchId), newMatch);
    } catch (error) {
      console.error('Gagal menyimpan pertandingan ke Firebase:', error);
      handleFirestoreError(error, OperationType.CREATE, 'matches');

      throw new Error(
        'Pertandingan gagal disimpan. Periksa koneksi dan izin database Firebase.'
      );
    }

    // Update local state immediately.
    setMatches((previous) => [
      newMatch,
      ...previous.filter((match) => match.id !== matchId)
    ]);

    // Sync to Supabase when configured.
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.from('matches').insert({
          id: matchId,
          title: data.title,
          type: data.type,
          format: data.format,
          match_date: data.date,
          location: data.location,
          level: data.level,
          description: data.description,
          status: data.status || 'terbuka',
          target_teams: 2,
          current_teams: data.teams?.length || 1,
          created_by: currentUser?.uid || 'guest',
          creator_name: data.creatorName,
          creator_phone: data.creatorPhone
        });

        if (error) {
          console.warn('Sinkronisasi pertandingan Supabase gagal:', error.message);
        }
      } catch (error) {
        console.warn('Kesalahan sinkronisasi pertandingan:', error);
      }
    }

    // Notification failure must not undo a saved match.
    try {
      await sendNotification(
        'Pertandingan Baru Dibuat! ⚽',
        `${data.title} di ${data.location} (${data.format}) telah dibuka untuk pendaftaran.`,
        'match_created',
        matchId
      );
    } catch (error) {
      console.warn('Pertandingan tersimpan, tetapi notifikasi gagal:', error);
    }

    return matchId;
  };

  // Join match.
  const joinMatch = async (
    matchId: string,
    teamData: {
      teamId: string;
      teamName: string;
      captainName: string;
      captainPhone: string;
    }
  ) => {
    const target = matches.find((match) => match.id === matchId);
    if (!target) {
      throw new Error('Pertandingan tidak ditemukan. Muat ulang daftar pertandingan.');
    }

    if (target.teams.some((team) => team.teamId === teamData.teamId)) {
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

    const newStatus: MatchStatus =
      updatedTeams.length >= 2 ? 'penuh' : 'terbuka';

    try {
      await updateDoc(doc(db, 'matches', matchId), {
        teams: updatedTeams,
        currentTeams: updatedTeams.length,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      await sendNotification(
        'Lawan Sparring Ditemukan! 🤝',
        `${teamData.teamName} telah bergabung ke pertandingan "${target.title}" di ${target.location}!`,
        'match_joined',
        matchId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `matches/${matchId}`);
      throw error;
    }
  };

  // Leave match.
  const leaveMatch = async (matchId: string, teamId: string) => {
    const target = matches.find((match) => match.id === matchId);
    if (!target) return;

    const remaining = target.teams.filter((team) => team.teamId !== teamId);

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
      throw error;
    }
  };

  // Update match status.
  const updateMatchStatus = async (
    matchId: string,
    status: MatchStatus
  ) => {
    const target = matches.find((match) => match.id === matchId);

    try {
      await updateDoc(doc(db, 'matches', matchId), {
        status,
        updatedAt: new Date().toISOString()
      });

      const label =
        status === 'selesai'
          ? 'Telah Selesai'
          : status === 'dibatalkan'
            ? 'Dibatalkan'
            : status === 'penuh'
              ? 'Telah Penuh'
              : 'Terbuka';

      await sendNotification(
        `Status Pertandingan Diperbarui: ${label}`,
        `Pertandingan "${target?.title || 'Sparring'}" kini berstatus ${label}.`,
        'match_status',
        matchId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `matches/${matchId}`);
      throw error;
    }
  };

  // Delete match.
  const deleteMatch = async (matchId: string) => {
    const target = matches.find((match) => match.id === matchId);

    try {
      await deleteDoc(doc(db, 'matches', matchId));

      setMatches((previous) =>
        previous.filter((match) => match.id !== matchId)
      );

      await sendNotification(
        'Pertandingan Dihapus 🗑️',
        `Pertandingan "${target?.title || 'Sparring'}" telah dihapus oleh ${isAdmin ? 'Admin' : 'Penyelenggara'}.`,
        'match_status'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `matches/${matchId}`);
      throw error;
    }
  };

  // User's default team.
  const myTeam =
    teams.find((team) => team.id === currentUser?.teamId) || teams[0];

  // Update team.
  const updateTeam = async (updatedTeam: Team) => {
    try {
      await setDoc(
        doc(db, 'teams', updatedTeam.id),
        {
          ...updatedTeam,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      );

      await sendNotification(
        'Profil Tim Diperbarui ⚡',
        `Tim ${updatedTeam.name} telah memperbarui data skuad dan informasi profil.`,
        'team_update'
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `teams/${updatedTeam.id}`
      );
      throw error;
    }
  };

  // Add team member.
  const addTeamMember = async (
    teamId: string,
    member: {
      name: string;
      role: string;
      position: string;
      number?: number;
    }
  ) => {
    const target = teams.find((team) => team.id === teamId);
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
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `teams/${teamId}`
      );
      throw error;
    }
  };

  // Send chat message.
  const sendMessage = async (
    channelId: string,
    channelName: string,
    text: string
  ) => {
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
      createdAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      }),
      timestamp: Date.now()
    };

    try {
      await setDoc(doc(db, 'messages', msgId), newMsg);

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.from('messages').insert({
            id: msgId,
            channel_id: channelId,
            channel_name: channelName,
            sender_id: newMsg.senderId,
            sender_name: newMsg.senderName,
            sender_role: newMsg.senderRole || 'member',
            sender_avatar: newMsg.senderAvatar || null,
            text: newMsg.text
          });

          if (error) {
            console.warn('Sinkronisasi pesan Supabase gagal:', error.message);
          }
        } catch (error) {
          console.warn('Kesalahan sinkronisasi pesan:', error);
        }
      }

      await sendNotification(
        `Pesan Baru dari ${newMsg.senderName}`,
        `"${text.length > 45 ? `${text.substring(0, 45)}...` : text}"`,
        'chat_message'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
      throw error;
    }
  };

  // Mark one notification as read.
  const markNotificationAsRead = async (notifId: string) => {
    const uid = currentUser?.uid || 'anonymous';
    const notif = notifications.find((item) => item.id === notifId);
    if (!notif) return;

    const currentReadBy = notif.readBy || [];
    if (currentReadBy.includes(uid)) return;

    try {
      await updateDoc(doc(db, 'notifications', notifId), {
        readBy: [...currentReadBy, uid]
      });
    } catch (error) {
      console.warn('Gagal menandai notifikasi sudah dibaca:', error);
    }
  };

  // Mark all notifications as read.
  const markAllNotificationsAsRead = async () => {
    const uid = currentUser?.uid || 'anonymous';

    for (const notification of notifications) {
      if (!notification.readBy?.includes(uid)) {
        try {
          await updateDoc(doc(db, 'notifications', notification.id), {
            readBy: [...(notification.readBy || []), uid]
          });
        } catch (error) {
          console.warn('Gagal memperbarui status notifikasi:', error);
        }
      }
    }
  };

  // Clear all notifications.
  const clearAllNotifications = async () => {
    if (!isAdmin) return;

    for (const notification of notifications) {
      try {
        await deleteDoc(doc(db, 'notifications', notification.id));
      } catch (error) {
        console.warn('Gagal menghapus notifikasi:', error);
      }
    }
  };

  const unreadNotificationsCount = notifications.filter(
    (notification) =>
      !(notification.readBy || []).includes(currentUser?.uid || '')
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
