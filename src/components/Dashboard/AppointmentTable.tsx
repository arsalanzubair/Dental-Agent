import { useState } from 'react';
import { Search, Eye, Edit3, Calendar, XCircle, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Appointment, useAppointments } from '../../hooks/useAppointments';
import { Badge } from '../ui/Badge';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredAppointments = appointments.filter((apt) => {
        const matchesSearch =
            (apt.patient_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (apt.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (apt.phone || '').includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + itemsPerPage);

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
                            <th>Patient</th>
                            <th>Reason</th>
                            <th>Appointment Time</th>
                            <th>Status</th>
                            <th>Reminder</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAppointments.map((apt) => (
                            <tr key={apt.id}>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '700' }}>{apt.patient_name}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{apt.email}</span>
                                    </div>
                                </td>
                                <td>
                                    <span style={{ color: 'var(--muted)', fontSize: '13px' }}>{apt.reason_for_visit}</span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: '600' }}>{format(new Date(apt.appointment_time), 'MMM dd, yyyy')}</span>
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{format(new Date(apt.appointment_time), 'hh:mm a')}</span>
                                    </div>
                                </td>
                                <td>
                                    <Badge status={apt.status} />
                                </td>
                                <td>
                                    {apt.reminder_status ? (
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            backgroundColor: apt.reminder_status === 'sent' ? 'var(--status-booked-bg)' :
                                                apt.reminder_status === 'failed' ? 'rgba(239, 68, 68, 0.1)' :
                                                    apt.reminder_status === 'replied' ? 'var(--status-completed-bg)' : 'transparent',
                                            color: apt.reminder_status === 'sent' ? 'var(--status-booked)' :
                                                apt.reminder_status === 'failed' ? '#ef4444' :
                                                    apt.reminder_status === 'replied' ? 'var(--status-completed)' : 'var(--muted)'
                                        }}>
                                            {apt.reminder_status.charAt(0).toUpperCase() + apt.reminder_status.slice(1)}
                                        </span>
                                    ) : (
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Pending</span>
                                    )}
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
                {paginatedAppointments.length === 0 && (
                    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>No appointments found matching your criteria.</div>
                )}
            </div>

            {/* Pagination Container */}
            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--muted)' }}>
                <span>Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length} appointments</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="btn"
                        style={{ padding: '8px', backgroundColor: 'transparent', opacity: currentPage === 1 ? 0.3 : 1 }}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontWeight: '700', margin: '0 8px' }}>Page {currentPage} of {totalPages || 1}</span>
                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="btn"
                        style={{ padding: '8px', backgroundColor: 'transparent', opacity: (currentPage === totalPages || totalPages === 0) ? 0.3 : 1 }}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
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
