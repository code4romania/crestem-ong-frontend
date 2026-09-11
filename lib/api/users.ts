import { serverApiFetch } from "./server";
import type { UserRoleType } from "@/lib/roles";

export interface AdminUser {
  documentId: string;
  nume: string | null;
  email: string;
  accountStatus: "pending" | "active" | "deleted";
  role: { type: UserRoleType; name: string } | null;
  ong: { documentId: string; name: string }[];
  avatar: { id: number; url: string } | null;
  createdAt: string | null;
  lastLoginAt: string | null;
  bio: string | null;
  dimensiuni: string[];
  ariiDeExpertiza: string[];
  programs: {
    documentId: string;
    name: string;
    ongs: { documentId: string; name: string }[];
  }[];
  activationLink?: string;
}

export interface UsersPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface ListUsersParams {
  search?: string;
  role?: string;
  ong?: string;
  status?: string;
  program?: string;
  sort?: string;
  page?: number;
}

export function listUsers(params: ListUsersParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.role) query.set("role", params.role);
  if (params.ong) query.set("ong", params.ong);
  if (params.status) query.set("status", params.status);
  if (params.program) query.set("program", params.program);
  if (params.sort) query.set("sort", params.sort);
  if (params.page && params.page > 1) query.set("page", String(params.page));

  const qs = query.toString();
  return serverApiFetch<{ data: AdminUser[]; meta: { pagination: UsersPagination } }>(
    `/api/admin/users${qs ? `?${qs}` : ""}`,
  );
}

export function getUser(documentId: string) {
  return serverApiFetch<{ data: AdminUser }>(`/api/admin/users/${documentId}`);
}
