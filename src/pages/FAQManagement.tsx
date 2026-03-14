import { useState } from 'react';
import { useFAQs, FAQEntry } from '../hooks/useFAQs';
import { format } from 'date-fns';
import { Search, Plus, Edit2, Trash2, Tag, BookOpen, AlertCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';

export function FAQManagement() {
    const { faqs, loading, saveFAQ, deleteFAQ } = useFAQs();
    const { role } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFAQ, setEditingFAQ] = useState<Partial<FAQEntry> | null>(null);

    const categories = ['all', ...Array.from(new Set(faqs.map(f => f.category)))];

    const filteredFAQs = faqs.filter(f => {
        const matchesSearch = (f.question?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (f.answer?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesFilter = categoryFilter === 'all' || f.category === categoryFilter;
        return matchesSearch && matchesFilter;
    });

    const handleOpenModal = (faq?: FAQEntry) => {
        setEditingFAQ(faq || { question: '', answer: '', category: 'General' });
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingFAQ) {
            await saveFAQ(editingFAQ);
            setIsModalOpen(false);
            setEditingFAQ(null);
        }
    };

    if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)' }}>Loading AI knowledge base...</div>;

    return (
        <div className="animate-up">
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="page-title">AI FAQ Management</h1>
                    <p className="page-subtitle">Update and manage the knowledge base used by the AI voice agent.</p>
                </div>
                {role === 'Admin' && (
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={18} /> Add New Entry
                    </button>
                )}
            </header>

            <div className="table-container">
                <div className="table-header-row">
                    <div className="search-input-wrapper" style={{ flex: 1 }}>
                        <Search className="icon" size={18} style={{ position: 'absolute', left: '12px', color: 'var(--muted)' }} />
                        <input
                            type="text"
                            placeholder="Search FAQ question or answer..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <Tag size={18} style={{ color: 'var(--muted)' }} />
                        <select
                            className="search-input"
                            style={{ paddingLeft: '16px', width: 'auto' }}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
                    {filteredFAQs.length > 0 ? (
                        filteredFAQs.map(faq => (
                            <div key={faq.id} className="card" style={{ padding: '20px', display: 'flex', gap: '20px', borderLeft: '4px solid var(--primary)' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span className="badge" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '10px' }}>
                                            {faq.category}
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                            Updated: {format(new Date(faq.last_updated), 'MMM dd, yyyy')}
                                        </span>
                                    </div>
                                    <h4 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Q: {faq.question}</h4>
                                    <p style={{ fontSize: '14px', color: 'var(--muted)', lineHeight: '1.5' }}>A: {faq.answer}</p>
                                </div>
                                {role === 'Admin' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <button
                                            onClick={() => handleOpenModal(faq)}
                                            className="btn"
                                            style={{ padding: '8px', backgroundColor: 'var(--input)', color: 'var(--muted)' }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => { if (confirm('Delete this entry?')) deleteFAQ(faq.id); }}
                                            className="btn"
                                            style={{ padding: '8px', backgroundColor: 'var(--status-cancelled-bg)', color: 'var(--status-cancelled)' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--muted)', fontStyle: 'italic' }}>
                            No FAQ entries found. Click "Add New Entry" to get started.
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingFAQ?.id ? "Edit FAQ Entry" : "Add FAQ Entry"}
            >
                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="input-group">
                        <label className="input-label">Category</label>
                        <input
                            className="search-input"
                            style={{ paddingLeft: '16px' }}
                            placeholder="e.g. General, Insurance, Location"
                            value={editingFAQ?.category || ''}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, category: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">Question</label>
                        <input
                            className="search-input"
                            style={{ paddingLeft: '16px' }}
                            placeholder="What should the AI respond to?"
                            value={editingFAQ?.question || ''}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">AI Answer Template</label>
                        <textarea
                            className="search-input"
                            style={{ paddingLeft: '16px', height: 'auto', minHeight: '120px', paddingTop: '12px' }}
                            placeholder="How should the AI answer this question?"
                            value={editingFAQ?.answer || ''}
                            onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                            required
                        />
                    </div>
                    <div className="modal-footer" style={{ borderTop: 'none', marginTop: 0 }}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn" style={{ border: '1px solid var(--border)', backgroundColor: 'transparent' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary">Save Entry</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
