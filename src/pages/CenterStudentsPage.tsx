import { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Filter,
    Download,
    Loader2,
    Mail,
    Phone,
    MapPin,
    GraduationCap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { useAuthStore } from '@/stores';
import { formatDate } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { CLASSES } from '@/constants/config';

export function CenterStudentsPage() {
    const { currentCenter } = useAuthStore();
    const [students, setStudents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [classFilter, setClassFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (currentCenter) {
            loadStudents();
        }
    }, [currentCenter]);

    const loadStudents = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('students')
                .select('*')
                .eq('referred_by_center_code', currentCenter?.centerCode)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setStudents(data || []);
        } catch (err) {
            console.error('Error loading center students:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch =
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.mobile.includes(searchTerm);

        const matchesClass = classFilter === 'all' || (s.class_level || s.class).toString() === classFilter;
        const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

        return matchesSearch && matchesClass && matchesStatus;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">Registered Students</h1>
                    <p className="text-muted-foreground">Manage students registered through your center</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download className="size-4" />
                    Export List
                </Button>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or mobile..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <select
                                className="bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                            >
                                <option value="all">All Classes</option>
                                {CLASSES.map(c => (
                                    <option key={c} value={c.toString()}>Class {c}</option>
                                ))}
                            </select>
                            <select
                                className="bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-md">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                            <Loader2 className="size-8 animate-spin mb-4" />
                            <p>Loading your student base...</p>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground">
                            <Users className="size-16 mx-auto mb-4 opacity-10" />
                            <p>No students match your search criteria.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Contact Info</TableHead>
                                        <TableHead>Class</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Joined Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-9 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                                                        <GraduationCap className="size-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{student.name}</p>
                                                        <p className="text-xs text-muted-foreground">Father: {student.father_name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Mail className="size-3 text-muted-foreground" />
                                                        {student.email}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <Phone className="size-3 text-muted-foreground" />
                                                        {student.mobile}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-muted/50">Class {student.class_level || student.class}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-start gap-1 text-[11px] text-muted-foreground">
                                                    <MapPin className="size-3 mt-0.5" />
                                                    <span>{student.address_village}, {student.address_district}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}
                                                    className={student.status === 'ACTIVE' ? 'bg-green-600' : ''}
                                                >
                                                    {student.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatDate(student.created_at)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
