import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Save, Trash2, Plus, GripVertical } from 'lucide-react';
import { useTeamStore, TeamMember } from '@/stores/teamStore';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/index';

export function AdminTeamSettings() {
    const { members, loadMembers, updateMember, deleteMember, addMember, reorderMembers } = useTeamStore();
    const { isSuperAdmin } = useAuthStore(state => ({ isSuperAdmin: state.currentAdmin?.role === 'SUPER_ADMIN' }));
    const { toast } = useToast();

    // Local state for editing to avoid constant DB writes
    const [localMembers, setLocalMembers] = useState<TeamMember[]>([]);

    useEffect(() => {
        loadMembers();
    }, [loadMembers]);

    useEffect(() => {
        // Sort local members by display order
        const sorted = [...members].sort((a, b) => a.displayOrder - b.displayOrder);
        setLocalMembers(sorted);
    }, [members]);

    const handleUpdateLocal = (index: number, field: keyof TeamMember, value: string | number) => {
        const updated = [...localMembers];
        updated[index] = { ...updated[index], [field]: value };
        setLocalMembers(updated);
    };

    const handleSaveAll = async () => {
        try {
            // Create new ones or update existing
            for (const m of localMembers) {
                if (members.find(om => om.id === m.id)) {
                    // Exists, so update
                    await updateMember(m.id, {
                        name: m.name,
                        role: m.role,
                        description: m.description,
                        imageUrl: m.imageUrl,
                        displayOrder: m.displayOrder
                    });
                } else {
                    // New
                    await addMember(m);
                }
            }
            toast({ title: 'Team Updated', description: 'Team members have been saved successfully.' });
            loadMembers(); // Refresh
        } catch (e) {
            toast({ title: 'Error', description: 'Failed to save team members.', variant: 'destructive' });
        }
    };

    const handleAddRow = () => {
        const newMember: TeamMember = {
            id: `temp-${Date.now()}`,
            name: '',
            role: '',
            description: '',
            displayOrder: localMembers.length > 0 ? Math.max(...localMembers.map(m => m.displayOrder)) + 1 : 1
        };
        setLocalMembers([...localMembers, newMember]);
    };

    const handleDeleteRow = async (id: string, index: number) => {
        if (id.startsWith('temp-')) {
            const updated = [...localMembers];
            updated.splice(index, 1);
            setLocalMembers(updated);
        } else {
            if (confirm('Are you sure you want to delete this team member?')) {
                await deleteMember(id);
                toast({ title: 'Member Deleted', description: 'The team member has been removed.' });
                loadMembers();
            }
        }
    };

    // Simple move up/down for reordering
    const moveUp = (index: number) => {
        if (index === 0) return;
        const updated = [...localMembers];
        const temp = updated[index].displayOrder;
        updated[index].displayOrder = updated[index - 1].displayOrder;
        updated[index - 1].displayOrder = temp;
        // Sort
        updated.sort((a, b) => a.displayOrder - b.displayOrder);
        setLocalMembers(updated);
    };

    const moveDown = (index: number) => {
        if (index === localMembers.length - 1) return;
        const updated = [...localMembers];
        const temp = updated[index].displayOrder;
        updated[index].displayOrder = updated[index + 1].displayOrder;
        updated[index + 1].displayOrder = temp;
        // Sort
        updated.sort((a, b) => a.displayOrder - b.displayOrder);
        setLocalMembers(updated);
    };

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="size-5 text-blue-600" />
                    Our Team (Homepage)
                </CardTitle>
                <CardDescription>
                    Manage the team members displayed in the "Our Team" section of the About page.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    {localMembers.map((member, index) => (
                        <div key={member.id} className="p-4 border rounded-xl bg-card flex flex-col md:flex-row gap-4 items-start relative">
                            <div className="flex flex-col gap-1 items-center justify-center mt-2 opacity-50">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveUp(index)} disabled={index === 0 || !isSuperAdmin}>▲</Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveDown(index)} disabled={index === localMembers.length - 1 || !isSuperAdmin}>▼</Button>
                            </div>

                            <div className="flex-1 grid md:grid-cols-2 gap-4 w-full">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Name</Label>
                                    <Input value={member.name} onChange={(e) => handleUpdateLocal(index, 'name', e.target.value)} disabled={!isSuperAdmin} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Role</Label>
                                    <Input value={member.role} onChange={(e) => handleUpdateLocal(index, 'role', e.target.value)} disabled={!isSuperAdmin} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs">Description (Stats / Details)</Label>
                                    <Input value={member.description} onChange={(e) => handleUpdateLocal(index, 'description', e.target.value)} disabled={!isSuperAdmin} />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs">Image URL (Optional)</Label>
                                    <Input placeholder="https://..." value={member.imageUrl || ''} onChange={(e) => handleUpdateLocal(index, 'imageUrl', e.target.value)} disabled={!isSuperAdmin} />
                                </div>
                            </div>

                            <div>
                                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteRow(member.id, index)} disabled={!isSuperAdmin}>
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {isSuperAdmin && (
                    <div className="flex justify-between items-center pt-2">
                        <Button variant="outline" size="sm" onClick={handleAddRow} className="gap-2">
                            <Plus className="size-4" />
                            Add Member
                        </Button>
                        <Button onClick={handleSaveAll} className="gap-2 institutional-gradient">
                            <Save className="size-4" />
                            Save Team Members
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
