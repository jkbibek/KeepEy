import type { Laptop, LaptopStatus, RentalLog, Tablet } from "./types";

const API_BASE_URL = "http://127.0.0.1:5175/api";

export const statusLabels: Record<"ko" | "en", Record<LaptopStatus, string>> = {
  ko: {
    available: "대여 가능",
    rented: "대여 중",
    repairing: "수리중",
    broken: "고장",
    issue_found: "점검 필요",
  },
  en: {
    available: "Available",
    rented: "Rented",
    repairing: "Repairing",
    broken: "Broken",
    issue_found: "Issue found",
  },
};

export const statusTone: Record<LaptopStatus, string> = {
  available: "success",
  rented: "info",
  repairing: "warning",
  broken: "danger",
  issue_found: "review",
};

export const statusOrder: LaptopStatus[] = [
  "available",
  "rented",
  "repairing",
  "issue_found",
  "broken",
];

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
    throw payload ?? new Error("API request failed.");
  }

  return payload as T;
}

export async function fetchLaptops(): Promise<Laptop[]> {
  const response = await requestJson<{ laptops: Laptop[] }>("/laptops");
  return response.laptops;
}

export async function fetchTablets(): Promise<Tablet[]> {
  const response = await requestJson<{ tablets: Tablet[] }>("/tablets");
  return response.tablets;
}

export async function fetchRentalLogs(): Promise<RentalLog[]> {
  const response = await requestJson<{ logs: RentalLog[] }>("/rental-logs");
  return response.logs;
}

export async function createLaptop(laptop: Laptop): Promise<Laptop> {
  const response = await requestJson<{ laptop: Laptop }>("/laptops", {
    method: "POST",
    body: JSON.stringify(laptop),
  });
  return response.laptop;
}

export async function createTablet(tablet: Tablet): Promise<Tablet> {
  const response = await requestJson<{ tablet: Tablet }>("/tablets", {
    method: "POST",
    body: JSON.stringify(tablet),
  });
  return response.tablet;
}

export async function deleteLaptop(laptopId: string): Promise<void> {
  await requestJson(`/laptops/${encodeURIComponent(laptopId)}`, {
    method: "DELETE",
  });
}

export async function deleteTablet(tabletId: string): Promise<void> {
  await requestJson(`/tablets/${encodeURIComponent(tabletId)}`, {
    method: "DELETE",
  });
}

export async function updateDeviceIssue(
  deviceKind: "laptop" | "tablet",
  deviceId: string,
  status: LaptopStatus,
  note: string,
): Promise<Laptop | Tablet> {
  const pathPrefix = deviceKind === "laptop" ? "laptops" : "tablets";
  const response = await requestJson<{ laptop?: Laptop; tablet?: Tablet }>(
    `/${pathPrefix}/${encodeURIComponent(deviceId)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status, note }),
    },
  );

  return (response.laptop ?? response.tablet) as Laptop | Tablet;
}
