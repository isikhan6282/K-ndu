// ====================================================================
// I. GENEL YÖNETİM VE EKRAN GEÇİŞLERİ
// ====================================================================

/**
 * Belirtilen ekranı gösterir ve diğerlerini gizler.
 * @param {string} screenName - 'menu', 'kindu' veya 'poli'
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
// II. HESAP MAKİNESİ MANTIĞI
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
        // Nokta kontrolü (Henüz HTML'de olmasa bile JS mantığını koruyoruz)
        if (digitOrOperator === '.' && currentInput.includes('.')) return; 
        currentInput = currentInput === '0' && digitOrOperator !== '.' ? digitOrOperator : currentInput + digitOrOperator;
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
    
    // Geçerli ilk operant kontrolü
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
    // Sonucu virgülden sonra max 4 hane ile sınırla
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
    if (value === '=') { calculate(); return; } // EŞİTTİR İŞLEVİ
    if (['+', '-', '*', '/'].includes(value)) {
        if (operator && !waitingForSecondOperand) { calculate(); }
        firstOperand = parseFloat(currentInput);
        operator = value;
        waitingForSecondOperand = true;
        return;
    }
    appendToScreen(value);
});


// ====================================================================
// III. KINDU OYUNLARI MANTIĞI (Açı, Çember, Köşegen)
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
        geribildirimP.innerHTML = `🎉 MÜKEMMEL! Hepsini doğru buldunuz!`;
        geribildirimP.style.color = 'green';
        kontrolButton.style.display = 'none'; yeniSoruButton.style.display = 'block';
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
    
    // 0.01 tolerans ile kontrol
    if (Math.abs(kullaniciCevabi - dogruYaricap) < 0.01) {
        cemberGeribildirim.innerHTML = '🎉 TEBRİKLER! Yarıçapı doğru buldunuz. Yeni soru hazırlanıyor...';
        cemberGeribildirim.style.color = 'green';
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
        cokgenGeribildirim.innerHTML = '🎉 TEBRİKLER! Köşegen sayısını doğru hesapladınız. Yeni soru hazırlanıyor...';
        cokgenGeribildirim.style.color = 'green';
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
// IV. ÇOKGEN KAHRAMANI QUIZLI V2 MANTIĞI
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
    // Önceki elementleri temizle ve yeni info'yu ekle
    poliGameAreaV2.innerHTML = poliInfoV2.innerHTML; 

    const correctShape = poliShapes[poliLevel % poliShapes.length];
    const options = [];

    // Seçenekleri oluşturma: 3 rastgele + 1 doğru, karışık
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
                poliScore += 10;
                poliResultV2.innerHTML = "✅ Doğru!";
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
    poliQuestionBoxV2.innerHTML = "";
    poliOptionsV2.innerHTML = "";
    poliResultV2.innerHTML = `🎉 Tebrikler! Oyunu ve testi tamamladın.<br>
     Toplam puanın: <b>${poliScore}</b>`;
}


// ====================================================================
// V. SAYFA BAŞLANGICI VE OLAY DİNLEYİCİLERİ
// ====================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Kındu oyunlarının dinleyicilerini kur
    kinduInitialize();
    
    // ANA MENÜ VE OYUN BUTONLARI İÇİN OLAY DİNLEYİCİLERİ EKLE
    
    const btnKindu = document.getElementById('btn-kindu-oyunlari');
    const btnPoli = document.getElementById('btn-poli-oyunu');
    const anaMenuLink = document.getElementById('ana-menu-link');
    
    if (btnKindu) {
        btnKindu.addEventListener('click', () => { showScreen('kindu'); });
    }
    if (btnPoli) {
        btnPoli.addEventListener('click', () => { showScreen('poli'); });
        if(poliStartBtnV2) poliStartBtnV2.addEventListener("click", poliStartGame);
    }
    if (anaMenuLink) {
        anaMenuLink.addEventListener('click', (e) => { 
            e.preventDefault();
            showScreen('menu');
        });
    }

    // Hesap Makinesi başlangıç ayarı
    updateScreen();

    // 1. Karşılama Ekranı Yönetimi (3 saniye sonra ana menüye geçiş)
    const splashScreen = document.getElementById('splash-screen');
    
    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.opacity = '0';
        }
        
        setTimeout(() => {
            if (splashScreen) {
                splashScreen.style.display = 'none';
            }
            // Artık Ana Menüyü gösterebiliriz
            showScreen('menu'); 
        }, 500);
        
    }, 3000);

});