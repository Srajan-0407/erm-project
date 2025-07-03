import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { engineersAPI, assignmentsAPI } from '../services/api';
import type { Engineer, Assignment } from '../types';
import { useAuthStore } from '../store/authStore';
import { EngineerForm } from '../components/EngineerForm';
import { AssignmentForm } from '../components/AssignmentForm';

export function Engineers() {
  const { user } = useAuthStore();
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState('all-skills');
  const [seniorityFilter, setSeniorityFilter] = useState('all-levels');
  const [showEngineerForm, setShowEngineerForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState<Engineer | undefined>();
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [engineersData, assignmentsData] = await Promise.all([
          engineersAPI.getAll(),
          assignmentsAPI.getAll(),
        ]);
        setEngineers(engineersData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Failed to fetch engineers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getUtilization = (engineer: Engineer) => {
    const activeAssignments = assignments.filter(
      a => a.engineer._id === engineer._id && a.status === 'active'
    );
    const totalAllocated = activeAssignments.reduce(
      (sum, assignment) => sum + assignment.allocationPercentage,
      0
    );
    return (totalAllocated / engineer.maxCapacity) * 100;
  };

  const getAvailableCapacity = (engineer: Engineer) => {
    const activeAssignments = assignments.filter(
      a => a.engineer._id === engineer._id && a.status === 'active'
    );
    const totalAllocated = activeAssignments.reduce(
      (sum, assignment) => sum + assignment.allocationPercentage,
      0
    );
    return engineer.maxCapacity - totalAllocated;
  };

  const filteredEngineers = engineers.filter(engineer => {
    const matchesSearch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engineer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = !skillFilter || skillFilter === 'all-skills' || engineer.skills.includes(skillFilter);
    const matchesSeniority = !seniorityFilter || seniorityFilter === 'all-levels' || engineer.seniority === seniorityFilter;
    
    return matchesSearch && matchesSkill && matchesSeniority;
  });

  const allSkills = [...new Set(engineers.flatMap(e => e.skills))];
  const seniorities = ['junior', 'mid', 'senior', 'lead', 'principal'];

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Engineers</h1>
        {user?.role === 'manager' && (
          <Button onClick={() => setShowEngineerForm(true)} className="w-fit">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Add Engineer</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search engineers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-skills">All skills</SelectItem>
                {allSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={seniorityFilter} onValueChange={setSeniorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by seniority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-levels">All levels</SelectItem>
                {seniorities.map(level => (
                  <SelectItem key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setSkillFilter('all-skills');
                setSeniorityFilter('all-levels');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Engineers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredEngineers.map((engineer) => {
          const utilization = getUtilization(engineer);
          const availableCapacity = getAvailableCapacity(engineer);
          const isAvailable = availableCapacity > 0;

          return (
            <Card key={engineer._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{engineer.name}</CardTitle>
                    <CardDescription>{engineer.email}</CardDescription>
                  </div>
                  <Badge variant={isAvailable ? 'default' : 'secondary'}>
                    {isAvailable ? 'Available' : 'Fully Allocated'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="font-medium">Seniority</p>
                    <p className="text-muted-foreground capitalize">{engineer.seniority}</p>
                  </div>
                  <div>
                    <p className="font-medium">Department</p>
                    <p className="text-muted-foreground truncate">{engineer.department}</p>
                  </div>
                </div>

                <div>
                  <p className="font-medium text-sm mb-2">Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {engineer.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {engineer.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{engineer.skills.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Capacity Utilization</span>
                    <span className="text-muted-foreground">
                      {Math.round(utilization)}%
                    </span>
                  </div>
                  <Progress value={utilization} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableCapacity}% available
                  </p>
                </div>

                {user?.role === 'manager' && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedEngineer(engineer);
                        setShowEngineerForm(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedEngineerId(engineer._id);
                        setShowAssignmentForm(true);
                      }}
                    >
                      Assign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEngineers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No engineers found matching your filters.</p>
          </CardContent>
        </Card>
      )}

      <EngineerForm
        engineer={selectedEngineer}
        open={showEngineerForm}
        onOpenChange={(open) => {
          setShowEngineerForm(open);
          if (!open) setSelectedEngineer(undefined);
        }}
        onSuccess={() => {
          const refetch = async () => {
            try {
              const [engineersData, assignmentsData] = await Promise.all([
                engineersAPI.getAll(),
                assignmentsAPI.getAll(),
              ]);
              setEngineers(engineersData);
              setAssignments(assignmentsData);
            } catch (error) {
              console.error('Failed to fetch engineers:', error);
            }
          };
          refetch();
        }}
      />

      <AssignmentForm
        open={showAssignmentForm}
        onOpenChange={setShowAssignmentForm}
        onSuccess={() => {
          const refetch = async () => {
            try {
              const [engineersData, assignmentsData] = await Promise.all([
                engineersAPI.getAll(),
                assignmentsAPI.getAll(),
              ]);
              setEngineers(engineersData);
              setAssignments(assignmentsData);
            } catch (error) {
              console.error('Failed to fetch engineers:', error);
            }
          };
          refetch();
        }}
        preselectedEngineer={selectedEngineerId}
      />
    </div>
  );
}