#!/usr/bin/env node
/**
 * 초기 관리자/운영자 계정 시딩 스크립트
 *
 * 실행:
 *   node scripts/seed-users.mjs
 *
 * 환경 변수 필요:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * .env.local 파일에서 자동으로 읽어옵니다.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// =============================================================================
// 기본 계정 정보 (배포 시 반드시 비밀번호 변경할 것!)
// =============================================================================
const DEFAULT_USERS = [
  {
    email: 'admin@naeilhi.com',
    password: 'NaeilhiAdmin2026!',
    name: '시스템 관리자',
    role: 'admin',
  },
  {
    email: 'operator@naeilhi.com',
    password: 'NaeilhiOp2026!',
    name: '운영 담당자',
    role: 'operator',
  },
];

// =============================================================================
// .env.local 로드
// =============================================================================
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local 파일을 찾을 수 없습니다');
    console.error('   프로젝트 루트에서 실행하거나 .env.local.example을 복사해주세요');
    process.exit(1);
  }
  const content = readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;          // 빈줄/주석 스킵
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) return;                            // =가 없으면 무시
    const key = line.slice(0, eqIdx).trim();
    if (!/^[A-Z_][A-Z0-9_]*$/i.test(key)) return;       // 키 형식 검증
    if (process.env[key] !== undefined) return;          // 기존 환경변수 우선
    const value = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = value;
  });
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ 필수 환경 변수가 설정되지 않았습니다');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// =============================================================================
// Supabase admin 클라이언트 (service_role로 RLS 우회)
// =============================================================================
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// =============================================================================
// 계정 시딩
// =============================================================================
async function seedUser({ email, password, name, role }) {
  console.log(`\n📧 ${email} (${role})...`);

  // 이미 존재하는지 확인
  const { data: existing } = await supabase.auth.admin.listUsers();
  const existingUser = existing?.users?.find((u) => u.email === email);

  if (existingUser) {
    console.log(`   ↩︎  이미 존재합니다 (ID: ${existingUser.id.slice(0, 8)}...)`);

    // 기존 계정의 역할만 업데이트
    const { error } = await supabase
      .from('profiles')
      .update({ name, role })
      .eq('id', existingUser.id);

    if (error) {
      console.log(`   ⚠️  role 업데이트 실패: ${error.message}`);
      return { success: false, email };
    }
    console.log(`   ✅ role/name 업데이트 완료`);
    return { success: true, email, updated: true };
  }

  // 신규 계정 생성
  const { data: created, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (authErr || !created?.user) {
    console.log(`   ❌ 계정 생성 실패: ${authErr?.message}`);
    return { success: false, email };
  }

  console.log(`   ✅ Auth 계정 생성됨 (ID: ${created.user.id.slice(0, 8)}...)`);

  // profiles는 DB 트리거로 생성되지만, role을 수동으로 업데이트
  // 약간의 지연을 두어 트리거 완료를 기다림
  await new Promise((r) => setTimeout(r, 500));

  const { error: profileErr } = await supabase
    .from('profiles')
    .update({ name, role })
    .eq('id', created.user.id);

  if (profileErr) {
    console.log(`   ⚠️  profile 업데이트 실패: ${profileErr.message}`);
    return { success: false, email };
  }

  console.log(`   ✅ role 설정 완료 (${role})`);
  return { success: true, email, created: true };
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  내일하이 K-디지털 계정 초기 설정     ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`\n🔗 Supabase URL: ${SUPABASE_URL.replace(/https?:\/\//, '').slice(0, 40)}`);
  console.log(`📋 생성할 계정: ${DEFAULT_USERS.length}개\n`);

  const results = [];
  for (const user of DEFAULT_USERS) {
    const result = await seedUser(user);
    results.push(result);
  }

  const ok = results.filter((r) => r.success).length;
  const fail = results.length - ok;

  console.log('\n════════════════════════════════════════');
  console.log(`✅ 성공: ${ok}건`);
  if (fail > 0) console.log(`❌ 실패: ${fail}건`);
  console.log('════════════════════════════════════════\n');

  if (ok > 0) {
    console.log('🔐 로그인 정보\n');
    DEFAULT_USERS.forEach((u) => {
      console.log(`  ${u.role === 'admin' ? '🛡️  어드민' : '👤 운영자'}`);
      console.log(`     이메일:   ${u.email}`);
      console.log(`     비밀번호: ${u.password}\n`);
    });
    console.log('⚠️  배포 후 반드시 비밀번호를 변경하세요!');
    console.log('   관리자 콘솔 → 계정 관리에서 편집 가능합니다.\n');
  }

  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('\n❌ 예기치 않은 오류:', err);
  process.exit(1);
});
