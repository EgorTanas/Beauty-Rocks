export default function SectionTitle({
  badge,
  badgeIcon: BadgeIcon,
  badgeIconStroke = 1.5,
  title,
  lead,
  align = 'center',
  deco = false,
  badgeClassName = '',
  className = '',
  headClassName = '',
  titleClassName = '',
  leadClassName = 'br-team-preview-lead',
}) {
  const headClasses = ['br-section-head', headClassName, className].filter(Boolean).join(' ');
  const titleClasses = ['br-section-title', align === 'left' ? 'br-section-title--left' : '', titleClassName]
    .filter(Boolean)
    .join(' ');
  const badgeClasses = ['br-badge', align === 'center' ? ' br-badge--center' : '', badgeClassName]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={headClasses}>
      {badge ? (
        <p className={badgeClasses}>
          {BadgeIcon ? (
            <BadgeIcon size={14} strokeWidth={badgeIconStroke} className="br-badge-icon" aria-hidden />
          ) : null}
          <span>{badge}</span>
        </p>
      ) : null}
      {title ? <h2 className={titleClasses}>{title}</h2> : null}
      {lead ? <p className={leadClassName}>{lead}</p> : null}
      {deco ? (
        <div className="br-section-head-deco" aria-hidden>
          <span />
          <span className="br-section-head-deco-diamond" />
          <span />
        </div>
      ) : null}
    </header>
  );
}
