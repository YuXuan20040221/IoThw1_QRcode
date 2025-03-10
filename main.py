from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import qrcode
import openpyxl
import os
from datetime import datetime
import base64
from io import BytesIO

app = Flask(__name__)
app.secret_key = 'your_secret_key'
excel_file = 'attendance.xlsx'

# 初始化 Excel
if not os.path.exists(excel_file):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.append(["員工編號", "姓名", "日期", "時間", "狀態"])
    wb.save(excel_file)

# 假的員工資料
users = {
    "admin": "1234",
    "user1": "password1"
}

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username in users and users[username] == password:
            session['user'] = username
            return redirect(url_for('dashboard'))
        else:
            return "登入失敗"
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    emp_id = session['user']
    qr = qrcode.make(emp_id)
    buffer = BytesIO()
    qr.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    return render_template('dashboard.html', qr_code=qr_base64, emp_id=emp_id)

@app.route('/scan_qr', methods=['POST'])
def scan_qr():
    emp_id = request.json.get('emp_id')
    status = request.json.get('status', '上班')
    now = datetime.now()
    date = now.strftime('%Y-%m-%d')
    time = now.strftime('%H:%M:%S')
    
    wb = openpyxl.load_workbook(excel_file)
    ws = wb.active
    ws.append([emp_id, "員工", date, time, status])
    wb.save(excel_file)
    
    return jsonify({"message": "打卡成功！"})

@app.route('/logout')
def logout():
    session.pop('user', None)
    return redirect(url_for('login'))

if __name__ == '__main__':
    app.run(debug=True)
