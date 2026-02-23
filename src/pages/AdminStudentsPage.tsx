import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Ban, CheckCircle, MoreHorizontal, Camera, Pencil, User, Upload, X, Loader2, Save, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuthStore, useStudentStore, usePaymentStore, useAdminLogStore } from '@/stores';
import { formatDate, getStatusColorClass, compressImage } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import type { Student } from '@/types';

// Maximum file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// Edit form type
interface StudentEditForm {
  name: string;
  fatherName: string;
  class: number;
  mobile: string;
  email: string;
  schoolName: string;
  schoolContact: string;
  addressVillage: string;
  addressBlock: string;
  addressTahsil: string;
  addressDistrict: string;
  addressState: string;
}

export function AdminStudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPhotoStudent, setEditingPhotoStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editForm, setEditForm] = useState<StudentEditForm>({
    name: '',
    fatherName: '',
    class: 1,
    mobile: '',
    email: '',
    schoolName: '',
    schoolContact: '',
    addressVillage: '',
    addressBlock: '',
    addressTahsil: '',
    addressDistrict: '',
    addressState: '',
  });

  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { students, loadStudents, blockStudent, unblockStudent, updateStudent } = useStudentStore();
  const { payments, loadPayments } = usePaymentStore();
  const { addLog } = useAdminLogStore();

  // Helper function to check if student has successful payment
  const hasSuccessfulPayment = (studentId: string) => {
    return payments.some(p => p.studentId === studentId && p.status === 'SUCCESS');
  };

  const handleBlockStudent = async (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to block ${studentName}?`)) {
      await blockStudent(studentId);
      if (currentAdmin) {
        addLog(currentAdmin.id, 'BLOCK_STUDENT', studentId, `Blocked student ${studentName}`);
      }
    }
  };

  const handleUnblockStudent = async (studentId: string, studentName: string) => {
    if (confirm(`Are you sure you want to unblock ${studentName}?`)) {
      await unblockStudent(studentId);
      if (currentAdmin) {
        addLog(currentAdmin.id, 'UNBLOCK_STUDENT', studentId, `Unblocked student ${studentName}`);
      }
    }
  };

  const openPhotoDialog = (student: Student) => {
    setEditingPhotoStudent(student);
    setSelectedFile(null);
    setPreviewUrl(student.photoUrl || '');
    setIsPhotoDialogOpen(true);
  };

  const openEditDialog = (student: Student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      fatherName: student.fatherName,
      class: student.class,
      mobile: student.mobile,
      email: student.email,
      schoolName: student.schoolName,
      schoolContact: student.schoolContact,
      addressVillage: student.addressVillage,
      addressBlock: student.addressBlock,
      addressTahsil: student.addressTahsil,
      addressDistrict: student.addressDistrict,
      addressState: student.addressState,
    });
    setIsEditDialogOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, PNG, or WebP image.",
        variant: "destructive"
      });
      return;
    }

    // Auto-compress image to under 2MB
    const compressToast = toast({
      title: "Processing Image",
      description: "Optimizing photo for upload...",
    });

    try {
      const compressedBase64 = await compressImage(file);
      setPreviewUrl(compressedBase64);

      // Convert base64 back to file for the upload function if needed, 
      // or modify uploadPhoto to accept base64. 
      // For now, let's just keep the file if it's already under 2MB, 
      // otherwise use the compressed base64 approach.

      if (file.size > MAX_FILE_SIZE) {
        // Create a new file from compressed base64
        const res = await fetch(compressedBase64);
        const blob = await res.blob();
        const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
        setSelectedFile(compressedFile);
      } else {
        setSelectedFile(file);
      }

      compressToast.dismiss();
    } catch (error) {
      console.error('Compression error:', error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try a different one.",
        variant: "destructive"
      });
      compressToast.dismiss();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(editingPhotoStudent?.photoUrl || '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!selectedFile || !editingPhotoStudent) return null;

    const fileExt = selectedFile.name.split('.').pop();
    const fileName = `${editingPhotoStudent.id}-${Date.now()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('student-photos')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: selectedFile.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('student-photos')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhotoStudent) return;

    setIsUploading(true);

    try {
      let photoUrl: string | undefined = editingPhotoStudent.photoUrl;

      // If a new file is selected, upload it
      if (selectedFile) {
        const uploadedUrl = await uploadPhoto();
        if (!uploadedUrl) {
          toast({
            title: "Upload Failed",
            description: "Failed to upload photo. Please try again.",
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }
        photoUrl = uploadedUrl;
      }

      // Update student record with new photo URL
      await updateStudent(editingPhotoStudent.id, { photoUrl });

      if (currentAdmin) {
        addLog(currentAdmin.id, 'UPDATE_STUDENT_PHOTO', editingPhotoStudent.id, `Updated photo for ${editingPhotoStudent.name}`);
      }

      toast({
        title: "Success",
        description: "Student photo updated successfully."
      });

      setIsPhotoDialogOpen(false);
      setEditingPhotoStudent(null);
      setSelectedFile(null);
      setPreviewUrl('');
      loadStudents(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student photo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!editingPhotoStudent || !editingPhotoStudent.photoUrl) return;

    if (!confirm('Are you sure you want to remove this student\'s photo?')) return;

    setIsUploading(true);

    try {
      await updateStudent(editingPhotoStudent.id, { photoUrl: undefined });

      if (currentAdmin) {
        addLog(currentAdmin.id, 'DELETE_STUDENT_PHOTO', editingPhotoStudent.id, `Removed photo for ${editingPhotoStudent.name}`);
      }

      toast({
        title: "Success",
        description: "Student photo removed successfully."
      });

      setIsPhotoDialogOpen(false);
      setEditingPhotoStudent(null);
      setSelectedFile(null);
      setPreviewUrl('');
      loadStudents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove student photo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!editingStudent) return;

    // Validate required fields
    if (!editForm.name || !editForm.fatherName || !editForm.mobile || !editForm.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);

    try {
      await updateStudent(editingStudent.id, {
        name: editForm.name,
        fatherName: editForm.fatherName,
        class: editForm.class,
        mobile: editForm.mobile,
        email: editForm.email,
        schoolName: editForm.schoolName,
        schoolContact: editForm.schoolContact,
        addressVillage: editForm.addressVillage,
        addressBlock: editForm.addressBlock,
        addressTahsil: editForm.addressTahsil,
        addressDistrict: editForm.addressDistrict,
        addressState: editForm.addressState,
      });

      if (currentAdmin) {
        addLog(currentAdmin.id, 'EDIT_STUDENT', editingStudent.id, `Edited student ${editForm.name}`);
      }

      toast({
        title: "Success",
        description: "Student details updated successfully."
      });

      setIsEditDialogOpen(false);
      setEditingStudent(null);
      loadStudents(); // Refresh the list
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update student details.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isAdminLoggedIn || !currentAdmin) {
      navigate('/admin/login');
      return;
    }
    loadStudents();
    loadPayments();
  }, [isAdminLoggedIn, currentAdmin, navigate, loadStudents, loadPayments]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search) ||
      s.centerCode.includes(search.toUpperCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold">Student Management</h1>
          <p className="text-muted-foreground">{students.length} total students</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Center Code</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {student.photoUrl ? (
                        <div className="size-10 rounded-full overflow-hidden bg-muted">
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="size-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>Class {student.class}</TableCell>
                  <TableCell className="font-mono text-xs">{student.centerCode}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={hasSuccessfulPayment(student.id) ? 'default' : 'secondary'}>
                        {hasSuccessfulPayment(student.id) ? 'Paid' : 'Pending'}
                      </Badge>
                      {!hasSuccessfulPayment(student.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-green-600 border-green-200 hover:bg-green-50"
                          onClick={async () => {
                            const pendingPayment = payments.find(p => p.studentId === student.id && p.status === 'PENDING');
                            if (pendingPayment) {
                              if (confirm(`Approve payment for ${student.name}?`)) {
                                try {
                                  await usePaymentStore.getState().approvePayment(pendingPayment.id);
                                  toast({ title: "Approved", description: "Payment approved successfully." });
                                } catch (e) {
                                  toast({ title: "Error", description: "Failed to approve payment.", variant: "destructive" });
                                }
                              }
                            } else {
                              toast({ title: "No Pending Payment", description: "This student has no pending payment to approve.", variant: "default" });
                            }
                          }}
                        >
                          <CheckCircle className="size-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {hasSuccessfulPayment(student.id) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                          onClick={async () => {
                            const successPayment = payments.find(p => p.studentId === student.id && p.status === 'SUCCESS');
                            if (successPayment) {
                              if (confirm(`Mark payment as pending for ${student.name}?`)) {
                                try {
                                  await usePaymentStore.getState().markPaymentPending(successPayment.id);
                                  toast({ title: "Marked Pending", description: "Payment status set to pending." });
                                } catch (e) {
                                  toast({ title: "Error", description: "Failed to mark payment as pending.", variant: "destructive" });
                                }
                              }
                            } else {
                              toast({ title: "No Success Payment", description: "No successful payment found to mark as pending.", variant: "default" });
                            }
                          }}
                        >
                          <AlertTriangle className="size-3 mr-1" />
                          Mark Pending
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`status-badge ${getStatusColorClass(student.status)}`}>
                      {student.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(student.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                          <Eye className="size-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(student)}>
                          <Pencil className="size-4 mr-2" />
                          Edit Student
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openPhotoDialog(student)}>
                          <Camera className="size-4 mr-2" />
                          {student.photoUrl ? 'Edit Photo' : 'Add Photo'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {student.status === 'ACTIVE' ? (
                          (currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'ADMIN') && (
                            <DropdownMenuItem
                              onClick={() => handleBlockStudent(student.id, student.name)}
                              className="text-destructive"
                            >
                              <Ban className="size-4 mr-2" />
                              Block Student
                            </DropdownMenuItem>
                          )
                        ) : student.status === 'PENDING' ? (
                          <DropdownMenuItem onClick={() => handleUnblockStudent(student.id, student.name)} className="text-green-600">
                            <CheckCircle className="size-4 mr-2" />
                            Approve Student
                          </DropdownMenuItem>
                        ) : (
                          (currentAdmin?.role === 'SUPER_ADMIN' || currentAdmin?.role === 'ADMIN') && (
                            <DropdownMenuItem onClick={() => handleUnblockStudent(student.id, student.name)}>
                              <CheckCircle className="size-4 mr-2" />
                              Unblock Student
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4">
              {/* Photo Section */}
              <div className="flex items-center gap-4 pb-4 border-b">
                {selectedStudent.photoUrl ? (
                  <div className="size-20 rounded-full overflow-hidden bg-muted">
                    <img
                      src={selectedStudent.photoUrl}
                      alt={selectedStudent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-20 rounded-full bg-muted flex items-center justify-center">
                    <User className="size-10 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">{selectedStudent.name}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const student = selectedStudent;
                        setSelectedStudent(null);
                        openPhotoDialog(student);
                      }}
                    >
                      <Camera className="size-4 mr-2" />
                      {selectedStudent.photoUrl ? 'Change Photo' : 'Add Photo'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const student = selectedStudent;
                        setSelectedStudent(null);
                        openEditDialog(student);
                      }}
                    >
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Father's Name / Guardian</p>
                  <p className="font-medium">{selectedStudent.fatherName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Class</p>
                  <p className="font-medium">Class {selectedStudent.class}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Referred By</p>
                  <p className="font-medium">
                    {selectedStudent.referredByCenter ? (
                      <span className="text-primary font-mono">{selectedStudent.referredByCenter} (Center)</span>
                    ) : selectedStudent.referredByStudent ? (
                      <span className="text-primary font-mono">{selectedStudent.referredByStudent} (Student)</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Mobile</p>
                  <p className="font-medium">{selectedStudent.mobile}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedStudent.email}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">School</p>
                  <p className="font-medium">{selectedStudent.schoolName}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {selectedStudent.addressVillage}, {selectedStudent.addressBlock}, {selectedStudent.addressDistrict}, {selectedStudent.addressState}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t mt-2">
                  <p className="text-muted-foreground mb-1">Payment Status</p>
                  <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg">
                    <Badge variant={hasSuccessfulPayment(selectedStudent.id) ? 'default' : 'secondary'}>
                      {hasSuccessfulPayment(selectedStudent.id) ? 'Paid' : 'Pending'}
                    </Badge>
                    {!hasSuccessfulPayment(selectedStudent.id) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50 h-8"
                        onClick={async () => {
                          const pendingPayment = payments.find(p => p.studentId === selectedStudent.id && p.status === 'PENDING');
                          if (pendingPayment) {
                            if (confirm(`Approve payment for ${selectedStudent.name}?`)) {
                              await usePaymentStore.getState().approvePayment(pendingPayment.id);
                              toast({ title: "Approved", description: "Payment approved successfully." });
                            }
                          } else {
                            toast({ title: "No Pending Payment", description: "This student has no pending payment to approve.", variant: "default" });
                          }
                        }}
                      >
                        <CheckCircle className="size-3 mr-1" />
                        Approve Payment
                      </Button>
                    )}
                    {hasSuccessfulPayment(selectedStudent.id) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 h-8"
                        onClick={async () => {
                          const successPayment = payments.find(p => p.studentId === selectedStudent.id && p.status === 'SUCCESS');
                          if (successPayment) {
                            if (confirm(`Mark payment as pending for ${selectedStudent.name}?`)) {
                              await usePaymentStore.getState().markPaymentPending(successPayment.id);
                              toast({ title: "Marked Pending", description: "Payment status set to pending." });
                            }
                          } else {
                            toast({ title: "No Success Payment", description: "No successful payment found to mark as pending.", variant: "default" });
                          }
                        }}
                      >
                        <AlertTriangle className="size-3 mr-1" />
                        Mark Pending
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Center Code</p>
                <p className="font-mono font-medium">{selectedStudent.centerCode}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <span className={`status-badge ${getStatusColorClass(selectedStudent.status)}`}>
                  {selectedStudent.status}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student Details</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <div className="space-y-4 py-4">
              {/* Personal Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-muted-foreground">Personal Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Name *</Label>
                    <Input
                      id="edit-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Student name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-fatherName">Father's Name *</Label>
                    <Input
                      id="edit-fatherName"
                      value={editForm.fatherName}
                      onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                      placeholder="Father's name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-class">Class</Label>
                    <select
                      id="edit-class"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={editForm.class}
                      onChange={(e) => setEditForm({ ...editForm, class: parseInt(e.target.value) })}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(c => (
                        <option key={c} value={c}>Class {c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-mobile">Mobile *</Label>
                    <Input
                      id="edit-mobile"
                      value={editForm.mobile}
                      onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                      placeholder="Mobile number"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
              </div>

              {/* School Information */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground">School Information</h4>
                <div className="grid gap-2">
                  <Label htmlFor="edit-schoolName">School Name</Label>
                  <Input
                    id="edit-schoolName"
                    value={editForm.schoolName}
                    onChange={(e) => setEditForm({ ...editForm, schoolName: e.target.value })}
                    placeholder="School name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-schoolContact">School Contact</Label>
                  <Input
                    id="edit-schoolContact"
                    value={editForm.schoolContact}
                    onChange={(e) => setEditForm({ ...editForm, schoolContact: e.target.value })}
                    placeholder="School contact number"
                  />
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-medium text-sm text-muted-foreground">Address Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-village">Village</Label>
                    <Input
                      id="edit-village"
                      value={editForm.addressVillage}
                      onChange={(e) => setEditForm({ ...editForm, addressVillage: e.target.value })}
                      placeholder="Village"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-block">Block</Label>
                    <Input
                      id="edit-block"
                      value={editForm.addressBlock}
                      onChange={(e) => setEditForm({ ...editForm, addressBlock: e.target.value })}
                      placeholder="Block"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tahsil">Tahsil</Label>
                    <Input
                      id="edit-tahsil"
                      value={editForm.addressTahsil}
                      onChange={(e) => setEditForm({ ...editForm, addressTahsil: e.target.value })}
                      placeholder="Tahsil"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-district">District</Label>
                    <Input
                      id="edit-district"
                      value={editForm.addressDistrict}
                      onChange={(e) => setEditForm({ ...editForm, addressDistrict: e.target.value })}
                      placeholder="District"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-state">State</Label>
                  <Input
                    id="edit-state"
                    value={editForm.addressState}
                    onChange={(e) => setEditForm({ ...editForm, addressState: e.target.value })}
                    placeholder="State"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditStudent} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={isPhotoDialogOpen} onOpenChange={setIsPhotoDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingPhotoStudent?.photoUrl ? 'Edit Student Photo' : 'Add Student Photo'}
            </DialogTitle>
          </DialogHeader>
          {editingPhotoStudent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 pb-4">
                {editingPhotoStudent.photoUrl && !selectedFile ? (
                  <div className="size-16 rounded-full overflow-hidden bg-muted">
                    <img
                      src={editingPhotoStudent.photoUrl}
                      alt={editingPhotoStudent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : previewUrl ? (
                  <div className="size-16 rounded-full overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="size-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{editingPhotoStudent.name}</p>
                  <p className="text-sm text-muted-foreground">Class {editingPhotoStudent.class}</p>
                </div>
              </div>

              {/* File Upload Area */}
              <div className="grid gap-2">
                <Label>Passport Size Photo (Max 2MB)</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle className="size-5 text-green-500" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                        >
                          <X className="size-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="size-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPEG, PNG or WebP (max 2MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="grid gap-2">
                  <Label>Photo Preview</Label>
                  <div className="flex justify-center">
                    <div className="w-32 h-40 rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Passport size photo preview
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {editingPhotoStudent?.photoUrl && !selectedFile && (
              <Button
                variant="destructive"
                onClick={handleDeletePhoto}
                disabled={isUploading}
                className="w-full sm:w-auto"
              >
                Remove Photo
              </Button>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setIsPhotoDialogOpen(false)}
                disabled={isUploading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePhoto}
                disabled={isUploading || (!selectedFile && !editingPhotoStudent?.photoUrl)}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : selectedFile ? (
                  'Upload Photo'
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
}
