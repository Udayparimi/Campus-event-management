import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <div className="text-8xl font-black chip-gradient-text animate-float">404</div>
    <h1 className="text-2xl font-bold text-gray-900 mt-4">This page wandered off campus</h1>
    <p className="text-gray-500 mt-2 max-w-sm">
      The page you're looking for doesn't exist, or may have been moved. Let's get you back to the events.
    </p>
    <Link to="/events" className="btn-gradient rounded-lg px-6 py-2.5 mt-6 inline-block">
      Back to Events
    </Link>
  </div>
);

export default NotFoundPage;
