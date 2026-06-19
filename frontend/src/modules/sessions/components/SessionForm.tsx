"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { uploadsApi, ApiRequestError } from "@/lib/api";
import { Session } from "@/lib/types";
import {
  minutesToSeconds,
  parseTagsInput,
  secondsToMinutes,
  tagsToInput,
} from "@/lib/format";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createSession, updateSession } from "@/modules/sessions/store/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  durationMinutes: z.number().positive("Duration must be positive"),
  instructorName: z.string().min(1, "Instructor is required").max(100),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function SessionForm({
  programId,
  session,
}: {
  programId: string;
  session?: Session;
}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(
    session?.mediaUrl ?? null,
  );
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: session
      ? {
          title: session.title,
          durationMinutes: secondsToMinutes(session.durationSeconds),
          instructorName: session.instructorName,
          tags: tagsToInput(session.tags),
        }
      : {
          durationMinutes: 10,
        },
  });

  const uploadMedia = async (): Promise<string | undefined> => {
    if (!mediaFile) return mediaUrl ?? undefined;

    setUploadStatus("Requesting upload URL...");
    const presign = await uploadsApi.presign(
      {
        filename: mediaFile.name,
        contentType: mediaFile.type,
        programId,
      },
      token,
    );

    setUploadStatus("Uploading to S3...");
    await uploadsApi.uploadToS3(presign.uploadUrl, mediaFile);
    setUploadStatus("Upload complete");
    setMediaUrl(presign.mediaUrl);
    return presign.mediaUrl;
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      let finalMediaUrl = mediaUrl;
      if (mediaFile) {
        finalMediaUrl = (await uploadMedia()) ?? null;
      }

      const payload = {
        title: data.title,
        durationSeconds: minutesToSeconds(data.durationMinutes),
        instructorName: data.instructorName,
        tags: parseTagsInput(data.tags ?? ""),
        ...(finalMediaUrl ? { mediaUrl: finalMediaUrl } : {}),
      };

      if (session) {
        await dispatch(
          updateSession(programId, session.id, {
            ...payload,
            mediaUrl: finalMediaUrl,
          }),
        );
      } else {
        await dispatch(createSession(programId, payload));
      }

      router.push(`/programs/${programId}`);
      router.refresh();
    } catch (err) {
      setUploadStatus(null);
      setError(
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Save failed",
      );
    }
  };

  return (
    <Card className="max-w-2xl">
      <h2 className="text-xl font-semibold text-gray-900">
        {session ? "Edit session" : "New session"}
      </h2>

      {error && <Alert variant="error">{error}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <Input
          label="Title"
          error={errors.title?.message}
          {...register("title")}
        />
        <Input
          label="Duration (minutes)"
          type="number"
          min={1}
          error={errors.durationMinutes?.message}
          {...register("durationMinutes", { valueAsNumber: true })}
        />
        <Input
          label="Instructor name"
          error={errors.instructorName?.message}
          {...register("instructorName")}
        />
        <Input
          label="Tags (comma-separated)"
          placeholder="sleep, relaxation"
          {...register("tags")}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Media file (audio or video)
          </label>
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-teal-700 hover:file:bg-teal-100"
          />
          {mediaUrl && !mediaFile && (
            <p className="text-sm text-gray-500">
              Current:{" "}
              <a
                href={mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:underline"
              >
                {mediaUrl}
              </a>
            </p>
          )}
          {uploadStatus && (
            <p className="text-sm text-teal-600">{uploadStatus}</p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : session ? "Update session" : "Create session"}
          </Button>
          <Link href={`/programs/${programId}`}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </Card>
  );
}
