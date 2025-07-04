import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { engineersAPI, projectsAPI, assignmentsAPI } from '../services/api';
import type { Engineer, Project } from '../types';
import { useToast } from '@/hooks/use-toast';

const assignmentSchema = z.object({
  engineer: z.string().min(1, 'Engineer is required'),
  project: z.string().min(1, 'Project is required'),
  allocationPercentage: z.number().min(1, 'Allocation must be at least 1%').max(100, 'Allocation cannot exceed 100%'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  role: z.string().min(1, 'Role is required'),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  preselectedEngineer?: string;
  preselectedProject?: string;
}

const commonRoles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'QA Engineer',
  'Tech Lead',
  'Architect',
  'Product Manager',
  'UI/UX Designer',
  'Data Engineer',
];

export function AssignmentForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  preselectedEngineer,
  preselectedProject 
}: AssignmentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | null>(null);
  const [engineersLoading, setEngineersLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      engineer: preselectedEngineer || '',
      project: preselectedProject || '',
      allocationPercentage: 50,
      startDate: '',
      endDate: '',
      role: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [engineersData, projectsData] = await Promise.all([
          engineersAPI.getAll({ available: true }),
          projectsAPI.getAll({ status: 'active' }),
        ]);
        setEngineers(engineersData);
        setProjects(projectsData);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load engineers and projects.",
        });
      } finally {
        setEngineersLoading(false);
        setProjectsLoading(false);
      }
    };

    if (open) {
      fetchData();
    }
  }, [open, toast]);

  useEffect(() => {
    if (preselectedEngineer) {
      form.setValue('engineer', preselectedEngineer);
    }
    if (preselectedProject) {
      form.setValue('project', preselectedProject);
    }
  }, [preselectedEngineer, preselectedProject, form]);

  const watchedEngineer = form.watch('engineer');

  useEffect(() => {
    const engineer = engineers.find(e => e._id === watchedEngineer);
    setSelectedEngineer(engineer || null);
  }, [watchedEngineer, engineers]);

  const onSubmit = async (values: AssignmentFormValues) => {
    setIsLoading(true);
    try {
      await assignmentsAPI.create(values);
      toast({
        title: "Assignment created",
        description: "Engineer has been assigned to the project successfully.",
      });
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to create assignment.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getEngineerCapacityInfo = () => {
    if (!selectedEngineer) return null;

    const allocation = form.watch('allocationPercentage') || 0;
    const availableCapacity = selectedEngineer.availableCapacity || 0;
    const currentUtilization = selectedEngineer.maxCapacity - availableCapacity;
    const newUtilization = currentUtilization + allocation;
    const utilizationPercentage = (newUtilization / selectedEngineer.maxCapacity) * 100;

    return {
      availableCapacity,
      newUtilization,
      utilizationPercentage,
      isOverallocated: newUtilization > selectedEngineer.maxCapacity,
    };
  };

  const capacityInfo = getEngineerCapacityInfo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Assign an engineer to a project with specific allocation and timeline.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="engineer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engineer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={engineersLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={engineersLoading ? "Loading..." : "Select engineer"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {engineers.map((engineer) => (
                          <SelectItem key={engineer._id} value={engineer._id}>
                            {engineer.name} - {engineer.seniority} ({engineer.availableCapacity || 0}% available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={projectsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={projectsLoading ? "Loading..." : "Select project"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project._id} value={project._id}>
                            {project.name} ({project.priority} priority)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commonRoles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allocationPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation Percentage (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="50" 
                      min="1" 
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                  {capacityInfo && (
                    <div className="mt-2 p-3 bg-muted rounded-md">
                      <p className="text-xs sm:text-sm font-medium mb-2">Capacity Analysis:</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>Available Capacity:</span>
                          <span>{capacityInfo.availableCapacity}%</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span>New Utilization:</span>
                          <span className={capacityInfo.isOverallocated ? 'text-red-500 font-medium' : ''}>
                            {Math.round(capacityInfo.utilizationPercentage)}%
                          </span>
                        </div>
                        <Progress 
                          value={Math.min(capacityInfo.utilizationPercentage, 100)} 
                          className="h-2"
                        />
                        {capacityInfo.isOverallocated && (
                          <p className="text-red-500 text-xs sm:text-sm font-medium">
                            ⚠️ This allocation would overbook the engineer by {Math.round(capacityInfo.utilizationPercentage - 100)}%
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (capacityInfo?.isOverallocated )}
              >
                {isLoading ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}