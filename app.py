from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'hrdkorea-secret-key-2025'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///hrdkorea_consultations.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# 상담 문의 모델
class Consultation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    company_name = db.Column(db.String(200), nullable=False)
    contact_number = db.Column(db.String(50), nullable=False)
    manager_name = db.Column(db.String(100), nullable=False)
    inquiry_content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_name': self.company_name,
            'contact_number': self.contact_number,
            'manager_name': self.manager_name,
            'inquiry_content': self.inquiry_content,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }

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
        
        # DB에 저장
        new_consultation = Consultation(
            company_name=company_name,
            contact_number=contact_number,
            manager_name=manager_name,
            inquiry_content=inquiry_content
        )
        
        db.session.add(new_consultation)
        db.session.commit()
        
        # 콘솔에 출력
        print("=" * 60)
        print("🎉 새로운 상담 문의가 접수되었습니다!")
        print("=" * 60)
        print(f"📋 ID: {new_consultation.id}")
        print(f"🏢 기업명: {company_name}")
        print(f"📞 연락처: {contact_number}")
        print(f"👤 담당자: {manager_name}")
        print(f"💬 문의사항: {inquiry_content if inquiry_content else '(없음)'}")
        print(f"⏰ 접수시간: {new_consultation.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        return jsonify({
            'status': 'success',
            'message': '상담 문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다!',
            'data': new_consultation.to_dict()
        })
    
    except Exception as e:
        db.session.rollback()
        print(f"❌ 오류 발생: {e}")
        return jsonify({
            'status': 'error',
            'message': '문의 전송 중 오류가 발생했습니다. 다시 시도해주세요.'
        }), 500

@app.route('/consultations', methods=['GET'])
def get_consultations():
    """모든 상담 문의 조회 (관리자용)"""
    try:
        consultations = Consultation.query.order_by(Consultation.created_at.desc()).all()
        return jsonify({
            'status': 'success',
            'count': len(consultations),
            'data': [c.to_dict() for c in consultations]
        })
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        return jsonify({
            'status': 'error',
            'message': '데이터 조회 중 오류가 발생했습니다.'
        }), 500

if __name__ == '__main__':
    # 데이터베이스 초기화
    with app.app_context():
        db.create_all()
        print("✅ 데이터베이스가 초기화되었습니다.")
    
    port = int(os.environ.get('PORT', 5001))
    print("\n" + "=" * 60)
    print("🚀 대한안전보건교육원 스타일 랜딩페이지 서버 시작!")
    print("=" * 60)
    print(f"🌐 브라우저에서 http://localhost:{port} 으로 접속하세요!")
    print("=" * 60 + "\n")
    app.run(debug=True, host='0.0.0.0', port=port)


