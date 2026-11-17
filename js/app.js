/**
 * 台灣百岳山屋野外筆記圖鑑 (Taiwan Mountain Cabins Field Guide)
 * 核心引擎：
 * 1. 壯麗百岳山景與溫暖山屋 SVG 向量繪圖系統（輪廓分明的大山、日照金山與窗櫺暖光）
 * 2. Web Audio API 物理琴弦合成：歐洲溫暖木吉他指彈音樂 (Karplus-Strong Acoustic Guitar)
 * 3. 優雅吉他琴音與泛音按鍵音效
 * 4. 實地寫真與完整生活機能手帳展開
 */

let cabinsData = [];
let currentRange = 'all';
let currentFeatures = new Set();
let searchQuery = '';

// 音效與音樂狀態
let sfxEnabled = true;
let bgmPlaying = false;
let audioCtx = null;
let guitarEngine = null;

/**
 * 取得或喚醒 Web Audio Context
 */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Karplus-Strong 演算法：物理建模合成真實木吉他琴弦單音
 * @param {AudioContext} ctx 
 * @param {number} freq 音高頻率 (Hz)
 * @param {number} duration 持續時間 (秒)
 * @param {number} volume 音量 (0.0 ~ 1.0)
 * @param {number} brightness 明亮度 (低通濾波參數)
 */
function pluckAcousticString(ctx, freq, duration = 1.8, volume = 0.25, brightness = 3200) {
  if (freq < 40 || freq > 2000) return;

  const sampleRate = ctx.sampleRate;
  const period = sampleRate / freq;
  const bufferLength = Math.round(period);

  // 1. 產生模擬撥片激發的短暫突發雜訊 (Pluck Excitation)
  const noiseBuffer = ctx.createBuffer(1, bufferLength, sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferLength; i++) {
    // 柔化雜訊以產生溫暖木質琴體共振
    noiseData[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufferLength);
  }

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;

  // 2. 循環延遲反饋迴路 (Delay Line Feedback)
  const delay = ctx.createDelay();
  delay.delayTime.setValueAtTime(1 / freq, ctx.currentTime);

  // 琴弦共振濾波器 (模擬琴弦自然衰減，高頻衰減較快)
  const dampingFilter = ctx.createBiquadFilter();
  dampingFilter.type = 'lowpass';
  dampingFilter.frequency.setValueAtTime(brightness, ctx.currentTime);

  // 反饋衰減量 (Feedback Gain, 控制延音長度)
  const feedback = ctx.createGain();
  feedback.gain.setValueAtTime(0.985, ctx.currentTime);

  // 琴體主音量包絡
  const mainGain = ctx.createGain();
  mainGain.gain.setValueAtTime(volume, ctx.currentTime);
  mainGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

  // 連接反饋迴路：noise -> delay -> filter -> feedback -> delay
  noiseSource.connect(delay);
  delay.connect(dampingFilter);
  dampingFilter.connect(feedback);
  feedback.connect(delay);

  // 輸出至主控與喇叭
  delay.connect(mainGain);
  mainGain.connect(ctx.destination);

  noiseSource.start();
  noiseSource.stop(ctx.currentTime + (1 / freq));
}

/**
 * 彈奏清澈如鈴的木吉他高把位自然泛音 (Acoustic Guitar Natural Harmonic)
 * 用於翻開手帳時的優雅點綴
 */
function playGuitarHarmonic(pitch = 659.25) { // E5
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    pluckAcousticString(ctx, pitch, 2.2, 0.18, 5500);
    setTimeout(() => {
      pluckAcousticString(ctx, pitch * 1.5, 2.0, 0.12, 6000); // 泛音伴隨
    }, 40);
  } catch (e) {}
}

/**
 * 柔和的木吉他單音撥弦聲 (用於按鍵點擊)
 */
function playGuitarPluck(freq = 329.63) { // E4
  if (!sfxEnabled) return;
  try {
    const ctx = getAudioContext();
    pluckAcousticString(ctx, freq, 1.2, 0.15, 2400);
  } catch (e) {}
}

/**
 * 歐洲溫暖 Cozy 木吉他指彈循環曲 (European Cozy Fingerstyle Acoustic Piece)
 * 和弦進行：C - G/B - Am7 - Em - Fmaj7 - C/E - Dm7 - G
 * 緩慢舒暢的 64 BPM 歐洲鄉村清晨指彈
 */
class CozyGuitarBGM {
  constructor(ctx) {
    this.ctx = ctx;
    this.isRunning = false;
    this.timer = null;
    this.step = 0;

    // 吉他標準定音頻率 (Hz)
    // C大調歐洲鄉村指彈分解和弦譜表 [Bass, 3弦, 2弦, 1弦, 2弦, 3弦]
    this.chords = [
      // 1. C 和弦 (C大調暖陽)
      [130.81, 196.00, 261.63, 329.63, 261.63, 196.00], // C3, G3, C4, E4...
      // 2. G/B 和弦 (下行低音)
      [123.47, 196.00, 293.66, 392.00, 293.66, 196.00], // B2, G3, D4, G4...
      // 3. Am7 和弦 (思鄉民謠)
      [110.00, 164.81, 261.63, 329.63, 261.63, 164.81], // A2, E3, C4, E4...
      // 4. Em 和弦 (阿爾卑斯深谷)
      [82.41, 146.83, 196.00, 293.66, 196.00, 146.83],  // E2, D3, G3, D4...
      // 5. Fmaj7 和弦 (溫暖壁爐)
      [87.31, 174.61, 261.63, 349.23, 261.63, 174.61],  // F2, F3, C4, F4...
      // 6. C/E 和弦 (柔和流動)
      [82.41, 164.81, 261.63, 329.63, 261.63, 164.81],  // E2, E3, C4, E4...
      // 7. Dm9 和弦 (微風輕撫)
      [146.83, 220.00, 293.66, 329.63, 293.66, 220.00], // D3, A3, D4, E4...
      // 8. G7 和弦 (回歸平靜)
      [98.00, 146.83, 246.94, 349.23, 246.94, 146.83]   // G2, D3, B3, F4...
    ];
  }

  start() {
    this.isRunning = true;
    this.step = 0;
    this.tick();
  }

  tick() {
    if (!this.isRunning) return;

    const chordIndex = Math.floor(this.step / 6) % this.chords.length;
    const noteIndex = this.step % 6;
    const chord = this.chords[chordIndex];
    const freq = chord[noteIndex];

    // 低音根音 (Bass) 撥弦音量較深厚，高音分解音符柔和
    const isBass = (noteIndex === 0);
    const vol = isBass ? 0.22 : 0.14;
    const duration = isBass ? 2.6 : 1.6;
    const brightness = isBass ? 2200 : 3800;

    pluckAcousticString(this.ctx, freq, duration, vol, brightness);

    this.step++;
    // 指彈間隔拍子 (約 250ms 一拍，流暢的 60~64 BPM)
    const noteDelay = isBass ? 280 : (240 + Math.random() * 20); // 微妙的人性化微延遲
    this.timer = setTimeout(() => this.tick(), noteDelay);
  }

  stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/**
 * 繪製輪廓分明、氣勢磅礡的大山與溫暖山屋 SVG
 * 重點：玉山主峰金字塔岩壁、能高雲海群峰、雪山圈谷草坡清晰可見！
 */
function getCabinIllustrationSVG(cabinId) {
  switch (cabinId) {
    case 'paiyun':
      // 排雲山莊：高聳入雲的【玉山主峰 3,952m】金字塔岩頂，清晰分明的山脊與金黃晨曦，山腳下排雲山莊透出溫暖窗光
      return `
        <svg viewBox="0 0 340 185" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <!-- 晨曦清透高山天空漸層 (藍天到橙金晨曦) -->
            <linearGradient id="sky-py" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#2B4C6F"/>
              <stop offset="45%" stop-color="#4B779A"/>
              <stop offset="75%" stop-color="#E59866"/>
              <stop offset="100%" stop-color="#FAD7A0"/>
            </linearGradient>
            <!-- 窗光溫暖光暈 -->
            <radialGradient id="lamp-py" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFF3CD" stop-opacity="0.95"/>
              <stop offset="50%" stop-color="#F39C12" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#F39C12" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="340" height="185" fill="url(#sky-py)"/>

          <!-- 遠方連綿百岳山脊 (清晰層次) -->
          <polygon points="-20,135 60,65 150,135" fill="#3D5A73" opacity="0.7"/>
          <polygon points="190,135 270,55 360,135" fill="#3D5A73" opacity="0.7"/>

          <!-- ★巍峨的玉山主峰金字塔巨岩 (清晰無比的大山！) -->
          <!-- 主峰受光面 (迎向晨曦金光) -->
          <polygon points="40,140 168,14 168,140" fill="#E67E22" stroke="#2C3E50" stroke-width="1.5"/>
          <!-- 主峰背光面 (深黛色險峻岩壁) -->
          <polygon points="168,14 295,140 168,140" fill="#2C3E50" stroke="#1A252F" stroke-width="1.5"/>
          <!-- 玉山主峰碎石坡與雪溝紋理 -->
          <polygon points="168,14 145,75 168,105 155,140" fill="#D35400" opacity="0.8"/>
          <polygon points="168,45 190,85 178,140" fill="#1F2A38" opacity="0.8"/>

          <!-- 主峰兩側針葉冷杉原始林 (深綠蒼鬱) -->
          <polygon points="10,145 22,88 34,145" fill="#193324"/>
          <polygon points="28,148 38,98 48,148" fill="#13261B"/>
          <polygon points="295,145 308,82 320,145" fill="#193324"/>
          <polygon points="312,148 322,95 332,148" fill="#13261B"/>

          <!-- 山莊前庭草坡基石 -->
          <path d="M0,135 Q170,126 340,135 L340,185 L0,185 Z" fill="#27372B"/>

          <!-- 溫暖大光暈 (山屋窗光投射) -->
          <ellipse cx="170" cy="125" rx="80" ry="36" fill="url(#lamp-py)"/>

          <!-- 排雲山莊本體 (雙層原木山屋) -->
          <polygon points="105,92 170,68 235,92" fill="#784212" stroke="#1A0D00" stroke-width="2.5"/>
          <rect x="115" y="92" width="110" height="50" fill="#A0522D" stroke="#1A0D00" stroke-width="2.5"/>

          <!-- 溫暖明亮的鵝黃色大窗 -->
          <rect x="126" y="98" width="18" height="15" rx="2" fill="#FFF3CD" stroke="#2C1200" stroke-width="1.8"/>
          <rect x="150" y="98" width="18" height="15" rx="2" fill="#FFF3CD" stroke="#2C1200" stroke-width="1.8"/>
          <rect x="174" y="98" width="18" height="15" rx="2" fill="#FFF3CD" stroke="#2C1200" stroke-width="1.8"/>
          <rect x="198" y="98" width="18" height="15" rx="2" fill="#FFF3CD" stroke="#2C1200" stroke-width="1.8"/>

          <!-- 觀景大木平台 -->
          <rect x="95" y="142" width="150" height="10" fill="#5D3A1A" stroke="#1A0D00" stroke-width="2"/>
        </svg>
      `;

    case 'dongpu':
      // 東埔山莊：塔塔加群山連綿、清晰的玉山前峰與鹿林山稜線、山谷薄霧與溫暖木屋
      return `
        <svg viewBox="0 0 340 185" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky-dp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#3A6073"/>
              <stop offset="50%" stop-color="#6F8EA4"/>
              <stop offset="80%" stop-color="#F2C94C"/>
              <stop offset="100%" stop-color="#F2994A"/>
            </linearGradient>
            <radialGradient id="lamp-dp" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFF3CD" stop-opacity="0.95"/>
              <stop offset="50%" stop-color="#F39C12" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#F39C12" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="340" height="185" fill="url(#sky-dp)"/>

          <!-- 第一層遠山：玉山前峰群嶺 (青藍山峰，輪廓清晰) -->
          <polygon points="-30,130 75,42 180,130" fill="#204051" stroke="#13222A" stroke-width="1.5"/>
          <polygon points="120,130 225,32 340,130" fill="#1B323F" stroke="#13222A" stroke-width="1.5"/>
          <polygon points="250,130 310,65 370,130" fill="#204051" stroke="#13222A" stroke-width="1.5"/>

          <!-- 第二層中景山巒 (蒼翠高山松林坡) -->
          <polygon points="10,140 120,70 230,140" fill="#2E5339" opacity="0.9"/>
          <polygon points="160,140 260,65 350,140" fill="#24422E" opacity="0.9"/>

          <!-- 塔塔加山谷流動晨霧 -->
          <ellipse cx="170" cy="125" rx="150" ry="20" fill="#FFF" opacity="0.35"/>

          <!-- 塔塔加高大二葉松 -->
          <polygon points="30,145 42,90 54,145" fill="#16291C"/>
          <polygon points="45,148 55,98 65,148" fill="#112016"/>
          <polygon points="280,145 292,85 304,145" fill="#16291C"/>

          <!-- 公路與山坡地面 -->
          <path d="M0,132 Q170,122 340,132 L340,185 L0,185 Z" fill="#2B2118"/>

          <!-- 溫暖燈光漫射 -->
          <ellipse cx="170" cy="115" rx="80" ry="38" fill="url(#lamp-dp)"/>

          <!-- 東埔山莊本體 (雙層紅頂木屋) -->
          <polygon points="110,82 170,45 230,82" fill="#A93226" stroke="#200B07" stroke-width="2.5"/>
          <rect x="120" y="82" width="100" height="55" fill="#873600" stroke="#200B07" stroke-width="2.5"/>

          <!-- 溫暖透亮的木屋窗戶 -->
          <rect x="130" y="88" width="22" height="18" rx="2" fill="#FFF3CD" stroke="#3D1800" stroke-width="2"/>
          <rect x="160" y="88" width="22" height="18" rx="2" fill="#FFF3CD" stroke="#3D1800" stroke-width="2"/>
          <rect x="190" y="88" width="22" height="18" rx="2" fill="#FFF3CD" stroke="#3D1800" stroke-width="2"/>
          <!-- 溫暖大門廊 -->
          <rect x="160" y="110" width="22" height="27" fill="#F39C12" stroke="#200B07" stroke-width="2"/>
        </svg>
      `;

    case 'tianchi':
      // 天池山莊：雄偉的【能高主峰與卡賀爾山】拔地而起、壯麗金色雲海翻騰、二樓陽台透出五星級暖光
      return `
        <svg viewBox="0 0 340 185" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky-tc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1F3C88"/>
              <stop offset="40%" stop-color="#583D72"/>
              <stop offset="70%" stop-color="#E58934"/>
              <stop offset="100%" stop-color="#FBE386"/>
            </linearGradient>
            <radialGradient id="lamp-tc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFF8DC" stop-opacity="0.95"/>
              <stop offset="50%" stop-color="#F39C12" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#F39C12" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="340" height="185" fill="url(#sky-tc)"/>

          <!-- ★能高主峰險峻巨大山脊 (清晰高聳矗立！) -->
          <polygon points="-20,135 65,38 175,135" fill="#1C2833" stroke="#0E171E" stroke-width="1.8"/>
          <!-- 卡賀爾山獨特的雙牛角尖岩 -->
          <polygon points="120,135 220,28 340,135" fill="#212F3D" stroke="#0E171E" stroke-width="1.8"/>
          <polygon points="210,38 220,28 228,38" fill="#F39C12"/> <!-- 暮光照亮的山巔金角 -->

          <!-- 翻騰的能高金色雲海 (立體波瀾層次) -->
          <ellipse cx="60" cy="132" rx="70" ry="22" fill="#FAD7A0" stroke="#E59866" stroke-width="1"/>
          <ellipse cx="160" cy="136" rx="85" ry="24" fill="#FDEBD0" stroke="#E59866" stroke-width="1"/>
          <ellipse cx="270" cy="132" rx="75" ry="22" fill="#FAD7A0" stroke="#E59866" stroke-width="1"/>

          <!-- 山屋陽台大面積暖燈光暈 -->
          <ellipse cx="170" cy="115" rx="85" ry="40" fill="url(#lamp-tc)"/>

          <!-- 天池五星級大木屋本體 (歐風大斜屋頂) -->
          <polygon points="85,78 170,35 255,78" fill="#6E2C00" stroke="#1A0A00" stroke-width="2.5"/>
          <rect x="95" y="78" width="150" height="58" fill="#935116" stroke="#1A0A00" stroke-width="2.5"/>

          <!-- 二樓景觀大陽台 -->
          <rect x="90" y="98" width="160" height="7" fill="#4E2000" stroke="#1A0A00" stroke-width="1.8"/>
          <line x1="90" y1="91" x2="250" y2="91" stroke="#4E2000" stroke-width="1.8"/>

          <!-- 溫暖輝煌的木窗燈光 -->
          <rect x="108" y="82" width="18" height="14" rx="2" fill="#FFF8DC" stroke="#2B1100" stroke-width="1.5"/>
          <rect x="138" y="82" width="18" height="14" rx="2" fill="#FFF8DC" stroke="#2B1100" stroke-width="1.5"/>
          <rect x="174" y="82" width="18" height="14" rx="2" fill="#FFF8DC" stroke="#2B1100" stroke-width="1.5"/>
          <rect x="204" y="82" width="18" height="14" rx="2" fill="#FFF8DC" stroke="#2B1100" stroke-width="1.5"/>

          <rect x="125" y="108" width="22" height="26" rx="2" fill="#FFF8DC" stroke="#2B1100" stroke-width="1.5"/>
          <rect x="180" y="108" width="22" height="26" rx="2" fill="#FFF8DC" stroke="#2B1100" stroke-width="1.5"/>
        </svg>
      `;

    case 'sanliujiu':
      // 三六九山莊：壯闊的【雪山主峰與一號圈谷大山】弧度、高山星空與甘木林山草坡、溫暖營舍暖橘帳棚
      return `
        <svg viewBox="0 0 340 185" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky-369" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#102030"/>
              <stop offset="50%" stop-color="#214252"/>
              <stop offset="80%" stop-color="#3D687A"/>
              <stop offset="100%" stop-color="#7EA0B0"/>
            </linearGradient>
            <radialGradient id="lamp-369" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFD54F" stop-opacity="0.95"/>
              <stop offset="50%" stop-color="#FF8F00" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#FF8F00" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="340" height="185" fill="url(#sky-369)"/>

          <!-- 高山繁星點綴 -->
          <circle cx="45" cy="18" r="1.3" fill="#FFF" opacity="0.9"/>
          <circle cx="120" cy="28" r="1.1" fill="#FFF" opacity="0.8"/>
          <circle cx="210" cy="15" r="1.5" fill="#FFF" opacity="0.95"/>
          <circle cx="300" cy="22" r="1.2" fill="#FFF" opacity="0.85"/>

          <!-- ★雪山主峰與一號圈谷巨大冰河冰斗山壁 (清晰弧線大山！) -->
          <polygon points="10,135 120,32 230,135" fill="#1C2E3D" stroke="#0E1A24" stroke-width="1.8"/>
          <!-- 圈谷碗狀岩盆地形 -->
          <path d="M120,32 Q175,70 230,135 L120,135 Z" fill="#2C4559" stroke="#0E1A24" stroke-width="1.5"/>
          <polygon points="180,135 270,45 355,135" fill="#1A2A38" stroke="#0E1A24" stroke-width="1.8"/>

          <!-- 甘木林山壯麗青翠大草坡 -->
          <path d="M0,110 Q140,75 340,118 L340,185 L0,185 Z" fill="#2E4A35" stroke="#142217" stroke-width="2"/>
          
          <!-- 黑森林純冷杉林邊緣 -->
          <polygon points="16,115 24,65 32,115" fill="#112217"/>
          <polygon points="32,118 39,75 46,118" fill="#0C1810"/>

          <!-- 營地帳棚溫暖透光暈 -->
          <ellipse cx="175" cy="130" rx="80" ry="36" fill="url(#lamp-369)"/>

          <!-- 臨時組合營舍 (深色鋼構) -->
          <rect x="105" y="90" width="85" height="42" rx="3" fill="#37474F" stroke="#102027" stroke-width="2.2"/>
          <polygon points="98,90 147,70 197,90" fill="#263238" stroke="#102027" stroke-width="2.2"/>
          <rect x="116" y="98" width="24" height="18" rx="2" fill="#FFF59D" stroke="#102027" stroke-width="1.8"/>
          <rect x="154" y="98" width="24" height="18" rx="2" fill="#FFF59D" stroke="#102027" stroke-width="1.8"/>

          <!-- 溫暖橘黃高山抗風帳 -->
          <polygon points="210,132 242,100 275,132" fill="#E65100" stroke="#211005" stroke-width="2"/>
          <polygon points="242,100 242,132 275,132" fill="#BF360C"/>
          <polygon points="222,132 242,108 250,132" fill="#FFE082" opacity="0.95"/>
        </svg>
      `;

    case 'kuaigu':
      // 檜谷山莊：【北大武山與喜多麗斷崖】壯闊懸崖日落、雲海晚霞、千年紅檜木林護衛著溫暖山屋
      return `
        <svg viewBox="0 0 340 185" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="sky-kg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#1B262C"/>
              <stop offset="35%" stop-color="#4B2C35"/>
              <stop offset="70%" stop-color="#B83B26"/>
              <stop offset="100%" stop-color="#F39C12"/>
            </linearGradient>
            <radialGradient id="lamp-kg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#FFEAA7" stop-opacity="0.95"/>
              <stop offset="50%" stop-color="#E67E22" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#E67E22" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="340" height="185" fill="url(#sky-kg)"/>

          <!-- ★北大武主脊與喜多麗斷崖 (清晰宏偉的山岳岩壁！) -->
          <polygon points="-10,135 90,45 190,135" fill="#231215" stroke="#12080A" stroke-width="1.8"/>
          <!-- 喜多麗斷崖絕壁與中央山脈南段山脊 -->
          <polygon points="120,135 220,35 340,135" fill="#1C0D10" stroke="#12080A" stroke-width="1.8"/>

          <!-- 光明頂翻滾的夕陽烈火雲海 -->
          <ellipse cx="60" cy="138" rx="65" ry="22" fill="#E67E22" opacity="0.75"/>
          <ellipse cx="160" cy="142" rx="85" ry="24" fill="#F39C12" opacity="0.8"/>
          <ellipse cx="270" cy="138" rx="75" ry="22" fill="#E67E22" opacity="0.75"/>

          <!-- 兩側頂天立地的千年紅檜原始巨木樹幹 (大自然神柱) -->
          <path d="M-15,185 L18,0 L42,0 L25,185 Z" fill="#3E2723" stroke="#1B0000" stroke-width="2.5"/>
          <path d="M320,185 L298,0 L325,0 L345,185 Z" fill="#3E2723" stroke="#1B0000" stroke-width="2.5"/>

          <!-- 山屋長廊溫暖柴火光暈 -->
          <ellipse cx="170" cy="125" rx="85" ry="38" fill="url(#lamp-kg)"/>

          <!-- 檜谷山莊長條木屋與深綠屋頂 -->
          <polygon points="75,85 170,52 265,85" fill="#1B4D3E" stroke="#0B1A15" stroke-width="2.5"/>
          <rect x="85" y="85" width="170" height="52" fill="#795548" stroke="#0B1A15" stroke-width="2.5"/>

          <!-- 開放式炊事長廊柱子 -->
          <line x1="102" y1="100" x2="102" y2="137" stroke="#3E2723" stroke-width="3"/>
          <line x1="134" y1="100" x2="134" y2="137" stroke="#3E2723" stroke-width="3"/>
          <line x1="166" y1="100" x2="166" y2="137" stroke="#3E2723" stroke-width="3"/>
          <line x1="198" y1="100" x2="198" y2="137" stroke="#3E2723" stroke-width="3"/>
          <line x1="230" y1="100" x2="230" y2="137" stroke="#3E2723" stroke-width="3"/>

          <!-- 廊道內溫暖的柴火煮水熱光 -->
          <rect x="110" y="102" width="18" height="20" rx="2" fill="#FFEAA7" stroke="#251408" stroke-width="1.5"/>
          <rect x="142" y="102" width="18" height="20" rx="2" fill="#FFEAA7" stroke="#251408" stroke-width="1.5"/>
          <rect x="174" y="102" width="18" height="20" rx="2" fill="#FFEAA7" stroke="#251408" stroke-width="1.5"/>
          <rect x="206" y="102" width="18" height="20" rx="2" fill="#FFEAA7" stroke="#251408" stroke-width="1.5"/>
        </svg>
      `;

    default:
      return `<svg viewBox="0 0 340 185" xmlns="http://www.w3.org/2000/svg"><rect width="340" height="185" fill="#2C3E50"/></svg>`;
  }
}

/**
 * 載入資料並初始化應用
 */
async function initApp() {
  try {
    const res = await fetch('data/cabins.json');
    if (res.ok) {
      cabinsData = await res.json();
    }
  } catch (err) {
    console.warn('Fetch data/cabins.json failed, falling back', err);
  }

  setupEventListeners();
  renderGallery();
}

/**
 * 綁定互動事件 (吉他琴音、篩選、搜尋、彈窗)
 */
function setupEventListeners() {
  // 吉他按鍵琴音開關
  const sfxBtn = document.getElementById('toggle-sfx-btn');
  sfxBtn.addEventListener('click', () => {
    sfxEnabled = !sfxEnabled;
    sfxBtn.classList.toggle('active', sfxEnabled);
    sfxBtn.innerHTML = sfxEnabled ? '<span class="audio-icon">🔔</span> 琴音: 開' : '<span class="audio-icon">🔕</span> 琴音: 關';
    if (sfxEnabled) playGuitarPluck(392.00); // G4 輕快點音
  });

  // 歐洲溫暖木吉他指彈 BGM 開關
  const bgmBtn = document.getElementById('toggle-bgm-btn');
  bgmBtn.addEventListener('click', () => {
    playGuitarPluck(261.63); // C4 和弦起音
    const ctx = getAudioContext();

    if (!bgmPlaying) {
      bgmPlaying = true;
      if (!guitarEngine) {
        guitarEngine = new CozyGuitarBGM(ctx);
      }
      guitarEngine.start();
      bgmBtn.classList.add('playing');
      bgmBtn.innerHTML = '<span class="audio-icon">🎸</span> 歐洲吉他: 演奏中';
    } else {
      bgmPlaying = false;
      if (guitarEngine) {
        guitarEngine.stop();
      }
      bgmBtn.classList.remove('playing');
      bgmBtn.innerHTML = '<span class="audio-icon">🎸</span> 歐洲溫暖木吉他';
    }
  });

  // 關鍵字搜尋
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search-btn');

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    renderGallery();
  });

  clearBtn.addEventListener('click', () => {
    playGuitarPluck(329.63);
    searchInput.value = '';
    searchQuery = '';
    clearBtn.style.display = 'none';
    renderGallery();
  });

  // 山系篩選標籤
  const rangeChips = document.querySelectorAll('#range-filter-chips .chip');
  rangeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      playGuitarPluck(293.66); // D4
      rangeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentRange = chip.dataset.range;
      renderGallery();
    });
  });

  // 機能多選標籤
  const featureChips = document.querySelectorAll('#feature-chips .feature-chip');
  featureChips.forEach(chip => {
    chip.addEventListener('click', () => {
      playGuitarPluck(349.23); // F4
      const feature = chip.dataset.feature;
      if (currentFeatures.has(feature)) {
        currentFeatures.delete(feature);
        chip.classList.remove('active');
      } else {
        currentFeatures.add(feature);
        chip.classList.add('active');
      }
      renderGallery();
    });
  });

  // 關閉手帳彈窗
  document.getElementById('close-modal-btn').addEventListener('click', () => {
    playGuitarPluck(196.00); // G3 柔和低音收尾
    closeCabinModal();
  });
  
  document.getElementById('cabin-modal').addEventListener('click', (e) => {
    if (e.target.id === 'cabin-modal') {
      playGuitarPluck(196.00);
      closeCabinModal();
    }
  });

  // ESC 鍵關閉
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCabinModal();
    }
  });
}

/**
 * 依條件過濾並渲染山屋卡片
 */
function renderGallery() {
  const container = document.getElementById('cabin-grid');
  const countEl = document.getElementById('cabin-count');

  const filtered = cabinsData.filter(cabin => {
    if (currentRange !== 'all') {
      if (!cabin.mountain_range.includes(currentRange)) return false;
    }

    for (const f of currentFeatures) {
      if (f === 'charging' && !cabin.facilities.charging.includes('提供')) return false;
      if (f === 'cotton-quilt' && !cabin.facilities.bedding.includes('棉被')) return false;
      if (f === 'shower' && !cabin.facilities.showers.includes('淋浴')) return false;
      if (f === 'pac' && !cabin.emergency_and_medical.pac) return false;
      if (f === 'dry-room' && !cabin.facilities.dry_room.includes('烘鞋')) return false;
      if (f === 'no-draw' && cabin.booking.draw_required) return false;
    }

    if (searchQuery) {
      const matchText = [
        cabin.name,
        cabin.alias,
        cabin.mountain_range,
        cabin.route,
        cabin.summary,
        cabin.facilities.bedding,
        cabin.facilities.toilets,
        cabin.facilities.cooking,
        cabin.facilities.charging,
        ...(cabin.tags || []),
        ...(cabin.wildlife.species || []),
        ...(cabin.wildlife.cautions || []),
        ...(cabin.hiker_tips || [])
      ].join(' ').toLowerCase();

      if (!matchText.includes(searchQuery)) return false;
    }

    return true;
  });

  countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem; background: #FFF; border: 2px dashed #C9BCAB; border-radius: 8px;">
        <p style="font-size: 2rem; margin-bottom: 0.5rem;">🏔️</p>
        <p style="font-weight: 800; font-size: 1.1rem; color: var(--ink-deep);">未檢索到符合條件的百岳山屋</p>
        <p style="font-size: 0.88rem; color: var(--ink-muted); margin-top: 0.35rem;">試著放寬搜尋字詞，或取消部分特性篩選標籤。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(cabin => {
    const stampClass = cabin.booking.draw_required ? 'draw-yes' : 'draw-no';
    const stampText = cabin.booking.draw_required ? '電腦抽籤' : '直接登記';
    const priceText = cabin.booking.price_per_night === 0 ? '免費住宿' : `NT$ ${cabin.booking.price_per_night} / 晚`;

    return `
      <article class="cabin-card" onclick="openCabinModal('${cabin.id}')">
        <span class="card-stamp ${stampClass}">${stampText}</span>
        
        <div class="card-illustration">
          ${getCabinIllustrationSVG(cabin.id)}
          <span class="card-elevation-tag">▲ ${cabin.elevation.toLocaleString()}M</span>
        </div>

        <div class="card-body">
          <div class="card-title-group">
            <div class="card-mountain-range">${cabin.mountain_range}</div>
            <h3 class="card-title">${cabin.name}</h3>
            <div class="card-alias">${cabin.alias}</div>
          </div>

          <p class="card-summary">${cabin.summary}</p>

          <div class="card-tags">
            ${cabin.tags ? cabin.tags.map(t => `<span class="card-tag">#${t}</span>`).join('') : ''}
          </div>

          <div class="card-footer">
            <span class="card-price">${priceText}</span>
            <span class="card-open-link">翻開手帳 ➔</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/**
 * 開啟手帳詳細介紹視窗 (伴隨吉他自然泛音 Chime)
 */
window.openCabinModal = function(cabinId) {
  playGuitarHarmonic(659.25); // E5 優雅自然泛音
  const cabin = cabinsData.find(c => c.id === cabinId);
  if (!cabin) return;

  const modalBody = document.getElementById('notebook-modal-body');
  const modal = document.getElementById('cabin-modal');

  const stampClass = cabin.booking.draw_required ? 'stamp-pill' : 'stamp-pill wood';
  const drawLabel = cabin.booking.draw_required ? '玉管/雪霸/林業署電腦抽籤' : '免抽籤線上登記制';

  const photosHTML = cabin.photos && cabin.photos.length > 0 ? `
    <section class="photo-gallery-section">
      <h3 class="section-heading"><span>📷</span> 實地寫真與協作伙食紀錄</h3>
      <div class="photo-gallery-grid">
        ${cabin.photos.map(p => `
          <div class="photo-card">
            <div class="photo-thumb-container">
              <img src="${p.url}" alt="${p.title}" loading="lazy">
            </div>
            <div class="photo-caption">${p.title}</div>
            <div class="photo-credit">${p.credit}</div>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  modalBody.innerHTML = `
    <!-- 頂部山屋大標題與郵戳 -->
    <div class="modal-header">
      <div class="modal-header-top">
        <span class="${stampClass}">${drawLabel}</span>
        <span class="stamp-pill wood">標高 ${cabin.elevation}M</span>
        <span class="stamp-pill copper">${cabin.status}</span>
      </div>
      <h2 class="modal-title">${cabin.name}</h2>
      <div class="modal-alias">${cabin.alias} ・ ${cabin.mountain_range}</div>
      <div class="modal-chips-row">
        <span class="card-tag">路線：${cabin.route}</span>
        <span class="card-tag">難度：${cabin.difficulty}</span>
        <span class="card-tag">床位容納：${cabin.booking.capacity} 席</span>
      </div>
    </div>

    <!-- 雙頁手帳排版 -->
    <div class="notebook-layout">
      <!-- 左頁：入住收費、生活寢具、伙食供水與實景照片 -->
      <div class="notebook-col">
        <!-- 預約與入住規範 -->
        <section class="notebook-card-section">
          <h3 class="section-heading"><span>📋</span> 入住與收費規範</h3>
          <ul class="field-list">
            <li><span class="label">預約管道：</span><span class="value">${cabin.booking.type}</span></li>
            <li><span class="label">每晚收費：</span><span class="value">${cabin.booking.price_per_night === 0 ? '免費住宿' : '新台幣 ' + cabin.booking.price_per_night + ' 元 / 每人'}</span></li>
            <li><span class="label">預約注意：</span><span class="value">${cabin.booking.notice}</span></li>
          </ul>
        </section>

        <!-- 設施與寢具狀況 -->
        <section class="notebook-card-section">
          <h3 class="section-heading"><span>🛏️</span> 寢具與生活設施</h3>
          <ul class="field-list">
            <li><span class="label">床位型態：</span><span class="value">${cabin.facilities.bed_type}</span></li>
            <li><span class="label">棉被/睡袋：</span><span class="value"><strong>${cabin.facilities.bedding}</strong></span></li>
            <li><span class="label">廁所配置：</span><span class="value">${cabin.facilities.toilets}</span></li>
            <li><span class="label">熱水沐浴：</span><span class="value">${cabin.facilities.showers}</span></li>
            <li><span class="label">自行開火：</span><span class="value">${cabin.facilities.cooking}</span></li>
            <li><span class="label">充電插座：</span><span class="value"><strong>${cabin.facilities.charging}</strong></span></li>
            <li><span class="label">乾燥設施：</span><span class="value">${cabin.facilities.dry_room}</span></li>
          </ul>
        </section>

        <!-- 協作餐飲與供水 -->
        <section class="notebook-card-section">
          <h3 class="section-heading"><span>🍲</span> 伙食協作與供水</h3>
          <ul class="field-list">
            <li><span class="label">協作團隊：</span><span class="value">${cabin.meals.provided ? '有提供（' + cabin.meals.provider + '）' : '無協作，須自理食材'}</span></li>
            <li><span class="label">供餐時段：</span><span class="value">
              早早餐：${cabin.meals.serve_times.early_breakfast}<br>
              早餐：${cabin.meals.serve_times.breakfast}<br>
              晚餐：${cabin.meals.serve_times.dinner}
            </span></li>
            <li><span class="label">熱水甜湯：</span><span class="value">${cabin.meals.hot_water}</span></li>
            <li><span class="label">水源型態：</span><span class="value">${cabin.water_source.type}（${cabin.water_source.stability}）</span></li>
          </ul>
        </section>

        <!-- 實景寫真集 -->
        ${photosHTML}
      </div>

      <!-- 右頁：野生動物警戒、資深山友避雷、急救與通訊 -->
      <div class="notebook-col">
        <!-- 🚨 野生動物防範專欄 -->
        <section class="wildlife-warning-box">
          <div class="wildlife-header">
            <span>🐾</span> 野生動物出沒與防範警戒
          </div>
          <div class="wildlife-species-tags">
            ${cabin.wildlife.species.map(s => `<span class="species-tag">${s}</span>`).join('')}
          </div>
          <ul class="wildlife-cautions-list">
            ${cabin.wildlife.cautions.map(c => `<li>${c}</li>`).join('')}
          </ul>
        </section>

        <!-- 🎒 資深山友生存避雷筆記 -->
        <section class="pro-tips-box">
          <div class="pro-tips-header">
            <span>🎒</span> 資深山友生存私房筆記
          </div>
          <ul class="pro-tips-list">
            ${cabin.hiker_tips.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </section>

        <!-- 通訊與高山急救設施 -->
        <section class="notebook-card-section">
          <h3 class="section-heading"><span>📡</span> 電信收訊與高山急救設施</h3>
          <ul class="field-list">
            <li><span class="label">中華電信：</span><span class="value">${cabin.signals.chunghwa}</span></li>
            <li><span class="label">遠傳/台哥：</span><span class="value">${cabin.signals.far_easTone} / ${cabin.signals.taiwan_mobile}</span></li>
            <li><span class="label">收訊熱點：</span><span class="value">${cabin.signals.best_spot}</span></li>
            <li><span class="label">醫療配置：</span><span class="value">
              ${cabin.emergency_and_medical.pac ? '★配置高山病加壓艙 (PAC) ' : '無 PAC '}・
              ${cabin.emergency_and_medical.aed ? '配置 AED ' : ''}
              <br><small style="color:var(--ink-muted);">${cabin.emergency_and_medical.notes}</small>
            </span></li>
          </ul>
        </section>
      </div>
    </div>
  `;

  modal.classList.add('open');
};

function closeCabinModal() {
  document.getElementById('cabin-modal').classList.remove('open');
}

// 啟動應用
document.addEventListener('DOMContentLoaded', initApp);
