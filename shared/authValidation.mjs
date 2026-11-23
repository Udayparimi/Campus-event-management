export function authErrors(input, signup) {
  const errors = {};
  const text = value => typeof value === "string" ? value.trim() : "";
  if (signup) {
    const name = text(input.name);
    if (name.length < 2 || name.length > 60) errors.name = "Enter a name between 2 and 60 characters.";
  }
  const email = text(input.email);
  if (!email) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter an email address such as name@example.com.";
  }
  if (!text(input.password)) errors.password = "Enter your password.";
  else if (signup && Array.from(input.password).length < 10) errors.password = "Use at least 10 characters.";
  else if (signup && new TextEncoder().encode(input.password).length > 72) {
    errors.password = "Use at most 72 bytes. Emoji and accented letters can use several bytes.";
  }
  if (signup) {
    if (input.department !== undefined && typeof input.department !== "string") errors.department = "Enter a department name or leave it blank.";
    if (input.role !== undefined && !["student", "admin"].includes(input.role)) errors.role = "Choose Student or Admin.";
    if (input.role === "admin" && !text(input.adminCode)) errors.adminCode = "Enter the invite code from your events committee.";
  }
  return errors;
}
