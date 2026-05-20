/** Split text into segments for search-term highlighting */
export function getHighlightSegments(text, query) {
  const source = String(text ?? '');
  const q = query.trim();
  if (!q) return [{ text: source, match: false }];

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = source.split(regex);

  return parts
    .filter((part) => part.length > 0)
    .map((part) => ({
      text: part,
      match: part.toLowerCase() === q.toLowerCase(),
    }));
}

export default function HighlightText({ text, query, className = '', as: Tag = 'span' }) {
  const segments = getHighlightSegments(text, query);

  return (
    <Tag className={className}>
      {segments.map((segment, index) =>
        segment.match ? (
          <mark key={`${segment.text}-${index}`} className="br-search-hit">
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </Tag>
  );
}
