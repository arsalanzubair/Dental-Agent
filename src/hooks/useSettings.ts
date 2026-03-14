import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ClinicSettings {
    id?: string;
    reminder_timing: string; // e.g. "24h"
    reminder_channels: string[]; // ["sms", "email"]
    reminder_template: string;
    followup_timing: string;
    followup_channels: string[];
    followup_template: string;
    followup_enabled: boolean;
    business_hours: any; // Weekly schedule object
    after_hours_behavior: 'voicemail' | 'callback' | 'message';
    holidays: string[];
}

export function useSettings() {
    const [settings, setSettings] = useState<ClinicSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('clinic_settings')
                .select('*')
                .single();

            if (error) {
                console.warn('Settings table may not exist, using demo defaults');
                setSettings({
                    reminder_timing: '24h',
                    reminder_channels: ['sms', 'email'],
                    reminder_template: 'Hi {{ $json[\'Customer Name\'] }}, this is a friendly reminder from SmileCraft Family Dental & Orthodontics. You have an appointment tomorrow, {{ DateTime.fromISO($json[\'Booking Date\']).toFormat(\'MMM d, yyyy\') }} at {{ DateTime.fromISO($json[\'Booking Date\']).toFormat(\'h:mm a\') }} for . Please call us if you need to reschedule. We look forward to seeing you!',
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
                });
            } else {
                setSettings(data);
            }
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateSettings = async (updates: Partial<ClinicSettings>) => {
        const { error } = await supabase
            .from('clinic_settings')
            .upsert({ id: settings?.id || 'default', ...settings, ...updates })
            .select();

        if (!error) {
            setSettings(curr => curr ? { ...curr, ...updates } : null);
        }
        return { error };
    };

    return { settings, loading, error, updateSettings };
}
