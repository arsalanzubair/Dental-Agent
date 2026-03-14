import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useLocations } from '../contexts/LocationContext';

export type CallOutcome = 'resolved' | 'transferred' | 'abandoned';

export interface CallLog {
    id: string;
    created_at: string;
    caller_number: string;
    duration: string;
    intent_detected: string;
    outcome: CallOutcome;
    location_id?: string;
}

export function useCallLogs() {
    const [callLogs, setCallLogs] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedLocation } = useLocations();

    const fetchCallLogs = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('call_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (selectedLocation && selectedLocation.id !== 'all') {
                query = query.eq('location_id', selectedLocation.id);
            }

            const { data, error } = await query;

            if (error) {
                console.warn('Call logs table may not exist, using demo data');
                setCallLogs([
                    { id: '1', created_at: new Date().toISOString(), caller_number: '+1 (555) 012-3456', duration: '2:45', intent_detected: 'Booking Appointment', outcome: 'resolved', location_id: 'clinic-north' },
                    { id: '2', created_at: new Date(Date.now() - 3600000).toISOString(), caller_number: '+1 (555) 987-6543', duration: '1:20', intent_detected: 'Asking for Price', outcome: 'transferred', location_id: 'clinic-north' },
                    { id: '3', created_at: new Date(Date.now() - 7200000).toISOString(), caller_number: '+1 (555) 456-7890', duration: '0:45', intent_detected: 'Wrong Number', outcome: 'abandoned', location_id: 'clinic-south' },
                ]);
            } else {
                setCallLogs(data || []);
            }
        } catch (err: any) {
            console.error('Error fetching call logs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedLocation]);

    useEffect(() => {
        fetchCallLogs();

        const channel = supabase
            .channel('call-logs-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'call_logs',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newLog = payload.new as CallLog;
                        if (!selectedLocation || selectedLocation.id === 'all' || newLog.location_id === selectedLocation.id) {
                            setCallLogs((current) => [newLog, ...current]);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchCallLogs, selectedLocation]);

    return { callLogs, loading, error, refresh: fetchCallLogs };
}
