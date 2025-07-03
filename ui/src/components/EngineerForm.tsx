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
import { engineersAPI } from '../services/api';
import type { Engineer } from '../types';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';

const createEngineerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  seniority: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']),
  department: z.string().min(1, 'Department is required'),
  maxCapacity: z.number().min(1).max(100),
});

const updateEngineerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  seniority: z.enum(['junior', 'mid', 'senior', 'lead', 'principal']),
  department: z.string().min(1, 'Department is required'),
  maxCapacity: z.number().min(1).max(100),
});

// type CreateEngineerFormValues = z.infer<typeof createEngineerSchema>;
// type UpdateEngineerFormValues = z.infer<typeof updateEngineerSchema>;
// type EngineerFormValues = CreateEngineerFormValues | UpdateEngineerFormValues;

interface EngineerFormProps {
  engineer?: Engineer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const commonSkills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
  'C++', 'Go', 'Rust', 'Docker', 'Kubernetes', 'AWS', 'MongoDB',
  'PostgreSQL', 'Redis', 'GraphQL', 'REST APIs', 'Microservices'
];

export function EngineerForm({ engineer, open, onOpenChange, onSuccess }: EngineerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<any>({
    resolver: zodResolver(engineer ? updateEngineerSchema : createEngineerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      skills: [],
      seniority: 'junior',
      department: '',
      maxCapacity: 100,
    },
  });

  useEffect(() => {
    if (engineer) {
      form.reset({
        name: engineer.name,
        email: engineer.email,
        password: '',
        skills: engineer.skills,
        seniority: engineer.seniority,
        department: engineer.department,
        maxCapacity: engineer.maxCapacity,
      });
      setSelectedSkills(engineer.skills);
    } else {
      form.reset({
        name: '',
        email: '',
        password: '',
        skills: [],
        seniority: 'junior',
        department: '',
        maxCapacity: 100,
      });
      setSelectedSkills([]);
    }
  }, [engineer, form, open]);

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      form.setValue('skills', newSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = selectedSkills.filter(skill => skill !== skillToRemove);
    setSelectedSkills(newSkills);
    form.setValue('skills', newSkills);
  };

  const onSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      if (engineer) {
        await engineersAPI.update(engineer._id, values);
        toast({
          title: "Engineer updated",
          description: "Engineer profile has been updated successfully.",
        });
      } else {
        await engineersAPI.create(values);
        toast({
          title: "Engineer created",
          description: "New engineer has been added to the team.",
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>
            {engineer ? 'Edit Engineer' : 'Add New Engineer'}
          </DialogTitle>
          <DialogDescription>
            {engineer 
              ? 'Update the engineer\'s profile information.'
              : 'Add a new engineer to your team.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {!engineer && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="seniority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seniority Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select seniority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid-level</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input placeholder="Engineering" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="maxCapacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Capacity (%)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="100" 
                      min="1" 
                      max="100"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skills"
              render={() => (
                <FormItem>
                  <FormLabel>Skills</FormLabel>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a skill..."
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
                {isLoading ? 'Saving...' : (engineer ? 'Update Engineer' : 'Create Engineer')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}