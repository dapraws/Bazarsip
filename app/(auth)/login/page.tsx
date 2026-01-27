import Link from "next/link";

export default function LoginPage() {
  return (
    <form className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded"
      />

      <button className="w-full bg-black text-white py-2 rounded">Login</button>

      <p className="text-sm text-center">
        Don’t have an account?{" "}
        <Link href="/register" className="underline">
          Register
        </Link>
      </p>
    </form>
  );
}
