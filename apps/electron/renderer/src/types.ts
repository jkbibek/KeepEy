export type LaptopStatus = "available" | "rented" | "issue_found" | "repairing" | "broken";
export type RentStatus = "active" | "returned" | "issue_found";

export type StudentSession = {
  studentId: string;
  startedAt: string;
};

export type Laptop = {
  id: string;
  brand: string;
  model: string;
  status: LaptopStatus;
  currentStudentId?: string | null;
  currentRentId?: string | null;
  lastIssueSummary?: string | null;
  updatedAt: string;
};

export type Tablet = Laptop;

export type RentRequest = {
  studentId: string;
  laptopId: string;
  baselineInstalledApps?: string[];
};

export type Rent = {
  id: string;
  laptopId: string;
  studentId: string;
  rentedAt: string;
  status: RentStatus;
  baselineInstalledApps?: string[];
};

export type RentalLog = {
  id: string;
  laptopId: string;
  studentId: string;
  rentedAt: string;
  returnedAt: string | null;
  result: "rented" | "returned" | "issue_found";
};

export type RentResponse = {
  rent: Rent;
  laptop: Laptop;
};

export type PendingRentSession = {
  id: string;
  token: string;
  studentId: string;
  deviceType: "laptop" | "tablet";
  deviceId: string;
  status: "pending" | "confirmed" | "expired";
  confirmationUrl: string;
  createdAt: string;
  expiresAt?: string;
  confirmedAt?: string | null;
  expiredAt?: string | null;
};

export type PendingRentSessionResponse = {
  session: PendingRentSession;
  laptop: Laptop;
};

export type ApiErrorCode =
  | "LAPTOP_NOT_FOUND"
  | "LAPTOP_NOT_AVAILABLE"
  | "LAPTOP_NOT_RENTED"
  | "RENT_SESSION_NOT_FOUND"
  | "RENT_SESSION_NOT_PENDING"
  | "RENT_SESSION_EXPIRED"
  | "STUDENT_MISMATCH"
  | "VALIDATION_ERROR"
  | "SERVER_ERROR";

export type ApiError = {
  error: {
    code: ApiErrorCode;
    message: string;
  };
};

export type ReturnStartRequest = {
  studentId: string;
  laptopId: string;
};

export type ReturnPhotoUploadRequest = {
  studentId: string;
  deviceType: "laptop" | "tablet";
  deviceId: string;
};

export type ReturnPhotoSet = {
  id: string;
  studentId: string;
  deviceType: "laptop" | "tablet";
  deviceId: string;
  rentId?: string | null;
  status: "uploaded";
  photos: Array<{
    id: string;
    angle: string;
    status: "uploaded";
    path: string;
  }>;
  createdAt: string;
};
