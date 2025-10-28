// 獲取DOM元素
const form = document.getElementById('qrcodeForm');
const doorNumberInput = document.getElementById('doorNumber');
const phoneNumberInput = document.getElementById('phoneNumber');
const generateBtn = document.getElementById('generateBtn');
const resultContainer = document.getElementById('resultContainer');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

const qrcodeImage = document.getElementById('qrcodeImage');
const resultDoorNumber = document.getElementById('resultDoorNumber');
const resultPhoneNumber = document.getElementById('resultPhoneNumber');
const resultTimestamp = document.getElementById('resultTimestamp');

let currentQrCodeData = null;

// 表單提交處理
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const doorNumber = doorNumberInput.value.trim();
    const phoneNumber = phoneNumberInput.value.trim();

    // 基本驗證
    if (!doorNumber || !phoneNumber) {
        showError('請填寫所有必填欄位');
        return;
    }

    // 門牌號碼格式驗證（純數字）
    if (!/^[0-9]+$/.test(doorNumber)) {
        showError('門牌號碼必須是數字');
        return;
    }

    // 電話號碼格式驗證
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
        showError('請輸入有效的電話號碼（10位數字）');
        return;
    }

    try {
        // 顯示載入動畫
        showLoading();

        // 發送API請求
        const response = await fetch('/api/generate-qrcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                doorNumber: doorNumber,
                phoneNumber: phoneNumber
            })
        });

        const data = await response.json();

        hideLoading();

        if (data.code === 200) {
            // 成功生成QR Code
            showResult(data.data);
            currentQrCodeData = data.data;
        } else if (data.code === 403) {
            // 無權限（不在資料庫中）
            showError('此門牌號碼和電話號碼組合不在資料庫中，無法生成訪客證');
        } else {
            // 其他錯誤
            showError(data.desc || data.message || '生成QR Code時發生錯誤');
        }

    } catch (error) {
        hideLoading();
        console.error('錯誤:', error);
        showError('無法連接到伺服器，請檢查網路連接');
    }
});

// 顯示結果
function showResult(data) {
    // 設置QR Code圖片
    qrcodeImage.src = data.qrcode;
    
    // 設置顯示資訊
    resultDoorNumber.textContent = data.doorNumber || '未提供';
    resultPhoneNumber.textContent = data.phoneNumber || '未提供';
    resultTimestamp.textContent = new Date(data.timestamp).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // 隱藏表單，顯示結果
    form.reset();
    resultContainer.style.display = 'block';
    errorMessage.style.display = 'none';

    // 滾動到結果區域
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 顯示錯誤訊息
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    resultContainer.style.display = 'none';

    // 滾動到錯誤訊息
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// 顯示載入動畫
function showLoading() {
    loading.style.display = 'block';
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<span class="btn-text">⏳ 生成中...</span>';
}

// 隱藏載入動畫
function hideLoading() {
    loading.style.display = 'none';
    generateBtn.disabled = false;
    generateBtn.innerHTML = '<span class="btn-text">🔲 產生QR Code</span>';
}

// 下載QR Code
downloadBtn.addEventListener('click', () => {
    if (!currentQrCodeData) return;

    const link = document.createElement('a');
    link.href = currentQrCodeData.qrcode;
    link.download = `qrcode_${currentQrCodeData.doorNumber}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// 清除並重新輸入
clearBtn.addEventListener('click', () => {
    resultContainer.style.display = 'none';
    errorMessage.style.display = 'none';
    currentQrCodeData = null;
    
    // 焦點回到第一個輸入框
    doorNumberInput.focus();
    
    // 平滑滾動到表單
    form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

// 輸入驗證提示
doorNumberInput.addEventListener('input', () => {
    clearError();
});

phoneNumberInput.addEventListener('input', () => {
    clearError();
});

function clearError() {
    if (errorMessage.style.display === 'block') {
        errorMessage.style.display = 'none';
    }
}

// Enter鍵提交表單
phoneNumberInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
    }
});

