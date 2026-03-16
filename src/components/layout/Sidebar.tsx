import React from 'react';
import {
    LayoutDashboard,
    Database,
    Calendar,
    BarChart3,
    Bell,
    Settings,
    PhoneCall,
    HelpCircle,
    AlertCircle
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    activePage: string;
    setActivePage: (page: string) => void;
}

export function Sidebar({ isOpen, activePage, setActivePage }: SidebarProps) {
    return (
        <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <LayoutDashboard size={18} />
                </div>
                {isOpen && (
                    <span className="sidebar-brand">
                        DentalAI
                    </span>
                )}
            </div>

            <nav className="nav-list" style={{ flex: 1, overflowY: 'auto' }}>
                <SectionLabel isOpen={isOpen} label="Clinic Overview" />
                <NavItem
                    icon={<LayoutDashboard size={20} />}
                    label="Dashboard"
                    active={activePage === 'dashboard'}
                    onClick={() => setActivePage('dashboard')}
                    isOpen={isOpen}
                />
                <NavItem
                    icon={<Database size={20} />}
                    label="Appointments"
                    active={activePage === 'appointments'}
                    onClick={() => setActivePage('appointments')}
                    isOpen={isOpen}
                />
                <NavItem
                    icon={<Calendar size={20} />}
                    label="Calendar"
                    active={activePage === 'calendar'}
                    onClick={() => setActivePage('calendar')}
                    isOpen={isOpen}
                />

                <SectionLabel isOpen={isOpen} label="AI Operations" />
                <NavItem
                    icon={<PhoneCall size={20} />}
                    label="Call Logs"
                    active={activePage === 'call-logs'}
                    onClick={() => setActivePage('call-logs')}
                    isOpen={isOpen}
                />
                <NavItem
                    icon={<AlertCircle size={20} />}
                    label="Unanswered"
                    active={activePage === 'unanswered'}
                    onClick={() => setActivePage('unanswered')}
                    isOpen={isOpen}
                    badge={2}
                />
                <NavItem
                    icon={<HelpCircle size={20} />}
                    label="Knowledge Base"
                    active={activePage === 'faq'}
                    onClick={() => setActivePage('faq')}
                    isOpen={isOpen}
                />

                <SectionLabel isOpen={isOpen} label="Management" />
                <NavItem
                    icon={<BarChart3 size={20} />}
                    label="Analytics"
                    active={activePage === 'analytics'}
                    onClick={() => setActivePage('analytics')}
                    isOpen={isOpen}
                />
                <NavItem
                    icon={<Bell size={20} />}
                    label="Notifications"
                    active={activePage === 'notifications'}
                    onClick={() => setActivePage('notifications')}
                    isOpen={isOpen}
                    badge={3}
                />
            </nav>

            <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
                <NavItem
                    icon={<Settings size={20} />}
                    label="Settings"
                    active={activePage === 'settings'}
                    onClick={() => setActivePage('settings')}
                    isOpen={isOpen}
                />
            </div>
        </aside>
    );
}

function SectionLabel({ isOpen, label }: { isOpen: boolean, label: string }) {
    if (!isOpen) return <div style={{ height: '24px' }}></div>;
    return (
        <div style={{
            padding: '24px 16px 8px',
            fontSize: '10px',
            fontWeight: '800',
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
        }}>
            {label}
        </div>
    );
}

function NavItem({ icon, label, isOpen, active = false, onClick, badge }: {
    icon: React.ReactNode,
    label: string,
    isOpen: boolean,
    active?: boolean,
    onClick: () => void,
    badge?: number
}) {
    return (
        <button
            onClick={onClick}
            className={`nav-item ${active ? 'active' : ''}`}
        >
            <span className="icon">{icon}</span>
            <span className="nav-label">{label}</span>
            {isOpen && badge && !active && (
                <span style={{
                    marginLeft: 'auto',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px'
                }}>
                    {badge}
                </span>
            )}
        </button>
    );
}
