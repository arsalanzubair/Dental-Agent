import { useState, useEffect } from 'react';
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
import { SMSTemplates } from './pages/SMSTemplates';
import { Settings } from './pages/Settings';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';

function AppContent() {
    const { theme } = useTheme();
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activePage, setActivePage] = useState('appointments');
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    useEffect(() => {
        const handleCancelEvent = (e: any) => {
            const apt = e.detail;
            const method = apt.canceled_via_sms ? 'via SMS' : '';
            setToastMessage(`Patient ${apt.patient_name || 'unknown'} cancelled their appointment ${method}.`.replace('  ', ' '));
            setTimeout(() => setToastMessage(null), 8000);
        };
        window.addEventListener('appointment-cancelled', handleCancelEvent);
        return () => window.removeEventListener('appointment-cancelled', handleCancelEvent);
    }, []);

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
            case 'appointments': return <Dashboard />;
            case 'calendar': return <CalendarView />;
            case 'call-logs': return <CallLogs />;
            case 'unanswered': return <UnansweredQuestions />;
            case 'faq': return <FAQManagement />;
            case 'analytics': return <Analytics />;
            case 'sms-templates': return <SMSTemplates />;
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
                />

                {toastMessage && (
                    <div style={{
                        position: 'absolute', top: '16px', right: '16px', zIndex: 9999,
                        background: '#ef4444', color: 'white', padding: '16px 24px',
                        borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <span style={{ fontWeight: '700' }}>Notification:</span> {toastMessage}
                        <button onClick={() => setToastMessage(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginLeft: '12px', opacity: 0.8 }}>✕</button>
                    </div>
                )}

                <section className="content-area">
                    {renderPage()}
                </section>
            </div>
        </div>
    );
}

import { LocationProvider } from './contexts/LocationContext';
import { AppointmentProvider } from './contexts/AppointmentContext';

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <LocationProvider>
                    <AppointmentProvider>
                        <AppContent />
                    </AppointmentProvider>
                </LocationProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
