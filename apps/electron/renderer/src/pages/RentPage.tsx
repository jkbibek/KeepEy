import { ChangeEvent, useEffect, useState } from "react";
import {
  confirmPendingRentSession,
  createPendingRentSession,
  getLaptops,
  getTablets,
} from "../api/mockClient";
import { BrandMark } from "../components/BrandMark";
import { LanguageToggle } from "../components/LanguageToggle";
import type { AppCopy } from "../lib/copy";
import type { ApiError, Laptop, PendingRentSession, Tablet } from "../types";

type RentPageProps = {
  text: AppCopy;
  studentId: string;
  deviceType: "laptop" | "tablet";
  onToggleLanguage: () => void;
  onStudentClick: () => void;
  onBack: () => void;
};

type RentDevice = Laptop | Tablet;
type RentQrState = "loadingDevices" | "selectingDevice" | "creating" | "ready" | "confirming" | "confirmed" | "error";

function isKoreanCopy(text: AppCopy) {
  return text.localeName === "English";
}

function getBrandLabel(brand: string, text: AppCopy) {
  if (!isKoreanCopy(text)) {
    return brand;
  }

  if (brand === "Apple" || brand === "애플") {
    return "애플";
  }

  if (brand === "Samsung" || brand === "삼성") {
    return "삼성";
  }

  return brand;
}

function getRentCopy(text: AppCopy) {
  if (isKoreanCopy(text)) {
    return {
      title: "\uB300\uC5EC QR",
      uploadTitle: "QR \uC774\uBBF8\uC9C0 \uC5C5\uB85C\uB4DC",
      uploadInstruction: "\uAE30\uAE30\uC758 QR\uC744 \uCD2C\uC601\uD55C \uB4A4 \uC774\uBBF8\uC9C0\uB97C \uC5C5\uB85C\uB4DC\uD558\uC138\uC694.",
      uploadButton: "QR \uC774\uBBF8\uC9C0 \uC120\uD0DD",
      uploadHelp: "\uC774\uBBF8\uC9C0\uAC00 \uC5C5\uB85C\uB4DC\uB418\uBA74 \uB300\uC5EC\uAC00 \uC644\uB8CC\uB429\uB2C8\uB2E4.",
      listTitle: "\uB300\uC5EC \uAC00\uB2A5 \uAE30\uAE30",
      listBody: "\uB300\uC5EC\uD560 \uAE30\uAE30\uB97C \uC120\uD0DD\uD558\uC138\uC694.",
      loadingDevices: "\uAE30\uAE30 \uD655\uC778 \uC911",
      loadingDevicesBody: "\uB300\uC5EC \uAC00\uB2A5\uD55C \uAE30\uAE30\uB97C \uBD88\uB7EC\uC624\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      noDevices: "\uB300\uC5EC \uAC00\uB2A5\uD55C \uAE30\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.",
      brand: "\uAE30\uC885",
      deviceNumber: "\uAE30\uAE30 \uBC88\uD638",
      rentButton: "\uB300\uC5EC",
      studentNumber: "\uD559\uC0DD \uBC88\uD638",
      creating: "\uC0DD\uC131 \uC911",
      creatingBody: "\uB300\uC5EC \uC138\uC158\uC744 \uC900\uBE44\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      pendingRent: "\uB300\uC5EC \uB300\uAE30",
      confirming: "\uD655\uC778 \uC911",
      confirmingBody: "\uC11C\uBC84\uC5D0 \uB300\uC5EC \uC644\uB8CC \uC0C1\uD0DC\uB97C \uBC18\uC601\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4.",
      completed: "\uB80C\uD2B8 \uC644\uB8CC",
      completedBody: "\uAE30\uAE30 \uB300\uC5EC\uAC00 \uC815\uC0C1\uC801\uC73C\uB85C \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
      needsAttention: "\uD655\uC778 \uD544\uC694",
      backToTasks: "\uC791\uC5C5 \uC120\uD0DD\uC73C\uB85C \uB3CC\uC544\uAC00\uAE30",
    };
  }

  return {
    title: "Rent QR",
    uploadTitle: "Upload QR image",
    uploadInstruction: "Take a photo of the device QR and upload the image.",
    uploadButton: "Choose QR image",
    uploadHelp: "The rental is completed after an image is uploaded.",
    listTitle: "Available devices",
    listBody: "Choose a device to rent.",
    loadingDevices: "Checking devices",
    loadingDevicesBody: "Loading available devices.",
    noDevices: "No available devices.",
    brand: "Brand",
    deviceNumber: "Device number",
    rentButton: "Rent",
    studentNumber: "Student number",
    creating: "Creating",
    creatingBody: "Preparing a rental session.",
    pendingRent: "Pending rent",
    confirming: "Confirming",
    confirmingBody: "Updating the rental status on the server.",
    completed: "Rent completed",
    completedBody: "The device rental has been completed successfully.",
    needsAttention: "Needs attention",
    backToTasks: "Back to tasks",
  };
}

function getRentSessionErrorMessage(error: unknown) {
  const apiError = error as ApiError;
  const code = apiError?.error?.code;

  if (code === "LAPTOP_NOT_FOUND") {
    return "No available laptop was found.";
  }

  if (code === "LAPTOP_NOT_AVAILABLE") {
    return "The selected device is not available for rent.";
  }

  if (code === "RENT_SESSION_EXPIRED") {
    return "This QR code has expired. Go back and create a new rent session.";
  }

  return "QR rent session could not be created. Make sure the API server is running.";
}

export function RentPage({
  text,
  studentId,
  deviceType,
  onToggleLanguage,
  onStudentClick,
  onBack,
}: RentPageProps) {
  const [state, setState] = useState<RentQrState>("loadingDevices");
  const [availableDevices, setAvailableDevices] = useState<RentDevice[]>([]);
  const [session, setSession] = useState<PendingRentSession | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<RentDevice | null>(null);
  const [error, setError] = useState("");
  const rentText = getRentCopy(text);

  useEffect(() => {
    let active = true;

    async function loadAvailableDevices() {
      try {
        setState("loadingDevices");
        setError("");
        const response = deviceType === "tablet" ? await getTablets() : await getLaptops();
        const devices =
          deviceType === "tablet"
            ? (response as { tablets: Tablet[] }).tablets
            : (response as { laptops: Laptop[] }).laptops;
        const available = devices
          .filter((device) => device.status === "available")
          .sort((a, b) => a.id.localeCompare(b.id))
          .slice(0, 10);

        if (!active) return;

        setAvailableDevices(available);
        setSelectedDevice(null);
        setSession(null);
        setState("selectingDevice");
      } catch (nextError) {
        if (!active) return;

        setError(getRentSessionErrorMessage(nextError));
        setState("error");
      }
    }

    loadAvailableDevices();

    return () => {
      active = false;
    };
  }, [deviceType]);

  async function handleQrImageUpload(event: ChangeEvent<HTMLInputElement>) {
    if (!session || state !== "ready") {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setState("confirming");
      const response = await confirmPendingRentSession(session.id);
      setSelectedDevice(response.laptop);
      setState("confirmed");
    } catch (nextError) {
      setError(getRentSessionErrorMessage(nextError));
      setState("error");
    }
  }

  async function handleStartRent(device: RentDevice) {
    try {
      setSelectedDevice(device);
      setState("creating");
      setError("");

      const response = await createPendingRentSession({
        studentId,
        deviceType,
        deviceId: device.id,
      });

      setSession(response.session);
      setSelectedDevice(response.laptop);
      setState("ready");
    } catch (nextError) {
      setError(getRentSessionErrorMessage(nextError));
      setState("error");
    }
  }

  return (
    <main className="app-shell home-screen">
      <BrandMark fixed onClick={onStudentClick} />
      <LanguageToggle text={text} onToggle={onToggleLanguage} />

      <section className="rent-workflow page-drop" aria-labelledby="rent-title">
        <div className="rent-heading">
          <h1 id="rent-title">{state === "selectingDevice" || state === "loadingDevices" ? rentText.listTitle : rentText.title}</h1>
        </div>

        <div className={`rent-panel qr-rent-panel ${state === "confirmed" ? "rent-complete-panel" : ""}`}>
          {state !== "confirmed" ? (
            <div className="readonly-row">
              <span>{rentText.studentNumber}</span>
              <strong>{studentId}</strong>
            </div>
          ) : null}

          {state === "loadingDevices" ? (
            <div className="status-panel status-loading" aria-live="polite" aria-busy="true">
              <span className="async-state-label">
                <span className="spinner" aria-hidden="true" />
                {rentText.loadingDevices}
              </span>
              <p>{rentText.loadingDevicesBody}</p>
            </div>
          ) : null}

          {state === "selectingDevice" ? (
            <div className="available-device-panel" aria-live="polite">
              <p>{rentText.listBody}</p>
              {availableDevices.length > 0 ? (
                <div className="available-device-list">
                  <div className="available-device-header" aria-hidden="true">
                    <span>{rentText.brand}</span>
                    <span>{rentText.deviceNumber}</span>
                    <span />
                  </div>
                  {availableDevices.map((device) => (
                    <article className="available-device-row" key={device.id}>
                      <span>{getBrandLabel(device.brand, text)}</span>
                      <strong>{device.id}</strong>
                      <button className="button-like-rent" type="button" onClick={() => handleStartRent(device)}>
                        {rentText.rentButton}
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="empty-state-panel" role="status">
                  <span className="empty-state-icon" aria-hidden="true">
                    <EmptyIcon />
                  </span>
                  <strong>{rentText.noDevices}</strong>
                  <p>{rentText.listBody}</p>
                </div>
              )}
            </div>
          ) : null}

          {state === "creating" ? (
            <div className="status-panel status-loading" aria-live="polite" aria-busy="true">
              <span className="async-state-label">
                <span className="spinner" aria-hidden="true" />
                {rentText.creating}
              </span>
              <p>{rentText.creatingBody}</p>
            </div>
          ) : null}

          {state === "ready" && session && selectedDevice ? (
            <div className="qr-upload-panel" aria-live="polite">
              <label className="qr-upload-card">
                <input type="file" accept="image/*" capture="environment" onChange={handleQrImageUpload} />
                <span>{rentText.uploadTitle}</span>
                <strong className="qr-upload-button">{rentText.uploadButton}</strong>
                <p>{rentText.uploadInstruction}</p>
              </label>

              <div className="qr-card qr-device-summary">
                <div>
                  <span>{rentText.pendingRent}</span>
                  <strong>{selectedDevice.id}</strong>
                  <p>{selectedDevice.model}</p>
                </div>
              </div>

              <div className="status-panel">
                <p>{rentText.uploadHelp}</p>
              </div>
            </div>
          ) : null}

          {state === "confirming" ? (
            <div className="status-panel status-loading" aria-live="polite" aria-busy="true">
              <span className="async-state-label">
                <span className="spinner" aria-hidden="true" />
                {rentText.confirming}
              </span>
              <p>{rentText.confirmingBody}</p>
            </div>
          ) : null}

          {state === "confirmed" && selectedDevice ? (
            <div className="rent-complete-screen" aria-live="polite">
              <div className="rent-complete-large-check" aria-hidden="true">
                <span className="rent-complete-check-icon" />
              </div>
              <h2>{rentText.completed}</h2>
              <strong>{selectedDevice.id}</strong>
              <p>{rentText.completedBody}</p>
            </div>
          ) : null}

          {state === "error" ? (
            <div className="status-panel status-error" role="alert">
              <span>{rentText.needsAttention}</span>
              <p>{error}</p>
            </div>
          ) : null}

          {state !== "confirmed" ? (
            <button className="text-button" type="button" onClick={onBack}>
              {rentText.backToTasks}
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function EmptyIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <rect x="4" y="7" width="16" height="12" rx="2" />
      <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      <path d="M4 11h16" />
    </svg>
  );
}
