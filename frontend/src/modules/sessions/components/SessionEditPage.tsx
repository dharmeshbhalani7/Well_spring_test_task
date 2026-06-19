"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSession } from "@/modules/sessions/store/actions";
import { ProgramBreadcrumbs } from "@/modules/shared/components/ProgramBreadcrumbs";
import { SessionForm } from "./SessionForm";
import { Alert } from "@/components/ui/Alert";
import { Spinner } from "@/components/ui/Spinner";

export function SessionEditPage() {
  const params = useParams();
  const programId = params.programId as string;
  const sessionId = params.sessionId as string;
  const dispatch = useAppDispatch();
  const { current: session, loading, error } = useAppSelector(
    (state) => state.sessions,
  );

  useEffect(() => {
    dispatch(fetchSession(programId, sessionId));
  }, [dispatch, programId, sessionId]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error || !session) {
    return <Alert variant="error">{error ?? "Session not found"}</Alert>;
  }

  return (
    <div className="space-y-4">
      <ProgramBreadcrumbs programId={programId} currentLabel="Edit session" />
      <SessionForm programId={programId} session={session} />
    </div>
  );
}
