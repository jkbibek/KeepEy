import type {
  PendingRentSessionResponse,
  RentRequest,
  RentResponse,
  RentalLog,
  Laptop,
  Tablet,
  ReturnPhotoSet,
  ReturnPhotoUploadRequest,
  ReturnStartRequest,
  StudentSession,
} from "../types";

const API_BASE_URL = "http://127.0.0.1:5175/api";
const STUDENT_SESSION_KEY = "keepey.studentSession";

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw payload ?? {
      error: {
        code: "SERVER_ERROR",
        message: "API request failed.",
      },
    };
  }

  return payload as T;
}

export function getStoredStudentSession(): StudentSession | null {
  const value = window.localStorage.getItem(STUDENT_SESSION_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StudentSession;
  } catch {
    window.localStorage.removeItem(STUDENT_SESSION_KEY);
    return null;
  }
}

export async function startMockStudentSession(studentId: string): Promise<StudentSession> {
  const session: StudentSession = {
    studentId,
    startedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearMockStudentSession() {
  window.localStorage.removeItem(STUDENT_SESSION_KEY);
}

export async function getLaptop(laptopId: string): Promise<{ laptop: Laptop }> {
  return requestJson(`/laptops/${encodeURIComponent(laptopId.trim().toUpperCase())}`);
}

export async function getLaptops(): Promise<{ laptops: Laptop[] }> {
  return requestJson("/laptops");
}

export async function getTablets(): Promise<{ tablets: Tablet[] }> {
  return requestJson("/tablets");
}

export async function getRentalLogs(): Promise<{ logs: RentalLog[] }> {
  return requestJson("/rental-logs");
}

export async function createRent(request: RentRequest): Promise<RentResponse> {
  return requestJson("/rents", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function createPendingRentSession(request: {
  studentId: string;
  deviceType?: "laptop" | "tablet";
  deviceId?: string;
}): Promise<PendingRentSessionResponse> {
  return requestJson("/rent-sessions", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function getPendingRentSession(sessionId: string): Promise<PendingRentSessionResponse> {
  return requestJson(`/rent-sessions/${encodeURIComponent(sessionId)}`);
}

export async function confirmPendingRentSession(sessionId: string): Promise<RentResponse> {
  return requestJson(`/rent-sessions/${encodeURIComponent(sessionId)}/confirm`, {
    method: "POST",
  });
}

export async function startReturnInspection(request: ReturnStartRequest) {
  return requestJson("/returns/start", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function uploadMockReturnPhotos(request: ReturnPhotoUploadRequest): Promise<{ photoSet: ReturnPhotoSet }> {
  return requestJson("/returns/photos/mock-upload", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
