import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const emptyDetails = { phone: "", studentId: "", notes: "" };
const emptyPayment = { cardName: "", cardNumber: "", expiry: "", cvv: "" };

const validateDetails = (values) => {
  const errors = {};
  if (!values.phone.trim()) errors.phone = "Phone number is required";
  else if (!/^[0-9+\-\s()]{7,20}$/.test(values.phone.trim())) errors.phone = "Enter a valid phone number";

  if (!values.studentId.trim()) errors.studentId = "Student / roll number is required";

  if (values.notes.length > 300) errors.notes = "Keep notes under 300 characters";

  return errors;
};

// Basic Luhn check so obviously-fake numbers are rejected client-side
// before we even hit the (mock) payment endpoint.
const passesLuhnCheck = (cardNumber) => {
  const digits = cardNumber.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

const validatePayment = (values) => {
  const errors = {};
  if (!values.cardName.trim()) errors.cardName = "Name on card is required";
  if (!passesLuhnCheck(values.cardNumber)) errors.cardNumber = "Enter a valid card number";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(values.expiry.trim())) errors.expiry = "Use MM/YY format";
  if (!/^\d{3,4}$/.test(values.cvv.trim())) errors.cvv = "3-4 digits";
  return errors;
};

const formatCardNumber = (value) =>
  value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

/**
 * The registration form students fill out to claim a seat at an event.
 * For paid events this becomes a two-step flow: attendee details, then a
 * checkout step, before the registration (and seat) is confirmed.
 */
const RegistrationModal = ({ event, onClose, onSubmit, submitting }) => {
  const { user } = useAuth();
  const isPaid = !!event.isPaid;

  const [step, setStep] = useState(1);
  const [details, setDetails] = useState(emptyDetails);
  const [detailErrors, setDetailErrors] = useState({});
  const [detailTouched, setDetailTouched] = useState({});

  const [payment, setPayment] = useState(emptyPayment);
  const [paymentErrors, setPaymentErrors] = useState({});
  const [paymentTouched, setPaymentTouched] = useState({});

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleDetailChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleDetailBlur = (e) => {
    setDetailTouched((prev) => ({ ...prev, [e.target.name]: true }));
    setDetailErrors(validateDetails(details));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === "cardNumber") next = formatCardNumber(value);
    if (name === "expiry") next = formatExpiry(value);
    if (name === "cvv") next = value.replace(/\D/g, "").slice(0, 4);
    setPayment((prev) => ({ ...prev, [name]: next }));
  };

  const handlePaymentBlur = (e) => {
    setPaymentTouched((prev) => ({ ...prev, [e.target.name]: true }));
    setPaymentErrors(validatePayment(payment));
  };

  const handleDetailsSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateDetails(details);
    setDetailErrors(validationErrors);
    setDetailTouched({ phone: true, studentId: true, notes: true });
    if (Object.keys(validationErrors).length > 0) return;

    if (isPaid) {
      setStep(2);
    } else {
      onSubmit(details);
    }
  };

  const handlePaySubmit = (e) => {
    e.preventDefault();
    const validationErrors = validatePayment(payment);
    setPaymentErrors(validationErrors);
    setPaymentTouched({ cardName: true, cardNumber: true, expiry: true, cvv: true });
    if (Object.keys(validationErrors).length === 0) {
      onSubmit({ ...details, payment });
    }
  };

  const detailFieldClass = (name) =>
    `input-field ${detailTouched[name] && detailErrors[name] ? "border-red-400 focus:ring-red-400" : ""}`;

  const paymentFieldClass = (name) =>
    `input-field font-mono tracking-wide ${
      paymentTouched[name] && paymentErrors[name] ? "border-red-400 focus:ring-red-400" : ""
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-8 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary-500">
              {step === 1 ? "Register for" : "Secure checkout for"}
            </p>
            <h2 className="text-xl font-bold text-gray-900">{event.eventName}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none -mt-1"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {isPaid && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? "text-primary-600" : "text-gray-300"}`}>
              <span className="w-5 h-5 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                1
              </span>
              Details
            </div>
            <div className={`flex-1 h-0.5 rounded ${step >= 2 ? "bg-primary-400" : "bg-gray-200"}`} />
            <div className={`flex items-center gap-1.5 ${step >= 2 ? "text-primary-600" : "text-gray-300"}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-400"
                }`}
              >
                2
              </span>
              Payment
            </div>
          </div>
        )}

        <div className="rounded-lg bg-primary-50/70 border border-primary-100 px-3 py-2 text-xs text-primary-700 grid grid-cols-2 gap-1">
          <span>📅 {new Date(event.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          <span>📍 {event.venue}</span>
          <span>🎟️ {event.availableSeats} seats left</span>
          <span>{isPaid ? `💳 ₹${event.price} ticket` : "🆓 Free entry"}</span>
        </div>

        {step === 1 && (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={details.phone}
                onChange={handleDetailChange}
                onBlur={handleDetailBlur}
                placeholder="e.g. 98765 43210"
                className={detailFieldClass("phone")}
              />
              {detailTouched.phone && detailErrors.phone && (
                <p className="text-xs text-red-500 mt-1">{detailErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student / Roll Number</label>
              <input
                type="text"
                name="studentId"
                value={details.studentId}
                onChange={handleDetailChange}
                onBlur={handleDetailBlur}
                placeholder="e.g. 21CS045"
                className={detailFieldClass("studentId")}
              />
              {detailTouched.studentId && detailErrors.studentId && (
                <p className="text-xs text-red-500 mt-1">{detailErrors.studentId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes <span className="text-gray-400 font-normal">(dietary needs, accessibility, etc. — optional)</span>
              </label>
              <textarea
                name="notes"
                rows="3"
                value={details.notes}
                onChange={handleDetailChange}
                onBlur={handleDetailBlur}
                placeholder="Anything the organizers should know"
                className={detailFieldClass("notes")}
              />
              {detailTouched.notes && detailErrors.notes && (
                <p className="text-xs text-red-500 mt-1">{detailErrors.notes}</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border-2 border-gray-200 text-gray-600 font-medium py-2.5 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-gradient flex-1 rounded-lg py-2.5">
                {isPaid ? "Continue to Payment" : submitting ? "Confirming..." : "Confirm Registration"}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePaySubmit} className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-gray-900 text-white px-4 py-3">
              <span className="text-xs uppercase tracking-wide text-white/70">Amount due</span>
              <span className="text-xl font-extrabold">₹{event.price}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
              <input
                type="text"
                name="cardName"
                value={payment.cardName}
                onChange={handlePaymentChange}
                onBlur={handlePaymentBlur}
                placeholder="e.g. Arjun Mehta"
                className="input-field"
              />
              {paymentTouched.cardName && paymentErrors.cardName && (
                <p className="text-xs text-red-500 mt-1">{paymentErrors.cardName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                inputMode="numeric"
                name="cardNumber"
                value={payment.cardNumber}
                onChange={handlePaymentChange}
                onBlur={handlePaymentBlur}
                placeholder="4242 4242 4242 4242"
                className={paymentFieldClass("cardNumber")}
              />
              {paymentTouched.cardNumber && paymentErrors.cardNumber && (
                <p className="text-xs text-red-500 mt-1">{paymentErrors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="expiry"
                  value={payment.expiry}
                  onChange={handlePaymentChange}
                  onBlur={handlePaymentBlur}
                  placeholder="MM/YY"
                  className={paymentFieldClass("expiry")}
                />
                {paymentTouched.expiry && paymentErrors.expiry && (
                  <p className="text-xs text-red-500 mt-1">{paymentErrors.expiry}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="password"
                  inputMode="numeric"
                  name="cvv"
                  value={payment.cvv}
                  onChange={handlePaymentChange}
                  onBlur={handlePaymentBlur}
                  placeholder="•••"
                  className={paymentFieldClass("cvv")}
                />
                {paymentTouched.cvv && paymentErrors.cvv && (
                  <p className="text-xs text-red-500 mt-1">{paymentErrors.cvv}</p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
              🔒 Demo checkout — no real charge is made and card details are never stored.
            </p>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 rounded-lg border-2 border-gray-200 text-gray-600 font-medium py-2.5 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button type="submit" disabled={submitting} className="btn-gradient flex-1 rounded-lg py-2.5">
                {submitting ? "Processing payment..." : `Pay ₹${event.price} & Register`}
              </button>
            </div>
          </form>
        )}

        <p className="text-[11px] text-gray-400 text-center">Registering as {user?.name}</p>
      </div>
    </div>
  );
};

export default RegistrationModal;
