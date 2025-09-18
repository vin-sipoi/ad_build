// Academy course list with modal and roadmap navigation
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { Course } from '@/types/academy';

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');


  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDifficulty) {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedDifficulty]);

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



  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Search skeleton */}
        <div className="h-10 bg-muted animate-pulse rounded-md" />
        
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedDifficulty === '' ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => setSelectedDifficulty('')}
          >
            All Levels
          </Badge>
          {difficulties.map((difficulty) => (
            <Badge
              key={difficulty}
              variant={selectedDifficulty === difficulty ? 'default' : 'secondary'}
              className="cursor-pointer"
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty}
            </Badge>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard 
            key={course._id} 
            course={course}
          />
        ))}
      </div>

      {/* No results */}
      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No courses found matching your criteria.</p>
        </div>
      )}


    </div>
  );
}
