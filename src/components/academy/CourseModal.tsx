'use client';
import { X, Play, Clock, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types/academy';

interface CourseModalProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onGetStarted: () => void;
  isProcessing?: boolean;
}

export function CourseModal({ course, isOpen, onClose, onGetStarted, isProcessing = false }: CourseModalProps) {
  const summaryText = course.summary ?? course.description;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => {
          if (!isProcessing) {
            onClose();
          }
        }}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-card border rounded-lg shadow-2xl">
        {/* Header */}
        <div className="relative rounded-t-lg bg-muted/30 p-6">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
            onClick={() => {
              if (!isProcessing) {
                onClose();
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Course Info */}
          <div className="space-y-2 pr-10">
            <Badge variant="secondary" className="w-fit">
              {course.difficulty}
            </Badge>
            <h2 className="text-xl font-bold text-foreground">{course.title}</h2>
            <p className="text-sm text-muted-foreground">{course.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium">{course.duration}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium">{course.enrolledCount}</div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
            <div className="text-center">
              <Trophy className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-sm font-medium">{course.creditsReward} credits</div>
              <div className="text-xs text-muted-foreground">Reward</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-3">Course Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {summaryText}
            </p>
          </div>

          {/* Modules Preview */}
          <div className="mb-6">
            <div className="space-y-2">
              {course.modules.slice(0, 3).map((module, index) => (
                <div key={module.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{module.title}</div>
                    <div className="text-sm text-muted-foreground">{module.topics.length} topics</div>
                  </div>
                </div>
              ))}
              {course.modules.length > 3 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  +{course.modules.length - 3} more modules
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t">
          <div className="text-sm text-muted-foreground">
            ⭐ {course.rating} ({course.enrolledCount} students)
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (!isProcessing) {
                  onClose();
                }
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={onGetStarted} disabled={isProcessing}>
              <Play className="h-4 w-4 mr-2" />
              {isProcessing ? 'Starting...' : 'Get Started'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
