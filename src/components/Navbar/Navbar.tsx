"use client";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

const Navbar = () => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <nav className="bg-blue-500 p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center space-x-2">
          <Image src="/cloud.png" alt="Cloud Pet Logo" width={40} height={40} />
          <h1 className="text-white text-2xl font-bold">Cloud Pet</h1>
        </div>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-6">
          <li>
            <Link href="/" className="text-white hover:underline">
              Home
            </Link>
          </li>
          <li>
            <Link href="/dashboard" className="text-white hover:underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/profile" className="text-white hover:underline">
              Profile
            </Link>
          </li>
         {/* Profile Dropdown */}
         {session?.user ? (
            <li className="relative">
              <button onClick={() => setDropdownOpen(!dropdownOpen)}>
                <Image
                  src="/profile.png"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                  <p className="px-4 py-2 text-gray-500 text-sm">
                    {session.user.email}
                  </p>
                  <hr className="border-gray-200" />
                  <button
                    onClick={() => signOut()}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </li>
          ) : (
            <li>
              <Link href="/api/auth/signin" className="text-white hover:underline">
                Sign In
              </Link>
            </li>
          )}

        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
