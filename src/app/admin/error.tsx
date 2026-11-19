"use client";

export default function StaffError({ reset }: { reset: () => void }) {
  return <div className="staff-state staff-box">
    <h1>Workspace unavailable</h1>
    <p>We couldn’t load this page. Please try again.</p>
    <button className="staff-primary" type="button" onClick={reset}>Try again</button>
  </div>;
}
