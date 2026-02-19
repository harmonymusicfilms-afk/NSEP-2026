import { useEffect } from 'react';
import { Calendar, Cpu, Bell, History, Play, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAutomationStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

export function AdminAutomationPage() {
    const { schedules, aiReports, notifLogs, fetchAutomationData, runAutomationRunner, generateQuestions, isLoading } = useAutomationStore();
    const { toast } = useToast();

    useEffect(() => {
        fetchAutomationData();
    }, [fetchAutomationData]);

    const handleRunAutomation = async () => {
        try {
            await runAutomationRunner();
            toast({ title: 'Automation Triggered', description: 'Checking schedules and notifications...' });
        } catch (error) {
            toast({ title: 'Error', description: 'Automation run failed.', variant: 'destructive' });
        }
    };

    const handleAIManual = async (classLevel: number) => {
        try {
            await generateQuestions(classLevel, 60);
            toast({ title: 'AI Generating', description: `Creating 60 questions for Class ${classLevel}...` });
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold font-serif">Automation & AI Controller</h1>
                    <p className="text-muted-foreground">Manage recurring exams, AI questions, and bulk notifications</p>
                </div>
                <Button onClick={handleRunAutomation} variant="default" disabled={isLoading} className="institutional-gradient">
                    <Play className="size-4 mr-2" />
                    Run Automation Now
                </Button>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Exam Schedule */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="size-5 text-blue-600" />
                            Upcoming Exam Schedule (Monthly 5th)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>AI Gen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((s) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="font-medium">{formatDate(s.examDate)}</TableCell>
                                        <TableCell>
                                            <Badge variant={s.status === 'LIVE' ? 'default' : 'secondary'}>{s.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">{s.recurring ? 'RECURRING' : 'ONE-TIME'}</TableCell>
                                        <TableCell>
                                            {s.autoGenerateQuestions ? (
                                                <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => handleAIManual(s.classLevel || 10)}>
                                                    <Cpu className="size-3 mr-1" /> Re-Gen
                                                </Button>
                                            ) : 'OFF'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* AI Generation Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="size-5 text-purple-600" />
                            AI Question Generation Logs
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {aiReports.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">Class {log.classLevel} Generation</p>
                                        <p className="text-[10px] text-muted-foreground">{formatDate(log.createdAt)}</p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={log.status === 'SUCCESS' ? 'outline' : 'destructive'} className="text-[10px]">
                                            {log.status === 'SUCCESS' ? `${log.questionsGenerated} Questions` : 'FAILED'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Logs */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="size-5 text-amber-600" />
                            Notification Dispatch History (Bulk)
                        </CardTitle>
                        <CardDescription>Email & WhatsApp logs for scheduled exams</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Channel</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifLogs.slice(0, 10).map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="text-xs">{formatDate(log.sentAt || log.createdAt)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] gap-1">
                                                {log.channel === 'WHATSAPP' ? <MessageSquare className="size-2" /> : <Play className="size-2" />}
                                                {log.channel}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs font-medium">{log.notifType}</TableCell>
                                        <TableCell>
                                            {log.status === 'SENT' ? (
                                                <span className="flex items-center text-green-600 text-[10px]"><CheckCircle className="size-3 mr-1" /> Sent</span>
                                            ) : (
                                                <span className="flex items-center text-red-600 text-[10px]"><AlertTriangle className="size-3 mr-1" /> Failed</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
