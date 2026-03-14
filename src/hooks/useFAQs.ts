import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface FAQEntry {
    id: string;
    question: string;
    answer: string;
    category: string;
    last_updated: string;
}

export function useFAQs() {
    const [faqs, setFaqs] = useState<FAQEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFAQs = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('faqs')
                .select('*')
                .order('category', { ascending: true });

            if (error) {
                console.warn('FAQs table may not exist, using demo data');
                setFaqs([
                    { id: '1', question: 'What are your business hours?', answer: 'We are open Monday to Friday from 8:00 AM to 6:00 PM, and Saturday from 9:00 AM to 2:00 PM.', category: 'General', last_updated: new Date().toISOString() },
                    { id: '2', question: 'Do you accept insurance?', answer: 'Yes, we accept most major dental insurance plans. Please bring your insurance card to your first visit.', category: 'Payments', last_updated: new Date().toISOString() },
                    { id: '3', question: 'Where is your clinic located?', answer: 'We are located at 123 Healthcare Plaza, Suite 400. There is free parking available in front of the building.', category: 'General', last_updated: new Date().toISOString() },
                ]);
            } else {
                setFaqs(data || []);
            }
        } catch (err: any) {
            console.error('Error fetching FAQs:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFAQs();
    }, [fetchFAQs]);

    const saveFAQ = async (faq: Partial<FAQEntry>) => {
        const isNew = !faq.id;
        const entry = { ...faq, last_updated: new Date().toISOString() };

        let result;
        if (isNew) {
            result = await supabase.from('faqs').insert([entry]).select();
        } else {
            result = await supabase.from('faqs').update(entry).eq('id', faq.id).select();
        }

        if (!result.error) {
            fetchFAQs();
        }
        return result;
    };

    const deleteFAQ = async (id: string) => {
        const { error } = await supabase.from('faqs').delete().eq('id', id);
        if (!error) {
            setFaqs(curr => curr.filter(f => f.id !== id));
        }
        return { error };
    };

    return { faqs, loading, error, refresh: fetchFAQs, saveFAQ, deleteFAQ };
}
