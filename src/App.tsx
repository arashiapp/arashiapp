/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { LandingScreen } from './components/LandingScreen';
import { HomeScreen } from './components/HomeScreen';
import { MatchesScreen } from './components/MatchesScreen';
import { CreateMatchScreen } from './components/CreateMatchScreen';
import { MatchDetailModal } from './components/MatchDetailModal';
import { MyTeamScreen } from './components/MyTeamScreen';
import { MessagesScreen } from './components/MessagesScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { RealtimeToastBanner } from './components/RealtimeToastBanner';
import { MoreMenuModal } from './components/MoreMenuModal';
import { InstallAppModal } from './components/InstallAppModal';


function MainAppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0f17] text-gray-100 flex items-center justify-center">
        Memeriksa sesi login...
      </div>
    );
  }

  if (!currentUser) {
    return <LandingScreen onEnterApp={() => {}} />;
  }

  return (
  <AppProvider>
    <AuthenticatedAppContent />
  </AppProvider>
);
}

function AuthenticatedAppContent() {
  const { activeToast, dismissToast } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('beranda');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [moreMenuSection, setMoreMenuSection] = useState<string | null>(null);
  const [showMyTeamModal, setShowMyTeamModal] = useState(false);
  const [chatChannelTarget, setChatChannelTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);


  const handleOpenMoreSection = (section: string) => {
    setMoreMenuSection(section);
    setIsMoreMenuOpen(true);
  };

  const handleOpenChatWithTeam = (teamId: string, teamName: string) => {
    setChatChannelTarget({ id: teamId, name: teamName });
    setSelectedMatchId(null);
    setActiveTab('pesan');
  };

  return (
    <div className="min-h-screen bg-[#0c0f17] text-gray-100 flex justify-center selection:bg-emerald-500 selection:text-black">
      {/* Mobile-first container shell with max width for desktop / tablet responsiveness */}
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl min-h-screen flex flex-col bg-[#0c0f17] relative border-x border-gray-800/40 shadow-2xl">
        {/* Real-time Push Notification Banner */}
        <RealtimeToastBanner
          notification={activeToast}
          onDismiss={dismissToast}
          onViewMatch={(mId) => setSelectedMatchId(mId)}
        />

        {/* Top Header */}
        <Header
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenMoreMenu={() => {
            setMoreMenuSection(null);
            setIsMoreMenuOpen(true);
          }}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* Main Body per Active Tab */}
        <main className="flex-1">
          {activeTab === 'beranda' && (
            <HomeScreen
              onSelectMatch={(mId) => setSelectedMatchId(mId)}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenVenues={() => handleOpenMoreSection('lapangan')}
              onOpenTournaments={() => handleOpenMoreSection('turnamen')}
              onOpenTeams={() => setShowMyTeamModal(true)}
            />
          )}

          {activeTab === 'cari' && (
            <MatchesScreen
              onSelectMatch={(mId) => setSelectedMatchId(mId)}
              onOpenCreate={() => setActiveTab('buat')}
            />
          )}

          {activeTab === 'buat' && (
            <CreateMatchScreen
              onBack={() => setActiveTab('beranda')}
              onSuccess={(newMatchId) => {
                setActiveTab('cari');
                setSelectedMatchId(newMatchId);
              }}
            />
          )}

          {activeTab === 'pesan' && (
            <MessagesScreen
              initialChannelId={chatChannelTarget?.id}
              initialChannelName={chatChannelTarget?.name}
            />
          )}

          {activeTab === 'profil' && (
            <ProfileScreen
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenMyTeam={() => setShowMyTeamModal(true)}
              onOpenSettings={() => handleOpenMoreSection('tentang')}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onChangeTab={(tab) => setActiveTab(tab)} />

        {/* Modals & Drawers */}
        {selectedMatchId && (
          <MatchDetailModal
            matchId={selectedMatchId}
            onClose={() => setSelectedMatchId(null)}
            onOpenChatWithTeam={handleOpenChatWithTeam}
          />
        )}

        {showMyTeamModal && (
          <div className="fixed inset-0 z-50 bg-[#0c0f17] overflow-y-auto">
            <div className="sticky top-0 bg-[#0c0f17]/95 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-gray-800 z-10">
              <span className="font-bold text-white text-sm">Informasi Tim</span>
              <button
                onClick={() => setShowMyTeamModal(false)}
                className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
              >
                Tutup
              </button>
            </div>
            <MyTeamScreen
              onViewMatches={() => {
                setShowMyTeamModal(false);
                setActiveTab('cari');
              }}
            />
          </div>
        )}

        <NotificationsDrawer
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onSelectMatch={(mId) => setSelectedMatchId(mId)}
        />

        <MoreMenuModal
          isOpen={isMoreMenuOpen}
          onClose={() => {
            setIsMoreMenuOpen(false);
            setMoreMenuSection(null);
          }}
          initialSection={moreMenuSection}
        />

        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainAppContent />
      </AppProvider>
    </AuthProvider>
  );
}
