"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchProgram,
  updateProgram,
  clearSaveError,
} from "@/modules/programs/store/actions";
import {
  fetchSessions,
  reorderSessions,
  deleteSession,
} from "@/modules/sessions/store/actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { SortableSessionList } from "@/modules/sessions/components/SortableSessionList";

const schema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

type FormData = z.infer<typeof schema>;

export function ProgramDetailPage() {
  const params = useParams();
  const programId = params.programId as string;
  const dispatch = useAppDispatch();

  const {
    current: program,
    loading: programLoading,
    error: programError,
    saveError,
  } = useAppSelector((state) => state.programs);

  const {
    list: sessions,
    reorderError,
  } = useAppSelector((state) => state.sessions);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    dispatch(fetchProgram(programId));
    dispatch(fetchSessions(programId));
  }, [dispatch, programId]);

  useEffect(() => {
    if (program) {
      reset({
        title: program.title,
        description: program.description ?? "",
      });
    }
  }, [program, reset]);

  const onSaveProgram = async (data: FormData) => {
    dispatch(clearSaveError());
    await dispatch(
      updateProgram(programId, {
        title: data.title,
        description: data.description || null,
      }),
    );
    dispatch(fetchProgram(programId));
  };

  const handleReorder = async (sessionIds: string[]) => {
    await dispatch(reorderSessions(programId, sessionIds, sessions));
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Delete this session?")) return;
    try {
      await dispatch(deleteSession(programId, sessionId));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (programLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (programError || !program) {
    return (
      <Alert variant="error">{programError ?? "Program not found"}</Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/programs" className="hover:text-teal-600">
          Programs
        </Link>
        <span>/</span>
        <span className="text-gray-900">{program.title}</span>
      </div>

      <Card className="max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-900">Edit program</h2>
        {saveError && <Alert variant="error">{saveError}</Alert>}
        <form onSubmit={handleSubmit(onSaveProgram)} className="mt-4 space-y-4">
          <Input
            label="Title"
            error={errors.title?.message}
            {...register("title")}
          />
          <Textarea
            label="Description"
            rows={3}
            {...register("description")}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save program"}
          </Button>
        </form>
      </Card>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Sessions</h2>
          <div className="flex gap-2">
            <Link href={`/programs/${programId}/import`}>
              <Button variant="secondary" size="sm">
                Import CSV
              </Button>
            </Link>
            <Link href={`/programs/${programId}/sessions/new`}>
              <Button size="sm">Add session</Button>
            </Link>
          </div>
        </div>

        {reorderError && <Alert variant="error">{reorderError}</Alert>}

        {sessions.length === 0 ? (
          <EmptyState
            title="No sessions yet"
            description="Add sessions manually or import from CSV."
            action={
              <Link href={`/programs/${programId}/sessions/new`}>
                <Button>Add first session</Button>
              </Link>
            }
          />
        ) : (
          <SortableSessionList
            sessions={sessions}
            programId={programId}
            onReorder={handleReorder}
            onDelete={handleDeleteSession}
          />
        )}
      </div>
    </div>
  );
}
