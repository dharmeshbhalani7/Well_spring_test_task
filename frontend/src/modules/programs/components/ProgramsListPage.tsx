"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPrograms, deleteProgram } from "@/modules/programs/store/actions";
import { formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

export function ProgramsListPage() {
  const dispatch = useAppDispatch();
  const { list: programs, loading, error } = useAppSelector((state) => state.programs);

  useEffect(() => {
    dispatch(fetchPrograms());
  }, [dispatch]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete program "${title}" and all its sessions?`)) return;
    try {
      await dispatch(deleteProgram(id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Programs</h2>
        <Link href="/programs/new">
          <Button>New Program</Button>
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {programs.length === 0 ? (
        <EmptyState
          title="No programs yet"
          description="Create your first wellness program to get started."
          action={
            <Link href="/programs/new">
              <Button>Create program</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id}>
              <Link href={`/programs/${program.id}`}>
                <h3 className="font-semibold text-gray-900 hover:text-teal-700">
                  {program.title}
                </h3>
              </Link>
              {program.description && (
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                  {program.description}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>{program._count?.sessions ?? 0} sessions</span>
                <span>{formatDate(program.createdAt)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/programs/${program.id}`}>
                  <Button variant="secondary" size="sm">
                    Manage
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(program.id, program.title)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
