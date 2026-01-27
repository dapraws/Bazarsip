import Link from "next/link";

export default function RegisterPage() {
  return (
    <form className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Register</h1>

      <input
        type="text"
        placeholder="Name"
        className="w-full border p-2 rounded"
      />

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

      <button className="w-full bg-black text-white py-2 rounded">
        Register
      </button>

      <p className="text-sm text-center">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Login
        </Link>
      </p>
    </form>
  );
}
