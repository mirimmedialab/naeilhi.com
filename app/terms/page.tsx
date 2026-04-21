import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { MobileFrame } from '@/components/mobile-frame';

export const metadata = {
  title: '서비스 이용약관 | 내일하이 K-디지털',
  description: '내일하이 K-디지털 기초역량훈련 신청 플랫폼 서비스 이용약관',
};

const LAST_UPDATED = '2026년 4월 20일';
const COMPANY_NAME = '내일하이';
const SERVICE_NAME = '내일하이 K-디지털 기초역량훈련 신청 플랫폼';
const CONTACT_EMAIL = 'support@naeilhi.com';

const SECTIONS = [
  { id: 'article-1', label: '제1조 목적' },
  { id: 'article-2', label: '제2조 용어의 정의' },
  { id: 'article-3', label: '제3조 약관의 게시와 개정' },
  { id: 'article-4', label: '제4조 서비스의 제공' },
  { id: 'article-5', label: '제5조 서비스 이용신청' },
  { id: 'article-6', label: '제6조 개인정보보호' },
  { id: 'article-7', label: '제7조 이용자의 의무' },
  { id: 'article-8', label: '제8조 서비스 이용 제한' },
  { id: 'article-9', label: '제9조 수강료 및 환불' },
  { id: 'article-10', label: '제10조 저작권 및 지적재산권' },
  { id: 'article-11', label: '제11조 손해배상 및 면책' },
  { id: 'article-12', label: '제12조 분쟁 해결' },
  { id: 'article-13', label: '제13조 준거법 및 재판관할' },
];

export default function TermsPage() {
  return (
    <MobileFrame>
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 z-10">
        <Link
          href="/"
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center tap-scale"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="font-display font-bold text-base text-slate-900">서비스 이용약관</h1>
      </div>

      <div className="px-6 py-6">
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-bold text-slate-900">{SERVICE_NAME}</p>
          </div>
          <p className="text-xs text-slate-500">
            최종 개정일: {LAST_UPDATED}
            <br />
            시행일: {LAST_UPDATED}
          </p>
        </div>

        {/* Table of contents */}
        <nav className="mb-8 p-4 rounded-xl bg-white border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-2">목차</p>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="text-xs text-slate-700 hover:text-blue-600 block py-0.5"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Article id="article-1" title="제1조 (목적)">
          <P>
            이 약관은 <strong>{COMPANY_NAME}</strong>(이하 "회사")가 제공하는 {SERVICE_NAME}(이하
            "서비스")의 이용과 관련하여 회사와 이용자의 권리·의무 및 책임사항, 기타 필요한
            사항을 규정함을 목적으로 합니다.
          </P>
        </Article>

        <Article id="article-2" title="제2조 (용어의 정의)">
          <P>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</P>
          <Bullets
            items={[
              '"서비스"란 회사가 제공하는 K-디지털 기초역량훈련 과정 신청 및 수료 관리 플랫폼을 의미합니다.',
              '"이용자"란 이 약관에 따라 서비스를 이용하는 자를 말하며, 수강 신청자·회원·관리자를 포함합니다.',
              '"수강 신청자"란 대학별 전용 URL을 통해 훈련과정을 신청하는 자를 말합니다.',
              '"관리자 계정"이란 서비스 운영을 위해 회사가 부여한 어드민·운영자 권한 계정을 말합니다.',
              '"훈련과정"이란 회사가 제공하는 K-디지털 기초역량훈련과정을 말합니다.',
            ]}
          />
        </Article>

        <Article id="article-3" title="제3조 (약관의 게시와 개정)">
          <P>
            회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
          </P>
          <P>
            회사는 「약관의 규제에 관한 법률」, 「정보통신망 이용촉진 및 정보보호 등에 관한
            법률」 등 관련법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.
          </P>
          <P>
            회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 적용일자
            7일 전부터 서비스 내 공지사항에 게시합니다. 다만 이용자에게 불리한 약관 개정의 경우에는
            최소 30일 전에 공지합니다.
          </P>
        </Article>

        <Article id="article-4" title="제4조 (서비스의 제공)">
          <P>회사가 제공하는 서비스는 다음과 같습니다.</P>
          <Bullets
            items={[
              'K-디지털 기초역량훈련 과정 안내 및 수강 신청 접수',
              '수강 신청 현황 및 승인/반려 안내',
              '수료 여부 확인 및 환급 관련 정보 제공',
              '고용노동부 공식 수료증 발급 지원',
              '기타 회사가 추가 개발하거나 제휴계약 등을 통해 이용자에게 제공하는 일체의 서비스',
            ]}
          />
          <P>
            회사는 서비스를 일정범위로 분할하여 각 범위별로 이용가능시간을 별도로 지정할 수
            있습니다. 이 경우 그 내용을 사전에 공지합니다.
          </P>
          <P>
            회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신두절 또는 운영상 상당한
            이유가 있는 경우 서비스의 제공을 일시적으로 중단할 수 있습니다.
          </P>
        </Article>

        <Article id="article-5" title="제5조 (서비스 이용신청)">
          <P>
            수강 신청자는 회사가 정한 양식에 따라 다음 정보를 입력하여 수강 신청을 할 수 있습니다.
          </P>
          <Bullets
            items={[
              '성명, 소속 대학·학과·학년',
              '휴대폰 번호, 이메일 주소',
              '내일배움카드 보유 여부',
              '개인정보 수집·이용 동의',
            ]}
          />
          <P>
            다음 각호에 해당하는 경우 회사는 수강 신청을 반려할 수 있습니다.
          </P>
          <Bullets
            items={[
              '신청서 기재 정보가 사실과 다르거나 허위인 경우',
              '소속 대학의 학생이 아닌 경우',
              '동일 과정에 중복 신청한 경우',
              '기타 회사가 정한 자격요건을 충족하지 못한 경우',
            ]}
          />
        </Article>

        <Article id="article-6" title="제6조 (개인정보보호)">
          <P>
            회사는 「개인정보 보호법」 및 관련 법령이 정하는 바에 따라 이용자의 개인정보를
            보호하기 위해 노력합니다. 개인정보 보호 및 사용에 관하여 관련 법령 및 회사의
            개인정보처리방침이 적용됩니다.
          </P>
          <P>
            이용자는 서비스 내 링크를 통하여 회사의{' '}
            <Link href="/privacy" className="text-blue-600 underline">
              개인정보처리방침
            </Link>
            을 확인할 수 있습니다.
          </P>
        </Article>

        <Article id="article-7" title="제7조 (이용자의 의무)">
          <P>이용자는 다음 행위를 하여서는 안 됩니다.</P>
          <Bullets
            items={[
              '신청 또는 변경 시 허위 내용의 등록',
              '타인의 정보 도용 또는 개인정보 무단 수집',
              '서비스에 게시된 정보의 변경, 삭제, 훼손',
              '회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해',
              '회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위',
              '외설 또는 폭력적인 메시지·화상·음성 등 공공질서·미풍양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위',
              '서비스의 정상적인 운영을 방해하는 행위',
              '수집한 개인정보를 본 서비스 이용 외의 목적으로 사용하는 행위',
              '기타 관련 법령 및 이 약관에 위배되는 행위',
            ]}
          />
        </Article>

        <Article id="article-8" title="제8조 (서비스 이용 제한)">
          <P>
            회사는 이용자가 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우
            경고·일시정지·영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
          </P>
          <P>
            회사는 본 조의 이용제한 범위 내에서 제한의 조건 및 세부내용은 이용제한정책 및 개별
            서비스상의 운영정책에서 정하는 바에 따릅니다.
          </P>
        </Article>

        <Article id="article-9" title="제9조 (수강료 및 환불)">
          <P>
            훈련과정의 수강료(자부담금)는 각 과정별로 안내된 금액에 따릅니다. 정가의 90% 할인이
            적용되어 이용자는 자부담금 10%만 부담합니다.
          </P>
          <P>
            내일배움카드를 보유한 수강생의 경우 정부지원금 사용 가능 여부는 「국민내일배움카드
            운영규정」에 따릅니다.
          </P>
          <P>수료 및 환급 조건은 다음과 같습니다.</P>
          <Bullets
            items={[
              '수료 기준: 진도율 80% 이상 달성',
              '수료 시 자부담금 전액 환급 가능 (고용노동부 K-디지털 정책 기준)',
              '환급은 고용노동부 지침 및 회사 정책에 따라 처리되며, 지급 시기는 별도 안내',
              '미수료 시 자부담금은 환급되지 않으며, 정부지원금 반납이 요구될 수 있음',
            ]}
          />
          <P>
            청약철회는 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 수강 시작 전 7일
            이내에 신청한 경우 전액 환불 가능합니다.
          </P>
        </Article>

        <Article id="article-10" title="제10조 (저작권 및 지적재산권)">
          <P>
            서비스에 게시된 모든 콘텐츠(강의 자료, 동영상, 텍스트, 이미지 등)의 저작권 및 기타
            지적재산권은 회사 또는 각 저작권자에게 귀속됩니다.
          </P>
          <P>
            이용자는 서비스를 이용함으로써 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판,
            배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안
            됩니다.
          </P>
          <P>
            이용자가 서비스 내에 게시한 게시물의 저작권은 해당 이용자에게 귀속되나, 회사는 서비스
            운영, 개선, 홍보 등의 목적으로 해당 게시물을 사용할 수 있습니다.
          </P>
        </Article>

        <Article id="article-11" title="제11조 (손해배상 및 면책)">
          <P>
            회사는 무료로 제공되는 서비스와 관련하여 이용자에게 어떠한 손해가 발생하더라도 회사의
            고의 또는 중대한 과실이 없는 한 이에 대하여 책임을 부담하지 아니합니다.
          </P>
          <P>
            회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
            서비스 제공에 관한 책임이 면제됩니다.
          </P>
          <P>
            회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
          </P>
          <P>
            회사는 이용자가 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등 내용에
            관하여 책임을 지지 않습니다.
          </P>
        </Article>

        <Article id="article-12" title="제12조 (분쟁 해결)">
          <P>
            회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상 처리하기
            위하여 고객센터를 설치·운영합니다.
          </P>
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
            <p className="text-slate-700">
              <span className="text-slate-500">고객센터 이메일:</span>{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
          <P>
            회사와 이용자 간에 발생한 분쟁은 당사자 간 협의에 의해 해결함을 원칙으로 하며, 협의로
            해결되지 아니한 경우에는 관련 법령 및 상관례에 따릅니다.
          </P>
        </Article>

        <Article id="article-13" title="제13조 (준거법 및 재판관할)">
          <P>
            회사와 이용자 간에 발생한 서비스 이용에 관한 분쟁에 대하여는 대한민국 법을 적용하며,
            본 분쟁으로 인한 소는 민사소송법상의 관할을 가지는 대한민국 법원에 제기합니다.
          </P>
        </Article>

        <div className="mt-8 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>부칙</strong>
            <br />본 약관은 {LAST_UPDATED}부터 시행됩니다.
          </p>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-blue-600">
            ← 개인정보처리방침
          </Link>
          <Link href="/" className="hover:text-blue-600">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}

function Article({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-8 scroll-mt-20">
      <h2 className="font-display text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-200">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-slate-700 leading-relaxed">{children}</p>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-slate-700 leading-relaxed">
          <span className="text-slate-400 shrink-0">·</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
