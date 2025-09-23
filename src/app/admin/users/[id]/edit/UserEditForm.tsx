'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { updateUserProfile } from '../../actions';
import { IUser } from '../../../types';

interface UserEditFormProps {
  user: IUser;
}

const availableRoles = [
  { id: 'admin', label: 'Administrator', description: 'Full system access' },
  { id: 'instructor', label: 'Instructor', description: 'Can create and manage courses' },
  { id: 'learner', label: 'Learner', description: 'Can access courses and lessons' },
  { id: 'mentor', label: 'Mentor', description: 'Can guide and support learners' },
];

export function UserEditForm({ user }: UserEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    roles: user.roles || [],
    profile: {
      bio: user.profile?.bio || '',
      avatarUrl: user.profile?.avatarUrl || '',
    }
  });

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleId]
        : prev.roles.filter(r => r !== roleId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      alert('Email is required');
      return;
    }

    if (formData.roles.length === 0) {
      alert('At least one role must be selected');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await updateUserProfile(user._id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        roles: formData.roles,
        profile: {
          bio: formData.profile.bio.trim() || undefined,
          avatarUrl: formData.profile.avatarUrl.trim() || undefined,
        }
      });
      
      if (result.success) {
        alert('User updated successfully!');
        router.push(`/admin/users/${user._id}`);
        router.refresh();
      } else {
        alert('Failed to update user: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error updating user: ' + String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Update the user&apos;s basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                required
              />
            </div>

            <div>
              <Label htmlFor="avatarUrl">Avatar URL</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={formData.profile.avatarUrl}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, avatarUrl: e.target.value }
                }))}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.profile.bio}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, bio: e.target.value }
                }))}
                placeholder="Tell us about this user..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Roles & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              Assign roles to control what this user can access and do
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Current Roles</Label>
              <div className="flex gap-2 flex-wrap mt-2 mb-4">
                {formData.roles.map(role => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Available Roles</Label>
              {availableRoles.map(role => (
                <div key={role.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={role.id}
                    checked={formData.roles.includes(role.id)}
                    onCheckedChange={(checked) => handleRoleChange(role.id, checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={role.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {role.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Updating User...' : 'Update User'}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => router.push(`/admin/users/${user._id}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
