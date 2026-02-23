import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores';
import { Student } from '@/types';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    student: Student | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const setStoreStudent = useAuthStore((state) => state.setStudent);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchStudentProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchStudentProfile(session.user.id);
            } else {
                setStudent(null);
                setStoreStudent(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchStudentProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error fetching student profile:', error);
                setStudent(null); // Ensure student is null on error
                setStoreStudent(null); // Ensure store student is null on error
            } else {
                // Map Supabase fields to Student type
                if (data) {
                    const studentData: Student = {
                        id: data.id,
                        name: data.name,
                        fatherName: data.father_name,
                        class: data.class_level || data.class || 0, // Map renamed column
                        mobile: data.mobile,
                        email: data.email,
                        schoolName: data.school_name,
                        schoolContact: data.school_contact,
                        addressVillage: data.address_village,
                        addressBlock: data.address_block,
                        addressTahsil: data.address_tahsil,
                        addressDistrict: data.address_district,
                        addressState: data.address_state,
                        photoUrl: data.photo_url,
                        centerCode: data.center_code,
                        referralCode: data.referral_code,
                        referredByCenter: data.referred_by_center_code || data.referred_by_center,
                        referredByStudent: data.referred_by_student,
                        status: data.status,
                        createdAt: data.created_at,
                        mobileVerified: data.mobile_verified,
                        emailVerified: data.email_verified,
                    };
                    setStudent(studentData);
                    setStoreStudent(studentData);
                } else {
                    setStudent(null);
                    setStoreStudent(null); // Also clear store if no data
                }
            }
        } catch (error) {
            console.error('Error fetching student profile:', error);
            setStudent(null); // Ensure student is null on catch
            setStoreStudent(null); // Ensure store student is null on catch
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast({
                title: 'Error signing out',
                description: error.message,
                variant: 'destructive',
            });
        } else {
            setStudent(null);
            setStoreStudent(null);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, student, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
