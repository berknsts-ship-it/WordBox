import Link from "next/link";

export default function StudentNotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl mb-4">🔍</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Код не найден</h1>
      <p className="text-gray-500 mb-6">
        Проверь код и попробуй ещё раз
      </p>
      <Link
        href="/student"
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors"
      >
        Попробовать снова
      </Link>
    </div>
  );
}
