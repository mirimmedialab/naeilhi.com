'use client';

import { useState, useTransition } from 'react';
import {
  Plus,
  Building2,
  Edit3,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  X,
  School,
  Link2,
  Hash,
  Settings,
  ChevronRight,
  Power,
} from 'lucide-react';
import Link from 'next/link';
import { fmt, cn } from '@/lib/utils';
import type { University } from '@/types';
import { createUniversity, updateUniversity, deleteUniversity } from './actions';

export default function UniversitiesClient({
  universities,
  counts,
}: {
  universities: University[];
  counts: Record<string, number>;
}) {
  const [editing, setEditing] = useState<University | null>(null);
  const [adding, setAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getLink = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/u/${slug}`;
  };

  const copyLink = (id: string, slug: string) => {
    navigator.clipboard?.writeText(getLink(slug));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">대학 관리</h1>
          <p className="text-sm text-slate-500">연계 대학 및 전용 URL 관리</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition tap-scale"
        >
          <Plus className="w-4 h-4" />
          링크 만들기
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {universities.map((u) => (
          <UniCard
            key={u.id}
            university={u}
            applicationsCount={counts[u.id] || 0}
            onEdit={() => setEditing(u)}
            onCopy={() => copyLink(u.id, u.slug)}
            copied={copiedId === u.id}
          />
        ))}
      </div>

      {(adding || editing) && (
        <UniversityModal
          university={editing}
          existingSlugs={universities.filter((u) => u.id !== editing?.id).map((u) => u.slug)}
          onClose={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function UniCard({
  university,
  applicationsCount,
  onEdit,
  onCopy,
  copied,
}: {
  university: University;
  applicationsCount: number;
  onEdit: () => void;
  onCopy: () => void;
  copied: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const handleToggleActive = () => {
    startTransition(async () => {
      await updateUniversity(university.id, { active: !university.active });
    });
  };

  const handleDelete = () => {
    if (applicationsCount > 0) {
      alert(
        `이 대학에 ${applicationsCount}건의 신청이 있어 삭제할 수 없습니다.\n비활성화를 사용해주세요.`
      );
      return;
    }
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    startTransition(async () => {
      const result = await deleteUniversity(university.id);
      if (!result.ok) alert(result.error);
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 group hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-slate-600" />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleToggleActive}
            disabled={pending}
            title={university.active ? '비활성화' : '활성화'}
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center',
              university.active ? 'hover:bg-slate-100' : 'hover:bg-emerald-50'
            )}
          >
            <Power
              className={cn(
                'w-3.5 h-3.5',
                university.active ? 'text-emerald-600' : 'text-slate-400'
              )}
            />
          </button>
          <button
            onClick={onEdit}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <button
            onClick={handleDelete}
            disabled={pending}
            className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center disabled:opacity-30"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-0.5">
        <h3 className="font-display font-bold text-base text-slate-900">{university.name}</h3>
        {!university.active && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">
            비활성
          </span>
        )}
      </div>
      <p className="text-[11px] text-slate-500 font-mono mb-3">{university.code}</p>

      <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100">
        <p className="text-[10px] text-slate-400 mb-1">전용 URL</p>
        <div className="flex items-center gap-1.5">
          <code className="text-[10px] text-slate-700 font-mono flex-1 truncate">
            /u/{university.slug}
          </code>
          <button
            onClick={onCopy}
            className="shrink-0 w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:border-blue-400 transition"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div>
          <p className="text-[10px] text-slate-400">총 신청</p>
          <p className="text-sm font-bold text-slate-900">{fmt(applicationsCount)}건</p>
        </div>
        <Link
          href={`/u/${university.slug}`}
          target="_blank"
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
        >
          미리보기 <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function UniversityModal({
  university,
  existingSlugs,
  onClose,
}: {
  university: University | null;
  existingSlugs: string[];
  onClose: () => void;
}) {
  const isEditing = !!university;
  const [name, setName] = useState(university?.name || '');
  const [slug, setSlug] = useState(university?.slug || '');
  const [code, setCode] = useState(university?.code || '');
  const [advanced, setAdvanced] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const handleSave = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = '대학명을 입력해주세요';
    if (slug && !/^[a-z0-9-]+$/.test(slug)) {
      e.slug = '영문 소문자, 숫자, - 만 사용 가능';
    } else if (slug && existingSlugs.includes(slug)) {
      e.slug = '이미 사용중인 slug입니다';
    }
    setErr(e);
    if (Object.keys(e).length > 0) {
      if (e.slug && !advanced) setAdvanced(true);
      return;
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateUniversity(university!.id, {
            name,
            slug: slug || university!.slug,
            code: code || university!.code,
          })
        : await createUniversity({ name, slug: slug || undefined, code: code || undefined });

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
              {isEditing ? '대학 정보 수정' : '링크 만들기'}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isEditing ? '대학명을 수정할 수 있습니다' : '대학명만 입력하면 URL이 자동 생성됩니다'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <ModalField
            label="대학명"
            Icon={School}
            required
            value={name}
            onChange={setName}
            placeholder="예: 서울대학교"
            error={err.name}
          />

          <button
            onClick={() => setAdvanced(!advanced)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg hover:bg-slate-50 transition text-slate-600"
          >
            <div className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">고급 설정</span>
              <span className="text-[10px] text-slate-400">(직접 지정)</span>
            </div>
            <ChevronRight className={cn('w-4 h-4 transition', advanced && 'rotate-90')} />
          </button>

          {advanced && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <ModalField
                label="URL slug"
                Icon={Link2}
                value={slug}
                onChange={(v) => setSlug(v.toLowerCase())}
                placeholder="자동 생성"
                error={err.slug}
              />
              <ModalField
                label="대학 코드"
                Icon={Hash}
                value={code}
                onChange={setCode}
                placeholder="자동 생성"
              />
              <p className="text-[10px] text-slate-500">
                비워두면 자동 생성됩니다. 직접 지정하면 의미있는 URL(예:{' '}
                <span className="font-mono">snu</span>)을 만들 수 있습니다.
              </p>
            </div>
          )}

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
            disabled={pending || !name.trim()}
            className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold tap-scale disabled:opacity-40 shadow-lg shadow-blue-500/10"
          >
            {pending ? '저장 중...' : isEditing ? '저장하기' : '링크 만들기'}
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
  error,
}: {
  label: string;
  Icon: any;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
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
          'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100'
        )}
      >
        <Icon className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-3 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      {error && <p className="text-[11px] text-rose-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
}
