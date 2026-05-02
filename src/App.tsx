import { Navigate, Route, Routes } from 'react-router-dom';

import HomePage from '@/pages/Home/HomePage';
import LoginPage from '@/pages/Login/LoginPage';
import PasswordResetPage from '@/pages/PasswordReset/PasswordResetPage';
import SignupPage from '@/pages/Signup/SignupPage';
import {
  BadgeDetailPage,
  BadgeListPage,
  CommunityListPage,
  CrewDetailPage,
  CrewSearchPage,
  DashboardHomePage,
  ErrorStatePage,
  FollowersPage,
  GoalEditPage,
  HashtagPage,
  NotificationsPage,
  PostComposePage,
  PostDetailPage,
  ProfileEditPage,
  ProfilePage,
  RecruitComposePage,
  RecruitDetailPage,
  RecordsPage,
  RunningDetailPage,
  SettingsPage,
  StatesPage,
} from '@/pages/Web/WebPages';

import styles from './App.module.css';

function App() {
  return (
    <div className={styles.app}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/password-reset" element={<PasswordResetPage />} />
        <Route path="/home" element={<DashboardHomePage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/records/:runId" element={<RunningDetailPage />} />
        <Route path="/goals/edit" element={<GoalEditPage />} />
        <Route path="/badges" element={<BadgeListPage />} />
        <Route path="/badges/:badgeId" element={<BadgeDetailPage />} />
        <Route path="/community" element={<CommunityListPage />} />
        <Route path="/community/new" element={<PostComposePage />} />
        <Route path="/community/:postId" element={<PostDetailPage />} />
        <Route path="/tags/:tag" element={<HashtagPage />} />
        <Route path="/crews" element={<CrewSearchPage />} />
        <Route path="/crews/:crewId" element={<CrewDetailPage />} />
        <Route path="/crews/:crewId/recruits/new" element={<RecruitComposePage />} />
        <Route path="/crews/:crewId/recruits/:recruitId" element={<RecruitDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<ProfileEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/followers" element={<FollowersPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/error/forbidden" element={<ErrorStatePage kind="forbidden" />} />
        <Route path="/error/server" element={<ErrorStatePage kind="server" />} />
        <Route path="/states" element={<StatesPage />} />
        <Route path="/mypage" element={<Navigate to="/profile" replace />} />
        <Route path="*" element={<ErrorStatePage kind="notFound" />} />
      </Routes>
    </div>
  );
}

export default App;
