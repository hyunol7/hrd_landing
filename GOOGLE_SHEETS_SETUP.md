# 구글 시트 연동 설정 가이드

상담 문의 데이터를 구글 시트에 자동으로 저장하는 방법입니다.

## 1단계: 구글 시트 생성

1. [Google Sheets](https://sheets.google.com)에 접속
2. 새 스프레드시트 생성
3. 첫 번째 행에 다음 헤더 입력:
   - A1: `접수일시`
   - B1: `기업명`
   - C1: `연락처`
   - D1: `담당자명`
   - E1: `문의사항`

## 2단계: Google Apps Script 설정

1. 구글 시트에서 **확장 프로그램 > Apps Script** 클릭
2. 기본 코드를 삭제하고 아래 코드 붙여넣기:

```javascript
function doPost(e) {
  try {
    // 스프레드시트 연결
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 폼 데이터 파싱
    var params = e.parameter;
    var timestamp = params.timestamp || new Date().toLocaleString('ko-KR');
    var companyName = params.company_name || '';
    var contactNumber = params.contact_number || '';
    var managerName = params.manager_name || '';
    var inquiryContent = params.inquiry_content || '';
    
    // 시트에 데이터 추가
    sheet.appendRow([
      timestamp,
      companyName,
      contactNumber,
      managerName,
      inquiryContent
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': '데이터가 저장되었습니다.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Apps Script가 정상 작동 중입니다.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. **저장** 버튼 클릭 (프로젝트 이름: "상담문의 수집기")

## 3단계: 웹 앱으로 배포

1. Apps Script 편집기에서 **배포 > 새 배포** 클릭
2. 설정:
   - **유형 선택**: 웹 앱
   - **설명**: 상담 문의 수집
   - **실행 주체**: 나
   - **액세스 권한**: **모든 사용자** (중요!)
3. **배포** 클릭
4. 권한 승인:
   - "권한 검토" 클릭
   - Google 계정 선택
   - "고급" 클릭 → "프로젝트 이름(안전하지 않음)으로 이동" 클릭
   - "허용" 클릭
5. **웹 앱 URL** 복사 (예: `https://script.google.com/macros/s/AKfycby.../exec`)

## 4단계: 웹사이트에 URL 적용

1. `static/js/script.js` 파일 열기
2. 2번째 줄 찾기:
```javascript
const GOOGLE_SHEET_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';
```
3. 복사한 URL로 교체:
```javascript
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
```
4. 파일 저장

## 5단계: 테스트

1. 웹사이트에서 상담 문의 폼 작성 및 제출
2. 구글 시트에 데이터가 자동으로 추가되는지 확인
3. 데이터베이스에도 동시에 저장됨

## 데이터 저장 흐름

```
사용자 폼 제출
    ↓
1. Flask 서버 DB에 저장 (SQLite)
    ↓
2. 구글 시트에도 저장 (Apps Script)
    ↓
성공 메시지 표시
```

## 문제 해결

### 데이터가 시트에 저장되지 않는 경우

1. **Apps Script 배포 확인**
   - "액세스 권한"이 "모든 사용자"로 설정되었는지 확인
   - 웹 앱 URL이 정확한지 확인

2. **브라우저 콘솔 확인**
   - F12 키 → Console 탭
   - 오류 메시지 확인

3. **Apps Script 로그 확인**
   - Apps Script 편집기 → 실행 로그 확인
   - 오류 발생 시 코드 재확인

### CORS 오류가 발생하는 경우

- `mode: 'no-cors'` 옵션이 JavaScript에 포함되어 있어 문제없음
- 데이터는 정상적으로 저장되지만 응답을 받을 수 없음 (정상 동작)

## 추가 기능

### 이메일 알림 추가

Apps Script 코드에 다음 추가:

```javascript
// 데이터 저장 후
MailApp.sendEmail({
  to: 'your-email@example.com',
  subject: '새로운 상담 문의',
  body: `
    기업명: ${companyName}
    연락처: ${contactNumber}
    담당자: ${managerName}
    문의사항: ${inquiryContent}
  `
});
```

### 자동 응답 메일 발송

연락처에 이메일이 포함된 경우:

```javascript
if (contactNumber.includes('@')) {
  MailApp.sendEmail({
    to: contactNumber,
    subject: '[대한안전보건교육원] 상담 문의 접수 완료',
    body: `
      ${managerName}님, 안녕하세요.
      
      상담 문의가 정상적으로 접수되었습니다.
      담당자가 빠른 시일 내에 연락드리겠습니다.
      
      감사합니다.
    `
  });
}
```

## 보안 주의사항

1. 구글 시트 공유 설정을 "링크가 있는 모든 사용자"로 설정하지 마세요
2. Apps Script 웹 앱 URL은 외부에 노출되지 않도록 주의
3. 민감한 개인정보는 암호화하여 저장하는 것을 권장

## 참고 자료

- [Google Apps Script 공식 문서](https://developers.google.com/apps-script)
- [Google Sheets API](https://developers.google.com/sheets/api)


