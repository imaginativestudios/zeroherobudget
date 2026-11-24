import { useState } from 'react';

// Launch moment: Dec 1, 2026 at 12:00 AM Pacific (08:00 UTC).
// Before this instant the badge renders nothing so it never links to a hidden launch page.
const PH_LAUNCH_START = new Date('2026-12-01T08:00:00Z').getTime();

const PH_POST_URL =
  'https://www.producthunt.com/posts/zero-hero?embed=true' +
  '&utm_source=badge-featured&utm_medium=badge&utm_campaign=zero-hero';

interface ProductHuntBadgeProps {
  theme: 'dark' | 'light';
  /** Footer instance defers loading; the hero instance loads normally. */
  lazy?: boolean;
}

export function ProductHuntBadge({ theme, lazy = false }: ProductHuntBadgeProps) {
  // Checked once per mount: after launch it shows and never changes again.
  const [show] = useState(() => Date.now() >= PH_LAUNCH_START);

  if (!show) return null;

  return (
    <a
      href={PH_POST_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Zero Hero on Product Hunt (opens in a new tab)"
      className="inline-block rounded-md"
    >
      <img
        src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1328215&theme=${theme}`}
        alt="Zero Hero on Product Hunt"
        width={250}
        height={54}
        loading={lazy ? 'lazy' : undefined}
        className="max-w-full h-auto"
      />
    </a>
  );
}
