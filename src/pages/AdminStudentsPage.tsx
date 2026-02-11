import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Ban, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthStore, useStudentStore, usePaymentStore } from '@/stores';
import { formatDate, getStatusColorClass } from '@/lib/utils';
import type { Student } from '@/types';

export function AdminStudentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  const { currentAdmin, isAdminLoggedIn } = useAuthStore();
  const { students, loadStudents, blockStudent, unblockStudent } = useStudentStore();
  const { payments, loadPayments, hasSuccessfulPayment } = usePaymentStore();

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
                  <TableCell>Class {student.class}</TableCell>
                  <TableCell className="font-mono text-xs">{student.centerCode}</TableCell>
                  <TableCell>
                    <Badge variant={hasSuccessfulPayment(student.id) ? 'default' : 'secondary'}>
                      {hasSuccessfulPayment(student.id) ? 'Paid' : 'Pending'}
                    </Badge>
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
                        {student.status === 'ACTIVE' ? (
                          <DropdownMenuItem 
                            onClick={() => blockStudent(student.id)}
                            className="text-destructive"
                          >
                            <Ban className="size-4 mr-2" />
                            Block Student
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => unblockStudent(student.id)}>
                            <CheckCircle className="size-4 mr-2" />
                            Unblock Student
                          </DropdownMenuItem>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
