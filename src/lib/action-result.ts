import type { z } from "zod";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T>;
export function ok(): ActionResult<void>;
export function ok<T>(data?: T): ActionResult<T | undefined> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

export function validationError(error: z.ZodError): ActionResult<never> {
  return fail(error.issues.map((issue) => issue.message).join("; "));
}
