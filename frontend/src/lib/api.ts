import {
  AuthResponse,
  AuditLog,
  Creator,
  ImportResult,
  Pagination,
  PresignResult,
  Program,
  Session,
  ApiError,
} from "./types";
import { clearToken, getToken } from "./auth-storage";
import { store } from "@/store";
import { AUTH_ACTION_TYPES } from "@/modules/auth/store/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1/admin";

export class ApiRequestError extends Error {
  constructor(
    public readonly apiError: ApiError,
    public readonly status: number,
  ) {
    super(apiError.message);
    this.name = "ApiRequestError";
  }
}

type RequestOptions = RequestInit & {
  token?: string | null | null;
  auth?: boolean;
};

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, auth = true, headers, ...init } = options;
  const authToken = token ?? getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(auth && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) return null as T;

  const body = await res.json();

  if (!res.ok) {
    const apiError = body.error as ApiError;
    if (res.status === 401 && typeof window !== "undefined") {
      clearToken();
      store.dispatch({ type: AUTH_ACTION_TYPES.SESSION_EXPIRED });
    }
    throw new ApiRequestError(apiError, res.status);
  }

  return body as T;
}

export const authApi = {
  signup: (data: { email: string; password: string; displayName: string }) =>
    request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
      auth: false,
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
      auth: false,
    }),

  requestPasswordReset: (email: string) =>
    request<{ message: string }>("/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      auth: false,
    }),

  confirmPasswordReset: (token: string, newPassword: string) =>
    request<{ message: string }>("/auth/password-reset/confirm", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
      auth: false,
    }),
};

export const programsApi = {
  list: (token?: string | null | null) =>
    request<{ programs: Program[] }>("/programs", { token }),

  get: (id: string, token?: string | null) =>
    request<{ program: Program }>(`/programs/${id}`, { token }),

  create: (
    data: { title: string; description?: string },
    token?: string | null,
  ) =>
    request<{ program: Program }>("/programs", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (
    id: string,
    data: { title?: string; description?: string | null },
    token?: string | null,
  ) =>
    request<{ program: Program }>(`/programs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  delete: (id: string, token?: string | null) =>
    request<void>(`/programs/${id}`, { method: "DELETE", token }),
};

export const sessionsApi = {
  list: (programId: string, token?: string | null) =>
    request<{ sessions: Session[] }>(`/programs/${programId}/sessions`, {
      token,
    }),

  get: (programId: string, sessionId: string, token?: string | null) =>
    request<{ session: Session }>(
      `/programs/${programId}/sessions/${sessionId}`,
      { token },
    ),

  create: (
    programId: string,
    data: {
      title: string;
      durationSeconds: number;
      instructorName: string;
      tags?: string[];
      mediaUrl?: string;
      position?: number;
    },
    token?: string | null,
  ) =>
    request<{ session: Session }>(`/programs/${programId}/sessions`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  update: (
    programId: string,
    sessionId: string,
    data: {
      title?: string;
      durationSeconds?: number;
      instructorName?: string;
      tags?: string[];
      mediaUrl?: string | null;
    },
    token?: string | null,
  ) =>
    request<{ session: Session }>(
      `/programs/${programId}/sessions/${sessionId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
        token,
      },
    ),

  delete: (programId: string, sessionId: string, token?: string | null) =>
    request<void>(`/programs/${programId}/sessions/${sessionId}`, {
      method: "DELETE",
      token,
    }),

  reorder: (programId: string, sessionIds: string[], token?: string | null) =>
    request<{ sessions: Session[] }>(
      `/programs/${programId}/sessions/reorder`,
      {
        method: "PUT",
        body: JSON.stringify({ sessionIds }),
        token,
      },
    ),
};

export const importApi = {
  uploadCsv: (
    programId: string,
    file: File,
    idempotencyKey: string,
    token?: string | null,
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<ImportResult>(`/programs/${programId}/sessions/import`, {
      method: "POST",
      body: formData,
      token,
      headers: { "Idempotency-Key": idempotencyKey },
    });
  },
};

export const uploadsApi = {
  presign: (
    data: { filename: string; contentType: string; programId: string },
    token?: string | null,
  ) =>
    request<PresignResult>("/uploads/presign", {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  uploadToS3: async (uploadUrl: string, file: File) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!res.ok) {
      throw new Error(`Upload failed with status ${res.status}`);
    }
  },
};

export const auditApi = {
  list: (
    params: {
      from?: string;
      to?: string;
      action?: string;
      page?: number;
      limit?: number;
    },
    token?: string | null,
  ) => {
    const search = new URLSearchParams();
    if (params.from) search.set("from", params.from);
    if (params.to) search.set("to", params.to);
    if (params.action) search.set("action", params.action);
    if (params.page) search.set("page", String(params.page));
    if (params.limit) search.set("limit", String(params.limit));
    const qs = search.toString();
    return request<{ items: AuditLog[]; pagination: Pagination }>(
      `/audit-logs${qs ? `?${qs}` : ""}`,
      { token },
    );
  },
};

export type { Creator };
