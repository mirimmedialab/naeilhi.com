export function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 font-kr flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl shadow-slate-300/40 relative">
        {children}
      </div>
    </div>
  );
}
