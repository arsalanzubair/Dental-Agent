import { useState, useEffect, useCallback } from 'react';
import { supabase, APPOINTMENTS_TABLE } from '../lib/supabase';
import { useLocations } from '../contexts/LocationContext';

export type AppointmentStatus = 'booked' | 'cancelled' | 'rescheduled' | 'completed';

export interface Appointment {
    id: string;
    patient_name: string;
    phone: string;
    email: string;
    reason_for_visit: string;
    appointment_time: string;
    status: AppointmentStatus;
    calendar_event_id?: string;
    location_id?: string;
    booking_channel?: 'Voice AI' | 'Phone' | 'Website' | 'Front Desk';
    reminder_status?: 'sent' | 'failed' | 'replied' | 'none';
    created_at: string;
    updated_at: string;
}

export function useAppointments() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { selectedLocation } = useLocations();

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            let query = supabase
                .from(APPOINTMENTS_TABLE)
                .select('*')
                .order('appointment_time', { ascending: true });

            if (selectedLocation && selectedLocation.id !== 'all') {
                query = query.eq('location_id', selectedLocation.id);
            }

            const { data, error } = await query;

            if (error) throw error;

            // If data is empty and we are in demo mode, inject some demo data for the specific location
            let mappedData = (data || []).map(apt => ({
                ...apt,
                status: (apt.status || 'booked') as AppointmentStatus
            }));

            if (mappedData.length === 0 && selectedLocation?.id !== 'all') {
                console.log('No data for location, injecting demo data');
                mappedData = [
                    { id: 'd1', patient_name: 'John Doe', phone: '555-0101', email: 'john@example.com', reason_for_visit: 'Checkup', appointment_time: new Date().toISOString(), status: 'booked', location_id: selectedLocation?.id, booking_channel: 'Voice AI', reminder_status: 'sent', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                    { id: 'd2', patient_name: 'Jane Smith', phone: '555-0102', email: 'jane@example.com', reason_for_visit: 'Cleaning', appointment_time: new Date(Date.now() + 86400000).toISOString(), status: 'booked', location_id: selectedLocation?.id, booking_channel: 'Website', reminder_status: 'none', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
                ];
            }

            setAppointments(mappedData);
        } catch (err: any) {
            console.error('Error fetching appointments:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [selectedLocation]);

    useEffect(() => {
        fetchAppointments();

        const channel = supabase
            .channel('appointments-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: APPOINTMENTS_TABLE,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        const newApt = { ...payload.new, status: (payload.new.status || 'booked') } as Appointment;
                        // Only add if it matches the current location filter
                        if (!selectedLocation || selectedLocation.id === 'all' || newApt.location_id === selectedLocation.id) {
                            setAppointments((current) => [...current, newApt]);
                        }
                    } else if (payload.eventType === 'UPDATE') {
                        const updatedApt = { ...payload.new, status: (payload.new.status || 'booked') } as Appointment;
                        setAppointments((current) =>
                            current.map((apt) => (apt.id === payload.new.id ? updatedApt : apt))
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setAppointments((current) => current.filter((apt) => apt.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchAppointments, selectedLocation]);

    const addAppointment = async (appointment: Partial<Appointment>) => {
        const { data, error } = await supabase
            .from(APPOINTMENTS_TABLE)
            .insert([{ ...appointment, location_id: selectedLocation?.id !== 'all' ? selectedLocation?.id : 'clinic-north' }])
            .select();
        if (error) throw error;
        return data;
    };

    const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
        const { data, error } = await supabase
            .from(APPOINTMENTS_TABLE)
            .update(updates)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data;
    };

    const deleteAppointment = async (id: string) => {
        const { error } = await supabase
            .from(APPOINTMENTS_TABLE)
            .delete()
            .eq('id', id);
        if (error) throw error;
    };

    return {
        appointments,
        loading,
        error,
        refresh: fetchAppointments,
        addAppointment,
        updateAppointment,
        deleteAppointment,
    };
}
