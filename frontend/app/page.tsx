import React from 'react';
import { LayoutDashboard, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] text-white">
      {/* Subtle blue glow to prevent pure-black flatness */}
      <div className="absolute top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute left-[50%] top-0 h-[400px] w-[400px] -translate-x-[50%] -translate-y-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
      </div>

      <main className="w-full max-w-xs px-6 flex flex-col items-center">
        {/* Minimal Icon */}
        <div className="mb-8">
          <CheckCircle2 className="h-12 w-12 text-blue-500" />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tight mb-2">TaskFlow</h1>
          <p className="text-slate-500 text-sm">Organize your workspace.</p>
        </div>

        {/* Small White Dashboard Button */}
        <Button 
          variant="default" 
          size="sm" 
          asChild
          className="w-full h-11 bg-white text-black hover:bg-slate-200 border-none font-semibold transition-all"
        >
          <Link href="/tasks">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>

        {/* Auth Links */}
        <div className="mt-6 flex items-center gap-4 text-sm font-medium">
          <Link 
            href="/auth/login" 
            className="text-slate-400 hover:text-white transition-colors"
          >
            Login
          </Link>
          <span className="text-slate-800">|</span>
          <Link 
            href="/auth/register" 
            className="text-slate-400 hover:text-white transition-colors"
          >
            Register
          </Link>
        </div>
      </main>

     
    </div>
  );
}