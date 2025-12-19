// 구글 시트 웹 앱 URL (Apps Script 배포 후 여기에 URL을 입력하세요)
const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyRE-HcBfCtfL7aNz_8Q8r6dKUkDTWtR37WnAnq71JahhG9QSuXcKfNxH-29yCdAkOS/exec';

// FAQ 토글
function toggleFaq(index) {
    const faqItems = document.querySelectorAll('.faq-item');
    const currentItem = faqItems[index];
    const answer = currentItem.querySelector('.faq-answer');
    
    const isActive = currentItem.classList.contains('active');
    
    // 모든 FAQ 닫기
    faqItems.forEach(item => {
        item.classList.remove('active');
        const itemAnswer = item.querySelector('.faq-answer');
        if (itemAnswer) itemAnswer.classList.remove('active');
    });
    
    // 현재 FAQ가 닫혀있었다면 열기
    if (!isActive) {
        currentItem.classList.add('active');
        answer.classList.add('active');
    }
}

// 상담 팝업 열기
function openConsultPopup() {
    const popup = document.getElementById('consultPopup');
    const tab = document.getElementById('popupTab');
    if (popup) {
        popup.classList.add('active');
    }
    if (tab) {
        tab.style.display = 'none';
    }
}

// 상담 팝업 닫기
function closeConsultPopup(event) {
    const popup = document.getElementById('consultPopup');
    const tab = document.getElementById('popupTab');
    if (popup) {
        popup.classList.remove('active');
    }
    if (tab) {
        tab.style.display = 'block';
    }
}

// 개인정보 자세히보기 토글
function togglePrivacyDetail() {
    const detail = document.getElementById('privacyDetail');
    if (detail) {
        detail.classList.toggle('active');
    }
}

// 상담 폼 제출 처리
async function handleConsultSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('.popup-submit-btn');
    const submitText = submitBtn.querySelector('.submit-text');
    const submitLoading = submitBtn.querySelector('.submit-loading');
    
    // 개인정보 동의 확인
    const privacyConsent = document.getElementById('privacyConsent');
    if (!privacyConsent.checked) {
        showNotification('개인정보 수집 및 이용에 동의해주세요.', 'error');
        return;
    }
    
    // 로딩 상태
    submitBtn.disabled = true;
    submitText.style.display = 'none';
    submitLoading.style.display = 'inline';
    
    try {
        // 폼 데이터 수집
        const formData = {
            company_name: document.getElementById('companyName').value.trim(),
            contact_number: document.getElementById('contactNumber').value.trim(),
            manager_name: document.getElementById('managerName').value.trim(),
            inquiry_content: document.getElementById('inquiryContent').value.trim() || ''
        };
        
        // 1. 서버 DB에 저장
        const dbResponse = await fetch('/consultation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const dbResult = await dbResponse.json();
        
        // 2. 구글 시트에도 저장 (선택사항)
        if (GOOGLE_SHEET_URL !== 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
            try {
                const sheetData = new URLSearchParams();
                sheetData.append('company_name', formData.company_name);
                sheetData.append('contact_number', formData.contact_number);
                sheetData.append('manager_name', formData.manager_name);
                sheetData.append('inquiry_content', formData.inquiry_content);
                sheetData.append('timestamp', new Date().toLocaleString('ko-KR'));
                
                await fetch(GOOGLE_SHEET_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: sheetData
                });
            } catch (sheetError) {
                console.log('구글 시트 저장 실패 (DB에는 저장됨):', sheetError);
            }
        }
        
        if (dbResult.status === 'success') {
            showNotification('✅ 상담 문의가 성공적으로 접수되었습니다!\n담당자가 빠른 시일 내에 연락드리겠습니다.', 'success');
            form.reset();
            
            // 2초 후 팝업 닫기
            setTimeout(() => {
                closeConsultPopup();
            }, 2000);
        } else {
            showNotification(dbResult.message || '문의 전송 중 오류가 발생했습니다.', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ 문의 전송 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.', 'error');
    } finally {
        // 로딩 상태 해제
        submitBtn.disabled = false;
        submitText.style.display = 'inline';
        submitLoading.style.display = 'none';
    }
}

// 알림 표시
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? '✅' : '❌';
    
    notification.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // 5초 후 자동 제거
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// 전화번호 자동 포맷팅
document.addEventListener('DOMContentLoaded', function() {
    const contactNumberInput = document.getElementById('contactNumber');
    if (contactNumberInput) {
        contactNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, '');
            
            if (value.length <= 3) {
                e.target.value = value;
            } else if (value.length <= 7) {
                e.target.value = value.slice(0, 3) + '-' + value.slice(3);
            } else if (value.length <= 11) {
                e.target.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
            } else {
                e.target.value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
            }
        });
    }
    
    // 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// ESC 키로 팝업 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeConsultPopup();
    }
});

// 스크롤 애니메이션
window.addEventListener('scroll', function() {
    const elements = document.querySelectorAll('.feature-card, .course-card, .faq-item');
    
    elements.forEach(element => {
        const position = element.getBoundingClientRect();
        
        if (position.top < window.innerHeight - 100) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
});

// 초기 스타일 설정
document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.feature-card, .course-card, .faq-item');
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // 페이지 로드 시 상담 팝업 자동으로 열기
    setTimeout(function() {
        openConsultPopup();
    }, 500);
});

