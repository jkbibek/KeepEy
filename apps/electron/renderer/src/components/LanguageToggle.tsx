import type { AppCopy } from "../lib/copy";

type LanguageToggleProps = {
  text: AppCopy;
  onToggle: () => void;
};

export function LanguageToggle({ text, onToggle }: LanguageToggleProps) {
  const isKorean = text.localeName === "English";

  return (
    <button
      className="language-toggle"
      type="button"
      aria-label={text.languageLabel}
      title={text.languageLabel}
      onClick={onToggle}
    >
      <span className={isKorean ? "active" : ""} aria-hidden="true">
        한
      </span>
      <span className={!isKorean ? "active" : ""} aria-hidden="true">
        A
      </span>
    </button>
  );
}
