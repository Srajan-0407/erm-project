import { useEffect, useState } from 'react';
import { Plus, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectsAPI, assignmentsAPI } from '../services/api';
import type { Project, Assignment } from '../types';
import { useAuthStore } from '../store/authStore';
import { ProjectForm } from '../components/ProjectForm';
import { AssignmentForm } from '../components/AssignmentForm';
import { format } from 'date-fns';

export function Projects() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, assignmentsData] = await Promise.all([
          projectsAPI.getAll(),
          assignmentsAPI.getAll(),
        ]);
        setProjects(projectsData);
        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'secondary';
      case 'active': return 'default';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  // Filter projects based on role
  const filteredProjects = user?.role === 'engineer' 
    ? projects.filter(project => 
        assignments.some(assignment => 
          assignment.project._id === project._id && 
          assignment.engineer.email === user.email
        )
      )
    : projects;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
        {user?.role === 'manager' && (
          <Button onClick={() => setShowProjectForm(true)} className="w-fit">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProjects.map((project) => (
          <Card key={project._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {project.description.length > 100
                      ? `${project.description.substring(0, 100)}...`
                      : project.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col space-y-1">
                  <Badge variant={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge variant={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">Start Date</p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {format(new Date(project.startDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">End Date</p>
                    <p className="text-muted-foreground text-xs sm:text-sm">
                      {format(new Date(project.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Team Size: {project.teamSize}</p>
                </div>
              </div>

              <div>
                <p className="font-medium text-sm mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                  {project.requiredSkills.slice(0, 2).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {project.requiredSkills.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.requiredSkills.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-sm">
                <p className="font-medium">Project Manager</p>
                <p className="text-muted-foreground truncate">{project.manager.name}</p>
              </div>

              {user?.role === 'manager' && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowProjectForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedProjectId(project._id);
                      setShowAssignmentForm(true);
                    }}
                  >
                    <span className="hidden sm:inline">Assign Team</span>
                    <span className="sm:hidden">Assign</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No projects found.</p>
          </CardContent>
        </Card>
      )}

      <ProjectForm
        project={selectedProject}
        open={showProjectForm}
        onOpenChange={(open) => {
          setShowProjectForm(open);
          if (!open) setSelectedProject(undefined);
        }}
        onSuccess={() => {
          const refetch = async () => {
            try {
              const [projectsData, assignmentsData] = await Promise.all([
                projectsAPI.getAll(),
                assignmentsAPI.getAll(),
              ]);
              setProjects(projectsData);
              setAssignments(assignmentsData);
            } catch (error) {
              console.error('Failed to fetch data:', error);
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
              const [projectsData, assignmentsData] = await Promise.all([
                projectsAPI.getAll(),
                assignmentsAPI.getAll(),
              ]);
              setProjects(projectsData);
              setAssignments(assignmentsData);
            } catch (error) {
              console.error('Failed to fetch data:', error);
            }
          };
          refetch();
        }}
        preselectedProject={selectedProjectId}
      />
    </div>
  );
}