import { useState } from 'react';
import { useSettings, ClinicSettings } from '../hooks/useSettings';
import { Bell, Zap, Calendar, Save, Trash2, Plus, Clock, MessageSquare, Shield, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TokenEditor } from '../components/shared/TokenEditor';

export function Settings() {
    const { settings, loading, updateSettings } = useSettings();
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<'reminders' | 'automation' | 'operations' | 'scheduling'>('reminders');
    const [isSaving, setIsSaving] = useState(false);

    if (loading || !settings) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading clinic settings...</div>;

    const handleSave = async (updates: Partial<ClinicSettings>) => {
        if (role !== 'Admin') return alert('Access Denied: Administrative privileges required.');
        setIsSaving(true);
        await updateSettings(updates);
        setIsSaving(false);
    };

    return (
        <div className="animate-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Clinic Control Settings</h1>
                    <p className="page-subtitle">Configure AI behavior, automated messaging, and clinic operations.</p>
                </div>
                {role !== 'Admin' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                        <Shield size={16} /> READ-ONLY MODE
                    </div>
                )}
            </header>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--background)' }}>
                    <TabButton active={activeTab === 'reminders'} onClick={() => setActiveTab('reminders')} icon={<Bell size={18} />} label="Reminders" />
                    <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={<Zap size={18} />} label="Automation" />
                    <TabButton active={activeTab === 'operations'} onClick={() => setActiveTab('operations')} icon={<Calendar size={18} />} label="Clinic Operations" />
                    <TabButton active={activeTab === 'scheduling'} onClick={() => setActiveTab('scheduling')} icon={<Clock size={18} />} label="Scheduling" />
                </div>

                <div style={{ padding: '32px' }}>
                    {activeTab === 'reminders' && <RemindersTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                    {activeTab === 'automation' && <AutomationTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                    {activeTab === 'operations' && <OperationsTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                    {activeTab === 'scheduling' && <SchedulingTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '16px 24px',
                border: 'none',
                background: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '14px',
                fontWeight: '700',
                color: active ? 'var(--primary)' : 'var(--muted)',
                borderBottom: active ? '2px solid var(--primary)' : '2px solid transparent',
                cursor: 'pointer',
                backgroundColor: active ? 'var(--card)' : 'transparent',
                transition: 'all 0.2s'
            }}
        >
            {icon}
            {label}
        </button>
    );
}

function RemindersTab({ settings, onSave, isSaving, isAdmin }: { settings: ClinicSettings, onSave: (u: Partial<ClinicSettings>) => void, isSaving: boolean, isAdmin: boolean }) {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Appointment Reminders</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    <div className="input-group">
                        <label className="input-label">Reminder Timing</label>
                        <select
                            className="search-input"
                            style={{ paddingLeft: '16px' }}
                            value={localSettings.reminder_timing}
                            disabled={!isAdmin}
                            onChange={(e) => setLocalSettings({ ...localSettings, reminder_timing: e.target.value })}
                        >
                            <option value="12h">12 hours before</option>
                            <option value="24h">24 hours before</option>
                            <option value="48h">48 hours before</option>
                            <option value="1w">1 week before</option>
                        </select>
                    </div>
                </div>
            </section>

            <section>
                <label className="input-label">Communication Channels</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                    {['sms', 'email', 'voice'].map(channel => (
                        <label key={channel} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isAdmin ? 'pointer' : 'default', opacity: isAdmin ? 1 : 0.7 }}>
                            <input
                                type="checkbox"
                                disabled={!isAdmin}
                                checked={localSettings.reminder_channels.includes(channel)}
                                onChange={(e) => {
                                    const newChannels = e.target.checked
                                        ? [...localSettings.reminder_channels, channel]
                                        : localSettings.reminder_channels.filter(c => c !== channel);
                                    setLocalSettings({ ...localSettings, reminder_channels: newChannels });
                                }}
                            />
                            <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>{channel}</span>
                        </label>
                    ))}
                </div>
            </section>

            <section>
                <label className="input-label">Reminder Message Template</label>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                    <TokenEditor
                        value={localSettings.reminder_template}
                        onChange={(val) => setLocalSettings({ ...localSettings, reminder_template: val })}
                        placeholder="Enter reminder template..."
                    />
                </div>
            </section>

            {isAdmin && (
                <button disabled={isSaving} onClick={() => onSave(localSettings)} className="btn btn-primary" style={{ width: 'fit-content', padding: '12px 32px' }}>
                    <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
            )}
        </div>
    );
}

function AutomationTab({ settings, onSave, isSaving, isAdmin }: { settings: ClinicSettings, onSave: (u: Partial<ClinicSettings>) => void, isSaving: boolean, isAdmin: boolean }) {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Follow-up Automation</h3>
                    <p style={{ fontSize: '14px', color: 'var(--muted)' }}>Automatically send messages after appointments to gather feedback.</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: isAdmin ? 'pointer' : 'default' }}>
                    <input
                        type="checkbox"
                        disabled={!isAdmin}
                        checked={localSettings.followup_enabled}
                        onChange={(e) => setLocalSettings({ ...localSettings, followup_enabled: e.target.checked })}
                    />
                    <span style={{ marginLeft: '12px', fontWeight: '700', color: localSettings.followup_enabled ? 'var(--status-completed)' : 'var(--muted)' }}>
                        {localSettings.followup_enabled ? 'ENABLED' : 'DISABLED'}
                    </span>
                </label>
            </section>

            <div style={{ opacity: localSettings.followup_enabled ? 1 : 0.5, pointerEvents: (localSettings.followup_enabled && isAdmin) ? 'all' : 'none', transition: 'opacity 0.3s' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                    <div className="input-group">
                        <label className="input-label">Follow-up Timing</label>
                        <select
                            className="search-input"
                            style={{ paddingLeft: '16px' }}
                            value={localSettings.followup_timing}
                            disabled={!isAdmin}
                            onChange={(e) => setLocalSettings({ ...localSettings, followup_timing: e.target.value })}
                        >
                            <option value="1h">1 hour after</option>
                            <option value="4h">4 hours after</option>
                            <option value="1d">1 day after</option>
                            <option value="3d">3 days after</option>
                        </select>
                    </div>
                </div>

                <section style={{ marginBottom: '24px' }}>
                    <label className="input-label">Follow-up Channels</label>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                        {['sms', 'email'].map(channel => (
                            <label key={channel} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isAdmin ? 'pointer' : 'default', opacity: isAdmin ? 1 : 0.7 }}>
                                <input
                                    type="checkbox"
                                    disabled={!isAdmin}
                                    checked={localSettings.followup_channels.includes(channel)}
                                    onChange={(e) => {
                                        const newChannels = e.target.checked
                                            ? [...localSettings.followup_channels, channel]
                                            : localSettings.followup_channels.filter((c: string) => c !== channel);
                                        setLocalSettings({ ...localSettings, followup_channels: newChannels });
                                    }}
                                />
                                <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase' }}>{channel}</span>
                            </label>
                        ))}
                    </div>
                </section>

                <div className="input-group">
                    <label className="input-label">Follow-up Template</label>
                    <div style={{ marginTop: '8px' }}>
                        <TokenEditor
                            value={localSettings.followup_template}
                            onChange={(val) => setLocalSettings({ ...localSettings, followup_template: val })}
                            placeholder="Enter follow-up template..."
                        />
                    </div>
                </div>
            </div>

            {isAdmin && (
                <button disabled={isSaving} onClick={() => onSave(localSettings)} className="btn btn-primary" style={{ width: 'fit-content', padding: '12px 32px' }}>
                    <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
            )}
        </div>
    );
}

function OperationsTab({ settings, onSave, isSaving, isAdmin }: { settings: ClinicSettings, onSave: (u: Partial<ClinicSettings>) => void, isSaving: boolean, isAdmin: boolean }) {
    const [localSettings, setLocalSettings] = useState(settings);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <section>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>Business Hours</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {Object.entries(localSettings.business_hours).map(([day, hours]: [string, any]) => (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '12px', backgroundColor: 'var(--background)', borderRadius: '12px' }}>
                            <div style={{ width: '100px', fontWeight: '700', textTransform: 'capitalize' }}>{day}</div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: isAdmin ? 'pointer' : 'default' }}>
                                <input
                                    type="checkbox"
                                    disabled={!isAdmin}
                                    checked={hours.enabled}
                                    onChange={(e) => {
                                        const newHours = { ...localSettings.business_hours, [day]: { ...hours, enabled: e.target.checked } };
                                        setLocalSettings({ ...localSettings, business_hours: newHours });
                                    }}
                                />
                                <span style={{ fontSize: '12px' }}>Open</span>
                            </label>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: hours.enabled ? 1 : 0.3 }}>
                                <input
                                    type="time"
                                    className="search-input"
                                    style={{ paddingLeft: '12px', width: '120px' }}
                                    value={hours.open}
                                    disabled={!hours.enabled || !isAdmin}
                                    onChange={(e) => {
                                        const newHours = { ...localSettings.business_hours, [day]: { ...hours, open: e.target.value } };
                                        setLocalSettings({ ...localSettings, business_hours: newHours });
                                    }}
                                />
                                <span>to</span>
                                <input
                                    type="time"
                                    className="search-input"
                                    style={{ paddingLeft: '12px', width: '120px' }}
                                    value={hours.close}
                                    disabled={!hours.enabled || !isAdmin}
                                    onChange={(e) => {
                                        const newHours = { ...localSettings.business_hours, [day]: { ...hours, close: e.target.value } };
                                        setLocalSettings({ ...localSettings, business_hours: newHours });
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '16px' }}>After-Hours Behavior</h3>
                <div className="input-group">
                    <select
                        className="search-input"
                        style={{ paddingLeft: '16px' }}
                        value={localSettings.after_hours_behavior}
                        disabled={!isAdmin}
                        onChange={(e) => setLocalSettings({ ...localSettings, after_hours_behavior: e.target.value as any })}
                    >
                        <option value="voicemail">Send to Voicemail</option>
                        <option value="callback">Offer Callback Request</option>
                        <option value="message">Provide Automated Message</option>
                    </select>
                </div>
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Holiday Closures</h3>
                    {isAdmin && (
                        <button 
                            className="btn btn-primary" 
                            style={{ padding: '8px 16px', fontSize: '12px' }}
                            onClick={() => {
                                const dateInput = prompt('Enter holiday date (YYYY-MM-DD):');
                                if (dateInput && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
                                    if (!localSettings.holidays.includes(dateInput)) {
                                        setLocalSettings({ ...localSettings, holidays: [...localSettings.holidays, dateInput].sort() });
                                    }
                                }
                            }}
                        >
                            <Plus size={14} /> Add Holiday
                        </button>
                    )}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {localSettings.holidays.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: '14px', fontStyle: 'italic' }}>No holidays configured.</p>
                    ) : (
                        localSettings.holidays.map(date => (
                            <div key={date} style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                padding: '6px 12px', backgroundColor: 'var(--background)', 
                                borderRadius: '8px', border: '1px solid var(--border)',
                                fontSize: '13px', fontWeight: '600'
                            }}>
                                <Calendar size={14} style={{ color: 'var(--primary)' }} />
                                {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                {isAdmin && (
                                    <button 
                                        onClick={() => setLocalSettings({ ...localSettings, holidays: localSettings.holidays.filter((d: string) => d !== date) })}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </section>

            {isAdmin && (
                <button disabled={isSaving} onClick={() => onSave(localSettings)} className="btn btn-primary" style={{ width: 'fit-content', padding: '12px 32px' }}>
                    <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
            )}
        </div>
    );
}
function SchedulingTab({ settings, onSave, isSaving, isAdmin }: { settings: ClinicSettings, onSave: (u: Partial<ClinicSettings>) => void, isSaving: boolean, isAdmin: boolean }) {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleAddType = () => {
        const newType = {
            id: Math.random().toString(36).substr(2, 9),
            name: 'New Appointment Type',
            duration: 30,
            color: '#3b82f6',
            pre_buffer: 5,
            post_buffer: 5
        };
        setLocalSettings({ ...localSettings, appointment_types: [...localSettings.appointment_types, newType] });
    };

    const handleRemoveType = (id: string) => {
        setLocalSettings({ ...localSettings, appointment_types: localSettings.appointment_types.filter(t => t.id !== id) });
    };

    const handleUpdateType = (id: string, updates: any) => {
        setLocalSettings({
            ...localSettings,
            appointment_types: localSettings.appointment_types.map(t => t.id === id ? { ...t, ...updates } : t)
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Slot Calibration</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--muted)' }}>Global Slot Duration:</span>
                        <select
                            className="search-input"
                            style={{ width: '120px', paddingLeft: '12px' }}
                            value={localSettings.slot_duration}
                            disabled={!isAdmin}
                            onChange={(e) => setLocalSettings({ ...localSettings, slot_duration: parseInt(e.target.value) })}
                        >
                            <option value={15}>15 mins</option>
                            <option value={30}>30 mins</option>
                            <option value={45}>45 mins</option>
                            <option value={60}>60 mins</option>
                        </select>
                    </div>
                </div>
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Schedule Availability</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Defined working hours per day</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    {Object.entries(localSettings.business_hours).map(([day, hours]: [string, any]) => (
                        <div key={day} style={{ 
                            padding: '16px', backgroundColor: 'var(--background)', borderRadius: '12px',
                            border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '12px',
                            opacity: hours.enabled ? 1 : 0.6
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '800', textTransform: 'capitalize', fontSize: '14px' }}>{day}</span>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        disabled={!isAdmin}
                                        checked={hours.enabled}
                                        onChange={(e) => {
                                            const newHours = { ...localSettings.business_hours, [day]: { ...hours, enabled: e.target.checked } };
                                            setLocalSettings({ ...localSettings, business_hours: newHours });
                                        }}
                                    />
                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>{hours.enabled ? 'ACTIVE' : 'OFF'}</span>
                                </label>
                            </div>
                            {hours.enabled && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="time"
                                        className="search-input"
                                        style={{ fontSize: '12px', padding: '6px' }}
                                        value={hours.open}
                                        disabled={!isAdmin}
                                        onChange={(e) => {
                                            const newHours = { ...localSettings.business_hours, [day]: { ...hours, open: e.target.value } };
                                            setLocalSettings({ ...localSettings, business_hours: newHours });
                                        }}
                                    />
                                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>→</span>
                                    <input
                                        type="time"
                                        className="search-input"
                                        style={{ fontSize: '12px', padding: '6px' }}
                                        value={hours.close}
                                        disabled={!isAdmin}
                                        onChange={(e) => {
                                            const newHours = { ...localSettings.business_hours, [day]: { ...hours, close: e.target.value } };
                                            setLocalSettings({ ...localSettings, business_hours: newHours });
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Appointment Library</h3>
                        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Manage types, durations, and specific buffers.</p>
                    </div>
                    {isAdmin && (
                        <button onClick={handleAddType} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                            <Plus size={16} /> New Type
                        </button>
                    )}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {localSettings.appointment_types.map((type: any) => (
                        <div key={type.id} className="card" style={{ padding: '20px', backgroundColor: 'var(--background)', display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '24px', alignItems: 'start' }}>
                            <div style={{ width: '12px', height: '100%', borderRadius: '6px', backgroundColor: type.color }} />
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '20px' }}>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '11px' }}>NAME</label>
                                    <input
                                        type="text"
                                        className="search-input"
                                        style={{ fontSize: '14px', height: '36px' }}
                                        value={type.name}
                                        disabled={!isAdmin}
                                        onChange={(e) => handleUpdateType(type.id, { name: e.target.value })}
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '11px' }}>DURATION (MIN)</label>
                                    <input
                                        type="number"
                                        className="search-input"
                                        style={{ fontSize: '14px', height: '36px' }}
                                        value={type.duration}
                                        disabled={!isAdmin}
                                        onChange={(e) => handleUpdateType(type.id, { duration: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '11px' }}>COLOR TAG</label>
                                    <input
                                        type="color"
                                        style={{ width: '100%', height: '36px', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'pointer', backgroundColor: 'transparent' }}
                                        value={type.color}
                                        disabled={!isAdmin}
                                        onChange={(e) => handleUpdateType(type.id, { color: e.target.value })}
                                    />
                                </div>
                                <div className="input-group" style={{ marginBottom: 0 }}>
                                    <label className="input-label" style={{ fontSize: '11px' }}>PRE/POST BUFFER (MIN)</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="number"
                                            placeholder="Pre"
                                            className="search-input"
                                            style={{ fontSize: '12px', height: '36px' }}
                                            value={type.pre_buffer}
                                            disabled={!isAdmin}
                                            onChange={(e) => handleUpdateType(type.id, { pre_buffer: parseInt(e.target.value) || 0 })}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Post"
                                            className="search-input"
                                            style={{ fontSize: '12px', height: '36px' }}
                                            value={type.post_buffer}
                                            disabled={!isAdmin}
                                            onChange={(e) => handleUpdateType(type.id, { post_buffer: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {isAdmin && (
                                <button 
                                    onClick={() => handleRemoveType(type.id)}
                                    className="btn" 
                                    style={{ color: '#ef4444', padding: '8px', backgroundColor: 'transparent' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {isAdmin && (
                <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                    <button disabled={isSaving} onClick={() => onSave(localSettings)} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                        <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                    </button>
                </div>
            )}
        </div>
    );
}
