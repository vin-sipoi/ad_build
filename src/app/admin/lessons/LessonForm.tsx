"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { createLesson, updateLesson } from "./actions";
import { ILesson } from "../types";
import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

const baseSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  topicId: z.string().min(1, "Please select a topic."),
  type: z.enum(["reading", "video", "quiz"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  estimatedMinutes: z
    .number()
    .min(0, "Estimated minutes must be a positive number."),
  order: z.number().min(0, "Order must be a positive number."),
  status: z.enum(["draft", "published"]),
  slug: z.string().optional(), // Slug is auto-generated from title if not provided
});

const quizQuestionSchema = z.object({
  question: z.string().min(1, "Question is required."),
  options: z
    .array(z.string().min(1, "Option cannot be empty."))
    .min(2, "Provide at least two options."),
  correctAnswer: z.number().min(0, "Select the correct answer."),
  explanation: z.string().optional(),
});

type QuizQuestion = z.infer<typeof quizQuestionSchema>;

// Quiz schema for reference (not used directly due to conditional validation)
const _quizSchema = z.object({
  passingScore: z
    .number()
    .min(0, "Passing score must be 0 or higher.")
    .max(100, "Passing score cannot exceed 100."),
  questions: z
    .array(quizQuestionSchema)
    .min(1, "Add at least one question."),
});

const lessonSchema = baseSchema
  .extend({
    content: z.string().optional(),
    videoUrl: z
      .string()
      .url("Please enter a valid URL.")
      .optional()
      .or(z.literal("")),
    quiz: z.any().optional(), // Allow any quiz data, validate only when type is 'quiz'
  })
  .superRefine((data, ctx) => {
    if (data.type === "video" && !data.videoUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["videoUrl"],
        message: "Video URL is required for video lessons.",
      });
    }

    if (data.type === "reading" && !data.content) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "Content is required for reading lessons.",
      });
    }

    if (data.type === "quiz") {
      // Only validate quiz when type is 'quiz'
      if (!data.quiz || !Array.isArray(data.quiz.questions) || data.quiz.questions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["quiz"],
          message: "Add at least one quiz question.",
        });
        return; // Skip further quiz validation if no questions
      }
      
      // Validate each question
      data.quiz.questions.forEach((question: QuizQuestion, index: number) => {
        if (!question.question || question.question.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["quiz", "questions", index, "question"],
            message: "Question text is required.",
          });
        }
        
        if (!Array.isArray(question.options) || question.options.filter((o) => o.trim()).length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["quiz", "questions", index, "options"],
            message: "Provide at least 2 valid options.",
          });
        }
        
        if (
          typeof question.correctAnswer !== 'number' ||
          question.correctAnswer < 0 ||
          question.correctAnswer >= (question.options?.length || 0)
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["quiz", "questions", index, "correctAnswer"],
            message: "Choose a valid correct option.",
          });
        }
      });
    }
  });

type LessonFormData = z.infer<typeof lessonSchema>;

const DEFAULT_QUIZ: LessonFormData["quiz"] = {
  passingScore: 70,
  questions: [
    {
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
    },
  ],
};

interface QuizData {
  passingScore?: number;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
}

const sanitizeQuiz = (quiz?: QuizData) => {
  if (!quiz) return undefined;

  const questions = quiz.questions
    .map((question) => {
      const options = question.options
        .map((option) => option.trim())
        .filter((option) => option.length > 0);

      if (options.length < 2 || question.question.trim().length === 0) {
        return null;
      }

      const boundedCorrectAnswer = Math.min(
        Math.max(question.correctAnswer ?? 0, 0),
        Math.max(options.length - 1, 0)
      );

      return {
        question: question.question.trim(),
        options,
        correctAnswer: boundedCorrectAnswer,
        explanation: question.explanation?.trim() || undefined,
      };
    })
    .filter((question): question is NonNullable<typeof question> => !!question);

  if (questions.length === 0) {
    return undefined;
  }

  return {
    passingScore: Math.min(Math.max(quiz.passingScore ?? 0, 0), 100),
    questions,
  };
};

type LessonFormProps = {
  lesson?: ILesson;
  topics: Array<{
    _id: string;
    title: string;
    courseId: { title: string };
  }>;
};

const normalizeLessonType = (type?: string): "reading" | "video" | "quiz" => {
  if (type === "video" || type === "quiz" || type === "reading") {
    return type;
  }

  if (type === "article") {
    return "reading";
  }

  return "reading";
};

export function LessonForm({ lesson, topics }: LessonFormProps) {
  const router = useRouter();
  const initialType = normalizeLessonType(lesson?.type);
  const isEditing = !!lesson;
  const [lessonType, setLessonType] = useState(initialType);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lessonContent = typeof lesson?.content === "string"
    ? lesson.content
    : (lesson?.content as { html?: string } | undefined)?.html ?? "";

  const initialQuiz = lesson?.quiz && lesson.quiz.questions?.length
    ? {
        passingScore: lesson.quiz.passingScore ?? 70,
        questions: lesson.quiz.questions.map((question) => ({
          question: question.question || "",
          options:
            question.options && question.options.length >= 2
              ? question.options
              : ["", ""],
          correctAnswer:
            typeof question.correctAnswer === "number"
              ? question.correctAnswer
              : 0,
          explanation: question.explanation || "",
        })),
      }
    : (initialType === "quiz" ? DEFAULT_QUIZ : undefined); // Only set default quiz for quiz type lessons

  const form = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || "",
      description: lesson?.description || "",
      topicId:
        typeof lesson?.topicId === "object" && lesson?.topicId !== null
          ? (lesson.topicId as { _id: string })._id
          : lesson?.topicId || "",
      type: initialType,
      difficulty: lesson?.difficulty || "beginner",
      estimatedMinutes: lesson?.estimatedMinutes || 0,
      order: lesson?.order || 0,
      content: lessonContent,
      videoUrl: lesson?.videoUrl || "",
      status: lesson?.status || "draft",
      slug: lesson?.slug || "",
      quiz: initialQuiz,
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({
    control: form.control,
    name: "quiz.questions",
  });

  useEffect(() => {
    if (lessonType === "quiz") {
      const currentQuiz = form.getValues("quiz");
      if (!currentQuiz || currentQuiz.questions.length === 0) {
        form.setValue("quiz", DEFAULT_QUIZ);
      }
    }
  }, [form, lessonType]);

  const quizQuestions = form.watch("quiz")?.questions ?? [];

  const handleAddQuestion = () => {
    appendQuestion({
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      explanation: "",
    });
  };

  const handleRemoveQuestion = (index: number) => {
    if (questionFields.length === 1) {
      form.setValue("quiz", DEFAULT_QUIZ);
      return;
    }
    removeQuestion(index);
  };

  const handleAddOption = (questionIndex: number) => {
    const options = form.getValues(`quiz.questions.${questionIndex}.options`) || [];
    form.setValue(`quiz.questions.${questionIndex}.options`, [...options, ""]);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const options = form.getValues(`quiz.questions.${questionIndex}.options`) || [];
    if (options.length <= 2) return;

    const updatedOptions = options.filter((_option: string, idx: number) => idx !== optionIndex);
    form.setValue(`quiz.questions.${questionIndex}.options`, updatedOptions);

    const currentCorrect = form.getValues(
      `quiz.questions.${questionIndex}.correctAnswer`
    );
    if (currentCorrect >= updatedOptions.length) {
      form.setValue(
        `quiz.questions.${questionIndex}.correctAnswer`,
        Math.max(updatedOptions.length - 1, 0)
      );
    }
  };

  async function onSubmit(values: LessonFormData) {
    console.log("Form submission started", values);
    setIsSubmitting(true);
    
    try {
      const slug =
        values.slug ||
        values.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

      const sanitizedQuiz = lessonType === "quiz" ? sanitizeQuiz(values.quiz) : undefined;

      const lessonData: Partial<ILesson> = {
        ...values,
        slug,
        content: lessonType === "reading" ? values.content || "" : "",
        videoUrl: lessonType === "video" ? values.videoUrl || "" : "",
        quiz: sanitizedQuiz,
        resources: [], // Initialize empty resources array
        creditsAwarded: 10, // Default credits awarded
      };

      if (lessonType !== "quiz") {
        delete (lessonData as { quiz?: LessonFormData["quiz"] }).quiz;
      }

      console.log("Prepared lesson data:", lessonData);

      let result;
      if (isEditing) {
        console.log("Updating lesson:", (lesson as ILesson)._id);
        result = await updateLesson((lesson as ILesson)._id, lessonData);
      } else {
        console.log("Creating new lesson");
        result = await createLesson(lessonData as Omit<ILesson, "_id" | "createdAt" | "updatedAt">);
      }

      console.log("Save result:", result);

      if (result.success) {
        alert(`Lesson ${isEditing ? "updated" : "created"} successfully!`);
        router.push("/admin/lessons");
        router.refresh();
      } else {
        console.error("Failed to save lesson:", result.error);
        alert(`Failed to save lesson: ${result.error}`);
      }
    } catch (error) {
      console.error("Failed to save lesson", error);
      alert("An unexpected error occurred while saving the lesson");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          alert("Please fix the form errors before submitting. Check console for details.");
        })} 
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Introduction to Components" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="introduction-to-components" {...field} />
              </FormControl>
              <FormDescription>
                URL-friendly version of the title. Auto-generated if left empty.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what students will learn in this lesson."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="topicId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic._id} value={topic._id.toString()}>
                      {topic.courseId.title} - {topic.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Type</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setLessonType(value as "reading" | "video" | "quiz");
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {lessonType === "quiz" && (
          <div className="space-y-6 rounded-lg border border-dashed p-6">
            <FormField
              control={form.control}
              name="quiz.passingScore"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passing Score (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={field.value ?? 70}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Learners must score at least this percentage to complete the lesson.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              {questionFields.map((question, questionIndex) => {
                const options = quizQuestions[questionIndex]?.options || [];
                const correctAnswer =
                  quizQuestions[questionIndex]?.correctAnswer ?? 0;

                return (
                  <div
                    key={question.id}
                    className="space-y-4 rounded-lg border bg-muted/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Question {questionIndex + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(questionIndex)}
                        disabled={questionFields.length === 1}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`quiz.questions.${questionIndex}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter the quiz question" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-3">
                      <FormLabel>Options</FormLabel>
                      {options.map((_option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center gap-3">
                          <input
                            type="radio"
                            className="h-4 w-4"
                            checked={correctAnswer === optionIndex}
                            onChange={() =>
                              form.setValue(
                                `quiz.questions.${questionIndex}.correctAnswer`,
                                optionIndex
                              )
                            }
                            aria-label="Mark as correct answer"
                          />
                          <Input
                            placeholder={`Option ${optionIndex + 1}`}
                            {...form.register(
                              `quiz.questions.${questionIndex}.options.${optionIndex}` as const
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                            disabled={options.length <= 2}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddOption(questionIndex)}
                        className="flex items-center gap-2"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add Option
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`quiz.questions.${questionIndex}.explanation`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Explanation (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide context or an explanation for the correct answer"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                );
              })}

              <Button
                type="button"
                variant="outline"
                onClick={handleAddQuestion}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>
        )}

        {lessonType === "reading" && (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the lesson content..."
                    className="min-h-[200px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {lessonType === "video" && (
          <FormField
            control={form.control}
            name="videoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Video URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="estimatedMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Minutes</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  value={field.value}
                  onChange={(event) =>
                    field.onChange(Number(event.target.value) || 0)
                  }
                />
              </FormControl>
              <FormDescription>
                The order in which this lesson appears in the topic.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Only published lessons will be visible to students.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="relative min-w-[180px]"
          onClick={() => {
            console.log("Button clicked!", {
              isSubmitting,
              formState: form.formState,
              hasErrors: Object.keys(form.formState.errors).length > 0,
              errors: form.formState.errors
            });
          }}
        >
          {isSubmitting ? (
            <>
              <span className="opacity-0">{isEditing ? "Update Lesson" : "Create Lesson"}</span>
              <span className="absolute inset-0 flex items-center justify-center">
                Saving...
              </span>
            </>
          ) : (
            isEditing ? "Update Lesson" : "Create Lesson"
          )}
        </Button>
      </form>
    </Form>
  );
}
