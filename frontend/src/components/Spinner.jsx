const sizes = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-[3px]",
  lg: "w-12 h-12 border-4",
};

const Spinner = ({ size = "md", label }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-10">
    <div
      className={`${sizes[size]} rounded-full border-primary-200 border-t-primary-600 animate-spin`}
      role="status"
      aria-label="Loading"
    />
    {label && <p className="text-sm text-gray-500">{label}</p>}
  </div>
);

export default Spinner;
