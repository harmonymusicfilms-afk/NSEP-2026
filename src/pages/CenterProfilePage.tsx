import { useState } from 'react';
import {
    Building2,
    User,
    Mail,
    Phone,
    MapPin,
    FileText,
    Save,
    Loader2,
    Shield,
    CreditCard,
    Camera
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function CenterProfilePage() {
    const { currentCenter, setCenter } = useAuthStore();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: currentCenter?.name || '',
        ownerName: currentCenter?.ownerName || '',
        ownerEmail: currentCenter?.ownerEmail || '',
        ownerPhone: currentCenter?.ownerPhone || '',
        village: currentCenter?.village || '',
        block: currentCenter?.block || '',
        district: currentCenter?.district || '',
        state: currentCenter?.state || '',
        pincode: currentCenter?.pincode || '',
        centerType: currentCenter?.centerType || '',
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentCenter) return;

        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from('centers')
                .update({
                    name: formData.name,
                    owner_name: formData.ownerName,
                    village: formData.village,
                    block: formData.block,
                    district: formData.district,
                    state: formData.state,
                    pincode: formData.pincode,
                })
                .eq('id', currentCenter.id)
                .select()
                .single();

            if (error) throw error;

            // Update local store
            setCenter({
                ...currentCenter,
                name: data.name,
                ownerName: data.owner_name,
                village: data.village,
                block: data.block,
                district: data.district,
                state: data.state,
                pincode: data.pincode,
            });

            toast({
                title: 'Profile Updated',
                description: 'Your center information has been successfully updated.',
            });
        } catch (err: any) {
            console.error('Error updating center profile:', err);
            toast({
                title: 'Update Failed',
                description: err.message || 'An error occurred while saving profile.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="font-serif text-3xl font-bold text-foreground">Center Profile</h1>
                <p className="text-muted-foreground">Manage your institution details and official information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Info Sidebar */}
                <div className="space-y-6">
                    <Card className="shadow-md">
                        <CardContent className="p-6 text-center">
                            <div className="relative inline-block mb-4">
                                <div className="size-24 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 border-2 border-amber-200">
                                    <Building2 className="size-12" />
                                </div>
                                <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-border hover:bg-muted transition-colors">
                                    <Camera className="size-4" />
                                </button>
                            </div>
                            <h2 className="font-bold text-xl">{currentCenter?.name}</h2>
                            <p className="text-sm text-muted-foreground capitalize">{currentCenter?.centerType.replace('_', ' ')}</p>
                            <div className="mt-4 flex flex-col gap-2">
                                <Badge variant="outline" className="justify-center py-1 bg-amber-50 text-amber-700 border-amber-200">
                                    Center Code: {currentCenter?.centerCode}
                                </Badge>
                                <Badge variant={currentCenter?.status === 'APPROVED' ? 'default' : 'secondary'} className={`justify-center py-1 ${currentCenter?.status === 'APPROVED' ? 'bg-green-600' : ''}`}>
                                    Account Status: {currentCenter?.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Verification Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                                <div className="flex items-center gap-2">
                                    <Shield className="size-4 text-green-600" />
                                    <span className="text-xs font-medium">Identity Proof</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] bg-white">Verified</Badge>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border">
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-4 text-green-600" />
                                    <span className="text-xs font-medium">Address Proof</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] bg-white">Verified</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md">
                        <CardHeader>
                            <CardTitle>Institution Details</CardTitle>
                            <CardDescription>Update your center's public and internal information.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpdateProfile}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="centerName">Center Name</Label>
                                        <Input
                                            id="centerName"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName">Head/Owner Name</Label>
                                        <Input
                                            id="ownerName"
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Official Email (Read Only)</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                            <Input readOnly type="email" value={formData.ownerEmail} className="pl-10 bg-muted/50 opacity-70 cursor-not-allowed" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Official Phone (Read Only)</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                                            <Input readOnly value={formData.ownerPhone} className="pl-10 bg-muted/50 opacity-70 cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-semibold text-sm">Location Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="village">Village/Town</Label>
                                            <Input id="village" value={formData.village} onChange={(e) => setFormData({ ...formData, village: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="block">Block/Tehsil</Label>
                                            <Input id="block" value={formData.block} onChange={(e) => setFormData({ ...formData, block: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="district">District</Label>
                                            <Input id="district" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="state">State</Label>
                                            <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pincode">Pincode</Label>
                                            <Input id="pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/30 border-t flex justify-end p-4">
                                <Button
                                    type="submit"
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 size-4" />
                                            Save Profile
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    <Card className="border-destructive/20 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-destructive flex items-center gap-2">
                                <Shield className="size-5" />
                                Security
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                                Reset Center Password
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
