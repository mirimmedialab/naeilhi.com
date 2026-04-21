import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { MobileFrame } from '@/components/mobile-frame';

export default function NotFound() {
  return (
    <MobileFrame>
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900 mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          요청하신 페이지가 존재하지 않거나
          <br />
          이동되었을 수 있습니다
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-slate-900 text-white rounded-full text-sm font-medium tap-scale"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </MobileFrame>
  );
}
