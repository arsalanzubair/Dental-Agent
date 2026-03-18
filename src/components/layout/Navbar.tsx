import React from 'react';
import { PanelLeftClose, PanelLeftOpen, Search, Sun, Moon, User, LogOut, MapPin } from 'lucide-react';
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
    const [showUserMenu, setShowUserMenu] = React.useState(false);


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
