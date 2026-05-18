import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const VARIANT_CLASS = {
  solid: 'br-btn--solid',
  outline: 'br-btn--outline',
  'outline-dark': 'br-btn--outline-dark',
  dark: 'br-btn--dark',
  'ghost-light': 'br-btn--ghost-light',
};

export default function ReusableButton({
  children,
  variant = 'solid',
  to,
  href,
  type = 'button',
  className = '',
  icon = false,
  iconSize = 18,
  block = false,
  large = false,
  startAppt = false,
  onClick,
  ...rest
}) {
  const classes = [
    'br-btn',
    VARIANT_CLASS[variant] || VARIANT_CLASS.solid,
    block ? 'br-btn--block' : '',
    large ? 'br-btn--lg' : '',
    startAppt ? 'br-btn--start-appt' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {children}
      {icon ? <ChevronRight size={iconSize} strokeWidth={2} className="br-btn-icon" aria-hidden /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick} {...rest}>
      {content}
    </button>
  );
}
