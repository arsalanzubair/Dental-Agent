import { useState } from 'react';
import { useUnansweredQuestions, ReviewStatus } from '../hooks/useUnansweredQuestions';
import { format } from 'date-fns';
import { Search, Filter, Phone, MessageSquare, CheckCircle2, Plus, AlertCircle } from 'lucide-react';
import { Badge } from '../components/ui/Badge';

export function UnansweredQuestions() {
    const { questions, loading, resolveQuestion } = useUnansweredQuestions();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('pending');

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = (q.question?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            q.caller_number.includes(searchTerm);
        const matchesFilter = statusFilter === 'all' || q.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading unanswered questions...</div>;

    return (
        <div className="animate-up">
            <header className="page-header">
                <h1 className="page-title">AI Unanswered Questions</h1>
                <p className="page-subtitle">Review questions the AI could not handle and update the knowledge base.</p>
            </header>

            <div className="table-container">
                <div className="table-header-row">
                    <div className="search-input-wrapper">
                        <Search className="icon" size={18} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                        <input
                            type="text"
                            placeholder="Search by question or number..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Filter size={18} style={{ color: 'var(--muted)' }} />
                        <select
                            className="search-input"
                            style={{ paddingLeft: '16px', width: 'auto' }}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending Review</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '150px' }}>Date</th>
                                <th style={{ width: '150px' }}>Caller</th>
                                <th>Unanswered Question</th>
                                <th style={{ width: '200px' }}>Suggested Intent</th>
                                <th style={{ width: '200px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuestions.length > 0 ? (
                                filteredQuestions.map((q) => (
                                    <tr key={q.id}>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                                {format(new Date(q.created_at), 'MMM dd, HH:mm')}
                                            </span>
                                        </td>
                                        <td style={{ verticalAlign: 'top' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Phone size={14} style={{ color: 'var(--muted)' }} />
                                                <span style={{ fontSize: '13px' }}>{q.caller_number}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <p style={{ fontWeight: '700', fontSize: '14px', lineHeight: '1.4' }}>"{q.question}"</p>
                                                {q.status === 'resolved' && (
                                                    <span style={{ fontSize: '11px', color: 'var(--status-completed)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <CheckCircle2 size={12} /> Resolved
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ verticalAlign: 'top' }}>
                                            {q.suggested_intent ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600', fontSize: '13px' }}>
                                                    <MessageSquare size={14} />
                                                    <span>{q.suggested_intent}</span>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--muted)', fontSize: '12px', fontStyle: 'italic' }}>Not detected</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                                            {q.status === 'pending' ? (
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => resolveQuestion(q.id)}
                                                        className="btn"
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: 'var(--status-completed-bg)',
                                                            color: 'var(--status-completed)',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <CheckCircle2 size={14} />
                                                        Mark Resolved
                                                    </button>
                                                    <button
                                                        className="btn btn-primary"
                                                        style={{ padding: '6px 12px', fontSize: '12px' }}
                                                    >
                                                        <Plus size={14} />
                                                        Add to FAQ
                                                    </button>
                                                </div>
                                            ) : (
                                                <span style={{ color: 'var(--muted)', fontSize: '12px' }}>Review completed</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '64px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', color: 'var(--muted)' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <CheckCircle2 size={24} />
                                            </div>
                                            <p style={{ fontStyle: 'italic' }}>All questions have been reviewed! Well done.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card bg-status-booked-bg" style={{ marginTop: '24px', border: '1px dashed var(--status-booked)', display: 'flex', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--status-booked)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertCircle size={24} />
                </div>
                <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--foreground)' }}>Proactive Knowledge Management</h4>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                        Adding unanswered questions to the FAQ database helps the AI handle future calls more effectively, reducing the need for clinical staff transfers.
                    </p>
                </div>
            </div>
        </div>
    );
}
