import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The one thing to do on this page.
 *
 * The complaint this answers: a page that lists fourteen things and a page
 * that does one thing are not the same kind of page. When everything is
 * offered at the same weight, a reader has to read the whole page to work out
 * what to press, and most of them press nothing. A page with a single
 * prominent action can be understood in the two seconds it takes to see it.
 *
 * The shape follows the house pattern already in the codebase — the exam
 * page's featured paper, the home page's hero. Amber means "this is the
 * action" and it is used for exactly one thing on a page. The reason line
 * underneath is not decoration: it says why this, why now, in one sentence a
 * reader can skip.
 *
 * It is deliberately not a card grid, not a banner, and not a fourth type
 * size. The label is set at the body size so the title still wins the page.
 *
 * A lookup page has no button to press — its main function is a field you type
 * into. So the panel also comes in a form that holds the field itself, and the
 * field carries the accent. One dominant affordance per page, whichever shape
 * it happens to take.
 */
export function ActionPanel({
  kicker,
  children,
}: {
  kicker?: string;
  children: ReactNode;
}) {
  return (
    <section className="action-panel">
      {kicker ? <span className="mono action-panel-kicker">{kicker}</span> : null}
      {children}
    </section>
  );
}

export function PageAction({
  href,
  label,
  reason,
  kicker,
  external,
}: {
  href: string;
  label: string;
  reason: string;
  kicker?: string;
  /** An outward link to a source outside the app — it opens in a new tab. */
  external?: boolean;
}) {
  return (
    <ActionPanel kicker={kicker}>
      {external ? (
        <a
          className="primary action-panel-cta"
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          <span>{label}</span>
          <span aria-hidden="true">↗</span>
        </a>
      ) : (
        <Link className="primary action-panel-cta" href={href}>
          <span>{label}</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
      <p className="micro action-panel-reason">{reason}</p>
    </ActionPanel>
  );
}
