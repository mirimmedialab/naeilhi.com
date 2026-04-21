import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '내일하이 K-디지털 기초역량훈련',
  description:
    '고용노동부 공식 인증 K-디지털 기초역량훈련과정. 자부담 10%로 핵심 디지털 역량을 키워보세요.',
  keywords: ['K-디지털', '내일배움카드', 'MS Copilot', '프롬프트 엔지니어링', '내일하이'],
  authors: [{ name: '내일하이' }],
  openGraph: {
    title: '내일하이 K-디지털 기초역량훈련',
    description: '대학생 전용 K-디지털 훈련 신청 플랫폼',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="font-kr antialiased bg-slate-100 text-slate-900">
        {children}
      </body>
    </html>
  );
}
