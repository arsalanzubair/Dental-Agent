import { useState } from 'react';
import { Settings as SettingsIcon, LayoutDashboard } from 'lucide-react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Analytics } from './pages/Analytics';
import { CalendarView } from './pages/Calendar';
import { Login } from './pages/Login';
import { CallLogs } from './pages/CallLogs';
import { UnansweredQuestions } from './pages/UnansweredQuestions';
import { FAQManagement } from './pages/FAQManagement';
import { Settings } from './pages/Settings';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';

function AppContent() {
    const { theme } = useTheme();
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('dashboard');
    const [showNotifications, setShowNotifications] = useState(false);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--background)',
                color: 'var(--muted)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="sidebar-logo" style={{ width: '48px', height: '48px', animation: 'spin 2s linear infinite' }}>
                        <LayoutDashboard size={24} />
                    </div>
                    <p style={{ fontWeight: '600' }}>Initializing DentalAI Control Panel...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Login />;
    }

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <Dashboard />;
            case 'appointments': return <Dashboard />;
            case 'calendar': return <CalendarView />;
            case 'call-logs': return <CallLogs />;
            case 'unanswered': return <UnansweredQuestions />;
            case 'faq': return <FAQManagement />;
            case 'analytics': return <Analytics />;
            case 'settings': return <Settings />;
            default:
                return (
                    <div className="empty-state animate-in">
                        <div className="empty-state-icon">
                            <SettingsIcon size={32} />
                        </div>
                        <div>
                            <h3>{activePage.charAt(0).toUpperCase() + activePage.slice(1)} View</h3>
                            <p style={{ fontStyle: 'italic' }}>This module is currently being initialized...</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className={`app-container ${theme === 'dark' ? 'dark' : ''}`}>
            <Sidebar
                isOpen={isSidebarOpen}
                activePage={activePage}
                setActivePage={setActivePage}
            />

            <div className="main-wrapper">
                <Navbar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                />

                <section className="content-area">
                    {renderPage()}
                </section>
            </div>
        </div>
    );
}

import { LocationProvider } from './contexts/LocationContext';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LocationProvider>
                    <AppContent />
                </LocationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
