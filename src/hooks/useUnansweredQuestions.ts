import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type ReviewStatus = 'pending' | 'resolved';

export interface UnansweredQuestion {
    id: string;
    created_at: string;
    caller_number: string;
    question: string;
    suggested_intent?: string;
    status: ReviewStatus;
}

export function useUnansweredQuestions() {
    const [questions, setQuestions] = useState<UnansweredQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuestions = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('unanswered_questions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.warn('Unanswered questions table may not exist, using demo data');
                setQuestions([
                    { id: '1', created_at: new Date().toISOString(), caller_number: '+1 (555) 012-3456', question: 'Do you offer Invisalign for teenagers?', suggested_intent: 'Invisalign Inquiry', status: 'pending' },
                    { id: '2', created_at: new Date(Date.now() - 86400000).toISOString(), caller_number: '+1 (555) 987-6543', question: 'What is the cost of a dental implant for a single tooth?', suggested_intent: 'Pricing Information', status: 'pending' },
                ]);
            } else {
                setQuestions(data || []);
            }
        } catch (err: any) {
            console.error('Error fetching questions:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const resolveQuestion = async (id: string) => {
        const { error } = await supabase
            .from('unanswered_questions')
            .update({ status: 'resolved' })
            .eq('id', id);

        if (!error) {
            setQuestions(curr => curr.map(q => q.id === id ? { ...q, status: 'resolved' } : q));
        }
        return { error };
    };

    return { questions, loading, error, refresh: fetchQuestions, resolveQuestion };
}
