import type { AppCopy } from "./copy";

export type LoginErrors = {
  studentId?: string;
};

export function normalizeStudentId(value: string) {
  return value.trim().replace(/\s+/g, "");
}

export function validateStudentId(value: string, text: AppCopy): LoginErrors {
  if (!value) {
    return { studentId: text.requiredError };
  }

  if (!/^\d{6,12}$/.test(value)) {
    return { studentId: text.formatError };
  }

  return {};
}
