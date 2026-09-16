import { ICONS } from "./icon-data";

export type IconName = keyof typeof ICONS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const icon: { viewBox: string; width?: string; height?: string; fill?: string; inner: string } =
    ICONS[name];
  return (
    <svg
      className={className}
      width={icon.width}
      height={icon.height}
      viewBox={icon.viewBox}
      fill={icon.fill}
      xmlns="http://www.w3.org/2000/svg"
      dangerouslySetInnerHTML={{ __html: icon.inner }}
    />
  );
}

/** The template's animated pill button (text + two sliding arrows). */
export function SwitchButton({
  href,
  label,
  className,
  newTab,
}: {
  href: string;
  label: string;
  className: string;
  newTab?: boolean;
}) {
  return (
    <a href={href} className={className} {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
      <span className="d-flex align-items-center justify-content-center">
        <span className="btn-text">{label}</span>
        <span className="btn-icon">
          <Icon name="arrowRight" />
        </span>
        <span className="btn-icon">
          <Icon name="arrowRight" />
        </span>
      </span>
    </a>
  );
}

/** The template's round "Start the Journey" button. */
export function RoundedButton({ href, label, newTab }: { href: string; label: string; newTab?: boolean }) {
  return (
    <div className="btn_wrapper d-inline-block">
      <a href={href} className="tp-btn-rounded btn-item" {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
        <span className="d-block mb-10">
          <Icon name="roundedArrow" />
        </span>
        {label}
        <i className="tp-btn-circle-dot"></i>
      </a>
    </div>
  );
}
