type BrandMarkProps = {
  fixed?: boolean;
  className?: string;
  onClick?: () => void;
};

const KEEPEY_LOGO_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDXhiqyJvfSjmaEzdYV-nzSmOGL1NOIL23Xa42GsPbidCZwDoi6NLIU9k06m1RNLj7fY6CQKVFOXsxmKshTc-VdO70g5Oj0IZxRJneX3VX83u9vFC6K5lUNvmefTnrGmE2LAKSs7MEdsOqXlpuaWoOHkNRwMmpTSZ6H_mxibZtVEpNXjDYh8QH43nG0ek2mY6-aIxXNaSRYnMvMJsCnOOIbCj17_UjPyFyW86584zD9pvQdpGXRlvbBY6kS8Pn0dQ2Y6jcZfFGriw4";

export function BrandMark({ fixed = false, className = "", onClick }: BrandMarkProps) {
  const mark = (
    <img className={`brand-mark ${className}`} src={KEEPEY_LOGO_URL} alt="KeepEy" />
  );

  const content = onClick ? (
    <button className="brand-button" type="button" aria-label="Back to student number" onClick={onClick}>
      {mark}
    </button>
  ) : (
    mark
  );

  if (!fixed) {
    return content;
  }

  return (
    <div className="brand-fixed" aria-label="KeepEy">
      {content}
    </div>
  );
}
