import { KeyboardEvent, PointerEvent } from "react";
import { BrandMark } from "../components/BrandMark";
import { LanguageToggle } from "../components/LanguageToggle";
import type { AppCopy, Task } from "../lib/copy";

type HomePageProps = {
  text: AppCopy;
  studentId: string;
  selectedTask: Task | null;
  pressedTask: Task | null;
  onToggleLanguage: () => void;
  onStudentClick: () => void;
  onTaskPointerDown: (task: Task) => void;
  onTaskPointerUp: (task: Task, event: PointerEvent<HTMLButtonElement>) => void;
  onTaskClick: (task: Task) => void;
  onTaskCancel: () => void;
  onTaskKeyDown: (task: Task, event: KeyboardEvent<HTMLButtonElement>) => void;
  onDeviceBack: () => void;
  onLaptopSelect: () => void;
  onTabletSelect: () => void;
};

export function HomePage({
  text,
  studentId,
  selectedTask,
  pressedTask,
  onToggleLanguage,
  onStudentClick,
  onTaskPointerDown,
  onTaskPointerUp,
  onTaskClick,
  onTaskCancel,
  onTaskKeyDown,
  onDeviceBack,
  onLaptopSelect,
  onTabletSelect,
}: HomePageProps) {
  return (
    <main className="task-page">
      <header className="login-topbar">
        <BrandMark onClick={onStudentClick} />
        <div className="home-topbar-actions">
          <LanguageToggle text={text} onToggle={onToggleLanguage} />
        </div>
      </header>

      <section className="task-canvas" aria-labelledby="task-title">
        {selectedTask ? (
          <section
            key={`device-picker-${selectedTask}`}
            className="device-picker page-drop"
            aria-labelledby="device-title"
          >
            <h2 id="device-title">{text.chooseDeviceTitle}</h2>

            <div className="device-grid-shell">
              <button className="device-back-button" type="button" aria-label={text.back} onClick={onDeviceBack}>
                <span aria-hidden="true">&larr;</span>
              </button>

              <div className="device-grid">
                <button className="device-card device-card-active" type="button" onClick={onLaptopSelect}>
                  <span className="device-icon laptop-icon" aria-hidden="true">
                    <span />
                  </span>
                  <strong>{text.laptopLabel}</strong>
                </button>

                <button className="device-card device-card-active" type="button" onClick={onTabletSelect}>
                  <span className="device-icon tablet-icon" aria-hidden="true">
                    <span />
                  </span>
                  <strong>{text.tabletLabel}</strong>
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section key="task-choice" className="task-content page-drop" aria-labelledby="task-title">
            <div className="task-heading task-heading-large">
              <h1 id="task-title" className="task-title">
                {text.taskTitle}
              </h1>
              <p>{text.taskSubtitle}</p>
            </div>

            <div className="task-card-grid" aria-label={text.taskTitle}>
              <button
                className={`task-card rent-card ${pressedTask === "rent" ? "is-pressed" : ""}`}
                type="button"
                aria-label={text.rentLabel}
                onClick={() => onTaskClick("rent")}
                onPointerDown={() => onTaskPointerDown("rent")}
                onPointerUp={(event) => onTaskPointerUp("rent", event)}
                onPointerCancel={onTaskCancel}
                onPointerLeave={onTaskCancel}
                onKeyDown={(event) => onTaskKeyDown("rent", event)}
              >
                <span className="task-card-icon" aria-hidden="true">
                  <LaptopIcon />
                </span>
                <strong>{text.rentLabel}</strong>
                <span className="task-card-link">
                  {text.rentCardCta} <ArrowIcon />
                </span>
              </button>

              <button
                className={`task-card return-card ${pressedTask === "return" ? "is-pressed" : ""}`}
                type="button"
                aria-label={text.returnLabel}
                onClick={() => onTaskClick("return")}
                onPointerDown={() => onTaskPointerDown("return")}
                onPointerUp={(event) => onTaskPointerUp("return", event)}
                onPointerCancel={onTaskCancel}
                onPointerLeave={onTaskCancel}
                onKeyDown={(event) => onTaskKeyDown("return", event)}
              >
                <span className="task-card-icon" aria-hidden="true">
                  <ReturnIcon />
                </span>
                <strong>{text.returnLabel}</strong>
                <span className="task-card-link">
                  {text.returnCardCta} <ArrowIcon />
                </span>
              </button>
            </div>

            <div className="task-info-row" aria-label="Rental information">
              <span>
                <InfoIcon />
                {text.rentalTimeInfo}
              </span>
              <span>
                <ShieldIcon />
                {text.studentIdRequiredInfo}
              </span>
            </div>
          </section>
        )}
      </section>

      <footer className="login-footer">
        <div className="home-footer-content">
          <span>
            {text.footerStudentPrefix}: {studentId}
          </span>
          <span className="footer-divider" aria-hidden="true" />
          <span>{text.footerCopyright}</span>
        </div>
      </footer>
    </main>
  );
}

function LaptopIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <rect x="5" y="5" width="14" height="10" rx="1.5" />
      <path d="M3.5 18h17" />
      <path d="M9.5 18h5" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M9 7 5 11l4 4" />
      <path d="M5 11h9.5a4.5 4.5 0 0 1 0 9H12" />
      <path d="M17 4v5h5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10v7" />
      <path d="M12 7h.01" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M12 3 5.5 5.4v5.7c0 4.1 2.7 7.8 6.5 9.1 3.8-1.3 6.5-5 6.5-9.1V5.4L12 3Z" />
      <path d="m8.8 12.1 2 2 4.4-4.5" />
    </svg>
  );
}
