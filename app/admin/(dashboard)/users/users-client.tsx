'use client';

import { useState, useTransition } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  User,
  UserCog,
  KeyRound,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn, fmtDate } from '@/lib/utils';
import { ROLES } from '@/lib/constants';
import type { Profile, Role } from '@/types';
import { createUser, updateUser, deleteUser } from './actions';

export default function UsersClient({
  users,
  currentUserId,
}: {
  users: Profile[];
  currentUserId: string;
}) {
  const [editing, setEditing] = useState<Profile | null>(null);
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = (userId: string, email: string) => {
    if (!confirm(`계정 "${email}"을(를) 삭제하시겠습니까?`)) return;
    startTransition(async () => {
      const result = await deleteUser(userId);
      if (!result.ok) alert(result.error);
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

      <div className="grid sm:grid-cols-2 gap-3 mb-6">
        {(Object.entries(ROLES) as [Role, (typeof ROLES)[Role]][]).map(([key, role]) => {
          const count = users.filter((u) => u.role === key).length;
          const Icon = key === 'admin' ? ShieldCheck : UserCog;
          const bg = key === 'admin' ? 'bg-rose-50 border-rose-200' : 'bg-blue-50 border-blue-200';
          const text = key === 'admin' ? 'text-rose-700' : 'text-blue-700';
          const badge =
            key === 'admin'
              ? 'bg-gradient-to-br from-rose-500 to-red-600'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600';
          return (
            <div key={key} className={`rounded-xl border ${bg} p-4`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${badge} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-sm ${text}`}>{role.label}</h3>
                    <span className="text-[10px] font-mono text-slate-400">{role.shortLabel}</span>
                  </div>
                  <p className={`text-xs mt-0.5 ${text} opacity-80`}>{role.description}</p>
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
            const Icon = u.role === 'admin' ? ShieldCheck : UserCog;
            const isSelf = u.id === currentUserId;
            const badge =
              u.role === 'admin'
                ? 'bg-gradient-to-br from-rose-500 to-red-600'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600';
            const bg = u.role === 'admin' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700';

            return (
              <div
                key={u.id}
                className="px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 group"
              >
                <div className={`w-10 h-10 rounded-xl ${badge} flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900">{u.name || '(이름 없음)'}</p>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${bg}`}
                    >
                      {ROLES[u.role].label}
                    </span>
                    {isSelf && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                        본인
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-slate-500">{u.email}</span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-400">{fmtDate(u.created_at)} 가입</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition">
                  <button
                    onClick={() => setEditing(u)}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(u.id, u.email)}
                    disabled={isSelf || pending}
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

      {(adding || editing) && (
        <UserModal
          user={editing}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose }: { user: Profile | null; onClose: () => void }) {
  const isEditing = !!user;
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState<Role>((user?.role as Role) || 'operator');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) e.email = '올바른 이메일을 입력해주세요';
    if (!isEditing && password.length < 8) e.password = '비밀번호는 8자 이상';
    if (isEditing && password && password.length < 8) e.password = '비밀번호는 8자 이상';
    if (!name.trim()) e.name = '이름을 입력해주세요';
    setErr(e);
    if (Object.keys(e).length > 0) return;

    startTransition(async () => {
      let result;
      if (isEditing && user) {
        result = await updateUser(user.id, {
          name,
          role,
          password: password || undefined,
        });
      } else {
        result = await createUser({ email, password, name, role });
      }

      if (result.ok) {
        onClose();
      } else {
        setErr({ _form: result.error || '저장 실패' });
      }
    });
  };

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
          <div>
            <h2 className="font-display font-bold text-base text-slate-900">
              {isEditing ? '계정 수정' : '계정 추가'}
            </h2>
            {isEditing && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                비밀번호 변경하지 않으려면 비워두세요
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <ModalField
            label="이름"
            Icon={User}
            required
            value={name}
            onChange={setName}
            placeholder="홍길동"
            error={err.name}
          />
          <ModalField
            label="이메일"
            Icon={Mail}
            required
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="admin@example.com"
            error={err.email}
            disabled={isEditing}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              비밀번호 {!isEditing && <span className="text-rose-500">*</span>}
            </label>
            <div
              className={cn(
                'relative flex items-center rounded-xl border transition',
                err.password ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white',
                'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
              )}
            >
              <KeyRound className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? '변경 시 새 비밀번호 입력' : '8자 이상'}
                className="flex-1 px-3 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="mr-2 w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                {showPw ? (
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            </div>
            {err.password && (
              <p className="text-[11px] text-rose-500 mt-1 ml-1 font-medium">{err.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              역할 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(ROLES) as [Role, (typeof ROLES)[Role]][]).map(([key, r]) => {
                const Icon = key === 'admin' ? ShieldCheck : UserCog;
                const active = role === key;
                const activeClass =
                  key === 'admin'
                    ? 'border-rose-300 bg-rose-50'
                    : 'border-blue-300 bg-blue-50';
                const activeText = key === 'admin' ? 'text-rose-700' : 'text-blue-700';
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={cn(
                      'py-3 px-3 rounded-xl border-2 transition tap-scale text-left',
                      active
                        ? activeClass
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon
                        className={cn('w-4 h-4', active ? activeText : 'text-slate-400')}
                      />
                      <span
                        className={cn(
                          'text-sm font-bold',
                          active ? activeText : 'text-slate-600'
                        )}
                      >
                        {r.label}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'text-[10px] leading-tight opacity-80',
                        active ? activeText : 'text-slate-500'
                      )}
                    >
                      {r.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {err._form && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
              <p className="text-xs text-rose-700">{err._form}</p>
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
            onClick={handleSave}
            disabled={pending}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold tap-scale shadow-lg shadow-blue-500/10 disabled:opacity-60"
          >
            {pending ? '저장 중...' : isEditing ? '저장' : '계정 추가'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalField({
  label,
  Icon,
  required,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled,
}: {
  label: string;
  Icon: LucideIcon;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div
        className={cn(
          'relative flex items-center rounded-xl border transition',
          error ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-white',
          disabled && 'opacity-60',
          'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
        )}
      >
        <Icon className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed"
        />
      </div>
      {error && <p className="text-[11px] text-rose-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
}
