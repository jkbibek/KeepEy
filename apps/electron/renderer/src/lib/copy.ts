export type Language = "ko" | "en";
export type View = "home" | "rent" | "return";
export type Task = "rent" | "return";

export type AppCopy = {
  localeName: string;
  languageButton: string;
  languageLabel: string;
  eyebrow: string;
  loginTitle: string;
  loginHeading: string;
  loginBody: string;
  studentLabel: string;
  studentPlaceholder: string;
  studentHelp: string;
  requiredError: string;
  formatError: string;
  continue: string;
  submitting: string;
  taskTitle: string;
  taskSubtitle: string;
  rentLabel: string;
  rentAction: string;
  rentCardCta: string;
  returnLabel: string;
  returnAction: string;
  returnCardCta: string;
  rentalTimeInfo: string;
  studentIdRequiredInfo: string;
  loginSecureTitle: string;
  loginSecureDesc: string;
  loginSupportTitle: string;
  loginSupportDesc: string;
  loginBrandTagline: string;
  footerStudentPrefix: string;
  footerCopyright: string;
  chooseDeviceTitle: string;
  laptopLabel: string;
  tabletLabel: string;
  unavailable: string;
  rentMockTitle: string;
  returnMockTitle: string;
  mockBody: string;
  back: string;
};

export const copy = {
  ko: {
    localeName: "English",
    languageButton: "A/EN",
    languageLabel: "Switch language to English",
    eyebrow: "Campus laptop service",
    loginTitle: "KeepEy",
    loginHeading: "학생 번호로 시작",
    loginBody: "대여나 반납을 진행하려면 먼저 학생 번호를 입력해 주세요.",
    studentLabel: "학생 번호",
    studentPlaceholder: "예: 2026123456",
    studentHelp: "숫자 6-12자리로 입력해 주세요.",
    requiredError: "학생 번호를 입력해 주세요.",
    formatError: "학생 번호는 숫자 6-12자리로 입력해 주세요.",
    continue: "계속",
    submitting: "확인 중...",
    taskTitle: "작업을 선택하세요",
    taskSubtitle: "진행할 작업을 선택해 주세요.",
    rentLabel: "대여",
    rentAction: "Rent",
    rentCardCta: "시작하기",
    returnLabel: "반납",
    returnAction: "Return",
    returnCardCta: "진행하기",
    rentalTimeInfo: "대여 기간: 최대 1주",
    studentIdRequiredInfo: "학생 번호 인증 필요",
    loginSecureTitle: "안전한 접속",
    loginSecureDesc: "세션 암호화 적용",
    loginSupportTitle: "IT 지원",
    loginSupportDesc: "운영 시간 내 지원",
    loginBrandTagline: "캠퍼스 장비 대여·반납을 한곳에서 안전하게 관리합니다.",
    footerStudentPrefix: "학생 번호",
    footerCopyright: "© 2026 KeepEy 장비 관리",
    chooseDeviceTitle: "기기를 선택하세요",
    laptopLabel: "노트북",
    tabletLabel: "태블릿",
    unavailable: "준비 중",
    rentMockTitle: "대여 화면",
    returnMockTitle: "반납 화면",
    mockBody: "다음 단계 화면입니다.",
    back: "뒤로",
  },
  en: {
    localeName: "Korean",
    languageButton: "A/KO",
    languageLabel: "Switch language to Korean",
    eyebrow: "Campus laptop service",
    loginTitle: "KeepEy",
    loginHeading: "Start with student number",
    loginBody: "Enter a student number before rent or return inspection.",
    studentLabel: "Student number",
    studentPlaceholder: "Ex: 2026123456",
    studentHelp: "Enter 6-12 digits.",
    requiredError: "Enter a student number.",
    formatError: "Student number must be 6-12 digits.",
    continue: "Continue",
    submitting: "Checking...",
    taskTitle: "Choose a task",
    taskSubtitle: "Select the task you want to continue with.",
    rentLabel: "Rent",
    rentAction: "Rent",
    rentCardCta: "Get started",
    returnLabel: "Return",
    returnAction: "Return",
    returnCardCta: "Proceed",
    rentalTimeInfo: "Rental period: up to 1 week",
    studentIdRequiredInfo: "Student ID required",
    loginSecureTitle: "Secure access",
    loginSecureDesc: "Encrypted sessions",
    loginSupportTitle: "IT support",
    loginSupportDesc: "Help during service hours",
    loginBrandTagline: "Campus device rent and return, managed in one trusted place.",
    footerStudentPrefix: "Student number",
    footerCopyright: "© 2026 KeepEy device management",
    chooseDeviceTitle: "Choose a device",
    laptopLabel: "Laptop",
    tabletLabel: "Tablet",
    unavailable: "Soon",
    rentMockTitle: "Rent screen",
    returnMockTitle: "Return screen",
    mockBody: "This is the next step screen.",
    back: "Back",
  },
} satisfies Record<Language, AppCopy>;
