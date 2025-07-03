import { useEffect, useState } from 'react';
import { User, Mail, Building, Award, Briefcase, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { engineersAPI } from '../services/api';
import type { Engineer } from '../types';
import { useAuthStore } from '../store/authStore';
import { EngineerForm } from '../components/EngineerForm';
import { useToast } from '@/hooks/use-toast';

export function Profile() {
  const { user } = useAuthStore();
  const [engineer, setEngineer] = useState<Engineer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user?.email) {
          const engineers = await engineersAPI.getAll();
          const userEngineer = engineers.find(e => e.email === user.email);
          setEngineer(userEngineer || null);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your profile. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.email, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!engineer) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">Profile Not Found</p>
            <p className="text-muted-foreground">
              Your engineer profile hasn't been created yet. Please contact your manager to set up your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
        <Button onClick={() => setShowEditForm(true)} className="w-fit">
          <Settings className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Edit Profile</span>
          <span className="sm:hidden">Edit</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your personal and professional details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>Full Name</span>
                </div>
                <p className="text-base sm:text-lg font-medium break-words">{engineer.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span>Email Address</span>
                </div>
                <p className="text-base sm:text-lg font-medium break-all">{engineer.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="w-4 h-4 flex-shrink-0" />
                  <span>Department</span>
                </div>
                <p className="text-base sm:text-lg font-medium break-words">{engineer.department}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Award className="w-4 h-4 flex-shrink-0" />
                  <span>Seniority Level</span>
                </div>
                <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
                  {engineer.seniority.charAt(0).toUpperCase() + engineer.seniority.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span>Max Capacity</span>
                </div>
                <p className="text-base sm:text-lg font-medium">{engineer.maxCapacity}%</p>
              </div>
            </div>

            <hr className="my-4" />

            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-medium">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {engineer.skills.map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs sm:text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>
              Your current work overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Available Capacity</span>
                <span className="font-medium">{engineer.availableCapacity || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${engineer.availableCapacity || 0}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Current Utilization</span>
                <span className="font-medium">
                  {Math.round(((engineer.maxCapacity - (engineer.availableCapacity || 0)) / engineer.maxCapacity) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.round(((engineer.maxCapacity - (engineer.availableCapacity || 0)) / engineer.maxCapacity) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <hr className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Total Skills</span>
                <span className="font-medium">{engineer.skills.length}</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">Profile Status</span>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Tips</CardTitle>
          <CardDescription>
            Keep your profile updated for better project matching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600 text-sm">✓ Keep Skills Current</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Regularly update your skills to match new technologies you've learned
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600 text-sm">💡 Update Capacity</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Adjust your max capacity based on your current availability and commitments
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600 text-sm">🎯 Accurate Seniority</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Ensure your seniority level reflects your current experience and responsibilities
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600 text-sm">📧 Contact Info</h4>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Keep your contact information up to date for project communications
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <EngineerForm
        engineer={engineer}
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSuccess={() => {
          // Refresh profile data after successful update
          const fetchProfile = async () => {
            try {
              if (user?.email) {
                const engineers = await engineersAPI.getAll();
                const userEngineer = engineers.find(e => e.email === user.email);
                setEngineer(userEngineer || null);
                toast({
                  title: "Profile updated",
                  description: "Your profile has been updated successfully.",
                });
              }
            } catch (error) {
              console.error('Failed to refresh profile:', error);
            }
          };
          fetchProfile();
        }}
      />
    </div>
  );
}