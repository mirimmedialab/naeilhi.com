-- =============================================================================
-- Row-Level Security 정책
-- =============================================================================
-- 주의: Supabase는 auth 스키마에 함수 생성 권한을 주지 않으므로
-- 모든 helper 함수는 public 스키마에 생성합니다.
-- =============================================================================

-- =============================================================================
-- 1. helper 함수: 현재 사용자의 역할 확인 (public 스키마)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'operator') FROM public.profiles WHERE id = auth.uid()),
    FALSE
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- 이 함수들은 authenticated/anon 역할이 실행 가능해야 RLS에서 호출됨
GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, anon;

-- =============================================================================
-- 2. profiles RLS
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 본인 프로필 조회
CREATE POLICY profiles_read_self ON profiles FOR SELECT
  USING (auth.uid() = id);

-- admin은 모든 프로필 조회
CREATE POLICY profiles_read_all_admin ON profiles FOR SELECT
  USING (public.is_admin());

-- admin은 프로필 역할 변경 가능
-- (단, 본인의 role은 변경 불가 — 마지막 어드민 잠금 방지)
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (
    public.is_admin()
    AND (
      -- 본인이 아니면 자유롭게 변경
      id != auth.uid()
      -- 본인이면 role은 그대로 유지해야 함
      OR role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    )
  );

-- admin은 계정 삭제 가능 (auth.users CASCADE로 동시 삭제됨)
-- 단, 본인은 삭제 불가
CREATE POLICY profiles_delete_admin ON profiles FOR DELETE
  USING (public.is_admin() AND id != auth.uid());

-- =============================================================================
-- 3. universities RLS
-- =============================================================================
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;

-- 공개: 활성 대학은 anon도 조회 가능 (학생 신청 페이지)
CREATE POLICY universities_read_public ON universities FOR SELECT
  USING (active = TRUE);

-- admin은 비활성 대학도 조회 가능
CREATE POLICY universities_read_admin ON universities FOR SELECT
  USING (public.is_admin());

-- admin만 대학 추가/수정/삭제
CREATE POLICY universities_insert_admin ON universities FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY universities_update_admin ON universities FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY universities_delete_admin ON universities FOR DELETE
  USING (public.is_admin());

-- =============================================================================
-- 4. applications RLS
-- =============================================================================
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 학생(anon) 신청서 제출 가능 — 활성 대학에만
CREATE POLICY applications_insert_public ON applications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM universities u
      WHERE u.id = university_id AND u.active = TRUE
    )
    AND status = 'pending'  -- 신규 신청은 항상 pending
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND completed IS NULL
  );

-- staff(admin + operator)는 전체 조회
CREATE POLICY applications_read_staff ON applications FOR SELECT
  USING (public.is_staff());

-- staff는 상태 변경 및 수료 정보 업데이트 가능
CREATE POLICY applications_update_staff ON applications FOR UPDATE
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- admin만 삭제
CREATE POLICY applications_delete_admin ON applications FOR DELETE
  USING (public.is_admin());
