import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 text-center bg-white rounded-lg shadow-md">
        <div>
          <Image 
            src="/Adamur_White_BG.png" 
            alt="Adamur Logo" 
            width={120} 
            height={120} 
            className="mx-auto mb-6" 
            style={{ width: "auto", height: "auto" }}
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Adamur
          </h1>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Builder Residency & Engineering Lab
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Virtual Accelerator (AI + Web3 Infra)
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/sign-in"
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors block"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="w-full bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-lg font-medium hover:bg-indigo-50 transition-colors block"
          >
            Create Account
          </Link>
        </div>

        <div className="text-sm text-gray-500">
          <p>Join the future of AI + Web3 innovation</p>
        </div>
      </div>
    </div>
  );
}
