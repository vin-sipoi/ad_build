"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { createTopic, updateTopic } from "./actions";
import { ITopic, ICourse } from "../types";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  summary: z.string().min(10, "Summary must be at least 10 characters."),
  courseId: z.string().min(1, "Please select a course."),
  estimatedMinutes: z.number().min(0, "Estimated minutes must be a positive number."),
  order: z.number().min(0, "Order must be a positive number."),
  status: z.enum(["draft", "published"]),
  slug: z.string().min(1, "Slug is required."),
});

type TopicFormProps = {
  topic?: ITopic;
  courses: Pick<ICourse, '_id' | 'title'>[];
};

export function TopicForm({ topic, courses }: TopicFormProps) {
  const router = useRouter();
  const isEditing = !!topic;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: topic?.title || "",
      summary: topic?.summary || "",
      courseId: typeof topic?.courseId === 'object' ? topic.courseId._id : topic?.courseId || "",
      estimatedMinutes: topic?.estimatedMinutes || 0,
      order: topic?.order || 0,
      status: topic?.status || "draft",
      slug: topic?.slug || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const slug = values.slug || values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const topicData = {
        title: values.title,
        summary: values.summary,
        courseId: values.courseId,
        estimatedMinutes: values.estimatedMinutes,
        order: values.order,
        status: values.status,
        slug,
    };

    try {
        if (isEditing) {
            await updateTopic(topic._id, topicData);
        } else {
            await createTopic(topicData);
        }
        router.push("/admin/topics");
        // Add toast notification for success
    } catch (error) {
        console.error("Failed to save topic", error);
        // Add toast notification for error
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
                <Input placeholder="e.g. State Management" {...field} />
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
                <Input placeholder="e.g. state-management" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief summary of the topic..."
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
          name="courseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course._id} value={course._id.toString()}>
                      {course.title}
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
          name="estimatedMinutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Minutes</FormLabel>
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
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order</FormLabel>
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
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">{isEditing ? "Update Topic" : "Create Topic"}</Button>
      </form>
    </Form>
  );
}
