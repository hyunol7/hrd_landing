from flask import Flask, render_template, request, jsonify
from datetime import datetime
import os
from supabase import create_client, Client

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hrdkorea-secret-key-2025'

# Supabase 클라이언트 초기화
SUPABASE_URL = os.environ.get('SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_KEY', '')

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except:
        pass

@app.route('/')
def index():
    """메인 페이지"""
    return render_template('index.html')

@app.route('/consultation', methods=['POST'])
def consultation():
    """상담 문의 저장"""
    try:
        data = request.get_json()
        
        company_name = data.get('company_name', '').strip()
        contact_number = data.get('contact_number', '').strip()
        manager_name = data.get('manager_name', '').strip()
        inquiry_content = data.get('inquiry_content', '').strip()
        
        # 필수 필드 검증
        if not company_name or not contact_number or not manager_name:
            return jsonify({
                'status': 'error',
                'message': '기업명, 연락처, 담당자 성함은 필수 입력 항목입니다.'
            }), 400
        
        # Supabase에 저장
        if supabase:
            consultation_data = {
                'company_name': company_name,
                'contact_number': contact_number,
                'manager_name': manager_name,
                'inquiry_content': inquiry_content,
                'created_at': datetime.utcnow().isoformat()
            }
            
            result = supabase.table('consultations').insert(consultation_data).execute()
            
            # 콘솔에 출력
            print("=" * 60)
            print("🎉 새로운 상담 문의가 접수되었습니다!")
            print("=" * 60)
            print(f"🏢 기업명: {company_name}")
            print(f"📞 연락처: {contact_number}")
            print(f"👤 담당자: {manager_name}")
            print(f"💬 문의사항: {inquiry_content if inquiry_content else '(없음)'}")
            print("=" * 60)
            
            return jsonify({
                'status': 'success',
                'message': '상담 문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다!',
                'data': result.data[0] if result.data else {}
            })
        else:
            # Supabase 미설정 시 로컬 저장 (개발용)
            return jsonify({
                'status': 'success',
                'message': '상담 문의가 접수되었습니다. (개발 모드)',
                'data': {
                    'company_name': company_name,
                    'contact_number': contact_number,
                    'manager_name': manager_name
                }
            })
    
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return jsonify({
            'status': 'error',
            'message': '문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.'
        }), 500

@app.route('/consultations', methods=['GET'])
def get_consultations():
    """모든 상담 문의 조회 (관리자용)"""
    try:
        if supabase:
            result = supabase.table('consultations').select('*').order('created_at', desc=True).execute()
            return jsonify({
                'status': 'success',
                'count': len(result.data),
                'data': result.data
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Supabase 설정이 필요합니다.'
            }), 500
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return jsonify({
            'status': 'error',
            'message': '데이터 조회 중 오류가 발생했습니다.'
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    print("\n" + "=" * 60)
    print("🚀 HRD코리아 랜딩페이지 서버 시작!")
    print("=" * 60)
    print(f"🌐 브라우저에서 http://localhost:{port} 으로 접속하세요!")
    print("=" * 60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=port)
