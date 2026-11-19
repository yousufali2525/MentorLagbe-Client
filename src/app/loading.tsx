export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"></div>

        <h2 className="text-xl font-semibold text-gray-800">
          MentorLagbe
        </h2>

        <p className="text-sm text-gray-500">
          Loading, please wait...
        </p>
      </div>
    </div>
  );
}