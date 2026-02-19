import { useEffect, useState } from 'react';
import { BookOpen, Plus, Save, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSyllabusStore, useAuthStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { SyllabusTopic } from '@/types';

export function AdminSyllabusPage() {
    const { syllabuses, fetchSyllabuses, saveSyllabus, toggleStatus, isLoading } = useSyllabusStore();
    const { currentAdmin } = useAuthStore();
    const { toast } = useToast();

    const [selectedClass, setSelectedClass] = useState<string>('10');
    const [subject, setSubject] = useState('General Science');
    const [topics, setTopics] = useState<SyllabusTopic[]>([]);
    const [newTopic, setNewTopic] = useState({ title: '', description: '' });

    useEffect(() => {
        fetchSyllabuses();
    }, [fetchSyllabuses]);

    useEffect(() => {
        const existing = syllabuses.find(s => s.classLevel === Number(selectedClass));
        if (existing) {
            setSubject(existing.subject);
            setTopics(existing.topics);
        } else {
            setTopics([]);
        }
    }, [selectedClass, syllabuses]);

    const handleAddTopic = () => {
        if (!newTopic.title) return;
        setTopics([...topics, newTopic]);
        setNewTopic({ title: '', description: '' });
    };

    const handleRemoveTopic = (index: number) => {
        setTopics(topics.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        try {
            await saveSyllabus(Number(selectedClass), subject, topics);
            toast({ title: 'Success', description: `Syllabus for Class ${selectedClass} updated.` });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save syllabus.', variant: 'destructive' });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-serif">Syllabus Management</h1>
                    <p className="text-muted-foreground">Define class-wise topics for AI question generation</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Class Selection</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Class</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                                        <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Subject Name</Label>
                            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
                        </div>
                        <Button onClick={handleSave} className="w-full" disabled={isLoading}>
                            <Save className="size-4 mr-2" />
                            Save Syllabus
                        </Button>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Topics & Content</CardTitle>
                        <CardDescription>AI will generate questions strictly from these topics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 border p-4 rounded-lg bg-muted/50">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Topic Title</Label>
                                    <Input
                                        placeholder="e.g. Newton's Laws"
                                        value={newTopic.title}
                                        onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Description/Context</Label>
                                    <Input
                                        placeholder="e.g. Focus on 2nd law F=ma"
                                        value={newTopic.description}
                                        onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <Button variant="secondary" onClick={handleAddTopic}>
                                <Plus className="size-4 mr-2" />
                                Add to Syllabus
                            </Button>
                        </div>

                        <div className="space-y-3 mt-6">
                            {topics.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground italic">No topics defined for this class.</p>
                            ) : (
                                topics.map((t, i) => (
                                    <div key={i} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                        <div>
                                            <h4 className="font-semibold text-sm">{t.title}</h4>
                                            <p className="text-xs text-muted-foreground">{t.description}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveTopic(i)} className="text-destructive">
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
