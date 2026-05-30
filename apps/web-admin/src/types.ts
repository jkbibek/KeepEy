export type LaptopStatus =
  | "available"
  | "rented"
  | "repairing"
  | "broken"
  | "issue_found";

export type Laptop = {
  id: string;
  brand: string;
  model: string;
  purchaseYear: number;
  purchaseMonth: number;
  status: LaptopStatus;
  currentStudentId: string | null;
  currentRentId: string | null;
  lastIssueSummary: string | null;
  updatedAt: string;
};

export type Tablet = Laptop;
export type DeviceAsset = Laptop | Tablet;

export type RentalLog = {
  id: string;
  laptopId: string;
  studentId: string;
  rentedAt: string;
  returnedAt: string | null;
  result: string;
};
