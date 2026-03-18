import { useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { useCallLogs } from '../hooks/useCallLogs';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { Calendar, TrendingUp, PhoneCall, CheckCircle2, Navigation, Clock } from 'lucide-react';

export function Analytics() {
    const { appointments } = useAppointments();
    const { callLogs } = useCallLogs();
    const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

    // Mock data for charts based on timeRange
    const dataByRange = {
        day: [
            { name: '08:00', calls: 4, bookings: 1 },
            { name: '10:00', calls: 8, bookings: 3 },
            { name: '12:00', calls: 12, bookings: 5 },
            { name: '14:00', calls: 7, bookings: 2 },
            { name: '16:00', calls: 14, bookings: 6 },
            { name: '18:00', calls: 5, bookings: 1 },
        ],
        week: [
            { name: 'Mon', calls: 45, bookings: 12 },
            { name: 'Tue', calls: 52, bookings: 18 },
            { name: 'Wed', calls: 38, bookings: 15 },
            { name: 'Thu', calls: 65, bookings: 22 },
            { name: 'Fri', calls: 48, bookings: 14 },
            { name: 'Sat', calls: 25, bookings: 8 },
            { name: 'Sun', calls: 10, bookings: 2 },
        ],
        month: [
            { name: 'Week 1', calls: 240, bookings: 75 },
            { name: 'Week 2', calls: 280, bookings: 92 },
            { name: 'Week 3', calls: 210, bookings: 68 },
            { name: 'Week 4', calls: 310, bookings: 105 },
        ]
    };

    const outcomeData = [
        { name: 'Resolved', value: callLogs.filter(l => l.outcome === 'resolved').length || 65, color: 'var(--status-completed)' },
        { name: 'Transferred', value: callLogs.filter(l => l.outcome === 'transferred').length || 20, color: 'var(--status-booked)' },
        { name: 'Abandoned', value: callLogs.filter(l => l.outcome === 'abandoned').length || 15, color: '#ef4444' },
    ];

    const channelData = [
        { name: 'Voice AI', value: 55, color: 'var(--primary)' },
        { name: 'Website', value: 25, color: 'var(--status-booked)' },
        { name: 'Phone', value: 15, color: 'var(--status-completed)' },
        { name: 'Front Desk', value: 5, color: 'var(--muted)' },
    ];

    return (
        <div className="animate-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Operational Analytics</h1>
                    <p className="page-subtitle">Detailed insights into AI performance and clinic efficiency.</p>
                </div>
                <div style={{ display: 'flex', backgroundColor: 'var(--input)', padding: '4px', borderRadius: '12px' }}>
                    {['day', 'week', 'month'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range as any)}
                            style={{
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: '700',
                                backgroundColor: timeRange === range ? 'var(--card)' : 'transparent',
                                color: timeRange === range ? 'var(--primary)' : 'var(--muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            <div className="stat-grid" style={{ marginBottom: '32px' }}>
                <AnalyticCard label="Total AI Calls" value={(callLogs.length * 12).toString()} delta="+12%" icon={<PhoneCall size={20} />} />
                <AnalyticCard label="Booking Rate" value="28.4%" delta="+4.2%" icon={<TrendingUp size={20} />} />
                <AnalyticCard label="Resolution Rate" value="76.2%" delta="+2.5%" icon={<CheckCircle2 size={20} />} />
                <AnalyticCard label="Avg. Handling Time" value="1:42s" delta="-12s" icon={<Clock size={20} />} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '24px' }}>Call Volume & Appointments</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <AreaChart data={dataByRange[timeRange]}>
                                <defs>
                                    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }} />
                                <Area type="monotone" dataKey="calls" stroke="var(--primary)" fillOpacity={1} fill="url(#colorCalls)" strokeWidth={3} />
                                <Area type="monotone" dataKey="bookings" stroke="var(--status-completed)" fillOpacity={0} strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Call Outcome Analysis</h3>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>Performance distribution of AI handled calls.</p>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ height: '240px', width: '200px' }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={outcomeData} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                        {outcomeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {outcomeData.map(item => (
                                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: item.color }}></div>
                                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: '14px', fontWeight: '700' }}>{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AnalyticCard({ label, value, delta, icon }: { label: string, value: string, delta: string, icon: React.ReactNode }) {
    const isNegative = delta.startsWith('-');
    return (
        <div className="card" style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '4px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em' }}>{value}</h2>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: isNegative ? '#ef4444' : 'var(--status-completed)' }}>
                        {delta}
                    </span>
                </div>
            </div>
        </div>
    );
}
