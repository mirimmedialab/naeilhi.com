import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';
import { MobileFrame } from '@/components/mobile-frame';

export const metadata = {
  title: '개인정보처리방침 | 내일하이 K-디지털',
  description: '내일하이 K-디지털 기초역량훈련 신청 플랫폼 개인정보처리방침',
};

const LAST_UPDATED = '2026년 4월 20일';
const COMPANY_NAME = '내일하이';
const SERVICE_NAME = '내일하이 K-디지털 기초역량훈련 신청 플랫폼';
const DPO_EMAIL = 'privacy@naeilhi.com';
const DPO_PHONE = '02-1234-5678';

const SECTIONS = [
  { id: 'general', label: '1. 총칙' },
  { id: 'items', label: '2. 수집하는 개인정보 항목' },
  { id: 'purpose', label: '3. 개인정보의 수집 및 이용목적' },
  { id: 'retention', label: '4. 개인정보의 보유 및 이용기간' },
  { id: 'sharing', label: '5. 개인정보의 제3자 제공' },
  { id: 'entrust', label: '6. 개인정보처리의 위탁' },
  { id: 'rights', label: '7. 정보주체의 권리와 행사방법' },
  { id: 'destruction', label: '8. 개인정보의 파기' },
  { id: 'security', label: '9. 개인정보 안전성 확보조치' },
  { id: 'cookies', label: '10. 쿠키 및 자동수집' },
  { id: 'dpo', label: '11. 개인정보 보호책임자' },
  { id: 'remedies', label: '12. 권익침해 구제방법' },
  { id: 'changes', label: '13. 개정 및 고지' },
];

export default function PrivacyPolicyPage() {
  return (
    <MobileFrame>
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3 z-10">
        <Link
          href="/"
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center tap-scale"
        >
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </Link>
        <h1 className="font-display font-bold text-base text-slate-900">개인정보처리방침</h1>
      </div>

      <div className="px-6 py-6">
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-bold text-slate-900">{SERVICE_NAME}</p>
          </div>
          <p className="text-xs text-slate-500">
            최종 개정일: {LAST_UPDATED}
            <br />
            시행일: {LAST_UPDATED}
          </p>
        </div>

        <p className="text-sm text-slate-700 leading-relaxed mb-6">
          <strong>{COMPANY_NAME}</strong>(이하 "회사")는 「개인정보 보호법」 제30조에 따라
          정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록
          다음과 같이 개인정보처리방침을 수립·공개합니다.
        </p>

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

        {/* Section 1: 총칙 */}
        <Section id="general" title="제1조 (총칙)">
          <P>
            이 개인정보처리방침은 회사가 제공하는 {SERVICE_NAME}(이하 "서비스") 이용과 관련하여,
            정보주체의 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보 보호를 위해
            어떠한 조치가 취해지고 있는지 알려드리기 위하여 수립되었습니다.
          </P>
        </Section>

        {/* Section 2: 수집 항목 */}
        <Section id="items" title="제2조 (수집하는 개인정보 항목)">
          <P>회사는 서비스 제공을 위해 다음의 개인정보를 수집합니다.</P>

          <SubTitle>1. 수강 신청 시 필수 수집 항목</SubTitle>
          <DataTable
            rows={[
              ['성명', '신청자 식별 및 수강 안내'],
              ['휴대폰 번호', '수강 관련 안내 및 연락'],
              ['이메일 주소', '수강신청 확인 및 안내 메일 발송'],
              ['소속 대학 / 학과 / 학년', '자격 확인 및 통계 목적'],
              ['내일배움카드 보유 여부', '정부지원 자격 확인'],
            ]}
          />

          <SubTitle>2. 서비스 이용 과정에서 자동 수집되는 항목</SubTitle>
          <Bullets
            items={[
              'IP 주소, 접속 일시, 서비스 이용 기록, 불량 이용 기록',
              '쿠키, 세션 ID',
              '브라우저 종류, 운영체제 정보',
            ]}
          />

          <SubTitle>3. 관리자·운영자 계정 수집 항목</SubTitle>
          <DataTable
            rows={[
              ['이메일 주소', '로그인 및 본인 확인'],
              ['비밀번호 (암호화 저장)', '계정 인증'],
              ['성명', '담당자 식별'],
            ]}
          />
        </Section>

        {/* Section 3: 이용목적 */}
        <Section id="purpose" title="제3조 (개인정보의 수집 및 이용목적)">
          <P>회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다.</P>
          <Bullets
            items={[
              '수강신청 접수·처리, 본인 확인',
              '수강 관련 안내 및 공지사항 전달',
              '수료 관리 및 환급액 산정',
              '부정 이용 방지 및 비인가 사용 방지',
              '서비스 개선을 위한 통계 분석 (비식별 처리)',
              '법령 및 이용약관 위반 행위에 대한 대응',
            ]}
          />
        </Section>

        {/* Section 4: 보유 기간 */}
        <Section id="retention" title="제4조 (개인정보의 보유 및 이용기간)">
          <P>
            회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에
            동의받은 기간 내에서 개인정보를 처리·보유합니다.
          </P>

          <SubTitle>1. 수강신청 정보</SubTitle>
          <DataTable
            headers={['항목', '보유기간', '근거']}
            rows={[
              ['신청자 개인정보', '수료 후 3년', '「근로자직업능력개발법」 시행령 제42조'],
              ['수료·환급 관련 기록', '수료 후 3년', '「보조금 관리에 관한 법률」'],
              ['서비스 이용기록', '3개월', '「통신비밀보호법」'],
            ]}
          />

          <SubTitle>2. 관리자 계정</SubTitle>
          <P>
            퇴사·계약 종료 등으로 권한 해지 시 즉시 파기합니다. 단, 관련 법령에 따른 보존 의무가
            있는 경우 해당 기간 동안 보관합니다.
          </P>
        </Section>

        {/* Section 5: 제3자 제공 */}
        <Section id="sharing" title="제5조 (개인정보의 제3자 제공)">
          <P>
            회사는 원칙적으로 정보주체의 개인정보를 수집·이용 목적으로 명시한 범위 내에서
            처리하며, 정보주체의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게
            제공하지 않습니다.
          </P>
          <P>
            다만, 다음의 경우에는 예외로 합니다.
          </P>
          <Bullets
            items={[
              '정보주체로부터 별도의 동의를 받은 경우',
              '법률에 특별한 규정이 있는 경우',
              '정보주체 또는 법정대리인이 의사표시를 할 수 없는 상태에 있거나 주소불명 등으로 사전 동의를 받을 수 없는 경우로서 명백히 정보주체 또는 제3자의 급박한 생명, 신체, 재산의 이익을 위하여 필요하다고 인정되는 경우',
              '수사기관의 수사목적으로 관련 법률에 정해진 절차와 방법에 따라 요구가 있는 경우',
            ]}
          />
        </Section>

        {/* Section 6: 위탁 */}
        <Section id="entrust" title="제6조 (개인정보처리의 위탁)">
          <P>
            회사는 원활한 서비스 제공을 위하여 다음과 같이 개인정보 처리 업무를 외부 전문업체에
            위탁하고 있습니다.
          </P>
          <DataTable
            headers={['수탁자', '위탁 업무', '개인정보 보유 및 이용기간']}
            rows={[
              ['Supabase Inc.', '데이터베이스 호스팅 및 인증 서비스', '서비스 이용 종료 또는 위탁계약 종료 시'],
              ['Vercel Inc.', '애플리케이션 호스팅 및 CDN', '서비스 이용 종료 또는 위탁계약 종료 시'],
            ]}
          />
          <P>
            회사는 위탁계약 체결 시 개인정보 보호법 제26조에 따라 위탁업무 수행목적 외 개인정보
            처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등
            책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지
            감독하고 있습니다.
          </P>
        </Section>

        {/* Section 7: 권리 */}
        <Section id="rights" title="제7조 (정보주체의 권리와 행사방법)">
          <P>정보주체는 회사에 대해 언제든지 다음 각호의 권리를 행사할 수 있습니다.</P>
          <Bullets
            items={[
              '개인정보 열람 요구',
              '오류 등이 있을 경우 정정 요구',
              '삭제 요구',
              '처리정지 요구',
            ]}
          />
          <P>
            위 권리 행사는 회사에 대해 서면, 전화, 전자우편 등을 통하여 하실 수 있으며, 회사는
            이에 대해 지체 없이 조치하겠습니다.
          </P>
          <P>
            정보주체가 개인정보의 오류 등에 대한 정정 또는 삭제를 요구한 경우에는 회사는 정정 또는
            삭제를 완료할 때까지 해당 개인정보를 이용하거나 제공하지 않습니다.
          </P>
        </Section>

        {/* Section 8: 파기 */}
        <Section id="destruction" title="제8조 (개인정보의 파기)">
          <P>
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
            지체없이 해당 개인정보를 파기합니다.
          </P>

          <SubTitle>1. 파기절차</SubTitle>
          <P>
            이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에
            따라 일정 기간 저장된 후 혹은 즉시 파기됩니다.
          </P>

          <SubTitle>2. 파기방법</SubTitle>
          <Bullets
            items={[
              '전자적 파일 형태의 정보: 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제',
              '종이에 출력된 개인정보: 분쇄기로 분쇄하거나 소각을 통하여 파기',
            ]}
          />
        </Section>

        {/* Section 9: 안전성 */}
        <Section id="security" title="제9조 (개인정보 안전성 확보조치)">
          <P>회사는 개인정보 보호법 제29조에 따라 다음과 같은 안전성 확보조치를 취하고 있습니다.</P>

          <SubTitle>1. 관리적 조치</SubTitle>
          <Bullets
            items={[
              '내부관리계획 수립 및 시행',
              '개인정보 취급자 최소화 및 교육',
              '접근권한 관리 및 접근 기록 보관',
            ]}
          />

          <SubTitle>2. 기술적 조치</SubTitle>
          <Bullets
            items={[
              '비밀번호 암호화 저장 (bcrypt 해시)',
              'HTTPS(TLS 1.2 이상) 통신 암호화',
              '개인정보 전송 시 암호화',
              '접근통제 시스템 운영 (Row-Level Security)',
              '보안프로그램 설치 및 주기적 갱신',
            ]}
          />

          <SubTitle>3. 물리적 조치</SubTitle>
          <P>서비스 인프라는 AWS Seoul Region(ISMS-P 인증) 데이터센터에서 운영됩니다.</P>
        </Section>

        {/* Section 10: 쿠키 */}
        <Section id="cookies" title="제10조 (쿠키 및 자동수집 장치의 설치·운영 및 거부)">
          <P>
            회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로
            불러오는 '쿠키(cookie)'를 사용합니다.
          </P>
          <Bullets
            items={[
              '쿠키의 사용 목적: 관리자 인증 세션 유지, 서비스 이용 분석',
              '쿠키의 설치·운영 및 거부: 브라우저 설정 메뉴에서 쿠키 저장을 거부할 수 있습니다',
              '단, 쿠키 저장을 거부할 경우 일부 서비스 이용에 어려움이 있을 수 있습니다',
            ]}
          />
        </Section>

        {/* Section 11: DPO */}
        <Section id="dpo" title="제11조 (개인정보 보호책임자)">
          <P>
            회사는 개인정보를 보호하고 개인정보와 관련한 불만을 처리하기 위하여 아래와 같이 관련
            부서 및 개인정보 보호책임자를 지정하고 있습니다.
          </P>
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm space-y-1.5">
            <p className="text-slate-700">
              <span className="text-slate-500">성명:</span>{' '}
              <strong>개인정보 보호책임자</strong>
            </p>
            <p className="text-slate-700">
              <span className="text-slate-500">이메일:</span>{' '}
              <a href={`mailto:${DPO_EMAIL}`} className="text-blue-600">
                {DPO_EMAIL}
              </a>
            </p>
            <p className="text-slate-700">
              <span className="text-slate-500">전화:</span> {DPO_PHONE}
            </p>
          </div>
        </Section>

        {/* Section 12: 구제 */}
        <Section id="remedies" title="제12조 (권익침해 구제방법)">
          <P>
            정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회,
            한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
          </P>
          <DataTable
            headers={['기관', '전화', '웹사이트']}
            rows={[
              ['개인정보분쟁조정위원회', '1833-6972', 'www.kopico.go.kr'],
              ['개인정보침해신고센터', '118', 'privacy.kisa.or.kr'],
              ['대검찰청', '1301', 'www.spo.go.kr'],
              ['경찰청', '182', 'ecrm.cyber.go.kr'],
            ]}
          />
        </Section>

        {/* Section 13: 개정 */}
        <Section id="changes" title="제13조 (개인정보처리방침의 개정 및 고지)">
          <P>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제
            및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 서비스 내 공지사항을 통하여
            고지합니다.
          </P>
          <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-800">
              <strong>부칙</strong>
              <br />
              본 개인정보처리방침은 {LAST_UPDATED}부터 시행됩니다.
            </p>
          </div>
        </Section>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between text-xs text-slate-500">
          <Link href="/terms" className="hover:text-blue-600">
            서비스 이용약관 →
          </Link>
          <Link href="/" className="hover:text-blue-600">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </MobileFrame>
  );
}

// ============================================================
// Rendering helpers
// ============================================================
function Section({
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

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-semibold text-sm text-slate-900 mt-4 mb-2">{children}</h3>
  );
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

function DataTable({
  rows,
  headers = ['항목', '이용목적'],
}: {
  rows: string[][];
  headers?: string[];
}) {
  return (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-slate-100 border-b border-slate-200">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-b-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 text-slate-700 border-r border-slate-100 last:border-r-0 align-top leading-relaxed"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
