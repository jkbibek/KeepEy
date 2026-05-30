import { ChangeEvent, useEffect, useState } from "react";
import { getLaptops, getRentalLogs, getTablets, uploadMockReturnPhotos } from "../api/mockClient";
import { BrandMark } from "../components/BrandMark";
import { LanguageToggle } from "../components/LanguageToggle";
import type { AppCopy } from "../lib/copy";
import type { Laptop, RentalLog, Tablet } from "../types";

type ReturnPageProps = {
  text: AppCopy;
  studentId: string;
  deviceType: "laptop" | "tablet";
  onToggleLanguage: () => void;
  onStudentClick: () => void;
  onBack: () => void;
};

type ReturnDevice = Laptop | Tablet;
type ReturnState = "loading" | "none" | "ready" | "photo" | "uploading" | "complete" | "error";

const MAX_RENTAL_MS = 7 * 24 * 60 * 60 * 1000;

function findActiveRentalLog(device: ReturnDevice, logs: RentalLog[]) {
  return (
    logs
      .filter((log) => {
        return (
          log.laptopId === device.id &&
          log.studentId === device.currentStudentId &&
          log.returnedAt === null &&
          log.result === "rented"
        );
      })
      .sort((a, b) => Date.parse(b.rentedAt) - Date.parse(a.rentedAt))[0] ?? null
  );
}

function formatDueDate(device: ReturnDevice, logs: RentalLog[]) {
  const activeLog = findActiveRentalLog(device, logs);
  const rentedAt = Date.parse(activeLog?.rentedAt || device.updatedAt);

  if (!Number.isFinite(rentedAt)) {
    return "Unavailable";
  }

  const dueDate = new Date(rentedAt + MAX_RENTAL_MS);
  return dueDate.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getReturnProcessTitle(deviceType: "laptop" | "tablet") {
  return deviceType === "tablet" ? "Tablet Return Process" : "Laptop Return Process";
}

function getReturnPhotoTitle(deviceType: "laptop" | "tablet") {
  return deviceType === "tablet" ? "Tablet Return Photos" : "Laptop Return Photos";
}

function getReturnTitle(deviceType: "laptop" | "tablet", state: ReturnState) {
  if (state === "photo") {
    return getReturnPhotoTitle(deviceType);
  }

  if (state === "complete") {
    return deviceType === "tablet" ? "Tablet Return Complete" : "Laptop Return Complete";
  }

  return getReturnProcessTitle(deviceType);
}

function getPhotoSteps(deviceType: "laptop" | "tablet") {
  if (deviceType === "tablet") {
    return [
      "Front screen view",
      "Back surface view",
    ];
  }

  return [
    "Open view with screen and keyboard",
    "Closed top view with mouse and charger",
    "Closed bottom view",
  ];
}

export function ReturnPage({
  text,
  studentId,
  deviceType,
  onToggleLanguage,
  onStudentClick,
  onBack,
}: ReturnPageProps) {
  const [state, setState] = useState<ReturnState>("loading");
  const [borrowedDevices, setBorrowedDevices] = useState<ReturnDevice[]>([]);
  const [rentalLogs, setRentalLogs] = useState<RentalLog[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<ReturnDevice | null>(null);
  const [uploadedPhotoSetId, setUploadedPhotoSetId] = useState("");
  const [selectedPhotoNames, setSelectedPhotoNames] = useState<Record<number, string>>({});
  const [error, setError] = useState("");
  const photoSteps = getPhotoSteps(deviceType);
  const hasAllRequiredPhotos = photoSteps.every((_, index) => selectedPhotoNames[index]);

  useEffect(() => {
    let active = true;

    async function loadBorrowedDevices() {
      try {
        setState("loading");
        setError("");
        setUploadedPhotoSetId("");
        setSelectedPhotoNames({});

        const [deviceResponse, logResponse] = await Promise.all([
          deviceType === "tablet" ? getTablets() : getLaptops(),
          getRentalLogs(),
        ]);
        const devices =
          deviceType === "tablet"
            ? (deviceResponse as { tablets: Tablet[] }).tablets
            : (deviceResponse as { laptops: Laptop[] }).laptops;
        const rented = devices.filter((device) => {
          return device.status === "rented" && device.currentStudentId === studentId;
        });

        if (!active) return;

        setBorrowedDevices(rented);
        setRentalLogs(logResponse.logs);
        setSelectedDevice(rented[0] ?? null);
        setState(rented.length > 0 ? "ready" : "none");
      } catch {
        if (!active) return;

        setError("Could not check borrowed devices. Make sure the API server is running.");
        setState("error");
      }
    }

    loadBorrowedDevices();

    return () => {
      active = false;
    };
  }, [deviceType, studentId]);

  function handleOpenPhotoPage(device: ReturnDevice) {
    setSelectedDevice(device);
    setSelectedPhotoNames({});
    setUploadedPhotoSetId("");
    setError("");
    setState("photo");
  }

  function handlePhotoChange(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    setSelectedPhotoNames((current) => {
      const next = { ...current };

      if (file) {
        next[index] = file.name;
      } else {
        delete next[index];
      }

      return next;
    });
  }

  async function handleUploadReturnPhotos() {
    if (!selectedDevice) {
      return;
    }

    if (!hasAllRequiredPhotos) {
      setError("Upload all required return photos before continuing.");
      return;
    }

    try {
      setError("");
      setState("uploading");
      const response = await uploadMockReturnPhotos({
        studentId,
        deviceType,
        deviceId: selectedDevice.id,
      });
      setUploadedPhotoSetId(response.photoSet.id);
      setState("complete");
    } catch {
      setError("Could not upload return photos. Make sure the API server is running.");
      setState("photo");
    }
  }

  function handleTemporaryNext() {
    setError("");
    setSelectedDevice((current) => current ?? borrowedDevices[0] ?? null);
    setState("complete");
  }

  return (
    <main className="app-shell home-screen">
      <BrandMark fixed onClick={onStudentClick} />
      <LanguageToggle text={text} onToggle={onToggleLanguage} />

      <button className="student-number" type="button" onClick={onStudentClick}>
        {studentId}
      </button>

      <section className="return-workflow page-drop" aria-labelledby="return-title">
        <button className="device-back-button rent-back-button" type="button" aria-label={text.back} onClick={onBack}>
          <span aria-hidden="true">&larr;</span>
        </button>

        <div className="rent-heading">
          <h1 id="return-title">{getReturnTitle(deviceType, state)}</h1>
        </div>

        <div className="rent-panel">
          <div className="readonly-row">
            <span>Student number</span>
            <button className="readonly-value-button" type="button" onClick={handleTemporaryNext}>
              {studentId}
            </button>
          </div>

          {state === "loading" ? (
            <div className="status-panel" aria-live="polite">
              <span>Checking</span>
              <p>Checking borrowed {deviceType}s.</p>
            </div>
          ) : null}

          {state === "none" ? (
            <div className="status-panel status-success" aria-live="polite">
              <span>No device</span>
              <strong>반납할 기기가 없습니다.</strong>
              <p>No rented {deviceType} was found for this student number.</p>
            </div>
          ) : null}

          {state === "ready" ? (
            <div className="return-device-list" aria-live="polite">
              {borrowedDevices.slice(0, 1).map((device) => (
                <article className="return-device-card" key={device.id}>
                  <div className="return-device-main">
                    <span>Rented {deviceType}</span>
                    <strong>{device.id}</strong>
                    <p>{device.model}</p>
                  </div>
                  <div className="return-time-left return-time-static">
                    <span>Due date</span>
                    <strong>{formatDueDate(device, rentalLogs)}</strong>
                  </div>
                  <button
                    className="primary-button return-continue-button"
                    type="button"
                    aria-label={`Continue return for ${device.id}`}
                    onClick={() => handleOpenPhotoPage(device)}
                  >
                    Continue
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          {state === "photo" ? (
            <div className="return-photo-panel" aria-live="polite">
              <div className="return-photo-header">
                <span>{deviceType} photo capture</span>
                <strong>{selectedDevice?.id}</strong>
                <p>Capture the required return photos in order.</p>
              </div>
              <div className="return-photo-steps">
                {photoSteps.map((step, index) => (
                  <div className="return-photo-step" key={step}>
                    <span>{index + 1}</span>
                    <div className="return-photo-step-body">
                      <strong>{step}</strong>
                      <label className="return-photo-upload">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(event) => handlePhotoChange(index, event)}
                        />
                        <em>{selectedPhotoNames[index] || "Choose photo"}</em>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {state === "uploading" ? (
            <div className="status-panel" aria-live="polite">
              <span>Uploading</span>
              <strong>{selectedDevice?.id}</strong>
              <p>Saving return photo records.</p>
            </div>
          ) : null}

          {state === "complete" ? (
            <div className="rent-complete-screen" aria-live="polite">
              <div className="rent-complete-large-check" aria-hidden="true">
                <span className="rent-complete-check-icon" />
              </div>
              <h2>Return completed</h2>
              <strong>{selectedDevice?.id}</strong>
              <p>The return process has been completed.</p>
            </div>
          ) : null}

          {error ? (
            <div className="status-panel status-error" role="alert">
              <span>Needs attention</span>
              <p>{error}</p>
            </div>
          ) : null}

          {state === "photo" ? (
            <div className="return-photo-actions">
              <button className="text-button" type="button" onClick={() => setState("ready")}>
                Back
              </button>
              <button
                className="primary-button return-next-button"
                type="button"
                disabled={!hasAllRequiredPhotos}
                onClick={handleUploadReturnPhotos}
              >
                Next
              </button>
            </div>
          ) : null}

          {state === "none" || state === "complete" ? (
            <button className="text-button" type="button" onClick={onBack}>
              {text.back}
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
