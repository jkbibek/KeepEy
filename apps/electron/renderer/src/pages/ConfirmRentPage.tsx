import { useEffect, useMemo, useState } from "react";
import {
  confirmPendingRentSession,
  getPendingRentSession,
} from "../api/mockClient";
import { BrandMark } from "../components/BrandMark";
import type { ApiError, Laptop, PendingRentSession } from "../types";

type ConfirmState = "loading" | "ready" | "confirming" | "confirmed" | "error";

function getConfirmErrorMessage(error: unknown) {
  const apiError = error as ApiError;
  const code = apiError?.error?.code;

  if (code === "RENT_SESSION_NOT_FOUND") {
    return "This rent confirmation link is no longer available.";
  }

  if (code === "RENT_SESSION_NOT_PENDING") {
    return "This rent session has already been used.";
  }

  if (code === "LAPTOP_NOT_AVAILABLE") {
    return "This device is no longer available for rent.";
  }

  return "The rent could not be confirmed. Try again near the rental desk.";
}

export function ConfirmRentPage() {
  const sessionId = useMemo(() => {
    const match = window.location.pathname.match(/^\/confirm-rent\/([^/]+)$/);
    return match?.[1] ?? "";
  }, []);
  const [state, setState] = useState<ConfirmState>("loading");
  const [session, setSession] = useState<PendingRentSession | null>(null);
  const [laptop, setLaptop] = useState<Laptop | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        setState("loading");
        setError("");
        const response = await getPendingRentSession(sessionId);

        if (!active) return;

        setSession(response.session);
        setLaptop(response.laptop);
        setState(response.session.status === "pending" ? "ready" : "confirmed");
      } catch (nextError) {
        if (!active) return;

        setError(getConfirmErrorMessage(nextError));
        setState("error");
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, [sessionId]);

  async function handleConfirm() {
    try {
      setState("confirming");
      setError("");
      const response = await confirmPendingRentSession(sessionId);
      setLaptop(response.laptop);
      setState("confirmed");
    } catch (nextError) {
      setError(getConfirmErrorMessage(nextError));
      setState("error");
    }
  }

  return (
    <main className="confirm-rent-page">
      <header className="login-topbar">
        <BrandMark />
      </header>

      <section className="confirm-rent-canvas" aria-labelledby="confirm-rent-title">
        <div className="confirm-rent-panel">
          <div className="login-heading">
            <h1 id="confirm-rent-title">Confirm rent</h1>
            <p>Review the pending device rental before confirming.</p>
          </div>

          {state === "loading" ? (
            <div className="status-panel">
              <span>Loading</span>
              <p>Checking the rent session.</p>
            </div>
          ) : null}

          {(state === "ready" || state === "confirming") && session && laptop ? (
            <>
              <div className="readonly-row">
                <span>Student number</span>
                <strong>{session.studentId}</strong>
              </div>
              <div className="readonly-row">
                <span>Device</span>
                <strong>{laptop.id}</strong>
              </div>
              <button className="primary-button" type="button" disabled={state === "confirming"} onClick={handleConfirm}>
                {state === "confirming" ? "Confirming..." : "Confirm"}
              </button>
            </>
          ) : null}

          {state === "confirmed" ? (
            <div className="status-panel status-success">
              <span>Completed</span>
              <strong>{laptop?.id ?? "Device"}</strong>
              <p>The rental has been completed.</p>
            </div>
          ) : null}

          {state === "error" ? (
            <div className="status-panel status-error" role="alert">
              <span>Needs attention</span>
              <p>{error}</p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}
