/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LanguageProvider, useLanguage } from './context/LanguageContext.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/common/Navbar.tsx';
import { Footer } from './components/common/Footer.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { Hero } from './components/home/Hero.tsx';
import { CategoryGrid } from './components/home/CategoryGrid.tsx';
import { HowItWorks } from './components/home/HowItWorks.tsx';
import { TrustAndBenefits } from './components/home/TrustAndBenefits.tsx';
import { FindWorkersPage } from './pages/FindWorkersPage.tsx';
import { FindJobsPage } from './pages/FindJobsPage.tsx';
import { AgriculturePage } from './pages/AgriculturePage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { WorkerDashboardPage } from './pages/WorkerDashboardPage.tsx';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { AboutPage } from './pages/AboutPage.tsx';

function MainApp() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchParams, setSearchParams] = useState<{
    skill: string;
    city: string;
    category: string;
  }>({
    skill: '',
    city: '',
    category: '',
  });

  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const handleHeroSearch = (skill: string, city: string) => {
    setSearchParams({ skill, city, category: '' });
    setCurrentPage('find-workers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categorySlug: string) => {
    if (categorySlug === 'agricultural-worker') {
      setCurrentPage('agriculture');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setSearchParams({ skill: '', city: '', category: categorySlug });
    setCurrentPage('find-workers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFindWorkClick = () => {
    if (!user) {
      openAuthModal('register', 'worker');
    } else if (user.role === 'worker') {
      setCurrentPage('find-jobs');
    } else {
      setCurrentPage('find-jobs');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Main Page Routing */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <div>
            <Hero
              onSearch={handleHeroSearch}
              onFindWorkClick={handleFindWorkClick}
              onAgriClick={() => {
                setCurrentPage('agriculture');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <CategoryGrid
              onSelectCategory={handleSelectCategory}
              onNavigateToAgri={() => {
                setCurrentPage('agriculture');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <HowItWorks
              onFindWorkersClick={() => {
                setCurrentPage('find-workers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPostJobClick={() => {
                setCurrentPage('find-jobs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <TrustAndBenefits
              onGetStarted={() => {
                setCurrentPage('find-workers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {currentPage === 'find-workers' && (
          <FindWorkersPage
            initialSearch={searchParams.skill}
            initialCity={searchParams.city}
            initialCategory={searchParams.category}
          />
        )}

        {currentPage === 'find-jobs' && (
          <FindJobsPage
            initialCategory={searchParams.category}
            initialCity={searchParams.city}
          />
        )}

        {currentPage === 'agriculture' && <AgriculturePage />}

        {currentPage === 'how-it-works' && (
          <div className="py-10">
            <HowItWorks
              onFindWorkersClick={() => {
                setCurrentPage('find-workers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onPostJobClick={() => {
                setCurrentPage('find-jobs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <TrustAndBenefits
              onGetStarted={() => {
                setCurrentPage('find-workers');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {currentPage === 'about' && <AboutPage />}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'worker-dashboard' && <WorkerDashboardPage />}

        {currentPage === 'customer-dashboard' && <CustomerDashboardPage />}

        {currentPage === 'admin-dashboard' && <AdminDashboardPage />}
      </main>

      {/* Global Authentication Modal */}
      <AuthModal />

      {/* Footer */}
      <Footer
        onCategoryClick={handleSelectCategory}
        onPageChange={(page) => {
          setCurrentPage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
