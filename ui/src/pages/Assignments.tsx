import { useEffect, useState } from 'react';
import { Plus, User, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { assignmentsAPI } from '../services/api';
import type { Assignment } from '../types';
import { useAuthStore } from '../store/authStore';
import { AssignmentForm } from '../components/AssignmentForm';
import { format } from 'date-fns';

export function Assignments() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const data = await assignmentsAPI.getAll();
        setAssignments(data);
      } catch (error) {
        console.error('Failed to fetch assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'active': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredAssignments = user?.role === 'engineer' 
    ? assignments.filter(assignment => assignment.engineer.email === user.email)
    : assignments;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assignments</h1>
        {user?.role === 'manager' && (
          <Button onClick={() => setShowAssignmentForm(true)} className="w-fit">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Assignment</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{assignment.project.name}</CardTitle>
                  <CardDescription className="mt-1">
                    Role: {assignment.role}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(assignment.status)}>
                  {assignment.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Engineer</p>
                  <p className="text-muted-foreground text-sm truncate">{assignment.engineer.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <FolderOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Project</p>
                  <p className="text-muted-foreground text-sm truncate">{assignment.project.name}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Allocation</span>
                  <span className="text-muted-foreground">
                    {assignment.allocationPercentage}%
                  </span>
                </div>
                <Progress value={assignment.allocationPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {format(new Date(assignment.startDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="font-medium">End Date</p>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {format(new Date(assignment.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-medium text-sm">Assigned By</p>
                <p className="text-muted-foreground text-sm truncate">{assignment.assignedBy.name}</p>
              </div>

              {user?.role === 'manager' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <span className="hidden sm:inline">Update Status</span>
                    <span className="sm:hidden">Update</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {user?.role === 'engineer' 
                ? 'You have no assignments yet.' 
                : 'No assignments found.'}
            </p>
          </CardContent>
        </Card>
      )}

      <AssignmentForm
        open={showAssignmentForm}
        onOpenChange={setShowAssignmentForm}
        onSuccess={() => {
          const refetch = async () => {
            try {
              const data = await assignmentsAPI.getAll();
              setAssignments(data);
            } catch (error) {
              console.error('Failed to fetch assignments:', error);
            }
          };
          refetch();
        }}
      />
    </div>
  );
}