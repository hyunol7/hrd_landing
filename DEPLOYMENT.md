# Vercel 배포 가이드

## 1. Supabase 데이터베이스 설정

### Supabase 프로젝트 생성
1. https://supabase.com 접속 및 가입
2. "New Project" 클릭
3. 프로젝트 이름: `hrd-korea`
4. Database Password 설정 및 저장

### 테이블 생성
SQL Editor에서 다음 쿼리 실행:

```sql
CREATE TABLE consultations (
  id BIGSERIAL PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  contact_number VARCHAR(50) NOT NULL,
  manager_name VARCHAR(100) NOT NULL,
  inquiry_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- RLS (Row Level Security) 비활성화 (공개 랜딩페이지용)
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;
```

### API 키 확인
1. Project Settings → API
2. **Project URL** 복사
3. **anon public** 키 복사

## 2. Vercel 배포

### Vercel 프로젝트 생성
1. https://vercel.com 에서 GitHub 계정으로 로그인
2. "Add New..." → "Project"
3. `hyunol7/hrd_landing` 저장소 Import

### 환경 변수 설정
Vercel 프로젝트 설정에서:
1. "Settings" → "Environment Variables"
2. 다음 변수 추가:
   - `SUPABASE_URL`: (Supabase Project URL)
   - `SUPABASE_KEY`: (Supabase anon public 키)

### 배포
1. "Deploy" 클릭
2. 완료될 때까지 대기 (1-2분)
3. 배포 완료 후 URL 확인: `https://hrd-landing-xxxx.vercel.app`

## 3. 로컬 개발

로컬에서 테스트하려면:

1. 환경 변수 설정:
```bash
# Windows (PowerShell)
$env:SUPABASE_URL="your-url"
$env:SUPABASE_KEY="your-key"

# Windows (CMD)
set SUPABASE_URL=your-url
set SUPABASE_KEY=your-key
```

2. 서버 실행:
```bash
python app.py
```

## 주의사항
- Supabase 무료 플랜: 500MB 데이터, 월 50,000 요청
- Vercel 무료 플랜: 월 100GB 대역폭
- 충분히 사용 가능합니다!






