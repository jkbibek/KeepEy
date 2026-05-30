import { FormEvent, KeyboardEvent, PointerEvent, useState } from "react";
import {
  clearMockStudentSession,
  startMockStudentSession,
} from "./api/mockClient";
import { copy, type Language, type Task, type View } from "./lib/copy";
import {
  normalizeStudentId,
  validateStudentId,
  type LoginErrors,
} from "./lib/studentValidation";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ConfirmRentPage } from "./pages/ConfirmRentPage";
import { RentPage } from "./pages/RentPage";
import { ReturnPage } from "./pages/ReturnPage";
import type { StudentSession } from "./types";

const TASK_TRANSITION_DELAY_MS = 260;

function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [session, setSession] = useState<StudentSession | null>(null);
  const [studentId, setStudentId] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [view, setView] = useState<View>("home");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [pressedTask, setPressedTask] = useState<Task | null>(null);
  const [rentDeviceType, setRentDeviceType] = useState<"laptop" | "tablet">("laptop");
  const [returnDeviceType, setReturnDeviceType] = useState<"laptop" | "tablet">("laptop");
  const [isTaskTransitioning, setIsTaskTransitioning] = useState(false);

  const text = copy[language];
  const isConfirmRentRoute = window.location.pathname.startsWith("/confirm-rent/");

  function toggleLanguage() {
    setLanguage((current) => (current === "ko" ? "en" : "ko"));
  }

  function handleStudentIdChange(value: string) {
    setStudentId(value);
    if (errors.studentId) {
      setErrors({});
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedStudentId = normalizeStudentId(studentId);
    const nextErrors = validateStudentId(normalizedStudentId, text);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const nextSession = await startMockStudentSession(normalizedStudentId);
      setSession(nextSession);
      setStudentId("");
      setView("home");
      setSelectedTask(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSignOut() {
    clearMockStudentSession();
    setSession(null);
    setErrors({});
    setView("home");
    setSelectedTask(null);
  }

  function handleTaskPointerDown(task: Task) {
    setPressedTask(task);
  }

  function handleTaskPointerUp(task: Task, event: PointerEvent<HTMLButtonElement>) {
    event.currentTarget.blur();
    if (!isTaskTransitioning) {
      setPressedTask(null);
    }
  }

  function handleTaskClick(task: Task) {
    if (isTaskTransitioning) {
      return;
    }

    setPressedTask(task);
    setIsTaskTransitioning(true);

    window.setTimeout(() => {
      setSelectedTask(task);
      setPressedTask(null);
      setIsTaskTransitioning(false);
    }, TASK_TRANSITION_DELAY_MS);
  }

  function handleTaskKeyDown(task: Task, event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleTaskClick(task);
    }
  }

  function handleLaptopSelect() {
    if (selectedTask) {
      if (selectedTask === "rent") {
        setRentDeviceType("laptop");
      } else {
        setReturnDeviceType("laptop");
      }
      setView(selectedTask);
      setSelectedTask(null);
    }
  }

  function handleTabletSelect() {
    if (selectedTask === "rent") {
      setRentDeviceType("tablet");
      setView("rent");
      setSelectedTask(null);
    } else if (selectedTask === "return") {
      setReturnDeviceType("tablet");
      setView("return");
      setSelectedTask(null);
    }
  }

  function handleBackHome() {
    setSelectedTask(null);
    setPressedTask(null);
    setView("home");
  }

  function handleBackToReturnDevicePicker() {
    setPressedTask(null);
    setSelectedTask("return");
    setView("home");
  }

  function handleDeviceBack() {
    if (isTaskTransitioning) {
      return;
    }

    setSelectedTask(null);
    setPressedTask(null);
  }

  if (isConfirmRentRoute) {
    return <ConfirmRentPage />;
  }

  if (!session) {
    return (
      <div className={`locale-${language}`}>
        <LoginPage
          text={text}
          studentId={studentId}
          errors={errors}
          isSubmitting={isSubmitting}
          onStudentIdChange={handleStudentIdChange}
          onSubmit={handleSubmit}
          onToggleLanguage={toggleLanguage}
        />
      </div>
    );
  }

  if (view === "rent") {
    return (
      <div className={`locale-${language}`}>
        <RentPage
          text={text}
          studentId={session.studentId}
          deviceType={rentDeviceType}
          onToggleLanguage={toggleLanguage}
          onStudentClick={handleSignOut}
          onBack={handleBackHome}
        />
      </div>
    );
  }

  if (view === "return") {
    return (
      <div className={`locale-${language}`}>
        <ReturnPage
          text={text}
          studentId={session.studentId}
          deviceType={returnDeviceType}
          onToggleLanguage={toggleLanguage}
          onStudentClick={handleSignOut}
          onBack={handleBackToReturnDevicePicker}
        />
      </div>
    );
  }

  return (
    <div className={`locale-${language}`}>
      <HomePage
        text={text}
        studentId={session.studentId}
        selectedTask={selectedTask}
        pressedTask={pressedTask}
        onToggleLanguage={toggleLanguage}
        onStudentClick={handleSignOut}
        onTaskPointerDown={handleTaskPointerDown}
        onTaskPointerUp={handleTaskPointerUp}
        onTaskClick={handleTaskClick}
        onTaskCancel={() => setPressedTask(null)}
        onTaskKeyDown={handleTaskKeyDown}
        onDeviceBack={handleDeviceBack}
        onLaptopSelect={handleLaptopSelect}
        onTabletSelect={handleTabletSelect}
      />
    </div>
  );
}

export default App;
