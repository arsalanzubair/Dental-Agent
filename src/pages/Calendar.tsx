import { useState } from 'react';
import Calendar from 'react-calendar';
import { useAppointments, Appointment } from '../hooks/useAppointments';
import { Badge } from '../components/ui/Badge';
import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import 'react-calendar/dist/Calendar.css';

export function CalendarView() {
    const { appointments, loading } = useAppointments();
    const [date, setDate] = useState<Date>(new Date());
    const [selectedAppointments, setSelectedAppointments] = useState<Appointment[]>([]);

    const appointmentsOnDate = (d: Date) => appointments.filter(a => isSameDay(new Date(a.appointment_time), d));

    const handleDateChange = (newDate: any) => {
        setDate(newDate);
        setSelectedAppointments(appointmentsOnDate(newDate));
    };

    // Mark tiles with dots if they have appointments
    const tileContent = ({ date: cellDate, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const dayApts = appointmentsOnDate(cellDate);
            if (dayApts.length > 0) {
                return (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px', gap: '2px' }}>
                        {dayApts.slice(0, 3).map((a, i) => (
                            <div key={i} style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                backgroundColor: i === 0 ? 'var(--primary)' : i === 1 ? 'var(--secondary)' : '#f59e0b'
                            }} />
                        ))}
                    </div>
                );
            }
        }
        return null;
    };

    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading calendar...</div>;

    return (
        <div className="animate-up">
            <header style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em' }}>Schedule Calendar</h1>
                <p style={{ color: 'var(--muted)', marginTop: '4px' }}>View and manage appointments in a monthly view.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'start' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <Calendar
                        onChange={handleDateChange}
                        value={date}
                        tileContent={tileContent}
                        className="font-sans"
                        prevLabel={<ChevronLeft size={20} />}
                        nextLabel={<ChevronRight size={20} />}
                        prev2Label={null}
                        next2Label={null}
                    />
                </div>

                <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '500px' }}>
                    <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '800' }}>{format(date, 'MMMM dd, yyyy')}</h3>
                        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{selectedAppointments.length} Appointments scheduled</p>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {selectedAppointments.length > 0 ? (
                            selectedAppointments.map(apt => (
                                <div key={apt.id} style={{
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--primary)' }}>{format(new Date(apt.appointment_time), 'hh:mm a')}</span>
                                        <Badge status={apt.status} />
                                    </div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '6px' }}>{apt.patient_name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)' }}>
                                        <Clock size={14} />
                                        <span>{apt.reason_for_visit}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center',
                                padding: '32px',
                                border: '2px dashed var(--border)',
                                borderRadius: '16px',
                                color: 'var(--muted)',
                                fontStyle: 'italic'
                            }}>
                                <CalendarIcon size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                <p>No appointments for this day.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
