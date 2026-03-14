import { useState } from 'react';
import { useSettings, ClinicSettings } from '../hooks/useSettings';
import { Bell, Zap, Calendar, Save, Trash2, Plus, Clock, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Settings() {
    const { settings, loading, updateSettings } = useSettings();
    const { role } = useAuth();
    const [activeTab, setActiveTab] = useState<'reminders' | 'automation' | 'operations'>('reminders');
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
                </div>

                <div style={{ padding: '32px' }}>
                    {activeTab === 'reminders' && <RemindersTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                    {activeTab === 'automation' && <AutomationTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
                    {activeTab === 'operations' && <OperationsTab settings={settings} onSave={handleSave} isSaving={isSaving} isAdmin={role === 'Admin'} />}
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
                    <textarea
                        className="search-input"
                        style={{ paddingLeft: '16px', height: '120px', paddingTop: '12px' }}
                        value={localSettings.reminder_template}
                        disabled={!isAdmin}
                        onChange={(e) => setLocalSettings({ ...localSettings, reminder_template: e.target.value })}
                    />
                    <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <var style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', fontStyle: 'normal' }}>{"{{ $json['Customer Name'] }}"}</var>
                        <var style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', fontStyle: 'normal' }}>{"{{ DateTime.fromISO($json['Booking Date']).toFormat('MMM d, yyyy') }}"}</var>
                        <var style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '700', backgroundColor: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px', fontStyle: 'normal' }}>{"{{ DateTime.fromISO($json['Booking Date']).toFormat('h:mm a') }}"}</var>
                    </div>
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

                <div className="input-group">
                    <label className="input-label">Follow-up Template</label>
                    <textarea
                        className="search-input"
                        style={{ paddingLeft: '16px', height: '120px', paddingTop: '12px', marginTop: '8px' }}
                        value={localSettings.followup_template}
                        disabled={!isAdmin}
                        onChange={(e) => setLocalSettings({ ...localSettings, followup_template: e.target.value })}
                    />
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

            {isAdmin && (
                <button disabled={isSaving} onClick={() => onSave(localSettings)} className="btn btn-primary" style={{ width: 'fit-content', padding: '12px 32px' }}>
                    <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Configuration'}
                </button>
            )}
        </div>
    );
}
