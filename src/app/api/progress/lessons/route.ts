import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth-utils";
import { adminAuth } from "@/lib/firebase-admin";
import { User } from "@/models/User";
import { Lesson } from "@/models/Lesson";
import { Progress } from "@/models/Progress";

const ALLOWED_STATUSES = new Set(["not-started", "in-progress", "completed"] as const);

interface QuizAnswerPayload {
  question: string;
  selectedOption: number | null;
  isCorrect: boolean;
}

interface ProgressRequestBody {
  courseId: string;
  topicId: string;
  lessonId: string;
  status?: "not-started" | "in-progress" | "completed";
  quizScore?: number;
  quizPassed?: boolean;
  answers?: QuizAnswerPayload[];
  timeSpentSeconds?: number;
}

async function resolveAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ") && adminAuth) {
    const token = authHeader.split(" ")[1];

    try {
      const decoded = await adminAuth.verifyIdToken(token);
      if (decoded?.email) {
        const user = await User.findOne({ email: decoded.email.toLowerCase() });
        if (user) {
          return user;
        }
      }
    } catch (error) {
      console.warn("Failed to verify Firebase token for progress update", error);
    }
  }

  const session = await getSession(request);
  if (session?.user?.id && Types.ObjectId.isValid(session.user.id)) {
    const user = await User.findById(session.user.id);
    if (user) {
      return user;
    }
  }

  return null;
}

function sanitizeScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function sanitizeAnswers(answers: unknown): QuizAnswerPayload[] | undefined {
  if (!Array.isArray(answers)) {
    return undefined;
  }

  const normalized = answers
    .filter((answer): answer is QuizAnswerPayload => {
      if (!answer || typeof answer !== "object") return false;
      const { question, selectedOption, isCorrect } = answer as QuizAnswerPayload;
      const validQuestion = typeof question === "string" && question.trim().length > 0;
      const validOption = selectedOption === null || typeof selectedOption === "number";
      const validCorrect = typeof isCorrect === "boolean";
      return validQuestion && validOption && validCorrect;
    })
    .map((answer) => ({
      question: answer.question.trim(),
      selectedOption: answer.selectedOption,
      isCorrect: answer.isCorrect,
    }));

  return normalized.length > 0 ? normalized : undefined;
}

function resolveStatus(
  requestedStatus: ProgressRequestBody["status"],
  quizPassed: boolean | undefined,
  previousStatus?: "not-started" | "in-progress" | "completed"
): "not-started" | "in-progress" | "completed" {
  if (previousStatus === "completed") {
    return "completed";
  }

  if (quizPassed) {
    return "completed";
  }

  if (requestedStatus && ALLOWED_STATUSES.has(requestedStatus)) {
    return requestedStatus;
  }

  return "in-progress";
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = (await request.json()) as ProgressRequestBody;
    const {
      courseId,
      topicId,
      lessonId,
      status: requestedStatus,
      quizScore,
      quizPassed,
      answers,
      timeSpentSeconds,
    } = body;

    if (!courseId || !topicId || !lessonId) {
      return NextResponse.json(
        { error: "courseId, topicId, and lessonId are required" },
        { status: 400 }
      );
    }

    if (!Types.ObjectId.isValid(courseId) || !Types.ObjectId.isValid(topicId) || !Types.ObjectId.isValid(lessonId)) {
      return NextResponse.json({ error: "Invalid identifier provided" }, { status: 400 });
    }

    const user = await resolveAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [courseObjectId, topicObjectId, lessonObjectId] = [
      new Types.ObjectId(courseId),
      new Types.ObjectId(topicId),
      new Types.ObjectId(lessonId),
    ];

    const lesson = await Lesson.findById(lessonObjectId).select("courseId topicId quiz");
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (!lesson.courseId.equals(courseObjectId) || !lesson.topicId.equals(topicObjectId)) {
      return NextResponse.json(
        { error: "Lesson does not belong to the provided course/topic" },
        { status: 400 }
      );
    }

  const sanitizedScore = sanitizeScore(quizScore);
  const sanitizedAnswers = sanitizeAnswers(answers);
  const hasQuizSubmission = Array.isArray(sanitizedAnswers) && sanitizedAnswers.length > 0;
  const quizResponsesPayload = hasQuizSubmission && sanitizedAnswers ? sanitizedAnswers : undefined;
    const now = new Date();

    const existingProgress = await Progress.findOne({
      userId: user._id,
      lessonId: lessonObjectId,
    });

    const finalStatus = resolveStatus(requestedStatus, quizPassed, existingProgress?.status);
    const nextQuizAttempts = (existingProgress?.quizAttempts ?? 0) + (hasQuizSubmission ? 1 : 0);

    const additionalTime =
      typeof timeSpentSeconds === "number" && timeSpentSeconds > 0
        ? Math.round(timeSpentSeconds)
        : 0;
    const nextTimeSpent = (existingProgress?.timeSpentSeconds ?? 0) + additionalTime;
    const resolvedQuizPassed = (existingProgress?.quizPassed ?? false) || Boolean(quizPassed);

    if (existingProgress) {
      existingProgress.courseId = courseObjectId;
      existingProgress.topicId = topicObjectId;
      existingProgress.status = finalStatus;
      existingProgress.timeSpentSeconds = nextTimeSpent;
      if (sanitizedScore !== undefined) {
        existingProgress.quizScore = sanitizedScore;
        existingProgress.score = sanitizedScore;
      }
      existingProgress.quizPassed = resolvedQuizPassed;
      if (quizResponsesPayload) {
        existingProgress.quizResponses = quizResponsesPayload;
      }
      if (hasQuizSubmission) {
        existingProgress.quizAttempts = nextQuizAttempts;
        existingProgress.lastAttemptAt = now;
      }
      if (!existingProgress.startedAt) {
        existingProgress.startedAt = now;
      }
      if (finalStatus === "completed" && !existingProgress.completedAt) {
        existingProgress.completedAt = now;
      }

      await existingProgress.save();

      return NextResponse.json({
        success: true,
        data: {
          id: existingProgress._id.toString(),
          status: existingProgress.status,
          quizScore: existingProgress.quizScore,
          quizPassed: existingProgress.quizPassed,
          quizAttempts: existingProgress.quizAttempts,
          completedAt: existingProgress.completedAt,
        },
      });
    }

    const progress = new Progress({
      userId: user._id,
      courseId: courseObjectId,
      topicId: topicObjectId,
      lessonId: lessonObjectId,
      status: finalStatus,
      startedAt: now,
      completedAt: finalStatus === "completed" ? now : undefined,
      timeSpentSeconds: additionalTime,
      quizScore: sanitizedScore,
      score: sanitizedScore,
      quizPassed: Boolean(quizPassed),
      quizAttempts: hasQuizSubmission ? 1 : 0,
      lastAttemptAt: hasQuizSubmission ? now : undefined,
      quizResponses: quizResponsesPayload,
    });

    await progress.save();

    return NextResponse.json({
      success: true,
      data: {
        id: progress._id.toString(),
        status: progress.status,
        quizScore: progress.quizScore,
        quizPassed: progress.quizPassed,
        quizAttempts: progress.quizAttempts,
        completedAt: progress.completedAt,
      },
    });
  } catch (error) {
    console.error("Error recording lesson progress:", error);
    return NextResponse.json(
      { error: "Failed to record lesson progress" },
      { status: 500 }
    );
  }
}
