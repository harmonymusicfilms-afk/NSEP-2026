import { supabase } from '@/lib/supabase';
import { Syllabus, SyllabusTopic } from '@/types';

export const SyllabusService = {
    /**
     * Fetches the syllabus for all classes or a specific one
     */
    async getSyllabuses(classLevel?: number): Promise<Syllabus[]> {
        let query = supabase.from('syllabuses').select('*');
        if (classLevel) {
            query = query.eq('class_level', classLevel);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data.map(s => ({
            id: s.id,
            classLevel: s.class_level,
            subject: s.subject,
            topics: s.topics as SyllabusTopic[],
            isActive: s.is_active,
            createdAt: s.created_at,
            updatedAt: s.updated_at
        }));
    },

    /**
     * Updates or creates a syllabus for a class
     */
    async saveSyllabus(classLevel: number, subject: string, topics: SyllabusTopic[]): Promise<void> {
        const { error } = await supabase
            .from('syllabuses')
            .upsert({
                class_level: classLevel,
                subject,
                topics,
                updated_at: new Date().toISOString()
            }, { onConflict: 'class_level,subject' });

        if (error) throw error;
    },

    /**
     * Toggles syllabus active status
     */
    async toggleSyllabusStatus(id: string, isActive: boolean): Promise<void> {
        const { error } = await supabase
            .from('syllabuses')
            .update({ is_active: isActive })
            .eq('id', id);

        if (error) throw error;
    }
};
