-- =============================================================================
-- K-디지털 기초역량훈련 플랫폼 - 초기 스키마
-- =============================================================================

-- =============================================================================
-- 1. profiles: 관리자/운영자 계정 프로필 (auth.users와 1:1 매핑)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'super_operator', 'operator')),
  university_id UUID REFERENCES universities(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- university_id 제약조건:
  --   - admin, super_operator: 항상 NULL
  --   - operator: 항상 NOT NULL
  CONSTRAINT profiles_university_id_check CHECK (
    (role IN ('admin', 'super_operator') AND university_id IS NULL) OR
    (role = 'operator' AND university_id IS NOT NULL)
  )
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_university ON profiles(university_id) WHERE role = 'operator';

-- 신규 사용자 가입 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'operator'  -- 기본 역할은 운영자. 어드민은 수동 승격
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- 2. universities: 연계 대학
-- =============================================================================
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,          -- URL에 사용 (영숫자+하이픈)
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_universities_slug ON universities(slug) WHERE active = TRUE;

-- =============================================================================
-- 3. applications: 수강 신청
-- =============================================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 연계 정보
  university_id UUID NOT NULL REFERENCES universities(id) ON DELETE RESTRICT,
  course_id TEXT NOT NULL,              -- COURSES 상수의 id (copilot, kotlin, ...)
  course_title TEXT NOT NULL,           -- 신청 시점의 과정명 스냅샷
  course_price INTEGER NOT NULL DEFAULT 0,
  
  -- 학생 정보
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  grade TEXT NOT NULL,                  -- '1학년', '2학년', ..., '대학원'
  has_card BOOLEAN NOT NULL,            -- 내일배움카드 보유 여부
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  status_note TEXT,                     -- 반려 사유 등 내부 메모
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  
  -- 수료 관리
  completed BOOLEAN,
  refund_amount INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  completion_note TEXT,
  
  -- 메타
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 중복 신청 방지 (pending/approved 상태인 신청만 체크, rejected는 재신청 허용)
CREATE UNIQUE INDEX unique_active_application 
  ON applications (university_id, course_id, phone)
  WHERE status IN ('pending', 'approved');

CREATE INDEX idx_applications_university ON applications(university_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_applied_at ON applications(applied_at DESC);
CREATE INDEX idx_applications_course ON applications(course_id);
CREATE INDEX idx_applications_completed ON applications(completed) WHERE status = 'approved';

-- 월별 조회는 applied_at 인덱스로 충분 (date_trunc는 IMMUTABLE 불가)

-- =============================================================================
-- 4. updated_at 자동 업데이트 트리거
-- =============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER universities_updated_at BEFORE UPDATE ON universities
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- 5. 통계 조회용 뷰 (관리자 대시보드)
-- =============================================================================
CREATE OR REPLACE VIEW application_stats AS
SELECT
  u.id AS university_id,
  u.name AS university_name,
  a.course_id,
  COUNT(*) FILTER (WHERE a.status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE a.status = 'approved') AS approved_count,
  COUNT(*) FILTER (WHERE a.status = 'rejected') AS rejected_count,
  COUNT(*) FILTER (WHERE a.completed = TRUE) AS completed_count,
  COALESCE(SUM(a.refund_amount) FILTER (WHERE a.completed = TRUE), 0) AS total_refund,
  date_trunc('month', a.applied_at) AS month
FROM applications a
JOIN universities u ON u.id = a.university_id
GROUP BY u.id, u.name, a.course_id, date_trunc('month', a.applied_at);
