import { useState } from 'react';
import { Search, Eye, Edit3, Calendar, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, useAppointments } from '../../hooks/useAppointments';
import { Badge } from '../ui/Badge';
import { format, isValid } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useLocations } from '../../contexts/LocationContext';

function safeFormat(dateStr: string | undefined | null, fmt: string, fallback = 'N/A'): string {
    if (!dateStr) return fallback;
    const d = new Date(dateStr);
    return isValid(d) ? format(d, fmt) : fallback;
}

interface AppointmentTableProps {
    onView: (apt: Appointment) => void;
    onEdit: (apt: Appointment) => void;
    onReschedule: (apt: Appointment) => void;
    onCancel: (apt: Appointment) => void;
    onDelete: (apt: Appointment) => void;
}

export function AppointmentTable({ onView, onEdit, onReschedule, onCancel, onDelete }: AppointmentTableProps) {
    const { appointments, loading, error } = useAppointments();
    const { role } = useAuth();
    const { locations } = useLocations();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filteredAppointments = appointments.filter((apt) => {
        const matchesSearch =
            (apt.patient_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (apt.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (apt.phone || '').includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading appointments...</div>;
    if (error) return <div style={{ padding: '48px', textAlign: 'center', color: '#ef4444' }}>Error: {error}</div>;

    return (
        <div className="table-container">
            {/* Table Headers/Controls */}
            <div className="table-header-row">
                <div className="search-input-wrapper" style={{ maxWidth: '360px' }}>
                    <Search className="icon" size={18} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                    <input
                        type="text"
                        placeholder="Search patient, email, phone..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <select
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--input)',
                            fontSize: '14px',
                            color: 'var(--foreground)',
                            cursor: 'pointer'
                        }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="booked">Booked</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rescheduled">Rescheduled</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Table Content */}
            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Contact</th>
                            <th>Reason</th>
                            <th>Schedule</th>
                            <th>Location</th>
                            <th>Status</th>
                            <th>Confirm</th>
                            <th>SMS</th>
                            <th>Response</th>
                            <th>Reminder</th>
                            <th>Created At</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.map((apt) => (
                            <tr key={apt.id}>
                                <td>
                                    <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'monospace' }} title={apt.id}>
                                        {apt.id.slice(0, 8)}...
                                    </span>
                                </td>
                                <td>
                                    <span style={{ fontWeight: '700' }}>{apt.patient_name}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '600' }}>{apt.phone}</span>
                                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{apt.email && apt.email !== 'EMPTY' ? apt.email : 'No email'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{apt.reason_for_visit}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600' }}>{safeFormat(apt.appointment_time, 'MMM dd, yyyy')}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{safeFormat(apt.appointment_time, 'hh:mm a')}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: '500' }}>
                                        {apt.location || 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    <Badge status={apt.status || 'booked'} />
                                </td>
                                <td>
                                    {apt.confirmation_status === 'CONFIRMED' ? (
                                        <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--status-completed)', backgroundColor: 'var(--status-completed-bg)', padding: '2px 8px', borderRadius: '4px' }}>CONFIRMED</span>
                                    ) : (
                                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--muted)' }}>{apt.confirmation_status || 'PENDING'}</span>
                                    )}
                                </td>
                                <td>
                                    {apt.canceled_via_sms ? (
                                        <div title="Cancelled via SMS" style={{ display: 'flex', alignItems: 'center', color: '#ef4444' }}>
                                            <XCircle size={14} />
                                        </div>
                                    ) : (
                                        <span style={{ color: '#10b981' }}>—</span>
                                    )}
                                </td>
                                <td>
                                    <span style={{ fontSize: '11px', color: 'var(--muted)', maxWidth: '120px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={apt.feedback_text || ''}>
                                        {apt.feedback_text || '—'}
                                    </span>
                                </td>
                                <td>
                                    {apt.reminder_sent === 'YES' ? (
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '700',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            backgroundColor: 'var(--status-booked-bg)',
                                            color: 'var(--status-booked)',
                                            textTransform: 'uppercase'
                                        }}>
                                            Sent
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Pending</span>
                                    )}
                                </td>
                                <td>
                                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                        {safeFormat(apt.created_at, 'MMM dd, HH:mm')}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                        <ActionButton icon={<Eye size={16} />} onClick={() => onView(apt)} tooltip="View Details" />
                                        {role === 'Admin' && (
                                            <>
                                                <ActionButton icon={<Edit3 size={16} />} onClick={() => onEdit(apt)} tooltip="Edit" />
                                                <ActionButton icon={<Calendar size={16} />} onClick={() => onReschedule(apt)} tooltip="Reschedule" />
                                                <ActionButton icon={<XCircle size={16} />} onClick={() => onCancel(apt)} tooltip="Cancel" className="danger-btn" />
                                                <ActionButton icon={<Trash2 size={16} />} onClick={() => onDelete(apt)} tooltip="Delete" className="danger-btn" />
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredAppointments.length === 0 && (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>No appointments found matching your criteria.</div>
                )}
            </div>
        </div>
    );
}

function ActionButton({ icon, onClick, tooltip, className = "" }: { icon: React.ReactNode, onClick: () => void, tooltip: string, className?: string }) {
    const isDanger = className.includes('danger');
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className="btn"
            style={{
                padding: '8px',
                backgroundColor: 'transparent',
                color: isDanger ? '#ef4444' : 'var(--muted)',
                borderRadius: '8px'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = isDanger ? 'rgba(239, 68, 68, 0.1)' : 'var(--primary-light)';
                if (!isDanger) e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = isDanger ? '#ef4444' : 'var(--muted)';
            }}
        >
            {icon}
        </button>
    );
}
