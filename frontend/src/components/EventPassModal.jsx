import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG } from "qrcode.react";

export default function EventPassModal({ registration, user, onClose }) {
  const dialog = useRef(null);
  const event = registration?.event;
  useEffect(() => {
    if (!event) return;
    const node = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => { node.close(); document.body.style.overflow = overflow; };
  }, [event]);
  if (!event) return null;
  const fields = [
    ["Attendee", user?.name], ["Student ID", registration.studentId],
    ["Date", new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })], ["Venue", event.venue]
  ];
  return createPortal(
    <dialog className="admission-dialog" ref={dialog} aria-labelledby="admission-title" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === dialog.current) onClose(); }}>
      <article id="printable-pass" className="admission">
        <header className="admission-cover">
          <span className="admission-kicker">Campus Events / Digital pass</span>
          <button autoFocus className="admission-close" onClick={onClose} aria-label="Close">×</button>
          <div className="admission-art" aria-hidden="true"><i/><i/><i/></div>
          <h2 id="admission-title">{event.eventName}</h2>
          <span className="admission-type">{event.eventType}</span>
        </header>
        <dl className="admission-fields">{fields.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>)}</dl>
        {registration.paymentStatus === "Paid" && <p className="admission-payment">Paid ₹{registration.amountPaid} · {registration.paymentId}</p>}
        <div className="admission-stub">
          <div className="admission-qr"><QRCodeSVG value={registration.ticketCode || registration._id} size={136} level="M" includeMargin /></div>
          <div className="admission-code">
            <span className="admission-state" data-status={registration.status}>{registration.status === "Attended" ? "Checked in" : registration.status}</span>
            <strong>{registration.ticketCode}</strong><p>Show this code at the venue entrance.</p>
          </div>
        </div>
        <button className="admission-print" onClick={() => window.print()}>Print / Save as PDF <span aria-hidden="true">↗</span></button>
      </article>
    </dialog>, document.body
  );
}
