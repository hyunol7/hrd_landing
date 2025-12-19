// 이 코드를 Google Apps Script 에디터에 붙여넣으세요
// https://docs.google.com/spreadsheets/d/1NjxwF1MSxgZHwy7YjyqdhEM2SOwjPUw9ACv2M9lRIoM/edit

function doPost(e) {
  try {
    // 스프레드시트 연결
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // 폼 데이터 파싱
    var params = e.parameter;
    var timestamp = params.timestamp || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    var companyName = params.company_name || '';
    var contactNumber = params.contact_number || '';
    var managerName = params.manager_name || '';
    var inquiryContent = params.inquiry_content || '';
    
    // 시트에 데이터 추가 (2번째 행부터 - 1번 행은 헤더)
    sheet.appendRow([
      timestamp,
      companyName,
      contactNumber,
      managerName,
      inquiryContent
    ]);
    
    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'success',
        'message': '상담 문의가 구글 시트에 저장되었습니다.'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 에러 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        'status': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 처리 (테스트용)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Apps Script가 정상 작동 중입니다.',
      'timestamp': new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// 테스트 함수 (Apps Script 에디터에서 실행 가능)
function testInsert() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.appendRow([
    new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
    '테스트 회사',
    '010-1234-5678',
    '홍길동',
    '테스트 문의입니다.'
  ]);
  Logger.log('테스트 데이터가 추가되었습니다.');
}

