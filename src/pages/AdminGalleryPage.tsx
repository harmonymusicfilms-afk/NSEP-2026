import { useState, useEffect, useRef } from 'react';
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    ExternalLink,
    Eye,
    EyeOff,
    Search,
    Filter,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    Pencil,
    Upload,
    X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useGalleryStore } from '@/stores';
import { compressImage } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import type { GalleryItem } from '@/types';

export function AdminGalleryPage() {
    const { items, isLoading, fetchGallery, addItem, updateItem, deleteItem } = useGalleryStore();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        imageUrl: '',
        category: 'OTHER',
        year: new Date().getFullYear(),
        featured: false,
        isPublished: true
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const compressToast = toast({
            title: "Processing Image",
            description: "Optimizing for gallery...",
        });

        try {
            // Auto-compress to under 2MB
            const base64String = await compressImage(file, 2);

            // Save image to localStorage to avoid DB column size limits
            const localKey = `gallery_img_${Date.now()}`;
            try {
                localStorage.setItem(localKey, base64String);
                // Store a reference key prefixed with 'local:' so we can retrieve it
                const imageRef = `local:${localKey}`;
                if (isEdit) {
                    setEditForm(prev => ({ ...prev, imageUrl: imageRef }));
                } else {
                    setNewItem(prev => ({ ...prev, imageUrl: imageRef }));
                }
            } catch {
                // If localStorage is full, just use base64 directly
                if (isEdit) {
                    setEditForm(prev => ({ ...prev, imageUrl: base64String }));
                } else {
                    setNewItem(prev => ({ ...prev, imageUrl: base64String }));
                }
            }

            compressToast.dismiss();
            toast({
                title: "Image Uploaded ✓",
                description: file.name
            });
        } catch (error) {
            console.error('Compression error:', error);
            compressToast.dismiss();
            toast({
                title: "Error",
                description: "Failed to process image.",
                variant: "destructive"
            });
        }
        event.target.value = '';
    };

    // Helper: resolve imageUrl - if it's a local: reference, get from localStorage
    const resolveImageUrl = (url: string) => {
        if (url?.startsWith('local:')) {
            return localStorage.getItem(url.slice(6)) || url;
        }
        return url;
    };

    const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
    const [editForm, setEditForm] = useState<{
        title: string;
        description: string;
        imageUrl: string;
        category: 'CEREMONY' | 'TOPPERS' | 'EVENTS' | 'OTHER';
        year: number;
        featured: boolean;
        isPublished: boolean;
    }>({
        title: '',
        description: '',
        imageUrl: '',
        category: 'OTHER',
        year: new Date().getFullYear(),
        featured: false,
        isPublished: true
    });

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const handleAddItem = async () => {
        if (!newItem.title || !newItem.imageUrl) {
            toast({
                title: "Error",
                description: "Title and Image URL are required.",
                variant: "destructive"
            });
            return;
        }

        await addItem(newItem as any);
        setIsAddDialogOpen(false);
        setNewItem({
            title: '',
            description: '',
            imageUrl: '',
            category: 'OTHER',
            year: new Date().getFullYear(),
            featured: false,
            isPublished: true
        });
        toast({
            title: "Success",
            description: "Gallery item added successfully."
        });
    };

    const openEditDialog = (item: GalleryItem) => {
        setEditingItem(item);
        setEditForm({
            title: item.title,
            description: item.description || '',
            imageUrl: item.imageUrl,
            category: item.category,
            year: item.year || new Date().getFullYear(),
            featured: item.featured || false,
            isPublished: item.isPublished
        });
        setIsEditDialogOpen(true);
    };

    const handleEditItem = async () => {
        if (!editingItem || !editForm.title || !editForm.imageUrl) {
            toast({
                title: "Error",
                description: "Title and Image URL are required.",
                variant: "destructive"
            });
            return;
        }

        await updateItem(editingItem.id, {
            title: editForm.title,
            description: editForm.description,
            imageUrl: editForm.imageUrl,
            category: editForm.category,
            year: editForm.year,
            featured: editForm.featured,
            isPublished: editForm.isPublished
        });

        setIsEditDialogOpen(false);
        setEditingItem(null);
        toast({
            title: "Success",
            description: "Gallery item updated successfully."
        });
    };

    const handleDeleteItem = async (id: string) => {
        if (confirm('Are you sure you want to delete this item?')) {
            await deleteItem(id);
            toast({
                title: "Deleted",
                description: "Item removed from gallery."
            });
        }
    };

    const togglePublished = async (id: string, current: boolean) => {
        await updateItem(id, { isPublished: !current });
    };

    const toggleFeatured = async (id: string, current: boolean) => {
        await updateItem(id, { featured: !current });
    };

    const filteredItems = items.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gallery Management</h1>
                    <p className="text-muted-foreground">Manage hospital and event photos displayed in the public gallery.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="size-4" />
                            Add Photo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add Gallery Item</DialogTitle>
                            <DialogDescription>
                                Create a new item for the public photo gallery.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={newItem.title}
                                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                    placeholder="e.g. Annual Topper Awards 2025"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    placeholder="Short description of the photo"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="imageUrl">Image URL</Label>
                                <Input
                                    id="imageUrl"
                                    value={newItem.imageUrl}
                                    onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                />
                                <div className="text-center text-muted-foreground text-xs my-1">- OR -</div>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, false)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full dashed border-primary/50 text-primary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="size-4 mr-2" />
                                        Upload Image
                                    </Button>
                                    {newItem.imageUrl && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setNewItem({ ...newItem, imageUrl: '' })}
                                            className="text-destructive hover:text-destructive shrink-0"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {newItem.imageUrl && (
                                <div className="grid gap-2">
                                    <Label>Preview</Label>
                                    <div className="w-full h-40 rounded-md overflow-hidden bg-muted">
                                        <img
                                            src={resolveImageUrl(newItem.imageUrl)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Category</Label>
                                    <select
                                        id="category"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                                    >
                                        <option value="CEREMONY">Ceremony</option>
                                        <option value="TOPPERS">Toppers</option>
                                        <option value="EVENTS">Events</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Input
                                        id="year"
                                        type="number"
                                        value={newItem.year}
                                        onChange={(e) => setNewItem({ ...newItem, year: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="featured"
                                        checked={newItem.featured}
                                        onChange={(e) => setNewItem({ ...newItem, featured: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="featured">Featured</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="isPublished"
                                        checked={newItem.isPublished}
                                        onChange={(e) => setNewItem({ ...newItem, isPublished: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="isPublished">Published</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddItem}>Save Item</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Gallery Item</DialogTitle>
                            <DialogDescription>
                                Update the details of this gallery photo.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-title">Title</Label>
                                <Input
                                    id="edit-title"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    placeholder="e.g. Annual Topper Awards 2025"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-description">Description (Optional)</Label>
                                <Input
                                    id="edit-description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Short description of the photo"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-imageUrl">Image URL</Label>
                                <Input
                                    id="edit-imageUrl"
                                    value={editForm.imageUrl}
                                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                    placeholder="https://images.unsplash.com/..."
                                />
                                <div className="text-center text-muted-foreground text-xs my-1">- OR -</div>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        ref={editFileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, true)}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full dashed border-primary/50 text-primary"
                                        onClick={() => editFileInputRef.current?.click()}
                                    >
                                        <Upload className="size-4 mr-2" />
                                        Upload Image
                                    </Button>
                                    {editForm.imageUrl && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setEditForm({ ...editForm, imageUrl: '' })}
                                            className="text-destructive hover:text-destructive shrink-0"
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                            {editForm.imageUrl && (
                                <div className="grid gap-2">
                                    <Label>Preview</Label>
                                    <div className="w-full h-40 rounded-md overflow-hidden bg-muted">
                                        <img
                                            src={resolveImageUrl(editForm.imageUrl)}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder.svg';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-category">Category</Label>
                                    <select
                                        id="edit-category"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={editForm.category}
                                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                                    >
                                        <option value="CEREMONY">Ceremony</option>
                                        <option value="TOPPERS">Toppers</option>
                                        <option value="EVENTS">Events</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-year">Year</Label>
                                    <Input
                                        id="edit-year"
                                        type="number"
                                        value={editForm.year}
                                        onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit-featured"
                                        checked={editForm.featured}
                                        onChange={(e) => setEditForm({ ...editForm, featured: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="edit-featured">Featured</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit-isPublished"
                                        checked={editForm.isPublished}
                                        onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="edit-isPublished">Published</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditItem}>Update Item</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search gallery..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="size-4 text-muted-foreground" />
                            <select
                                className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="all">All Categories</option>
                                <option value="CEREMONY">Ceremonies</option>
                                <option value="TOPPERS">Toppers</option>
                                <option value="EVENTS">Events</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-muted-foreground">Loading gallery items...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg">
                            <ImageIcon className="size-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-semibold text-lg">No photos found</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
                                Connect your story with photos. Add your first photo to the gallery.
                            </p>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="size-4 mr-2" />
                                Add First Photo
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Card className="overflow-hidden group relative">
                                            <div className="aspect-square relative flex items-center justify-center bg-muted">
                                                <img
                                                    src={resolveImageUrl(item.imageUrl)}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="secondary" className="rounded-full shadow-lg" asChild>
                                                        <a href={item.imageUrl} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="size-4" />
                                                        </a>
                                                    </Button>
                                                </div>
                                                <div className="absolute top-2 left-2 flex gap-1">
                                                    {item.featured && (
                                                        <Badge className="bg-yellow-500 hover:bg-yellow-600 border-none text-black">
                                                            Featured
                                                        </Badge>
                                                    )}
                                                    {!item.isPublished && (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <EyeOff className="size-3" />
                                                            Draft
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <CardContent className="p-3">
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                                                        <p className="text-xs text-muted-foreground line-clamp-1">{item.category} • {item.year || '2025'}</p>
                                                    </div>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="size-7">
                                                                <MoreVertical className="size-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                                                                <Pencil className="size-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => togglePublished(item.id, item.isPublished)}>
                                                                {item.isPublished ? (
                                                                    <><EyeOff className="size-4 mr-2" /> Unpublish</>
                                                                ) : (
                                                                    <><Eye className="size-4 mr-2" /> Publish</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => toggleFeatured(item.id, !!item.featured)}>
                                                                {item.featured ? (
                                                                    <><AlertCircle className="size-4 mr-2" /> Remove Featured</>
                                                                ) : (
                                                                    <><CheckCircle2 className="size-4 mr-2" /> Make Featured</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => handleDeleteItem(item.id)}
                                                            >
                                                                <Trash2 className="size-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
