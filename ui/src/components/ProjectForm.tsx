import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { projectsAPI } from '../services/api';
import type { Project } from '../types';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { format } from 'date-fns';

const projectSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['planning', 'active', 'completed', 'cancelled']),
  requiredSkills: z.array(z.string()).min(1, 'At least one skill is required'),
  teamSize: z.number().min(1, 'Team size must be at least 1'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  project?: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const commonSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'C++', 'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'MongoDB',
  'PostgreSQL', 'Redis', 'GraphQL', 'REST APIs', 'Microservices',
  'DevOps', 'CI/CD', 'Testing', 'UI/UX Design', 'Mobile Development'
];

export function ProjectForm({ project, open, onOpenChange, onSuccess }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      requiredSkills: [],
      teamSize: 1,
      priority: 'medium',
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description,
        startDate: format(new Date(project.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(project.endDate), 'yyyy-MM-dd'),
        status: project.status,
        requiredSkills: project.requiredSkills,
        teamSize: project.teamSize,
        priority: project.priority,
      });
      setSelectedSkills(project.requiredSkills);
    } else {
      form.reset({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'planning',
        requiredSkills: [],
        teamSize: 1,
        priority: 'medium',
      });
      setSelectedSkills([]);
    }
  }, [project, form, open]);

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      form.setValue('requiredSkills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    form.setValue('requiredSkills', newSkills);
  };

  const onSubmit = async (values: ProjectFormValues) => {
    setIsLoading(true);
    try {
      if (project) {
        await projectsAPI.update(project._id, values);
        toast({
          title: "Project updated",
          description: "Project has been updated successfully.",
        });
      } else {
        await projectsAPI.create(values);
        toast({
          title: "Project created",
          description: "New project has been created successfully.",
        });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
          <DialogDescription>
            {project 
              ? 'Update the project information.'
              : 'Create a new project and define its requirements.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Project" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Describe the project goals, scope, and requirements..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teamSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="5" 
                        min="1" 
                        max="50"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requiredSkills"
              render={() => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a required skill..."
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addSkill(skillInput);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addSkill(skillInput)}
                      >
                        Add
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {commonSkills.map((skill) => (
                        <Button
                          key={skill}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => addSkill(skill)}
                          disabled={selectedSkills.includes(skill)}
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>

                    {selectedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {selectedSkills.map((skill) => (
                          <Badge key={skill} variant="default" className="flex items-center gap-1">
                            {skill}
                            <button
                              type="button"
                              onClick={() => removeSkill(skill)}
                              className="ml-1 hover:bg-red-500 rounded-full p-0.5"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}