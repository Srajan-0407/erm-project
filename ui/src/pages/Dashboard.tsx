import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { engineersAPI, projectsAPI, assignmentsAPI } from '../services/api';
import type { Engineer, Project, Assignment } from '../types';
import { useAuthStore } from '../store/authStore';

interface DashboardStats {
  totalEngineers: number;
  availableEngineers: number;
  activeProjects: number;
  totalAssignments: number;
}

export function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats>({
    totalEngineers: 0,
    availableEngineers: 0,
    activeProjects: 0,
    totalAssignments: 0,
  });
  const [engineers, setEngineers] = useState<Engineer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  // const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [myUtilization, setMyUtilization] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [engineersData, projectsData, assignmentsData] = await Promise.all([
          engineersAPI.getAll({ available: true }),
          projectsAPI.getAll({ status: 'active' }),
          assignmentsAPI.getAll(),
        ]);

        const allEngineers = await engineersAPI.getAll();
        
        setEngineers(allEngineers);
        setProjects(projectsData);
        setAssignments(assignmentsData);
        
        // Calculate stats based on role
        if (user?.role === 'engineer') {
          const userAssignments = assignmentsData.filter(a => a.engineer.email === user.email);
          const userActiveAssignments = userAssignments.filter(a => a.status === 'active');
          const userPendingAssignments = userAssignments.filter(a => a.status === 'pending');
          const userProjectsData = projectsData.filter(project => 
            assignmentsData.some(assignment => 
              assignment.project._id === project._id && 
              assignment.engineer.email === user.email
            )
          );
          
          // Calculate personal utilization
          const currentEngineer = allEngineers.find(e => e.email === user.email);
          let personalUtilization = 0;
          if (currentEngineer) {
            const totalAllocated = userActiveAssignments.reduce(
              (sum, assignment) => sum + assignment.allocationPercentage, 0
            );
            personalUtilization = (totalAllocated / currentEngineer.maxCapacity) * 100;
          }
          
          setMyAssignments(userAssignments);
          // setMyProjects(userProjectsData);
          setMyUtilization(personalUtilization);
          
          setStats({
            totalEngineers: userAssignments.length, // Total assignments for engineer
            availableEngineers: userActiveAssignments.length, // Active assignments
            activeProjects: userProjectsData.length, // My projects
            totalAssignments: userPendingAssignments.length, // Pending assignments
          });
        } else {
          setStats({
            totalEngineers: allEngineers.length,
            availableEngineers: engineersData.length,
            activeProjects: projectsData.length,
            totalAssignments: assignmentsData.filter(a => a.status === 'active').length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

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

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant={user?.role === 'manager' ? 'default' : 'secondary'} className="text-xs sm:text-sm w-fit">
          {user?.role === 'manager' ? 'Manager View' : 'Engineer View'}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {user?.role === 'engineer' ? 'Total Assignments' : 'Total Engineers'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalEngineers}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'engineer' 
                ? `${stats.availableEngineers} active` 
                : `${stats.availableEngineers} available`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {user?.role === 'engineer' ? 'My Projects' : 'Active Projects'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.activeProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {user?.role === 'engineer' ? 'Pending Tasks' : 'Active Assignments'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'engineer' ? 'Awaiting start' : 'Currently active'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">
              {user?.role === 'engineer' ? 'My Utilization' : 'Team Utilization'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {user?.role === 'engineer' 
                ? Math.round(myUtilization)
                : engineers.length > 0 
                  ? Math.round((stats.totalAssignments / stats.totalEngineers) * 100) 
                  : 0
              }%
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.role === 'engineer' ? 'Current workload' : 'Average capacity'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {user?.role === 'manager' ? (
          <>
            {/* Team Capacity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Team Capacity</CardTitle>
                <CardDescription className="text-sm">Current utilization by engineer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {engineers.slice(0, 5).map((engineer) => {
                  const utilization = getUtilization(engineer);
                  return (
                    <div key={engineer._id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate pr-2">{engineer.name}</span>
                        <span className="text-muted-foreground flex-shrink-0">
                          {Math.round(utilization)}%
                        </span>
                      </div>
                      <Progress value={utilization} className="h-2" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Active Projects</CardTitle>
                <CardDescription className="text-sm">Currently running projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <div key={project._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{project.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {project.requiredSkills.slice(0, 3).join(', ')}
                      </p>
                    </div>
                    <Badge 
                      variant={
                        project.priority === 'high' || project.priority === 'critical' 
                          ? 'destructive' 
                          : 'secondary'
                      }
                      className="text-xs w-fit"
                    >
                      {project.priority}
                    </Badge>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No active projects
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* My Current Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">My Current Assignments</CardTitle>
                <CardDescription className="text-sm">Projects you're currently working on</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {myAssignments.filter(a => a.status === 'active').slice(0, 5).map((assignment) => (
                  <div key={assignment._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{assignment.project.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {assignment.role} • {assignment.allocationPercentage}% allocated
                      </p>
                    </div>
                    <Badge variant="default" className="text-xs w-fit">
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
                {myAssignments.filter(a => a.status === 'active').length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No active assignments
                  </p>
                )}
              </CardContent>
            </Card>

            {/* My Upcoming Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Upcoming Assignments</CardTitle>
                <CardDescription className="text-sm">Projects starting soon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {myAssignments.filter(a => a.status === 'pending').slice(0, 5).map((assignment) => (
                  <div key={assignment._id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm sm:text-base truncate">{assignment.project.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Starts {new Date(assignment.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs w-fit">
                      {assignment.status}
                    </Badge>
                  </div>
                ))}
                {myAssignments.filter(a => a.status === 'pending').length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No upcoming assignments
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}