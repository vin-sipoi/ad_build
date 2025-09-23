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
import { createUser } from '../actions';

const availableRoles = [
  { id: 'admin', label: 'Administrator', description: 'Full system access' },
  { id: 'instructor', label: 'Instructor', description: 'Can create and manage courses' },
  { id: 'learner', label: 'Learner', description: 'Can access courses and lessons' },
  { id: 'mentor', label: 'Mentor', description: 'Can guide and support learners' },
];

export function NewUserForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: ['learner'], // Default role
    profile: {
      bio: '',
      avatarUrl: '',
      credits: 100, // Default starting credits
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

    if (!formData.password.trim()) {
      alert('Password is required');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (formData.roles.length === 0) {
      alert('At least one role must be selected');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        roles: formData.roles,
        profile: {
          bio: formData.profile.bio.trim() || undefined,
          avatarUrl: formData.profile.avatarUrl.trim() || undefined,
          credits: formData.profile.credits,
        }
      });
      
      if (result.success) {
        alert('User created successfully!');
        router.push('/admin/users');
        router.refresh();
      } else {
        alert('Failed to create user: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error creating user: ' + String(error));
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
              Enter the new user&apos;s basic profile information
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
              <Label htmlFor="password">Temporary Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Enter temporary password"
                required
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                User should change this on first login
              </p>
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

        {/* Roles & Credits */}
        <Card>
          <CardHeader>
            <CardTitle>Roles & Credits</CardTitle>
            <CardDescription>
              Assign roles and set starting credits for the new user
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="credits">Starting Credits</Label>
              <Input
                id="credits"
                type="number"
                min="0"
                value={formData.profile.credits}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  profile: { ...prev.profile, credits: parseInt(e.target.value) || 0 }
                }))}
                placeholder="100"
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default starting credits for new user
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Selected Roles</Label>
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
                    onCheckedChange={(checked: boolean) => handleRoleChange(role.id, checked)}
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
          {isSubmitting ? 'Creating User...' : 'Create User'}
        </Button>
        <Button 
          type="button" 
          variant="secondary" 
          onClick={() => router.push('/admin/users')}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
