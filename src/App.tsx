/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import AddLocationPage from './pages/AddLocationPage';
import LocationDetailsPage from './pages/LocationDetailsPage';
import CommunityPage from './pages/CommunityPage';
import AdminPage from './pages/AdminPage';
import { NotificationProvider } from './components/NotificationProvider';

export default function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="feed" element={<FeedPage />} />
            <Route path="add" element={<AddLocationPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="community" element={<CommunityPage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="location/:id" element={<LocationDetailsPage />} />
          </Route>
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

