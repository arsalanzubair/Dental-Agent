import { useState, useEffect, useCallback } from 'react';

const SETTINGS_STORAGE_KEY = 'clinic_settings_v1';

export interface ClinicSettings {
    id?: string;
    reminder_timing: string;
    reminder_channels: string[];
    reminder_template: string;
    followup_timing: string;
    followup_channels: string[];
    followup_template: string;
    followup_enabled: boolean;
    business_hours: any;
    after_hours_behavior: 'voicemail' | 'callback' | 'message';
    holidays: string[];
}

const DEFAULT_SETTINGS: ClinicSettings = {
    reminder_timing: '24h',
    reminder_channels: ['sms', 'email'],
    reminder_template: "Hi {{ $json['Customer Name'] }}, this is a friendly reminder from SmileCraft Family Dental & Orthodontics. You have an appointment tomorrow, {{ DateTime.fromISO($json['Booking Date']).toFormat('MMM d, yyyy') }} at {{ DateTime.fromISO($json['Booking Date']).toFormat('h:mm a') }} for . Please call us if you need to reschedule. We look forward to seeing you!",
    followup_timing: '1d',
    followup_channels: ['sms'],
    followup_template: 'Hi {{patient_name}}, how was your visit? We appreciate your feedback.',
    followup_enabled: true,
    business_hours: {
        monday: { open: '08:00', close: '18:00', enabled: true },
        tuesday: { open: '08:00', close: '18:00', enabled: true },
        wednesday: { open: '08:00', close: '18:00', enabled: true },
        thursday: { open: '08:00', close: '18:00', enabled: true },
        friday: { open: '08:00', close: '17:00', enabled: true },
        saturday: { open: '09:00', close: '14:00', enabled: true },
        sunday: { open: '00:00', close: '00:00', enabled: false },
    },
    after_hours_behavior: 'callback',
    holidays: ['2024-12-25', '2025-01-01'],
};

export function useSettings() {
    const [settings, setSettings] = useState<ClinicSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    const fetchSettings = useCallback(() => {
        try {
            const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (stored) {
                setSettings(JSON.parse(stored));
            } else {
                setSettings(DEFAULT_SETTINGS);
            }
        } catch {
            setSettings(DEFAULT_SETTINGS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (updates: Partial<ClinicSettings>) => {
        const next = { ...(settings || DEFAULT_SETTINGS), ...updates };
        try {
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
            setSettings(next);
            return { error: null };
        } catch (err: any) {
            return { error: err };
        }
    };

    return { settings, loading, error, updateSettings };
}
