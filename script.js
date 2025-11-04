// ====================================================================
// I. GENEL YÖNETİM VE EKRAN GEÇİŞLERİ
// ====================================================================

/**
 * Belirtilen ekranı gösterir ve diğerlerini gizler.
 * @param {string} screenName - 'menu', 'kindu', 'poli', 'geometri-5-sinif', 'cokgen-5-sinif'
 */
function showScreen(screenName) {
    const screens = document.querySelectorAll('#ana-icerik > section');
    const targetId = screenName === 'menu' ? 'menu-ekrani' : screenName + '-oyun-alani';
    const targetScreen = document.getElementById(targetId);
    
    screens.forEach(screen => {
        screen.style.display = 'none';
    });

    if (targetScreen) {
        targetScreen.style.display = 'block';

        if (screenName === 'poli') {
            document.body.style.background = 'linear-gradient(120deg, #84fab0, #8fd3f4)';
        } else {
            document.body.style.background = '#e9ecef';
        }
    }
}

// ====================================================================
// II. HESAP YÖNETİMİ VE SKOR TABLOSU MANTIĞI
// ====================================================================

const loginLogoutButton = document.getElementById('login-logout-button');
const welcomeMessage = document.getElementById('welcome-message');
const highScoresList = document.getElementById('high-scores');

// localStorage'dan mevcut kullanıcı adını yükle
let currentUserName = localStorage.getItem('currentUserName');

function updateAccountStatus() {
    if (currentUserName) {
        welcomeMessage.textContent = `Hoş Geldin, ${currentUserName}!`;
        loginLogoutButton.textContent = 'Kullanıcı Adı Değiştir';
    } else {
        welcomeMessage.textContent = 'Misafir (Puan kaydı için giriş yapın)';
        loginLogoutButton.textContent = 'Kullanıcı Adı Gir';
    }
    loadAndDisplayHighScores();
}

function handleLoginLogout() {
    if (currentUserName) {
        // İsim değiştirmeden önce onay al
        const confirmChange = confirm("Mevcut kullanıcı adınız: " + currentUserName + ". Yeni bir isimle devam etmek ister misiniz?");
        if (!confirmChange) return;
    }

    const newName = prompt("Lütfen bir kullanıcı adı girin (min 3 karakter):");
    if (newName && newName.length >= 3) {
        currentUserName = newName.trim();
        localStorage.setItem('currentUserName', currentUserName);
        alert(`Kullanıcı adı başarıyla ayarlandı: ${currentUserName}`);
        updateAccountStatus();
    } else if (newName !== null) {
        alert("Kullanıcı adı en az 3 karakter olmalıdır.");
    }
}

/**
 * Puanı kaydeder veya mevcut puanı günceller (en yüksek puanı tutar).
 * @param {string} userName - Kullanıcının adı.
 * @param {number} scoreToAdd - Kazanılan puan.
 */
function saveScore(userName, scoreToAdd) {
    if (!userName) {
        // Kullanıcı adı olmadığında uyarı verme.
        return;
    }

    let scores = JSON.parse(localStorage.getItem('kınduScores')) || [];
    
    // Aynı kullanıcı adını bul
    let existingUserIndex = scores.findIndex(s => s.user === userName);

    if (existingUserIndex > -1) {
        // Mevcut puana ekle
        scores[existingUserIndex].score += scoreToAdd;
    } else {
        // Yeni kayıt oluştur
        scores.push({ user: userName, score: scoreToAdd });
    }

    // Puanları büyükten küçüğe sırala
    scores.sort((a, b) => b.score - a.score);

    localStorage.setItem('kınduScores', JSON.stringify(scores.slice(0, 10))); // En iyi 10'u tut
    loadAndDisplayHighScores();
}

function loadAndDisplayHighScores() {
    let scores = JSON.parse(localStorage.getItem('kınduScores')) || [];
    highScoresList.innerHTML = '';

    if (scores.length === 0) {
        highScoresList.innerHTML = '<li>Henüz bir skor kaydedilmedi. Oyuna başlayın!</li>';
        return;
    }

    scores.slice(0, 5).forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="score-rank">#${index + 1}</span>
            <span>${item.user}</span>
            <span class="score-value">${item.score} Puan</span>
        `;
        highScoresList.appendChild(li);
    });
}

// Olay dinleyicisini ekle
if (loginLogoutButton) {
    loginLogoutButton.addEventListener('click', handleLoginLogout);
}

// ====================================================================
// III. HESAP MAKİNESİ MANTIĞI
// ====================================================================

const calcButton = document.getElementById('calc-button');
const calculator = document.getElementById('calculator');
const calcScreen = document.getElementById('calc-screen');
const calcKeys = document.querySelector('.calc-keys');

let currentInput = '0';
let operator = null;
let firstOperand = null;
let waitingForSecondOperand = false;

calcButton.addEventListener('click', () => { calculator.classList.toggle('hidden'); });

function updateScreen() { calcScreen.value = currentInput; }
function appendToScreen(digitOrOperator) {
    if (waitingForSecondOperand) {
        currentInput = digitOrOperator; waitingForSecondOperand = false;
    } else {
        if (digitOrOperator === '.' && currentInput.includes('.')) return; 
        currentInput = (currentInput === '0' && digitOrOperator !== '.') ? digitOrOperator : currentInput + digitOrOperator;
    }
    updateScreen();
}
function clearScreen() { 
    currentInput = '0'; operator = null; firstOperand = null; waitingForSecondOperand = false; updateScreen(); 
}
function calculate() {
    if (operator === null || waitingForSecondOperand) return;
    const secondOperand = parseFloat(currentInput);
    let result = 0;
    
    if (isNaN(firstOperand)) return;

    switch (operator) {
        case '+': result = firstOperand + secondOperand; break; 
        case '-': result = firstOperand - secondOperand; break; 
        case '*': result = firstOperand * secondOperand; break;
        case '/': 
            if (secondOperand === 0) {
                currentInput = "Hata"; firstOperand = null; operator = null; waitingForSecondOperand = true; updateScreen();
                return;
            }
            result = firstOperand / secondOperand; 
            break;
        default: return;
    }
    currentInput = String(parseFloat(result.toFixed(4))); 
    firstOperand = parseFloat(currentInput);
    waitingForSecondOperand = true;
    operator = null; 
    updateScreen();
}
calcKeys.addEventListener('click', (event) => {
    const { target } = event;
    if (!target.matches('button')) return;
    const value = target.innerText;

    if (value === 'C') { clearScreen(); return; }
    if (value === '=') { calculate(); return; } 
    if (['+', '-', '*', '/'].includes(value)) {
        if (operator && !waitingForSecondOperand) { calculate(); }
        firstOperand = parseFloat(currentInput);
        operator = value;
        waitingForSecondOperand = true;
        return;
    }
    if (!isNaN(parseInt(value)) || value === '.') {
        appendToScreen(value);
    }
});


// ====================================================================
// IV. KINDU OYUNLARI MANTIĞI (Açı, Çember, Köşegen)
// ====================================================================

let verilenAciAdi = '';
let dogruCevaplar = {};
const aciPozisyonlari = ['A', 'X', 'Y', 'Z'];
const SVG_POSITIONS = {
    A: { x: 100, y: 70 }, X: { x: 230, y: 170 }, Y: { x: 300, y: 170 }, Z: { x: 230, y: 230 }, 
};

function cizimiGuncelle() {
    const svg = document.getElementById('geometri-svg');
    const labelA = document.getElementById('label-A');
    const labelX = document.getElementById('label-X');
    const labelY = document.getElementById('label-Y');
    const labelZ = document.getElementById('label-Z');
    
    svg.innerHTML = '';
    const d1 = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    d1.setAttribute('x1', '0'); d1.setAttribute('y1', '100'); d1.setAttribute('x2', '400'); d1.setAttribute('y2', '100'); d1.setAttribute('stroke', '#3498db'); d1.setAttribute('stroke-width', '2'); svg.appendChild(d1);
    const d2 = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    d2.setAttribute('x1', '0'); d2.setAttribute('y1', '200'); d2.setAttribute('x2', '400'); d2.setAttribute('y2', '200'); d2.setAttribute('stroke', '#3498db'); d2.setAttribute('stroke-width', '2'); svg.appendChild(d2);
    const t = document.createElementNS("http://www.w3.org/2000/svg", 'line');
    t.setAttribute('x1', '50'); t.setAttribute('y1', '0'); t.setAttribute('x2', '350'); t.setAttribute('y2', '300'); t.setAttribute('stroke', '#e74c3c'); t.setAttribute('stroke-width', '2'); svg.appendChild(t);
    
    [labelA, labelX, labelY, labelZ].forEach(label => {
        const id = label.id.split('-')[1];
        label.setAttribute('x', SVG_POSITIONS[id].x);
        label.setAttribute('y', SVG_POSITIONS[id].y);
        svg.appendChild(label);
    });
    document.getElementById(`label-${verilenAciAdi}`).setAttribute('fill', '#007bff');
    document.getElementById(`label-${verilenAciAdi}`).style.textShadow = '0 0 5px #007bff';
}
function aciOyunuHazirla() {
    const aciXInput = document.getElementById('aci-x-input');
    const aciYInput = document.getElementById('aci-y-input');
    const aciZInput = document.getElementById('aci-z-input');
    const geribildirimP = document.getElementById('geribildirim');
    const kontrolButton = document.getElementById('kontrol-et-butonu');
    const yeniSoruButton = document.getElementById('yeni-soru-butonu');
    const aciIsimSpan = document.getElementById('aci-isim');
    const aciAspan = document.getElementById('aci-a-verilen');
    
    aciXInput.value = ''; aciYInput.value = ''; aciZInput.value = '';
    geribildirimP.innerHTML = 'X, Y ve Z açılarını bulmalısın.'; geribildirimP.style.color = '#333';
    kontrolButton.style.display = 'block'; yeniSoruButton.style.display = 'none';
    const darAci = Math.floor(Math.random() * (70 - 30 + 1)) + 30;
    const genisAci = 180 - darAci;
    verilenAciAdi = aciPozisyonlari[Math.floor(Math.random() * aciPozisyonlari.length)];
    let aciKural = (verilenAciAdi === 'A' || verilenAciAdi === 'X') ? darAci : genisAci;
    dogruCevaplar.X = darAci; dogruCevaplar.Y = genisAci; dogruCevaplar.Z = genisAci; 
    aciIsimSpan.textContent = verilenAciAdi; aciAspan.textContent = aciKural + '°';
    
    document.getElementById('label-A').textContent = 'A'; document.getElementById('label-X').textContent = 'X'; 
    document.getElementById('label-Y').textContent = 'Y'; document.getElementById('label-Z').textContent = 'Z';
    document.getElementById(`label-${verilenAciAdi}`).textContent = verilenAciAdi + ' (' + aciKural + '°' + ')';
    cizimiGuncelle();
}
function aciCevapKontrol() {
    const aciXInput = document.getElementById('aci-x-input');
    const aciYInput = document.getElementById('aci-y-input');
    const aciZInput = document.getElementById('aci-z-input');
    const geribildirimP = document.getElementById('geribildirim');
    const kontrolButton = document.getElementById('kontrol-et-butonu');
    const yeniSoruButton = document.getElementById('yeni-soru-butonu');

    let dogruSayisi = 0; let feedbackMetni = [];
    const cevapX = parseInt(aciXInput.value);
    const cevapY = parseInt(aciYInput.value);
    const cevapZ = parseInt(aciZInput.value);

    if (cevapX === dogruCevaplar.X) { dogruSayisi++; feedbackMetni.push("✅ Açı X: Doğru!"); } else { feedbackMetni.push(`❌ Açı X yanlış. Doğru: ${dogruCevaplar.X}°`); }
    if (cevapY === dogruCevaplar.Y) { dogruSayisi++; feedbackMetni.push("✅ Açı Y: Doğru!"); } else { feedbackMetni.push(`❌ Açı Y yanlış. Doğru: ${dogruCevaplar.Y}°`); }
    if (cevapZ === dogruCevaplar.Z) { dogruSayisi++; feedbackMetni.push("✅ Açı Z: Doğru!"); } else { feedbackMetni.push(`❌ Açı Z yanlış. Doğru: ${dogruCevaplar.Z}°`); }
    
    if (dogruSayisi === 3) {
        geribildirimP.innerHTML = `🎉 MÜKEMMEL! Hepsini doğru buldunuz! (+50 Puan)`;
        geribildirimP.style.color = 'green';
        kontrolButton.style.display = 'none'; yeniSoruButton.style.display = 'block';
        saveScore(currentUserName, 50); // Puan Kaydı
    } else {
        geribildirimP.innerHTML = `Tekrar Dene! ${dogruSayisi}/3 doğru. <br><br>` + feedbackMetni.join('<br>');
        geribildirimP.style.color = 'red';
    }
}

let dogruYaricap;
function cemberOyunuHazirla() {
    const merkezXspan = document.getElementById('merkez-x');
    const merkezYspan = document.getElementById('merkez-y');
    const noktaXspan = document.getElementById('nokta-x');
    const noktaYspan = document.getElementById('nokta-y');
    const yaricapInput = document.getElementById('yaricap-input');
    const cemberGeribildirim = document.getElementById('cember-geribildirim');

    const M_x = Math.floor(Math.random() * 21) - 10;
    const M_y = Math.floor(Math.random() * 21) - 10;
    const A_x = Math.floor(Math.random() * 21) - 10;
    const A_y = Math.floor(Math.random() * 21) - 10;
    const deltaX = A_x - M_x;
    const deltaY = A_y - M_y;
    dogruYaricap = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

    merkezXspan.textContent = M_x; merkezYspan.textContent = M_y;
    noktaXspan.textContent = A_x; noktaYspan.textContent = A_y;
    yaricapInput.value = ''; cemberGeribildirim.textContent = '';
}
function cemberCevapKontrol() {
    const yaricapInput = document.getElementById('yaricap-input');
    const cemberGeribildirim = document.getElementById('cember-geribildirim');
    const kullaniciCevabi = parseFloat(yaricapInput.value);
    
    if (Math.abs(kullaniciCevabi - dogruYaricap) < 0.01) {
        cemberGeribildirim.innerHTML = '🎉 TEBRİKLER! Yarıçapı doğru buldunuz. (+30 Puan)';
        cemberGeribildirim.style.color = 'green';
        saveScore(currentUserName, 30); // Puan Kaydı
        setTimeout(cemberOyunuHazirla, 3000); 
    } else {
        cemberGeribildirim.innerHTML = `❌ Yanlış Cevap. Pisagor'u kullan!`;
        cemberGeribildirim.style.color = 'red';
    }
}

let dogruKosegenSayisi;
function cokgenOyunuHazirla() {
    const kenarSayisiSpan = document.getElementById('kenar-sayisi');
    const kosegenInput = document.getElementById('kosegen-input');
    const cokgenGeribildirim = document.getElementById('cokgen-geribildirim');

    const n = Math.floor(Math.random() * (12 - 5 + 1)) + 5;
    dogruKosegenSayisi = n * (n - 3) / 2;

    kenarSayisiSpan.textContent = n;
    kosegenInput.value = ''; cokgenGeribildirim.textContent = '';
}
function cokgenCevapKontrol() {
    const kosegenInput = document.getElementById('kosegen-input');
    const cokgenGeribildirim = document.getElementById('cokgen-geribildirim');
    const kullaniciCevabi = parseInt(kosegenInput.value);

    if (kullaniciCevabi === dogruKosegenSayisi) {
        cokgenGeribildirim.innerHTML = '🎉 TEBRİKLER! Köşegen sayısını doğru hesapladınız. (+20 Puan)';
        cokgenGeribildirim.style.color = 'green';
        saveScore(currentUserName, 20); // Puan Kaydı
        setTimeout(cokgenOyunuHazirla, 3000); 
    } else {
        cokgenGeribildirim.innerHTML = `❌ Yanlış Cevap. Formülü hatırla!`;
        cokgenGeribildirim.style.color = 'red';
    }
}

function kinduInitialize() {
    if (window.kinduInitialized) return;

    aciOyunuHazirla();
    cemberOyunuHazirla();
    cokgenOyunuHazirla();
    
    document.getElementById('kontrol-et-butonu').addEventListener('click', aciCevapKontrol);
    document.getElementById('yeni-soru-butonu').addEventListener('click', aciOyunuHazirla);
    document.getElementById('cember-kontrol-et').addEventListener('click', cemberCevapKontrol);
    document.getElementById('cokgen-kontrol-et').addEventListener('click', cokgenCevapKontrol);
    
    window.kinduInitialized = true;
}


// ====================================================================
// V. ÇOKGEN KAHRAMANI QUIZLI V2 MANTIĞI
// ====================================================================

let poliLevel = 1;
let poliScore = 0;

const poliShapes = ["Üçgen", "Kare", "Beşgen", "Altıgen", "Sekizgen"];
const poliGameAreaV2 = document.getElementById("gameArea-v2");
const poliStartBtnV2 = document.getElementById("startBtn-v2");
const poliInfoV2 = document.getElementById("info-v2");

const poliQuizQuestions = [
    { q: "Üçgenin iç açılarının toplamı kaç derecedir?", a: ["90", "180", "360"], c: 1 },
    { q: "Dörtgenin kenar sayısı kaçtır?", a: ["3", "4", "5"], c: 1 },
    { q: "Beşgenin köşe sayısı kaçtır?", a: ["5", "6", "7"], c: 0 },
    { q: "Altıgenin her iç açısı eşitse bu çokgen nasıldır?", a: ["Düzgün altıgen", "Yamuk", "Kare"], c: 0 },
    { q: "Sekizgenin iç açılarının toplamı kaç derecedir?", a: ["720", "900", "1080"], c: 2 }
];

let poliCurrentQuestion = 0;
const poliQuizAreaV2 = document.getElementById("quizArea-v2");
const poliQuestionBoxV2 = document.getElementById("questionBox-v2");
const poliOptionsV2 = document.getElementById("options-v2");
const poliResultV2 = document.getElementById("result-v2");

function poliStartGame() {
    poliScore = 0;
    poliLevel = 1;
    poliStartBtnV2.style.display = "none";
    poliNextLevel();
}

function poliNextLevel() {
    if (poliLevel > 10) {
        poliStartQuiz();
        return;
    }

    poliInfoV2.innerHTML = `<p id="info-v2">Level ${poliLevel}: **${poliShapes[poliLevel % poliShapes.length]}**'yi bul!</p>`;
    poliGameAreaV2.innerHTML = poliInfoV2.innerHTML; 

    const correctShape = poliShapes[poliLevel % poliShapes.length];
    const options = [];

    const tempShapes = [...poliShapes];
    const correctIndex = tempShapes.indexOf(correctShape);
    if (correctIndex > -1) tempShapes.splice(correctIndex, 1);

    options.push(correctShape);
    for (let i = 0; i < 2; i++) {
        const randomIndex = Math.floor(Math.random() * tempShapes.length);
        options.push(tempShapes.splice(randomIndex, 1)[0]);
    }
    options.sort(() => Math.random() - 0.5);

    options.forEach(shape => {
        const div = document.createElement("div");
        div.className = "shape-v2";
        div.textContent = shape;
        div.onclick = () => {
            if (shape === correctShape) {
                poliScore += 10;
                poliLevel++;
                poliNextLevel();
            } else {
                poliGameAreaV2.querySelector('#info-v2').innerHTML = `Level ${poliLevel}: Yanlış seçim! Tekrar dene.`;
            }
        };
        poliGameAreaV2.appendChild(div);
    });
}

function poliStartQuiz() {
    poliGameAreaV2.style.display = "none";
    poliQuizAreaV2.style.display = "block";
    poliCurrentQuestion = 0;
    poliShowQuestion();
}

function poliShowQuestion() {
    if (poliCurrentQuestion >= poliQuizQuestions.length) {
        poliEndQuiz();
        return;
    }

    const q = poliQuizQuestions[poliCurrentQuestion];
    poliQuestionBoxV2.innerHTML = `<div class='question-v2'>Soru ${poliCurrentQuestion + 1}: ${q.q}</div>`;
    poliOptionsV2.innerHTML = "";
    poliResultV2.innerHTML = "";

    q.a.forEach((ans, i) => {
        const btn = document.createElement("div");
        btn.className = "option-v2";
        btn.textContent = ans;
        btn.onclick = () => {
            if (i === q.c) {
                poliScore += 20; // Quiz için 20 puan
                poliResultV2.innerHTML = "✅ Doğru! (+20 Puan)";
            } else {
                poliResultV2.innerHTML = "❌ Yanlış!";
            }
            
            setTimeout(() => {
                poliCurrentQuestion++;
                poliShowQuestion();
            }, 1000);
        };
        poliOptionsV2.appendChild(btn);
    });
}

function poliEndQuiz() {
    const finalScore = poliScore; // Toplam puanı al
    poliQuestionBoxV2.innerHTML = "";
    poliOptionsV2.innerHTML = "";
    poliResultV2.innerHTML = `🎉 Tebrikler! Oyunu ve testi tamamladın.<br>
     Toplam puanın: <b>${finalScore}</b>`;
     
    if (currentUserName) {
        saveScore(currentUserName, finalScore);
    } else {
        poliResultV2.innerHTML += "<br><b>Puanınızı kaydetmek için lütfen kullanıcı adı girin.</b>";
    }
}


// ====================================================================
// VI. ACIMAN AI ASİSTAN MANTIĞI
// ====================================================================

const acimanButton = document.getElementById('aciman-button');
const acimanAssistant = document.getElementById('aciman-assistant');
const chatHistory = document.getElementById('chat-history');
const acimanInput = document.getElementById('aciman-input');
const acimanSendButton = document.getElementById('aciman-send-button');

// Buton tıklaması: Aç/Kapa
if (acimanButton) {
    acimanButton.addEventListener('click', () => {
        acimanAssistant.classList.toggle('hidden');
    });
}

// Gönder butonu veya Enter tuşu
if (acimanSendButton) {
    acimanSendButton.addEventListener('click', sendMessage);
}
if (acimanInput) {
    acimanInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

function sendMessage() {
    const userText = acimanInput.value.trim();
    if (userText === '') return;

    appendMessage(userText, 'user');
    acimanInput.value = ''; 

    chatHistory.scrollTop = chatHistory.scrollHeight;

    setTimeout(() => {
        const response = generateAcimanResponse(userText);
        appendMessage(response, 'aciman');
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1000);
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `message ${sender}-message`;
    div.textContent = text;
    chatHistory.appendChild(div);
}

function isMathExpression(query) {
    // Basit bir regex ile sorgunun temel aritmetik işlemleri (+, -, *, /) içerip içermediğini kontrol eder.
    // Parantezleri de destekler.
    return /^\s*[\d.()]\s*[+\-*/]\s*[\d.()]/g.test(query.trim()) || /^\s*(\d+(\.\d+)?)\s*$/.test(query.trim());
}

function calculateExpression(expression) {
    try {
        // Tehlikeli kod çalıştırmayı engellemek için sadece rakam, boşluk, parantez ve temel aritmetik karakterlerine izin veriyoruz.
        const safeExpression = expression.replace(/[^-()\d/*+.]/g, ''); 
        
        // Function constructor, eval'a göre daha güvenli bir yöntemdir.
        const result = new Function('return ' + safeExpression)();
        
        // Sonucu ondalık hassasiyeti koruyarak döndür.
        return parseFloat(result.toFixed(4));
        
    } catch (e) {
        return null;
    }
}

function generateAcimanResponse(query) {
    const lowerQuery = query.toLowerCase().trim();

    // 1. MATEMATİK KONTROLÜ
    if (isMathExpression(query)) {
        const result = calculateExpression(query);
        if (result !== null && !isNaN(result)) {
            return `Hesapladım: **${query}** işleminin sonucu **${result}**'dir.`;
        }
    }
    
    // 2. GEOMETRİ VE YERLEŞİK KURALLAR
    if (lowerQuery.includes('üçgen') || lowerQuery.includes('açı') || lowerQuery.includes('derece')) {
        return "Üçgenin iç açılarının toplamı her zaman 180°'dir. Hangi kuralı merak ediyorsun (sinüs, kosinüs, benzerlik)?";
    }
    if (lowerQuery.includes('çokgen') || lowerQuery.includes('kenar')) {
        return "n kenarlı bir çokgenin iç açılarının toplamı (n-2) x 180° formülüyle bulunur. Kenar sayısını söyler misin?";
    }
    if (lowerQuery.includes('pisagor') || lowerQuery.includes('hipotenüs')) {
        return "Pisagor teoremi sadece dik üçgenler için geçerlidir: a² + b² = c². Bu teoremle ilgili bir problem çözmek ister misin?";
    }
    if (lowerQuery.includes('merhaba') || lowerQuery.includes('selam')) {
        return "Tekrar merhaba! Matematiksel keşifler için hazırım!";
    }
    if (lowerQuery.includes('adın ne') || lowerQuery.includes('kimsin')) {
        return "Ben Acıman, Kındu platformunun matematik ve geometri asistanıyım. İstediğin formülü sorabilirsin!";
    }
    if (lowerQuery.includes('teşekkür')) {
        return "Rica ederim! Başka bir matematiksel gizemi çözmek istersen buradayım.";
    }

    // 3. NORMALLEŞTİRİLMİŞ VARSAYILAN CEVAP
    const defaultResponses = [
        "Hmm, bu biraz karmaşık görünüyor. Uzmanlık alanım geometri kuralları ve temel matematik formülleri. Daha spesifik bir soru alabilir miyim?",
        "Bu konuda sana nasıl yardımcı olabilirim? Örneğin, bir çokgenin alanını mı yoksa bir açının değerini mi merak ediyorsun?",
        "Bu soruyu çözmek için hangi geometri kuralını kullanmak istersin? İpucu verebilirim.",
        "Şu an sadece temel geometri ve matematik işlemlerine odaklanıyorum. Daha net bir formül sorarsan hemen cevaplarım!",
        "Lütfen sorunu bir formül veya kural sorusu olarak tekrar düzenle. Seni duymak için sabırsızlanıyorum!"
    ];

    const randomIndex = Math.floor(Math.random() * defaultResponses.length);
    return defaultResponses[randomIndex];
}


// ====================================================================
// VII. 5. SINIF GEOMETRİ OYUNU MANTIĞI (ALAN/ÇEVRE)
// ====================================================================

const shapes5 = ["kare","dikdörtgen","üçgen","çember"];
let currentQ5 = {};
let score5 = 0;
let timeLeft5 = 60;
let timer5;
let gameActive5 = false;

function newQuestion5(){
    const shape = shapes5[Math.floor(Math.random()*shapes5.length)];
    const shapeDiv=document.getElementById('shape5');
    shapeDiv.innerHTML='';
    let text='',ans;

    if(shape==="kare"){
        const a=Math.floor(Math.random()*9)+2;
        text=`Kenar uzunluğu ${a} cm olan karenin çevresi kaç cm'dir?`;
        ans=4*a;
        shapeDiv.innerHTML=`<div style='width:100px;height:100px;background:#90ee90;margin:auto;border:2px solid #333'></div>`;
    } else if(shape==="dikdörtgen"){
        const w=Math.floor(Math.random()*9)+2;
        const h=Math.floor(Math.random()*9)+2;
        text=`Kısa kenarı ${w} cm, uzun kenarı ${h} cm olan dikdörtgenin alanı kaç cm²'dir?`;
        ans=w*h;
        shapeDiv.innerHTML=`<div style='width:120px;height:80px;background:#add8e6;margin:auto;border:2px solid #333'></div>`;
    } else if(shape==="üçgen"){
        const b=Math.floor(Math.random()*9)+2;
        const h=Math.floor(Math.random()*9)+2;
        text=`Tabanı ${b} cm, yüksekliği ${h} cm olan üçgenin alanı kaç cm²'dir?`;
        ans=0.5*b*h;
        shapeDiv.innerHTML=`<svg width='200' height='200'><polygon points='50,150 150,150 100,50' fill='#ffcccb' stroke='#333' stroke-width='2'/></svg>`;
    } else { // çember
        const r=Math.floor(Math.random()*5)+2;
        text=`Yarıçapı ${r} cm olan çemberin çevresi (π=3 al) kaç cm'dir?`;
        ans=2*3*r;
        shapeDiv.innerHTML=`<svg width='200' height='200'><circle cx='100' cy='100' r='60' fill='none' stroke='#f5a623' stroke-width='3'/></svg>`;
    }
    document.getElementById('question5').textContent=text;
    currentQ5={ans:ans.toFixed(2)};
    document.getElementById('result5').textContent='';
    document.getElementById('answer5').value='';
    document.getElementById('check5').disabled = false;
    document.getElementById('next5').disabled = true;
}

function checkAnswer5(){
    if(!gameActive5) return;
    const user=parseFloat(document.getElementById('answer5').value);
    const result=document.getElementById('result5');
    
    document.getElementById('check5').disabled = true;
    document.getElementById('next5').disabled = false;

    if(isNaN(user)){
        result.textContent='Lütfen sayı gir.';
        result.style.color='red';
        document.getElementById('check5').disabled = false;
        document.getElementById('next5').disabled = true;
        return;
    }

    const correct=parseFloat(currentQ5.ans);
    
    if(Math.abs(user-correct)<0.1){
        result.textContent='Doğru! (+10 Puan)';
        result.style.color='green';
        score5 += 10;
        saveScore(currentUserName, 10); // Puan Kaydı
    } else {
        result.textContent=`Yanlış 😅 Doğru cevap: ${correct} (-5 Puan)`;
        result.style.color='red';
        score5 -= 5;
    }
    document.getElementById('score5').textContent=score5;
}

function startGame5(){
    score5 = 0;
    timeLeft5 = 60;
    gameActive5 = true;
    document.getElementById('score5').textContent=score5;
    document.getElementById('time5').textContent=timeLeft5;
    document.getElementById('answer5').disabled=false;
    document.getElementById('check5').disabled=false;
    document.getElementById('next5').disabled=true;
    document.getElementById('start5').disabled=true;
    newQuestion5();
    
    clearInterval(timer5); // Eski zamanlayıcıyı temizle
    timer5 = setInterval(()=>{
        timeLeft5--;
        document.getElementById('time5').textContent=timeLeft5;
        if(timeLeft5<=0){
            endGame5();
        }
    },1000);
}

function endGame5(){
    clearInterval(timer5);
    gameActive5=false;
    document.getElementById('question5').textContent=`Süre doldu! Toplam puanın: ${score5}`;
    document.getElementById('result5').textContent = `Toplam Puanınız Kaydedildi.`;
    document.getElementById('answer5').disabled=true;
    document.getElementById('check5').disabled=true;
    document.getElementById('next5').disabled=true;
    document.getElementById('start5').disabled=false;
}

// ====================================================================
// VIII. ÇOKGEN BİLMECESİ OYUNU MANTIĞI (5. SINIF)
// ====================================================================

const svg4 = document.getElementById('svg4');
const answers4 = document.getElementById('answers4');
const scoreElem4 = document.getElementById('score4');
const livesElem4 = document.getElementById('lives4');
const levelElem4 = document.getElementById('level4');
const modeSelect4 = document.getElementById('mode4');
const difficulty4 = document.getElementById('difficulty4');
const maxSidesSpan4 = document.getElementById('maxSides4');
const hintBtn4 = document.getElementById('hintBtn4');
const hintBox4 = document.getElementById('hintBox4');
const nextBtn4 = document.getElementById('nextBtn4');
const startBtn4 = document.getElementById('startBtn4');

let score4 = 0, lives4 = 3, level4 = 1;
let currentSides4 = 3; // geçerli çokgenin kenar sayısı

const names4 = {
    3: 'Üçgen',
    4: 'Dörtgen',
    5: 'Beşgen',
    6: 'Altıgen',
    7: 'Yedigen',
    8: 'Sekizgen'
};

function temizleSVG4(){ if(svg4) svg4.innerHTML = ''; }

function cizCokgen4(n, color='#0b75d1'){
    if(!svg4) return;
    temizleSVG4();
    const R = 150; 
    const centerX = 0, centerY = 0;
    let pts = [];
    for(let i=0;i<n;i++){
        const a = -Math.PI/2 + i*2*Math.PI/n; 
        const x = centerX + R*Math.cos(a);
        const y = centerY + R*Math.sin(a);
        pts.push(`${x},${y}`);
    }
    const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('points', pts.join(' '));
    poly.setAttribute('fill','rgba(11,117,209,0.08)');
    poly.setAttribute('stroke',color);
    poly.setAttribute('stroke-width','6');
    poly.setAttribute('stroke-linejoin','round');
    svg4.appendChild(poly);
}

function yeniSoru4(){
    if(!difficulty4 || !modeSelect4) return;
    const maxSides = Number(difficulty4.value);
    currentSides4 = Math.floor(Math.random()*(maxSides-2))+3; 
    cizCokgen4(currentSides4);
    renderAnswers4();
    hintBox4.style.display = 'none';
    updateStats4();
    document.getElementById('question4').textContent = modeSelect4.value === 'isim' ? 
        "Bu çokgenin adı nedir?" : "Bu çokgenin kaç kenarı vardır?";
}

function renderAnswers4(){
    if(!answers4 || !difficulty4 || !modeSelect4) return;
    answers4.innerHTML = '';
    const mode = modeSelect4.value;
    let options = [];
    const maxDifficulty = Number(difficulty4.value);

    let pool = [];
    for(let i=3; i<=maxDifficulty; i++) pool.push(i);

    let selectedOptions = shuffle(pool);
    let numOptions = 4; 
    
    if(!selectedOptions.slice(0, numOptions).includes(currentSides4)){
        selectedOptions[Math.floor(Math.random()*numOptions)] = currentSides4;
    }

    options = selectedOptions.slice(0, numOptions);
    options = shuffle(options); 

    options.forEach(opt=>{
        const b = document.createElement('button');
        b.className = 'choice';
        b.textContent = mode === 'isim' ? names4[opt] : opt + ' kenar';
        b.onclick = ()=>checkAnswer4(opt, b);
        answers4.appendChild(b);
    });
}

function checkAnswer4(value, btn){
    if(!answers4 || lives4 <= 0) return;
    Array.from(answers4.children).forEach(b => b.onclick = null); 

    if(value === currentSides4){
        score4 += 2;
        btn.style.borderColor = '#2ea44f'; // var(--good)
        btn.textContent += ' ✓ Doğru!';
        saveScore(currentUserName, 2); 
        setTimeout(()=>{ levelUpIfNeeded4(); yeniSoru4(); },700);
    } else {
        lives4 -= 1;
        btn.style.borderColor = '#d12b2b'; // var(--bad)
        btn.textContent += ' ✗ Yanlış';
        if(lives4<=0){
            oyunBitti4();
        } else {
            const optValue = modeSelect4.value === 'isim' ? names4[currentSides4] : currentSides4 + ' kenar';
            const correctBtn = Array.from(answers4.children).find(b => b.textContent.includes(optValue));
            if (correctBtn) correctBtn.style.borderColor = '#2ea44f';
            
            setTimeout(()=>{ yeniSoru4(); },1500);
        }
    }
    updateStats4();
}

function oyunBitti4(){
    temizleSVG4();
    if(svg4) svg4.innerHTML = '<text x="0" y="0" text-anchor="middle" font-size="28" fill="#d12b2b">Oyun Bitti! Puan: '+score4+'</text>';
    if(answers4) answers4.innerHTML = '<button id="restartBtn4" class="big-btn">Tekrar Başlat</button>';
    if(document.getElementById('restartBtn4')) document.getElementById('restartBtn4').onclick = startGame4;
    if(startBtn4) startBtn4.style.display = 'block';
}

function updateStats4(){
    if(scoreElem4) scoreElem4.textContent = score4;
    if(livesElem4) livesElem4.textContent = lives4;
    if(levelElem4) levelElem4.textContent = 'Seviye '+level4;
    if(maxSidesSpan4 && difficulty4) maxSidesSpan4.textContent = difficulty4.value;
}

function levelUpIfNeeded4(){
    const newLevel = Math.floor(score4/6)+1;
    if(newLevel>level4){
        level4 = newLevel;
        const curMax = Number(difficulty4.value);
        if(curMax<8 && difficulty4) difficulty4.value = Math.min(8, curMax+1); 
    }
}

function startGame4() {
    score4 = 0; lives4 = 3; level4 = 1; 
    updateStats4(); 
    if(startBtn4) startBtn4.style.display = 'none';
    yeniSoru4();
}

// Yardımcı Fonksiyon (shuffle - karıştıma)
function shuffle(a){
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    return a;
}


// ====================================================================
// IX. SAYFA BAŞLANGICI VE OLAY DİNLEYİCİLERİ
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Hesap durumunu ve skor tablosunu yükle (Bölüm II)
    updateAccountStatus();

    // Kındu oyunlarının dinleyicilerini kur (Bölüm IV)
    kinduInitialize();
    
    // ANA MENÜ VE OYUN BUTONLARI İÇİN OLAY DİNLEYİCİLERİ EKLE
    
    const btnKindu = document.getElementById('btn-kindu-oyunlari');
    const btnPoli = document.getElementById('btn-poli-oyunu');
    const btnGeometri5Sinif = document.getElementById('btn-geometri-5-sinif');
    const btnCokgen5Sinif = document.getElementById('btn-cokgen-5-sinif'); // Yeni buton
    const anaMenuLink = document.getElementById('ana-menu-link');
    
    if (btnKindu) {
        btnKindu.addEventListener('click', () => { showScreen('kindu'); });
    }
    if (btnPoli) {
        btnPoli.addEventListener('click', () => { showScreen('poli'); });
        if(poliStartBtnV2) poliStartBtnV2.addEventListener("click", poliStartGame);
    }
    // Oyun 3 dinleyicisi
    if (btnGeometri5Sinif) {
        btnGeometri5Sinif.addEventListener('click', () => { showScreen('geometri-5-sinif'); });
        document.getElementById('check5').onclick=checkAnswer5;
        document.getElementById('next5').onclick=newQuestion5;
        document.getElementById('start5').onclick=startGame5;
        document.getElementById('answer5').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !document.getElementById('check5').disabled) {
                checkAnswer5();
            } else if (e.key === 'Enter' && !document.getElementById('next5').disabled) {
                newQuestion5();
            }
        });
        newQuestion5();
    }
    // Oyun 4 dinleyicisi
    if (btnCokgen5Sinif) {
        btnCokgen5Sinif.addEventListener('click', () => { showScreen('cokgen-5-sinif'); });
    }
    if(hintBtn4) hintBtn4.addEventListener('click', ()=>{
        if(score4<1){ hintBox4.textContent = 'İpucu için en az 1 puanın olmalı.'; hintBox4.style.display='block'; return; }
        score4 -= 1;
        hintBox4.style.display = 'block';
        hintBox4.textContent = `Bu çokgenin kenar sayısı: ${currentSides4}. Adı: ${names4[currentSides4]}`;
        updateStats4();
    });
    if(nextBtn4) nextBtn4.addEventListener('click', ()=>{ score4 -= 0; yeniSoru4(); });
    if(difficulty4) difficulty4.addEventListener('input', ()=>{ maxSidesSpan4.textContent = difficulty4.value; });
    if(startBtn4) startBtn4.addEventListener('click', startGame4);
    if(modeSelect4) modeSelect4.addEventListener('change', ()=>{ if(lives4 > 0) yeniSoru4(); });
    cizCokgen4(5); // İlk çokgeni çiz (başlangıç ekranı için)


    if (anaMenuLink) {
        anaMenuLink.addEventListener('click', (e) => { 
            e.preventDefault();
            showScreen('menu');
        });
    }

    // Hesap Makinesi başlangıç ayarı (Bölüm III)
    updateScreen();

    // Karşılama Ekranı Yönetimi
    const splashScreen = document.getElementById('splash-screen');
    
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.opacity = '0';
        }
        
        setTimeout(() => {
            if (splashScreen) {
                splashScreen.style.display = 'none';
            }
            showScreen('menu'); 
        }, 500);
        
    }, 3000);

});
