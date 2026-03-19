import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Search, Sun, Moon, User, LogOut, MapPin, Bell, Check, Trash2, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLocations } from '../../contexts/LocationContext';

interface NavbarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (open: boolean) => void;
}

export function Navbar({
    isSidebarOpen,
    setIsSidebarOpen
}: NavbarProps) {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, role } = useAuth();
    const { locations, selectedLocation, setSelectedLocation } = useLocations();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const [showNotifications, setShowNotifications] = React.useState(false);


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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '12px' }}>
                    <MapPin size={18} style={{ color: 'var(--primary)' }} />
                    <select
                        className="search-input"
                        style={{ padding: '8px 12px', minWidth: '160px', height: '40px' }}
                        value={selectedLocation?.id || 'all'}
                        onChange={(e) => {
                            const loc = locations.find(l => l.id === e.target.value);
                            setSelectedLocation(loc || null);
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


                <div style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="btn"
                        style={{ padding: '10px', backgroundColor: 'transparent', borderRadius: '12px', position: 'relative' }}
                    >
                        <Bell size={20} color={unreadCount > 0 ? 'var(--primary)' : 'var(--foreground)'} />
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute', top: '6px', right: '6px',
                                background: '#ef4444', color: 'white',
                                fontSize: '10px', fontWeight: '800',
                                width: '16px', height: '16px',
                                borderRadius: '50%', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                border: '2px solid var(--card-bg)'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="card shadow-lg animate-in" style={{
                            position: 'absolute', right: 0, top: '100%',
                            marginTop: '12px', width: '380px', zIndex: 1000,
                            maxHeight: '500px', display: 'flex', flexDirection: 'column',
                            padding: 0, overflow: 'hidden'
                        }}>
                            <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--background)' }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Activity Feed</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={markAllAsRead} className="btn-text" style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>Mark all read</button>
                                    <button onClick={clearNotifications} className="btn-text" style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: '700' }}><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--card-bg)' }}>
                                {notifications.length > 0 ? (
                                    notifications.map(n => (
                                        <div key={n.id} 
                                            onClick={() => markAsRead(n.id)}
                                            style={{ 
                                                padding: '16px', borderBottom: '1px solid var(--border)',
                                                backgroundColor: n.isRead ? 'transparent' : 'var(--primary-light)',
                                                cursor: 'pointer', transition: 'background 0.2s',
                                                display: 'flex', gap: '12px'
                                            }}
                                        >
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '8px', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                backgroundColor: n.type === 'CONFIRMED' ? 'var(--status-completed-bg)' : n.type === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-light)',
                                                color: n.type === 'CONFIRMED' ? 'var(--status-completed)' : n.type === 'CANCELLED' ? '#ef4444' : 'var(--primary)'
                                            }}>
                                                {n.type === 'CONFIRMED' ? <CheckCircle size={18} /> : n.type === 'CANCELLED' ? <XCircle size={18} /> : <MessageSquare size={18} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{n.patientName || 'System'}</span>
                                                    <span style={{ fontSize: '10px', color: 'var(--muted)' }}>{format(new Date(n.timestamp), 'h:mm a')}</span>
                                                </div>
                                                <p style={{ fontSize: '12px', color: 'var(--foreground)', lineHeight: '1.4' }}>{n.message}</p>
                                            </div>
                                            {!n.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)', marginTop: '4px' }} />}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                                        <Bell size={32} style={{ opacity: 0.1, marginBottom: '12px' }} />
                                        <p style={{ fontSize: '13px', fontStyle: 'italic' }}>No recent activity to show.</p>
                                    </div>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase' }}>Showing last 50 events</span>
                                </div>
                            )}
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
