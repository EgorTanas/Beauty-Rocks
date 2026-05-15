import { useEffect, useState } from 'react';
import { getUserAvatarUrl, getUserInitials } from '../utils/userDisplay';

export default function UserAvatar({ user, className = 'site-user-avatar' }) {
  const src = getUserAvatarUrl(user);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt=""
        className={`${className} ${className}--img`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className={className} aria-hidden>
      {getUserInitials(user)}
    </span>
  );
}
