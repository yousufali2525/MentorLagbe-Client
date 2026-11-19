import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-10 text-center shadow-lg">
        <h1 className="mb-2 text-8xl font-extrabold text-blue-600">
          404
        </h1>

        <h2 className="mb-4 text-2xl font-bold text-gray-800">
          Page Not Found
        </h2>

        <p className="mb-8 text-gray-500">
          Sorry, the page you are looking for does not exist or may have been moved.
        </p>

        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}