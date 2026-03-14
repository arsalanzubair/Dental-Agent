import { AppointmentStatus } from '../../hooks/useAppointments';

interface BadgeProps {
    status: AppointmentStatus;
}

export function Badge({ status }: BadgeProps) {
    if (!status) return null;

    const styles: Record<AppointmentStatus, { color: string, bg: string }> = {
        booked: { color: 'var(--status-booked)', bg: 'var(--status-booked-bg)' },
        cancelled: { color: 'var(--status-cancelled)', bg: 'var(--status-cancelled-bg)' },
        rescheduled: { color: 'var(--status-rescheduled)', bg: 'var(--status-rescheduled-bg)' },
        completed: { color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
    };

    const config = styles[status] || styles.booked;

    return (
        <span className="badge" style={{
            color: config.color,
            backgroundColor: config.bg,
            border: `1px solid ${config.color}20`
        }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
