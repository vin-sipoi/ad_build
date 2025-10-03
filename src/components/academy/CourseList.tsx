// Academy course list with modal and roadmap navigation
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { CourseModal } from './CourseModal';
import { Course } from '@/types/academy';
import { useAuth } from '@/hooks/useAuth';

export function CourseList() {
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStartingCourse, setIsStartingCourse] = useState(false);


  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchEnrolledCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    let filtered = courses;

    // Filter out enrolled courses
    filtered = filtered.filter(course => {
      const courseId = course._id?.toString() || course.id;
      return !enrolledCourseIds.has(courseId);
    });

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTrack) {
      // Filter by track - you can modify this logic based on how tracks are stored in your course data
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(selectedTrack.toLowerCase()) ||
        course.description.toLowerCase().includes(selectedTrack.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedTrack, enrolledCourseIds]);

  const fetchEnrolledCourses = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.uid}/progress`);
      if (response.ok) {
        const data = await response.json();
        const enrolledIds = new Set<string>(
          (data.courses || []).map((c: { courseId: string }) => c.courseId)
        );
        setEnrolledCourseIds(enrolledIds);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isStartingCourse) return;
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  const handleGetStarted = async () => {
    if (!selectedCourse) return;

    setIsStartingCourse(true);
    try {
      // Get Firebase auth token
      const { auth } = await import('@/lib/firebase');
      const { getIdToken } = await import('firebase/auth');
      const user = auth.currentUser;
      
      if (!user) {
        console.error('User not authenticated');
        return;
      }

      const idToken = await getIdToken(user);

      const response = await fetch('/api/user/my-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ courseId: selectedCourse.id || selectedCourse._id }),
      });

      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
      } catch {
        // ignore body parse errors
      }

      if (!response.ok) {
        console.error('Failed to add course to My Journey', responseBody);
        return;
      }

      // Refresh enrolled courses to update the list
      await fetchEnrolledCourses();

      setIsModalOpen(false);
      router.push(`/dashboard/academy/${selectedCourse.id || selectedCourse._id}`);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error starting course:', error);
    } finally {
      setIsStartingCourse(false);
    }
  };



  const tracks = ['DeFi', 'Smart Contracts', 'AI', 'Web3', 'NFTs', 'GameFi'];

  if (loading) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Search skeleton */}
        <div className="w-full max-w-md mx-auto sm:mx-0">
          <div className="h-10 md:h-11 bg-muted animate-pulse rounded-md" />
        </div>
        
        {/* Filter skeleton */}
        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-7 w-16 md:h-8 md:w-20 bg-muted animate-pulse rounded-full" />
          ))}
        </div>
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 md:h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto sm:mx-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full h-10 md:h-11"
        />
      </div>

      {/* Track Filter */}
      <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
        <Badge
          variant={selectedTrack === '' ? 'default' : 'secondary'}
          className="cursor-pointer touch-manipulation px-3 py-1.5"
          onClick={() => setSelectedTrack('')}
        >
          All Tracks
        </Badge>
        {tracks.map((track) => (
          <Badge
            key={track}
            variant={selectedTrack === track ? 'default' : 'secondary'}
            className="cursor-pointer touch-manipulation px-3 py-1.5"
            onClick={() => setSelectedTrack(track)}
          >
            {track}
          </Badge>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course._id ?? course.id}
            course={course}
            onSelect={handleSelectCourse}
          />
        ))}
      </div>

      {/* No results */}
      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-8 md:py-12">
          <p className="text-muted-foreground text-sm md:text-base">No courses found matching your criteria.</p>
        </div>
      )}

      {selectedCourse && (
        <CourseModal
          course={selectedCourse}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onGetStarted={handleGetStarted}
          isProcessing={isStartingCourse}
        />
      )}

    </div>
  );
}
