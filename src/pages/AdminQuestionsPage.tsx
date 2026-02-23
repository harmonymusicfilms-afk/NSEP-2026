import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    Plus,
    Search,
    Trash2,
    Edit2,
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Filter,
    Upload,
    FileText,
    Image as ImageIcon,
    X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore, useExamStore, useAdminLogStore } from '@/stores';
import { ExamQuestion } from '@/types';
import { compressImage } from '@/lib/utils';

export function AdminQuestionsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { currentAdmin, isAdminLoggedIn } = useAuthStore();
    const { questions, isLoading, loadQuestions, addQuestion, updateQuestion, deleteQuestion } = useExamStore();
    const { addLog } = useAdminLogStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClass, setSelectedClass] = useState<string>('all');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        class: 10,
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        subject: '',
        questionFileUrl: '',
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const compressToast = toast({
            title: "Processing File",
            description: "Optimizing for upload...",
        });

        try {
            if (file.type.startsWith('image/')) {
                // Auto-compress images to under 2MB
                const compressedBase64 = await compressImage(file, 2);
                setFormData(prev => ({ ...prev, questionFileUrl: compressedBase64 }));
            } else {
                // For PDFs or other files, use as is if under 5MB
                if (file.size > 5 * 1024 * 1024) {
                    toast({
                        title: 'File too large',
                        description: 'Please upload a file smaller than 5MB.',
                        variant: 'destructive',
                    });
                    compressToast.dismiss();
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormData(prev => ({ ...prev, questionFileUrl: reader.result as string }));
                };
                reader.readAsDataURL(file);
            }
            compressToast.dismiss();
        } catch (error) {
            console.error('Processing error:', error);
            compressToast.dismiss();
            toast({
                title: "Error",
                description: "Failed to process file.",
                variant: "destructive"
            });
        }
    };

    const removeFile = () => {
        setFormData(prev => ({ ...prev, questionFileUrl: '' }));
    };

    useEffect(() => {
        if (!isAdminLoggedIn || !currentAdmin) {
            navigate('/admin/login');
            return;
        }
        // Load all questions initially
        loadQuestions();
    }, [isAdminLoggedIn, currentAdmin, navigate, loadQuestions]);

    const handleClassChange = (value: string) => {
        setSelectedClass(value);
        if (value === 'all') {
            loadQuestions();
        } else {
            loadQuestions(Number(value));
        }
    };

    const filteredQuestions = questions.filter((q) => {
        const matchesSearch = q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.subject?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClass = selectedClass === 'all' || q.class === Number(selectedClass);
        return matchesSearch && matchesClass;
    });

    const handleAddQuestion = async () => {
        if (!formData.questionText || formData.options.some(o => !o)) {
            toast({
                title: 'Missing Fields',
                description: 'Please fill in the question and all options.',
                variant: 'destructive',
            });
            return;
        }

        try {
            await addQuestion({
                class: formData.class,
                questionText: formData.questionText,
                options: formData.options,
                correctOptionIndex: formData.correctOptionIndex,
                subject: formData.subject,
            });

            if (currentAdmin) {
                addLog(currentAdmin.id, 'ADD_QUESTION', undefined, `Added question for class ${formData.class}: ${formData.questionText.substring(0, 30)}...`);
            }

            toast({
                title: 'Success',
                description: 'Question added successfully.',
            });

            setIsAddDialogOpen(false);
            setFormData({
                class: formData.class,
                questionText: '',
                options: ['', '', '', ''],
                correctOptionIndex: 0,
                subject: '',
                questionFileUrl: '',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to add question. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleUpdateQuestion = async () => {
        if (!editingQuestion) return;

        try {
            await updateQuestion(editingQuestion.id, {
                class: formData.class,
                questionText: formData.questionText,
                options: formData.options,
                correctOptionIndex: formData.correctOptionIndex,
                subject: formData.subject,
            });

            if (currentAdmin) {
                addLog(currentAdmin.id, 'UPDATE_QUESTION', editingQuestion.id, `Updated question: ${formData.questionText.substring(0, 30)}...`);
            }

            toast({
                title: 'Success',
                description: 'Question updated successfully.',
            });

            setIsEditDialogOpen(false);
            setEditingQuestion(null);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update question.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        try {
            await deleteQuestion(id);

            if (currentAdmin) {
                addLog(currentAdmin.id, 'DELETE_QUESTION', id, 'Deleted a question');
            }

            toast({
                title: 'Deleted',
                description: 'Question has been removed.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete question.',
                variant: 'destructive',
            });
        }
    };

    const openEditDialog = (q: ExamQuestion) => {
        setEditingQuestion(q);
        setFormData({
            class: q.class,
            questionText: q.questionText,
            options: [...q.options],
            correctOptionIndex: q.correctOptionIndex,
            subject: q.subject || '',
            questionFileUrl: q.questionFileUrl || '',
        });
        setIsEditDialogOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground flex items-center gap-2">
                        <ClipboardList className="size-6" />
                        Exam Questions
                    </h1>
                    <p className="text-muted-foreground">Manage and organize questions for different classes</p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="institutional-gradient gap-2">
                            <Plus className="size-4" />
                            Add New Question
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add New Question</DialogTitle>
                            <DialogDescription>Create a new multiple-choice question for the exam.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Class Level</Label>
                                    <Select
                                        value={formData.class.toString()}
                                        onValueChange={(val) => setFormData({ ...formData, class: Number(val) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                                <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject (Optional)</Label>
                                    <Input
                                        placeholder="e.g. Science, Mathematics"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Question Text</Label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Enter the question here..."
                                    value={formData.questionText}
                                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Attachment (Image or PDF)</Label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('add-file-upload')?.click()}
                                    >
                                        <Upload className="size-4 mr-2" />
                                        Upload File
                                    </Button>
                                    <input
                                        id="add-file-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                    {formData.questionFileUrl && (
                                        <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm">
                                            {formData.questionFileUrl.startsWith('data:application/pdf') ? (
                                                <FileText className="size-4 text-red-500" />
                                            ) : (
                                                <ImageIcon className="size-4 text-blue-500" />
                                            )}
                                            <span className="truncate max-w-[150px]">File Attached</span>
                                            <button
                                                type="button"
                                                onClick={removeFile}
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Options (Mark the correct one)</Label>
                                {formData.options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, correctOptionIndex: idx })}
                                            className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.correctOptionIndex === idx
                                                ? 'bg-green-500 border-green-500 text-white'
                                                : 'border-muted-foreground'
                                                }`}
                                        >
                                            {formData.correctOptionIndex === idx && <CheckCircle2 className="size-4" />}
                                        </button>
                                        <Input
                                            placeholder={`Option ${idx + 1}`}
                                            value={opt}
                                            onChange={(e) => {
                                                const newOptions = [...formData.options];
                                                newOptions[idx] = e.target.value;
                                                setFormData({ ...formData, options: newOptions });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddQuestion} className="institutional-gradient">Save Question</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search questions or subjects..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-[200px]">
                    <Select value={selectedClass} onValueChange={handleClassChange}>
                        <SelectTrigger>
                            <Filter className="size-4 mr-2" />
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Classes</SelectItem>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-dashed">
                        <div className="size-10 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading questions...</p>
                    </div>
                ) : filteredQuestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-card rounded-lg border border-dashed">
                        <AlertCircle className="size-10 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground font-medium">No questions found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new question.</p>
                    </div>
                ) : (
                    filteredQuestions.map((q) => (
                        <Card key={q.id} className="overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-6">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                                                    Class {q.class}
                                                </Badge>
                                                {q.subject && (
                                                    <Badge variant="secondary" className="font-normal">
                                                        {q.subject}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h3 className="font-medium text-lg pt-1">{q.questionText}</h3>

                                            {q.questionFileUrl && (
                                                <div className="mt-2">
                                                    {q.questionFileUrl.startsWith('data:image') || q.questionFileUrl.match(/\.(jpeg|jpg|gif|png)$/) != null ? (
                                                        <img
                                                            src={q.questionFileUrl}
                                                            alt="Question Attachment"
                                                            className="max-w-full h-auto max-h-[200px] rounded-md border"
                                                        />
                                                    ) : (
                                                        <a
                                                            href={q.questionFileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-primary hover:underline bg-primary/5 p-2 rounded-md w-fit"
                                                        >
                                                            <FileText className="size-4" />
                                                            View Attachment
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(q)}>
                                                <Edit2 className="size-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete this question. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeleteQuestion(q.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-3">
                                        {q.options.map((option, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${idx === q.correctOptionIndex
                                                    ? 'bg-green-50 border-green-200 text-green-800'
                                                    : 'bg-muted/50 border-border'
                                                    }`}
                                            >
                                                <span className={`flex items-center justify-center size-5 rounded-full text-[10px] font-bold ${idx === q.correctOptionIndex ? 'bg-green-500 text-white' : 'bg-muted-foreground/20'
                                                    }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </span>
                                                <span className="flex-1">{option}</span>
                                                {idx === q.correctOptionIndex && (
                                                    <CheckCircle2 className="size-4 shrink-0 text-green-500" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                        <DialogDescription>Modify the question details and options.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Class Level</Label>
                                <Select
                                    value={formData.class.toString()}
                                    onValueChange={(val) => setFormData({ ...formData, class: Number(val) })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                                            <SelectItem key={c} value={c.toString()}>Class {c}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Subject (Optional)</Label>
                                <Input
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Question Text</Label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.questionText}
                                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Attachment (Image or PDF)</Label>
                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('edit-file-upload')?.click()}
                                >
                                    <Upload className="size-4 mr-2" />
                                    Upload File
                                </Button>
                                <input
                                    id="edit-file-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                />
                                {formData.questionFileUrl && (
                                    <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-md text-sm">
                                        {formData.questionFileUrl.startsWith('data:application/pdf') ? (
                                            <FileText className="size-4 text-red-500" />
                                        ) : (
                                            <ImageIcon className="size-4 text-blue-500" />
                                        )}
                                        <span className="truncate max-w-[150px]">File Attached</span>
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="size-4" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Options (Mark the correct one)</Label>
                            {formData.options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, correctOptionIndex: idx })}
                                        className={`size-6 rounded-full border-2 flex items-center justify-center transition-colors ${formData.correctOptionIndex === idx
                                            ? 'bg-green-50 border-green-500 text-white'
                                            : 'border-muted-foreground'
                                            }`}
                                    >
                                        {formData.correctOptionIndex === idx && <CheckCircle2 className="size-4" />}
                                    </button>
                                    <Input
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...formData.options];
                                            newOptions[idx] = e.target.value;
                                            setFormData({ ...formData, options: newOptions });
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateQuestion} className="institutional-gradient">Update Question</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
