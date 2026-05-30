import { FormEvent } from "react";
import { BrandMark } from "../components/BrandMark";
import { LanguageToggle } from "../components/LanguageToggle";
import type { AppCopy } from "../lib/copy";
import type { LoginErrors } from "../lib/studentValidation";

type LoginPageProps = {
  text: AppCopy;
  studentId: string;
  errors: LoginErrors;
  isSubmitting: boolean;
  onStudentIdChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleLanguage: () => void;
};

export function LoginPage({
  text,
  studentId,
  errors,
  isSubmitting,
  onStudentIdChange,
  onSubmit,
  onToggleLanguage,
}: LoginPageProps) {
  const isEnglish = text.localeName === "Korean";
  const loginCopy = isEnglish
    ? {
        title: "Student number",
        body: "Please enter your credentials to continue.",
        label: "Student number",
        placeholder: "e.g. 20230001",
        help: "6-12 digits",
        submit: "Continue",
        submitting: "Checking...",
        footer: "Student Number: --",
      }
    : {
        title: "학생 번호 입력",
        body: "계속하려면 학생 번호를 입력하세요.",
        label: "학생 번호",
        placeholder: "예: 20230001",
        help: "6-12자리 숫자",
        submit: "계속",
        submitting: "확인 중...",
        footer: "Student Number: --",
      };

  return (
    <main className="login-page">
      <header className="login-topbar">
        <BrandMark />
        <LanguageToggle text={text} onToggle={onToggleLanguage} />
      </header>

      <section className="login-canvas" aria-labelledby="login-title">
        <div className="login-stack">
          <div className="login-panel">
            <div className="login-heading">
              <h1 id="login-title">{loginCopy.title}</h1>
              <p>{loginCopy.body}</p>
            </div>

            <form className="student-form" onSubmit={onSubmit} noValidate>
              <div className="field-group">
                <label htmlFor="student-id">{loginCopy.label}</label>
                <input
                  id="student-id"
                  value={studentId}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={12}
                  minLength={6}
                  placeholder={loginCopy.placeholder}
                  aria-invalid={Boolean(errors.studentId)}
                  aria-describedby={errors.studentId ? "student-id-error" : "student-id-help"}
                  onChange={(event) => onStudentIdChange(event.target.value.replace(/\D/g, ""))}
                />
                {errors.studentId ? (
                  <p className="field-error" id="student-id-error">
                    {errors.studentId}
                  </p>
                ) : (
                  <p className="field-help" id="student-id-help">
                    <InfoIcon />
                    <span>{loginCopy.help}</span>
                  </p>
                )}
              </div>

              <button className="primary-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? loginCopy.submitting : loginCopy.submit}
              </button>
            </form>

            <div className="login-brand-panel" aria-label="KeepEy service message">
              <BrandMark className="login-panel-logo" />
              <p>Operational clarity and trust for our university campus environment.</p>
            </div>
          </div>

          <div className="login-context-grid" aria-label="Service context">
            <article className="context-card">
              <span className="context-icon" aria-hidden="true">
                <ShieldIcon />
              </span>
              <div>
                <strong>Secure Access</strong>
                <p>Encrypted sessions</p>
              </div>
            </article>

            <article className="context-card">
              <span className="context-icon" aria-hidden="true">
                <SupportIcon />
              </span>
              <div>
                <strong>IT Support</strong>
                <p>24/7 Assistance</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <footer className="login-footer">
        <span>{loginCopy.footer}</span>
      </footer>
    </main>
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

function SupportIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
      <path d="M5 12a7 7 0 0 1 14 0" />
      <path d="M5 12v3.2a2 2 0 0 0 2 2h1.1V12H5Z" />
      <path d="M19 12v3.2a2 2 0 0 1-2 2h-1.1V12H19Z" />
      <path d="M14.2 19.2H12" />
    </svg>
  );
}
