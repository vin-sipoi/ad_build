import { NextRequest, NextResponse } from 'next/server';

// Types for our role system
export type UserRole = 'learner' | 'mentor' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
}

// Check if user has required role
export function hasRole(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some(role => requiredRoles.includes(role));
}

// Check if user has admin access
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ['admin']);
}

// Check if user has mentor access
export function isMentor(user: AuthUser | null): boolean {
  return hasRole(user, ['mentor', 'admin']);
}

// Middleware function to protect API routes
export function requireRole(user: AuthUser | null, requiredRoles: UserRole[]) {
  if (!user) {
    throw new Error('Authentication required');
  }
  
  if (!hasRole(user, requiredRoles)) {
    throw new Error('Insufficient permissions');
  }
}

// Create error response for unauthorized access
export function createUnauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message, success: false },
    { status: 403 }
  );
}

// Create authentication required response
export function createAuthRequiredResponse(message: string = 'Authentication required') {
  return NextResponse.json(
    { error: message, success: false },
    { status: 401 }
  );
}

// Higher-order function to protect API routes
export function withAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>,
  requiredRoles: UserRole[] = ['learner']
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // TODO: Implement session/JWT validation here
      // For now, using a mock user - replace with actual auth
      const user = await getUserFromRequest();
      
      if (!user) {
        return createAuthRequiredResponse();
      }

      requireRole(user, requiredRoles);
      
      return await handler(req, user);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage === 'Authentication required') {
        return createAuthRequiredResponse();
      }
      if (errorMessage === 'Insufficient permissions') {
        return createUnauthorizedResponse();
      }
      
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error', success: false },
        { status: 500 }
      );
    }
  };
}

// Mock function - replace with actual session/JWT validation
async function getUserFromRequest(): Promise<AuthUser | null> {
  // TODO: Implement actual authentication
  // This could be:
  // - NextAuth session validation
  // - JWT token verification
  // - Custom session management
  
  // For development/testing, return a mock admin user
  return {
    id: '507f1f77bcf86cd799439011',
    email: 'admin@adamur.com',
    name: 'Admin User',
    roles: ['admin', 'mentor', 'learner']
  };
}
