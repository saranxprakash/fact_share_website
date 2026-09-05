import "./VerdictStamp.css";

const COPY = {
  pending: "Checking",
  verified: "Verified",
  disputed: "Disputed",
  unverified: "Unverified",
};

// Renders the AI's verdict as a rubber-stamp mark — the single bold
// element in the design. "pending" stays flat (nothing to stamp yet);
// a resolved verdict animates in like it's just been pressed onto the page.
export default function VerdictStamp({ status = "pending" }) {
  const isResolved = status !== "pending";

  return (
    <span
      className={`stamp stamp--${status} ${isResolved ? "stamp--land" : ""}`}
    >
      {COPY[status] || "Unverified"}
    </span>
  );
}
