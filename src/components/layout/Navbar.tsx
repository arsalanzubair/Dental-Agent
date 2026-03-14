import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Search, Sun, Moon, Bell, User, LogOut, MapPin } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocations } from '../../contexts/LocationContext';

interface NavbarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
    showNotifications: boolean;
    setShowNotifications: (show: boolean) => void;
}

export function Navbar({
    isSidebarOpen,
    setIsSidebarOpen,
    showNotifications,
    setShowNotifications
}: NavbarProps) {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, role } = useAuth();
    const { locations, selectedLocation, setSelectedLocation } = useLocations();
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    // Mock notifications
    const notifications = [
        { id: 1, text: "New booking: Sarah Johnson", time: "2 mins ago", type: "new" },
        { id: 2, text: "Appointment cancelled: Mike Ross", time: "1 hour ago", type: "cancelled" },
    ];

    return (
        <header className="navbar">
            <div className="navbar-left">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="btn"
                    style={{ padding: '8px', backgroundColor: 'transparent' }}
                >
                    {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                </button>

                <div className="search-input-wrapper">
                    <Search className="icon" size={18} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        className="search-input"
                    />
                </div>

                <div className="divider-v"></div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin size={18} style={{ color: 'var(--muted)' }} />
                    <select
                        className="search-input"
                        style={{ paddingLeft: '12px', width: 'auto', border: 'none', backgroundColor: 'transparent', fontWeight: '700', fontSize: '13px' }}
                        value={selectedLocation?.id || ''}
                        onChange={(e) => {
                            const loc = locations.find(l => l.id === e.target.value);
                            if (loc) setSelectedLocation(loc);
                        }}
                    >
                        {locations.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="navbar-right">
                <button
                    onClick={toggleTheme}
                    className="btn"
                    style={{ padding: '10px', backgroundColor: 'transparent', borderRadius: '12px' }}
                >
                    {theme === 'dark' ? <Sun size={20} style={{ color: '#fbbf24' }} /> : <Moon size={20} />}
                </button>

                <div className="notification-trigger">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="btn"
                        style={{ padding: '10px', backgroundColor: 'transparent', borderRadius: '12px', position: 'relative' }}
                    >
                        <Bell size={20} />
                        <span className="dot-badge"></span>
                    </button>

                    {showNotifications && (
                        <div className="card notification-dropdown">
                            <div className="notification-header">
                                <span>Notifications</span>
                                <button style={{ color: 'var(--primary)', border: 'none', background: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Clear all</button>
                            </div>
                            <div className="notification-list">
                                {notifications.map(n => (
                                    <div key={n.id} className="notification-item">
                                        <div className="notification-item-icon">
                                            <Bell size={16} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '13px', fontWeight: '600' }}>{n.text}</p>
                                            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="divider-v"></div>

                <div style={{ position: 'relative' }}>
                    <button
                        className="btn user-profile"
                        onClick={() => setShowUserMenu(!showUserMenu)}
                    >
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '13px', fontWeight: '700' }}>{user?.email?.split('@')[0] || 'Staff User'}</span>
                            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{role}</span>
                        </div>
                        <div className="user-avatar">
                            <User size={18} />
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="card" style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            marginTop: '8px',
                            width: '200px',
                            zIndex: 100,
                            padding: '8px'
                        }}>
                            <div style={{ padding: '12px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
                                <p style={{ fontSize: '12px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
                            </div>
                            <button
                                onClick={() => logout()}
                                className="nav-item"
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    color: 'var(--status-cancelled)',
                                    border: 'none',
                                    background: 'none',
                                    width: '100%',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                }}
                            >
                                <LogOut size={18} />
                                <span style={{ fontWeight: '600', fontSize: '13px' }}>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
