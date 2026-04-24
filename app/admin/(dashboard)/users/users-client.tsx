'use client';

import { useState, useTransition, useMemo } from 'react';
import {
  Plus,
  Trash2,
  KeyRound,
  UserCog,
  ShieldCheck,
  Users,
  X,
  AlertTriangle,
  Search,
  Building2,
  Check,
  ChevronLeft,
  Copy,
  CheckCircle2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import { cn, fmtDate } from '@/lib/utils';
import { ROLES } from '@/lib/constants';
import type { Profile, Role, University } from '@/types';
import { createUser, resetUserPassword, deleteUser } from './actions';

// Server Action이 반환하는 자격증명 (1회성)
interface GeneratedCredentials {
  email: string;
  password: string;
  role: Role;
  universityName: string | null;
}

// role별 시각적 스타일
function roleStyle(role: Role) {
  if (role === 'admin') {
    return {
      Icon: ShieldCheck,
      badge: 'bg-gradient-to-br from-rose-500 to-red-600',
      bgLight: 'bg-rose-50 border-rose-200',
      textDark: 'text-rose-700',
      pillBg: 'bg-rose-50 text-rose-700',
      hoverBorder: 'hover:border-rose-300 hover:bg-rose-50',
    };
  }
  if (role === 'super_operator') {
    return {
      Icon: Users,
      badge: 'bg-gradient-to-br from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50 border-violet-200',
      textDark: 'text-violet-700',
      pillBg: 'bg-violet-50 text-violet-700',
      hoverBorder: 'hover:border-violet-300 hover:bg-violet-50',
    };
  }
  return {
    Icon: UserCog,
    badge: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50 border-blue-200',
    textDark: 'text-blue-700',
    pillBg: 'bg-blue-50 text-blue-700',
    hoverBorder: 'hover:border-blue-300 hover:bg-blue-50',
  };
}

export default function UsersClient({
  users,
  universities,
  currentUserId,
}: {
  users: Profile[];
  universities: University[];
  currentUserId: string;
}) {
  const [adding, setAdding] = useState(false);
  const [credentials, setCredentials] = useState<GeneratedCredentials | null>(null);
  const [pending, startTransition] = useTransition();

  const universityNameById = useMemo(() => {
    const map = new Map<string, string>();
    universities.forEach((u) => map.set(u.id, u.name));
    return map;
  }, [universities]);

  const operatorUniversityIds = useMemo(() => {
    const set = new Set<string>();
    users.forEach((u) => {
      if (u.role === 'operator' && u.university_id) set.add(u.university_id);
    });
    return set;
  }, [users]);

  const handleDelete = (userId: string, email: string) => {
    if (!confirm(`계정 "${email}"을(를) 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (!result.ok) alert(result.error);
    });
  };

  const handleResetPassword = (userId: string, email: string) => {
    if (!confirm(`"${email}"의 비밀번호를 재설정하시겠습니까?\n새 비밀번호가 자동 생성됩니다.`))
      return;
    startTransition(async () => {
      const result = await resetUserPassword(userId);
      if (result.ok) {
        setCredentials(result.credentials);
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">계정 관리</h1>
          <p className="text-sm text-slate-500">관리자 및 운영자 계정을 관리합니다</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition tap-scale"
        >
          <Plus className="w-4 h-4" />
          계정 추가
        </button>
      </div>

      {/* 역할별 통계 카드 */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {(Object.entries(ROLES) as [Role, (typeof ROLES)[Role]][]).map(([key, role]) => {
          const count = users.filter((u) => u.role === key).length;
          const s = roleStyle(key);
          const Icon = s.Icon;
          return (
            <div key={key} className={`rounded-xl border ${s.bgLight} p-4`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.badge} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-sm ${s.textDark}`}>{role.label}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{role.shortLabel}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${s.textDark} opacity-80`}>{role.description}</p>
                  <p className="text-[11px] text-slate-500 mt-1.5">{count}명 등록</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {users.map((u) => {
            const s = roleStyle(u.role);
            const Icon = s.Icon;
            const isSelf = u.id === currentUserId;
            const uniName = u.university_id
              ? universityNameById.get(u.university_id) || '(알 수 없는 대학)'
              : null;

            // 표시용 이름: 운영자는 대학명, 그 외는 role 라벨
            const displayName =
              u.role === 'operator'
                ? uniName || '(대학 미배정)'
                : u.role === 'super_operator'
                ? '총괄 운영자'
                : '관리자';

            return (
              <div
                key={u.id}
                className="px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 group"
              >
                <div className={`w-10 h-10 rounded-xl ${s.badge} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${s.pillBg}`}>
                      {ROLES[u.role].label}
                    </span>
                    {isSelf && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        본인
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[11px] text-slate-500 font-mono">{u.email}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-400">{fmtDate(u.created_at)} 가입</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button
                    onClick={() => handleResetPassword(u.id, u.email)}
                    disabled={pending}
                    title="비밀번호 재설정"
                    className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center disabled:opacity-30"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id, u.email)}
                    disabled={isSelf || pending}
                    title="계정 삭제"
                    className="w-8 h-8 rounded-lg hover:bg-rose-50 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {adding && (
        <AddAccountModal
          universities={universities}
          operatorUniversityIds={operatorUniversityIds}
          onClose={() => setAdding(false)}
          onCreated={(creds) => {
            setAdding(false);
            setCredentials(creds);
          }}
        />
      )}

      {credentials && (
        <CredentialsModal
          credentials={credentials}
          onClose={() => setCredentials(null)}
        />
      )}
    </div>
  );
}

// =============================================================================
// 계정 추가 모달
// =============================================================================
// Step 1: 역할 선택 (3가지)
//   ├─ admin          → 확인 팝업 → 생성 확인
//   ├─ super_operator → 확인 팝업 → 생성 확인
//   └─ operator       → 대학 선택 → 생성 확인
// Step 최종: [계정 생성] 버튼 → Server Action
// =============================================================================

type AddStep = 'role' | 'confirm-admin' | 'confirm-super' | 'select-university' | 'confirm-create';

function AddAccountModal({
  universities,
  operatorUniversityIds,
  onClose,
  onCreated,
}: {
  universities: University[];
  operatorUniversityIds: Set<string>;
  onClose: () => void;
  onCreated: (creds: GeneratedCredentials) => void;
}) {
  const [step, setStep] = useState<AddStep>('role');
  const [role, setRole] = useState<Role | null>(null);
  const [universityId, setUniversityId] = useState<string | null>(null);
  const [err, setErr] = useState<string>('');
  const [pending, startTransition] = useTransition();

  const selectedUniversity = useMemo(
    () => universities.find((u) => u.id === universityId) || null,
    [universities, universityId]
  );

  const handleRolePick = (picked: Role) => {
    setRole(picked);
    setErr('');
    if (picked === 'admin') setStep('confirm-admin');
    else if (picked === 'super_operator') setStep('confirm-super');
    else setStep('select-university');
  };

  const handleConfirmYes = () => setStep('confirm-create');
  const handleConfirmNo = () => {
    setRole(null);
    setStep('role');
  };

  const handleUniversityPick = (uniId: string) => {
    setUniversityId(uniId);
    setStep('confirm-create');
  };

  const handleCreate = () => {
    if (!role) return;
    if (role === 'operator' && !universityId) return;

    setErr('');
    startTransition(async () => {
      const result = await createUser({
        role,
        universityId: role === 'operator' ? universityId : null,
      });
      if (result.ok) {
        onCreated(result.credentials);
      } else {
        setErr(result.error);
      }
    });
  };

  const canGoBack = step !== 'role';
  const handleBack = () => {
    if (step === 'confirm-admin' || step === 'confirm-super') {
      setRole(null);
      setStep('role');
    } else if (step === 'select-university') {
      setRole(null);
      setUniversityId(null);
      setStep('role');
    } else if (step === 'confirm-create') {
      if (role === 'admin') setStep('confirm-admin');
      else if (role === 'super_operator') setStep('confirm-super');
      else setStep('select-university');
    }
  };

  const headerTitle =
    step === 'role'
      ? '역할 선택'
      : step === 'confirm-admin'
      ? '어드민 계정 확인'
      : step === 'confirm-super'
      ? '총괄 운영자 확인'
      : step === 'select-university'
      ? '소속 대학 선택'
      : '계정 생성';

  const headerSubtitle =
    step === 'role'
      ? '추가할 계정의 역할을 선택해주세요'
      : step === 'confirm-admin'
      ? '관리자 계정은 모든 데이터에 접근 가능합니다'
      : step === 'confirm-super'
      ? '전체 대학 신청·수료를 관리하는 계정입니다'
      : step === 'select-university'
      ? '운영자가 소속될 대학을 선택해주세요'
      : '이메일과 비밀번호는 자동 생성됩니다';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 min-w-0">
            {canGoBack && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0"
                title="뒤로"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="font-display font-bold text-base text-slate-900 truncate">{headerTitle}</h2>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{headerSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Step 1: 역할 선택 — 3가지 */}
        {step === 'role' && (
          <div className="p-6 space-y-3">
            {(Object.entries(ROLES) as [Role, (typeof ROLES)[Role]][]).map(([key, r]) => {
              const s = roleStyle(key);
              const Icon = s.Icon;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleRolePick(key)}
                  className={cn(
                    'w-full p-4 rounded-xl border-2 border-slate-200 bg-white transition text-left tap-scale',
                    s.hoverBorder
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${s.badge} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn('font-bold text-sm', s.textDark)}>{r.label}</h3>
                        <span className="text-[10px] font-mono text-slate-400">{r.shortLabel}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">{r.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2a: admin 확인 */}
        {step === 'confirm-admin' && (
          <ConfirmBox
            tone="rose"
            title="어드민 계정을 추가하시나요?"
            description="어드민은 모든 대학의 신청·수료·계정·과정 정보에 접근할 수 있습니다. 신중하게 결정해주세요."
            onYes={handleConfirmYes}
            onNo={handleConfirmNo}
          />
        )}

        {/* Step 2b: super_operator 확인 */}
        {step === 'confirm-super' && (
          <ConfirmBox
            tone="violet"
            title="총괄 운영자 계정을 추가하시나요?"
            description="총괄 운영자는 모든 대학의 신청·수료 데이터를 조회·관리할 수 있습니다. 계정·과정·대학 관리는 불가합니다."
            onYes={handleConfirmYes}
            onNo={handleConfirmNo}
          />
        )}

        {/* Step 2c: 대학 선택 (operator) */}
        {step === 'select-university' && (
          <UniversityPicker
            universities={universities}
            operatorUniversityIds={operatorUniversityIds}
            onPick={handleUniversityPick}
          />
        )}

        {/* Step 최종: 생성 확인 */}
        {step === 'confirm-create' && role && (
          <>
            <div className="p-6 space-y-4">
              <RoleSummary role={role} universityName={selectedUniversity?.name || null} />

              {/* 자동 생성 안내 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="flex-1 text-xs text-slate-700 leading-relaxed">
                    <p className="font-semibold mb-1">계정 정보는 자동 생성됩니다</p>
                    <ul className="space-y-0.5 text-[11px] text-slate-500">
                      <li>
                        · 이메일:{' '}
                        {role === 'operator' && selectedUniversity ? (
                          <span className="font-mono text-slate-700">
                            {selectedUniversity.slug}@naeilhi.com
                          </span>
                        ) : role === 'super_operator' ? (
                          <span className="font-mono text-slate-700">super-XXXXXX@naeilhi.com</span>
                        ) : (
                          <span className="font-mono text-slate-700">admin-XXXXXX@naeilhi.com</span>
                        )}
                      </li>
                      <li>· 비밀번호: 12자 랜덤 (자동 생성)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  생성 직후 화면에서 <span className="font-bold">비밀번호를 한 번만</span> 확인할 수 있습니다.
                  복사해서 담당자에게 전달해주세요.
                </p>
              </div>

              {err && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                  <p className="text-xs text-rose-700">{err}</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-slate-100 flex gap-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                취소
              </button>
              <button
                onClick={handleCreate}
                disabled={pending}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold tap-scale shadow-lg shadow-blue-500/10 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {pending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    생성 중...
                  </>
                ) : (
                  <>계정 생성</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// 확인 박스 (admin / super 공통)
// =============================================================================
function ConfirmBox({
  tone,
  title,
  description,
  onYes,
  onNo,
}: {
  tone: 'rose' | 'violet';
  title: string;
  description: string;
  onYes: () => void;
  onNo: () => void;
}) {
  const styles = tone === 'rose'
    ? {
        bg: 'bg-rose-50 border-rose-200',
        iconBg: 'bg-rose-100',
        iconText: 'text-rose-600',
        titleText: 'text-rose-900',
        bodyText: 'text-rose-700/80',
        yesBtn: 'bg-gradient-to-r from-rose-500 to-red-600 shadow-rose-500/20',
      }
    : {
        bg: 'bg-violet-50 border-violet-200',
        iconBg: 'bg-violet-100',
        iconText: 'text-violet-600',
        titleText: 'text-violet-900',
        bodyText: 'text-violet-700/80',
        yesBtn: 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-violet-500/20',
      };

  return (
    <div className="p-6 space-y-4">
      <div className={cn('flex items-start gap-3 p-4 rounded-xl border', styles.bg)}>
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', styles.iconBg)}>
          <AlertTriangle className={cn('w-5 h-5', styles.iconText)} />
        </div>
        <div className="flex-1">
          <p className={cn('text-sm font-bold mb-1', styles.titleText)}>{title}</p>
          <p className={cn('text-xs leading-relaxed', styles.bodyText)}>{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onNo}
          className="py-3 rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 tap-scale"
        >
          아니오, 뒤로
        </button>
        <button
          onClick={onYes}
          className={cn('py-3 rounded-xl text-white text-sm font-bold shadow-lg tap-scale', styles.yesBtn)}
        >
          예, 계속
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// 역할·대학 요약 (confirm-create 단계 상단)
// =============================================================================
function RoleSummary({
  role,
  universityName,
}: {
  role: Role;
  universityName: string | null;
}) {
  const s = roleStyle(role);
  const Icon = s.Icon;

  return (
    <div className={cn('p-4 rounded-xl border flex items-center gap-3', s.bgLight)}>
      <div className={`w-12 h-12 rounded-xl ${s.badge} flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-bold', s.textDark)}>{ROLES[role].label}</p>
        {role === 'operator' && universityName && (
          <p className="text-xs text-slate-700 mt-0.5 flex items-center gap-1 truncate">
            <Building2 className="w-3 h-3 shrink-0" />
            <span className="font-semibold truncate">{universityName}</span>
          </p>
        )}
        {role === 'super_operator' && (
          <p className="text-xs text-slate-700 mt-0.5">
            모든 대학의 신청·수료 데이터 접근
          </p>
        )}
        {role === 'admin' && (
          <p className="text-xs text-slate-700 mt-0.5">전체 대학 데이터에 접근 가능</p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// 대학 검색/선택
// =============================================================================
function UniversityPicker({
  universities,
  operatorUniversityIds,
  onPick,
}: {
  universities: University[];
  operatorUniversityIds: Set<string>;
  onPick: (universityId: string) => void;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? universities.filter(
          (u) => u.name.toLowerCase().includes(q) || u.code.toLowerCase().includes(q)
        )
      : universities;
    return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));
  }, [universities, query]);

  return (
    <div className="flex flex-col">
      <div className="p-6 pb-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="대학명 또는 코드 검색"
            autoFocus
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-slate-100 flex items-center justify-center"
              title="검색어 지우기"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-500 mt-2 px-1">
          검색 결과 <span className="font-bold text-slate-900">{filtered.length}</span>개 /{' '}
          <span className="text-slate-400">전체 {universities.length}개</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[50vh] px-6 pb-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {filtered.map((u) => {
              const alreadyHasOperator = operatorUniversityIds.has(u.id);
              return (
                <button
                  key={u.id}
                  onClick={() => {
                    if (alreadyHasOperator) return;
                    onPick(u.id);
                  }}
                  disabled={alreadyHasOperator}
                  className={cn(
                    'w-full p-3 rounded-xl border transition text-left flex items-center gap-3',
                    alreadyHasOperator
                      ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
                      : 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 tap-scale'
                  )}
                >
                  <div
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                      alreadyHasOperator ? 'bg-slate-200' : 'bg-gradient-to-br from-slate-100 to-slate-200'
                    )}
                  >
                    <Building2 className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                      {alreadyHasOperator && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 shrink-0">
                          이미 운영자 있음
                        </span>
                      )}
                      {!u.active && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 shrink-0">
                          비활성
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-slate-500">{u.code}</span>
                    </div>
                  </div>
                  {!alreadyHasOperator && <Check className="w-4 h-4 text-slate-300 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// 자격증명 1회성 팝업
// =============================================================================
function CredentialsModal({
  credentials,
  onClose,
}: {
  credentials: GeneratedCredentials;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState<'email' | 'password' | 'full' | null>(null);

  const loginUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/admin/login` : '';

  // role별 맥락 표시
  const contextLabel =
    credentials.universityName
      ? credentials.universityName
      : credentials.role === 'super_operator'
      ? '총괄 운영자'
      : '관리자 계정';

  const contextTitle =
    credentials.universityName
      ? `${credentials.universityName} 운영자`
      : credentials.role === 'super_operator'
      ? '총괄 운영자 계정'
      : '관리자 계정';

  const fullText = useMemo(() => {
    const lines: string[] = [];
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━');
    if (credentials.role === 'operator') {
      lines.push('[내일하이 운영자 계정]');
      lines.push('');
      lines.push(`소속: ${credentials.universityName}`);
    } else if (credentials.role === 'super_operator') {
      lines.push('[내일하이 총괄 운영자 계정]');
      lines.push('');
    } else {
      lines.push('[내일하이 관리자 계정]');
      lines.push('');
    }
    lines.push(`로그인: ${loginUrl}`);
    lines.push('');
    lines.push(`이메일: ${credentials.email}`);
    lines.push(`비밀번호: ${credentials.password}`);
    lines.push('');
    lines.push('※ 보안을 위해 계정 정보는 안전하게 보관해주세요.');
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━');
    return lines.join('\n');
  }, [credentials, loginUrl]);

  const copyToClipboard = (text: string, target: 'email' | 'password' | 'full') => {
    navigator.clipboard?.writeText(text);
    setCopied(target);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-8 pb-6 text-center bg-gradient-to-b from-emerald-50 to-white">
          <div className="relative mb-4 inline-block">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" strokeWidth={2.5} />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping opacity-30" />
          </div>
          <h2 className="font-display font-bold text-lg text-slate-900 mb-1">계정이 생성되었습니다</h2>
          <p className="text-xs text-slate-500">{contextTitle}</p>
        </div>

        <div className="px-6 pb-3">
          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 mb-1.5 tracking-wider">이메일</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-slate-900 break-all">{credentials.email}</code>
                <button
                  onClick={() => copyToClipboard(credentials.email, 'email')}
                  className="shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-blue-400 flex items-center justify-center transition"
                  title="이메일 복사"
                >
                  {copied === 'email' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-[10px] font-semibold text-slate-500 mb-1.5 tracking-wider">비밀번호</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-slate-900 font-bold break-all">
                  {credentials.password}
                </code>
                <button
                  onClick={() => copyToClipboard(credentials.password, 'password')}
                  className="shrink-0 w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-blue-400 flex items-center justify-center transition"
                  title="비밀번호 복사"
                >
                  {copied === 'password' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-3">
          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 leading-relaxed">
              이 화면을 닫으면 <span className="font-bold">비밀번호는 다시 볼 수 없습니다.</span> 반드시 복사해서{' '}
              {contextLabel} 담당자에게 전달하세요. 잊어버린 경우 계정 목록에서{' '}
              <KeyRound className="w-3 h-3 inline -mt-0.5" /> 재설정 가능합니다.
            </p>
          </div>
        </div>

        <div className="sticky bottom-0 px-6 py-4 bg-white border-t border-slate-100 flex gap-2">
          <button
            onClick={() => copyToClipboard(fullText, 'full')}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold tap-scale shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
          >
            {copied === 'full' ? (
              <>
                <Check className="w-4 h-4" />
                복사됨!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                전체 정보 복사
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}