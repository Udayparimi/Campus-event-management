import { useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

const statusStyles = {
  Registered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
  Attended: "bg-blue-100 text-blue-700",
};

/**
 * A boarding-pass style digital ticket for a registered student, with a
 * scannable QR code encoding the ticket code admins use to check them in.
 */
const EventPassModal = ({ registration, user, onClose }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!registration || !registration.event) return null;
  const { event } = registration;

  const handlePrint = () => window.print();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-gray-900/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-scale-in max-h-[90vh] overflow-y-auto"
      >
        <div id="printable-pass" className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
          <button
            onClick={onClose}
            className="print:hidden absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 text-gray-500 hover:text-gray-800 flex items-center justify-center text-xl shadow"
            aria-label="Close"
          >
            &times;
          </button>

          {/* Header stub */}
          <div className="bg-hero-gradient bg-[length:200%_200%] animate-gradient-x text-white px-6 py-5">
            <p className="text-xs uppercase tracking-widest text-white/80">Digital Event Pass</p>
            <h2 className="text-xl font-bold leading-tight mt-1">{event.eventName}</h2>
            <p className="text-sm text-white/90 mt-1">{event.eventType}</p>
          </div>

          {/* Perforation line */}
          <div className="relative">
            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-gray-900/70" />
            <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-gray-900/70" />
            <div className="border-t-2 border-dashed border-gray-200" />
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Attendee</p>
                <p className="font-semibold text-gray-900">{user?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Student ID</p>
                <p className="font-semibold text-gray-900">{registration.studentId || "-"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">Venue</p>
                <p className="font-semibold text-gray-900">{event.venue}</p>
              </div>
            </div>

            {registration.paymentStatus === "Paid" && (
              <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800">
                <span>💳 Paid ₹{registration.amountPaid}</span>
                <span className="font-mono">{registration.paymentId}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-2 pt-2">
              <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-inner">
                <QRCodeSVG value={registration.ticketCode || registration._id} size={150} level="M" />
              </div>
              <p className="font-mono text-sm tracking-widest text-gray-700">{registration.ticketCode}</p>
              <span className={`badge-pill ${statusStyles[registration.status] || "bg-gray-100 text-gray-600"}`}>
                {registration.status === "Attended" ? "✓ Checked in" : registration.status}
              </span>
            </div>

            <p className="text-xs text-gray-400 text-center pt-1">
              Show this QR code at the venue entrance for a quick check-in.
            </p>

            <button onClick={handlePrint} className="print:hidden btn-outline w-full rounded-lg py-2.5 text-sm">
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPassModal;
