'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export function Navigation() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900/95 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-white">
              My<span className="text-primary-400">Anime</span>
            </Link>

            <div className="hidden md:flex gap-6">
              <Link href="/browse" className="text-gray-300 hover:text-white transition">
                Browse
              </Link>
              <Link href="/recommendations" className="text-gray-300 hover:text-white transition">
                Recommendations
              </Link>
              <Link href="/clubs" className="text-gray-300 hover:text-white transition">
                Clubs
              </Link>
              <Link href="/activity" className="text-gray-300 hover:text-white transition">
                Activity
              </Link>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <Link href="/my-list" className="text-gray-300 hover:text-white transition">
                  My List
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                >
                  <User size={20} />
                  {session.user?.name || 'Profile'}
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white transition"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white"
          >
            <Menu size={24} />
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <div className="flex flex-col gap-3">
              <Link href="/browse" className="text-gray-300 hover:text-white transition">
                Browse
              </Link>
              <Link href="/recommendations" className="text-gray-300 hover:text-white transition">
                Recommendations
              </Link>
              <Link href="/clubs" className="text-gray-300 hover:text-white transition">
                Clubs
              </Link>
              {session && (
                <Link href="/my-list" className="text-gray-300 hover:text-white transition">
                  My List
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
