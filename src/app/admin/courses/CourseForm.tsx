"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { createCourse, updateCourse } from "./actions";
import { ICourse } from "../types";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  track: z.enum(["defi", "smart-contracts", "ai", "web3", "nfts"]),
  credits: z.number().min(0, "Credits must be a positive number."),
  thumbnail: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  tags: z.string().optional(),
  estimatedHours: z.number().min(0, "Estimated hours must be a positive number."),
  status: z.enum(["draft", "published"]),
  slug: z.string().min(1, "Slug is required."),
});

type CourseFormData = z.infer<typeof formSchema>;

type CourseFormProps = {
  course?: ICourse;
};

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const isEditing = !!course;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CourseFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      track: course?.track || "defi",
      credits: course?.credits || 0,
      thumbnail: course?.thumbnail || "",
      tags: course?.tags?.join(", ") || "",
      estimatedHours: course?.estimatedHours || 0,
      status: course?.status || "draft",
      slug: course?.slug || "",
    },
  });

  async function onSubmit(values: CourseFormData) {
    setIsSubmitting(true);
    const slug = values.slug || values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const courseData = {
        title: values.title,
        description: values.description,
        track: values.track,
        credits: values.credits,
        estimatedHours: values.estimatedHours,
        status: values.status,
        thumbnail: values.thumbnail || undefined,
        tags: values.tags?.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag) || [],
        slug,
        order: course?.order || 0
    };

    try {
        if (isEditing) {
            await updateCourse(course._id, courseData);
        } else {
            await createCourse(courseData);
        }
        router.push("/admin/courses");
        // Add toast notification for success
    } catch (error) {
        console.error("Failed to save course", error);
        // Add toast notification for error
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Introduction to Next.js" {...field} />
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
                <Input placeholder="introduction-to-nextjs" {...field} />
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
                  placeholder="Describe the course content and what students will learn."
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
          name="track"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Track</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a track" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="defi">DeFi</SelectItem>
                  <SelectItem value="smart-contracts">Smart Contracts</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="web3">Web3</SelectItem>
                  <SelectItem value="nfts">NFTs</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the primary category for this course
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="thumbnail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input placeholder="React, Next.js, Tailwind CSS" {...field} />
              </FormControl>
              <FormDescription>
                Enter tags separated by commas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="estimatedHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Inactive courses will not be visible to students.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value === "published"}
                  onCheckedChange={(checked) => field.onChange(checked ? "published" : "draft")}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (isEditing ? "Update Course" : "Create Course")}
        </Button>
      </form>
    </Form>
  );
}
