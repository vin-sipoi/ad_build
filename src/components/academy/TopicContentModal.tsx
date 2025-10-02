"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Topic, Subtopic } from "@/types/academy";

const resolveSubtopics = (topic: Topic): Subtopic[] =>
  topic.subtopics ?? (topic as unknown as { lessons?: Subtopic[] }).lessons ?? [];

interface TopicContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: Topic;
  allTopics: Topic[];
  onTopicChange: (topicId: string) => void;
  courseId: string;
}

export function TopicContentModal({
  isOpen,
  onClose,
  topic,
  allTopics,
  onTopicChange,
  courseId,
}: TopicContentModalProps) {
  const [currentSubtopicIndex, setCurrentSubtopicIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number | null>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const subtopics = useMemo(() => resolveSubtopics(topic), [topic]);

  useEffect(() => {
    setCurrentSubtopicIndex(0);
    const initialCompleted = new Set(
      subtopics.filter((subtopic) => subtopic.isCompleted).map((subtopic) => subtopic.id)
    );
    setCompletedLessons(initialCompleted);
    setQuizAnswers({});
    setQuizResult(null);
    setQuizError(null);
  }, [topic, subtopics]);

  const currentSubtopic = subtopics[currentSubtopicIndex];

  useEffect(() => {
    setQuizAnswers({});
    setQuizResult(null);
    setQuizError(null);
  }, [currentSubtopic?.id]);

  const completedCount = useMemo(
    () =>
      subtopics.filter(
        (subtopic) => completedLessons.has(subtopic.id) || subtopic.isCompleted
      ).length,
    [subtopics, completedLessons]
  );

  const progress = subtopics.length > 0 ? (completedCount / subtopics.length) * 100 : 0;

  const currentTopicIndex = allTopics.findIndex((t) => t.id === topic.id);
  const canGoPrevTopic = currentTopicIndex > 0;
  const canGoNextTopic = currentTopicIndex < allTopics.length - 1;

  const handlePrevSubtopic = () => {
    if (currentSubtopicIndex > 0) {
      setCurrentSubtopicIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (canGoPrevTopic) {
      const prevTopic = allTopics[currentTopicIndex - 1];
      onTopicChange(prevTopic.id);
    }
  };

  const handleNextSubtopic = () => {
    if (currentSubtopicIndex < subtopics.length - 1) {
      setCurrentSubtopicIndex((index) => Math.min(index + 1, subtopics.length - 1));
      return;
    }

    if (canGoNextTopic) {
      const nextTopic = allTopics[currentTopicIndex + 1];
      onTopicChange(nextTopic.id);
    }
  };

  const getContentTypeIcon = (type?: string) => {
    switch (type) {
      case "video":
        return <Play className="h-4 w-4" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmittingQuiz || quizResult?.passed) {
      return;
    }

    setQuizAnswers((previous) => ({
      ...previous,
      [questionIndex]: optionIndex,
    }));
  };

  const handleQuizSubmit = async () => {
    if (!currentSubtopic || !currentSubtopic.quiz) {
      return;
    }

    const quiz = currentSubtopic.quiz;
    const unanswered = quiz.questions.some(
      (_, index) => quizAnswers[index] === undefined || quizAnswers[index] === null
    );

    if (unanswered) {
      setQuizError("Please answer all questions before submitting.");
      return;
    }

    const correctCount = quiz.questions.reduce((total, question, index) => {
      return total + (quizAnswers[index] === question.correctAnswer ? 1 : 0);
    }, 0);

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    setQuizError(null);
    setQuizResult({ score, passed });
    setIsSubmittingQuiz(true);

    try {
      const response = await fetch("/api/progress/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          topicId: topic.id,
          lessonId: currentSubtopic.id,
          status: passed ? "completed" : "in-progress",
          quizScore: score,
          quizPassed: passed,
          answers: quiz.questions.map((question, index) => ({
            question: question.question,
            selectedOption: quizAnswers[index],
            isCorrect: quizAnswers[index] === question.correctAnswer,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || "Failed to save progress");
      }

      if (passed) {
        setCompletedLessons((previous) => {
          const updated = new Set(previous);
          updated.add(currentSubtopic.id);
          return updated;
        });
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      setQuizError(
        error instanceof Error ? error.message : "Failed to submit quiz. Please try again."
      );
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizResult(null);
    setQuizError(null);
  };

  const estimatedTimeLabel = currentSubtopic
    ? currentSubtopic.estimatedTime ||
      (typeof (currentSubtopic as { duration?: number }).duration === "number"
        ? `${(currentSubtopic as { duration?: number }).duration} min`
        : undefined)
    : undefined;

  const content = typeof currentSubtopic?.content === "string" ? currentSubtopic.content : "";

  const currentQuiz = currentSubtopic?.quiz;
  const quizDisabled = isSubmittingQuiz || (quizResult?.passed ?? false);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{topic.title}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {subtopics.length > 0
                  ? `${currentSubtopicIndex + 1} of ${subtopics.length}`
                  : "No lessons yet"}
                {topic.estimatedTime ? ` • ${topic.estimatedTime}` : ""}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">Progress</div>
              <div className="text-xs text-muted-foreground">{Math.round(progress)}%</div>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-2" />
        </DialogHeader>

        <div className="mt-6">
          {currentSubtopic ? (
            <div className="mb-6 space-y-4 rounded-lg bg-muted/30 p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-primary/10 p-2">{getContentTypeIcon(currentSubtopic.type)}</div>
                <div>
                  <h3 className="font-semibold">{currentSubtopic.title}</h3>
                  {currentSubtopic.description && (
                    <p className="text-sm text-muted-foreground">{currentSubtopic.description}</p>
                  )}
                </div>
                {estimatedTimeLabel && (
                  <Badge variant="outline" className="ml-auto">
                    {estimatedTimeLabel}
                  </Badge>
                )}
              </div>

              {content ? (
                <div className="prose prose-sm max-w-none whitespace-pre-wrap text-muted-foreground">
                  {content}
                </div>
              ) : (
                <p className="text-sm italic text-muted-foreground">
                  No content available for this lesson yet.
                </p>
              )}

              {currentSubtopic.type === "video" && (
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm text-muted-foreground">Watch the lesson video:</p>
                  {currentSubtopic.videoUrl ? (
                    <Button asChild className="mt-3" variant="secondary">
                      <a
                        href={currentSubtopic.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open video in new tab
                      </a>
                    </Button>
                  ) : (
                    <p className="text-xs text-muted-foreground">Video link coming soon.</p>
                  )}
                </div>
              )}

              {currentSubtopic.type === "quiz" && currentQuiz && (
                <div className="space-y-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                  {quizError && (
                    <Alert variant="destructive">
                      <AlertTitle>Submission issue</AlertTitle>
                      <AlertDescription>{quizError}</AlertDescription>
                    </Alert>
                  )}

                  {quizResult && (
                    <Alert variant={quizResult.passed ? "default" : "destructive"}>
                      <AlertTitle className="flex items-center gap-2">
                        {quizResult.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        {quizResult.passed ? "Great job!" : "Keep trying"}
                      </AlertTitle>
                      <AlertDescription>
                        You scored {quizResult.score}% • Passing score: {currentQuiz.passingScore}%
                      </AlertDescription>
                    </Alert>
                  )}

                  {currentQuiz.questions.map((question, questionIndex) => {
                    const selectedOption = quizAnswers[questionIndex];
                    return (
                      <div key={questionIndex} className="space-y-3 rounded-lg border border-border bg-background p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Question {questionIndex + 1}</span>
                          {quizResult && selectedOption !== undefined && selectedOption !== null && (
                            <span>
                              {selectedOption === question.correctAnswer ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{question.question}</p>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const isSelected = selectedOption === optionIndex;
                            const isCorrect = optionIndex === question.correctAnswer;
                            const highlightCorrect = quizResult?.passed && isCorrect;
                            const highlightWrongSelection =
                              quizResult && !quizResult.passed && isSelected && !isCorrect;

                            const optionClasses = [
                              "w-full rounded-md border p-3 text-left transition",
                              isSelected ? "border-primary bg-primary/10" : "border-border bg-background",
                              highlightCorrect ? "border-green-500 bg-green-500/10" : "",
                              highlightWrongSelection ? "border-destructive bg-destructive/10" : "",
                            ]
                              .filter(Boolean)
                              .join(" ");

                            return (
                              <button
                                key={optionIndex}
                                type="button"
                                className={optionClasses}
                                onClick={() => handleSelectOption(questionIndex, optionIndex)}
                                disabled={quizDisabled}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                        {quizResult && question.explanation && (
                          <p className="text-xs text-muted-foreground">
                            Explanation: {question.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  <div className="flex flex-wrap gap-3">
                    <Button
                      type="button"
                      onClick={handleQuizSubmit}
                      disabled={quizDisabled || isSubmittingQuiz}
                    >
                      {quizResult?.passed
                        ? "Quiz completed"
                        : isSubmittingQuiz
                        ? "Submitting..."
                        : "Submit quiz"}
                    </Button>
                    {quizResult && !quizResult.passed && (
                      <Button type="button" variant="ghost" onClick={handleResetQuiz} disabled={isSubmittingQuiz}>
                        Try again
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/30 p-8 text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Content coming soon</h3>
              <p className="text-muted-foreground">
                Lessons for this topic are being prepared. Check back soon for updates!
              </p>
            </div>
          )}

          {/* Lesson Navigation */}
          <div className="sticky bottom-0 left-0 right-0 flex items-center justify-between border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 mt-6 -mb-6 -mx-6">
            <Button
              variant="outline"
              onClick={handlePrevSubtopic}
              disabled={currentSubtopicIndex === 0 && !canGoPrevTopic}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {subtopics.map((subtopic, index) => {
                const isActive = index === currentSubtopicIndex;
                const isCompleted = completedLessons.has(subtopic.id) || subtopic.isCompleted;
                const dotClasses = [
                  "h-2 w-2 rounded-full transition cursor-pointer hover:scale-125",
                  isActive ? "bg-primary scale-125" : isCompleted ? "bg-green-500" : "bg-muted",
                ].join(" ");

                return (
                  <button
                    key={subtopic.id}
                    type="button"
                    className={dotClasses}
                    onClick={() => setCurrentSubtopicIndex(index)}
                    aria-label={`Go to lesson ${index + 1}`}
                  />
                );
              })}
            </div>

            <Button
              onClick={handleNextSubtopic}
              disabled={currentSubtopicIndex === subtopics.length - 1 && !canGoNextTopic}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
