# 🏔️ 台灣百岳山屋野外筆記圖鑑 (Taiwan Mountain Cabins Field Guide)
> 基於 Andrej Karpathy "LLM Wiki" 架構之登山知識庫與典藏野外手帳

---

## 📖 專案簡介與作業核心概念

本專案旨在解決登山者在規劃台灣百岳行程時，面臨山屋資訊破碎、協作供餐規則不一、高山生態與安全事項散落各處的痛點。

與傳統的單次「Vibe Coding」不同，本專案的核心目標是**建立一套標準化的長期維護規則 (`AGENTS.md`)**，讓未來任何 AI 助理（Claude, Codex, Gemini 等）都能依循相同的 SOP，持續為知識庫擴充新的山屋資料，且完全維持一致的資料規格與典藏手帳風格。

本專案架構深度參考了前 OpenAI 研究科學家 **Andrej Karpathy 所倡導的「LLM Wiki」概念**：
- **傳統 RAG**：每次對話都重新從零檢索零碎片段，知識無法沉澱與複利。
- **LLM Wiki**：由人類提供一手原始資料（/raw/），AI 負責結構化編譯、跨文檔更新、維護歷史日誌（/wiki/），形成可持續積累的實體知識庫。

---

## 🌲 專案三大層級架構 (Three-Layer Architecture)

```text
llm-wiki-note/
├── AGENTS.md               # 🌟 [核心大腦] AI 操作守則與 YAML Schema 規範手冊
├── README.md               # 專案說明與部署指南
│
├── raw/                    # 📄 [Layer 1: 原始資料層] (只讀的事實依據)
│   ├── yushan-paiyun.txt   # 玉山排雲山莊官方規範與協作公告
│   ├── yushan-dongpu.txt   # 東埔山莊公路前哨基地資料
│   ├── nenggao-tianchi.txt # 能高越嶺天池山莊五星木屋規章
│   ├── syue-sanliujiu.txt  # 雪山三六九山莊臨時營舍資料
│   └── beidawu-kuaigu.txt  # 北大武檜谷山莊與神木林資料
│
├── wiki/                   # 📚 [Layer 2: 結構化知識庫] (由 AI 自動維護)
│   ├── index.md            # 全山屋目錄、設施比對矩陣、生態警戒表
│   ├── log.md              # 依時間遞增的運作變更紀錄 (Append-only Ledger)
│   └── cabins/             # 個別山屋詳細 Markdown 筆記 (含完整 YAML Frontmatter)
│       ├── paiyun.md
│       ├── dongpu.md
│       ├── tianchi.md
│       ├── sanliujiu.md
│       └── kuaigu.md
│
├── data/                   # 🔄 [資料傳遞層] 由 wiki 同步匯出之 JSON
│   └── cabins.json         # 供網頁前端讀取的完整山屋資料庫 (含合法公開照片)
│
├── index.html              # 🎨 [Layer 3: 網頁展示層] 野外手帳圖鑑主頁面 (支援 GitHub Pages)
├── css/
│   └── style.css           # 典藏皮革裝訂、黃銅鉚釘、和紙膠帶與暮色暖光樣式
└── js/
    └── app.js              # 向量光影插畫引擎、Web Audio 自然音合成、手帳翻頁展開
```

---

## 🎨 典藏手帳特色與資深山友生存情報

1. **野外探險典藏手帳風格 (Expedition Field Journal Vibe)**：
   - 採用復古再生紙、皮革縫線裝訂飾條、黃銅鉚釘、半透明和紙膠帶。
   - 內建自製 SVG 純向量山屋手繪插圖，具備**深色暮色/晨曦薄霧背景與鵝黃色窗光溢散**的溫暖意境。
2. **Web Audio 純代碼音效與自然白噪音（零外部依賴）**：
   - **高山自然音**：點擊右上角一鍵啟動**「高山松林陣風＋溫暖營火柴火劈啪聲」**，伴隨探險沉浸閱讀。
   - **紙質翻頁音與木質敲擊**：翻開手帳與點選標籤時，具備清脆細緻的手帳翻頁聲。
3. **合法開放授權之實地寫真集**：
   - 翻開手帳後可查閱山屋實體外觀、大通鋪鋪位狀況與協作澎湃熱食之實景影像（遵守政府開放資料與 CC 授權規範）。
4. **山屋全方位生活與機能清單**：
   - **預約與入住**：電腦抽籤或免抽籤線上登記、床位數、每晚規費、申請注意事項。
   - **生活設施**：床型、**棉被還是睡袋**、廁所型式與數量、熱水淋浴、開火炊事區、**110V充電插座**、烘鞋乾燥室。
   - **協作餐飲**：供餐廠商、早早餐/早餐/晚餐供餐時段、黑糖薑茶與熱開水。
   - **水資源與電力**：引水型態、枯水期穩定度、晚間熄燈時間。
5. **🚨 野生動物防範與生態警戒（特色亮點）**：
   - **黃喉貂（羌仔虎）**：揭露其拉開拉鍊撕咬背包習性，提供防貂硬盒收納指引。
   - **台灣水鹿**：夜間大量出沒，**嚴厲警告切忌隨地便溺**，防止水鹿因爭奪尿液鹽分衝撞人群。
   - **台灣獼猴**：塔塔加地區猴群搶食防範（禁提塑膠袋）。
   - **台灣黑熊與蛇類**：北大武山雙鬼湖歷史棲地防熊守則與中海拔步道毒蛇防護。
6. **🎒 資深山友私房情報（避雷指南）**：
   - **耳塞必備 5 顆星**：通鋪打呼交響樂安眠救星。
   - **紅光頭燈禮儀**：20:00 熄燈後的換燈規範。
   - **高度適應黃金法則**：爬玉山前一晚宿東埔山莊（2,580m）抗高山症策略。
   - **緊急醫療配備**：標註是否有 PAC（高山病加壓艙）與 AED。

---

## 🚀 本地預覽方式 (Local Preview)

本專案採用**零環境依賴（Zero-Dependency）**架構，無需安裝 Node.js 或執行複雜的打包指令：

### 方法一：直接瀏覽器開啟
直接雙擊點開專案資料夾內的 `index.html`，即可在 Chrome / Edge / Safari 中直接瀏覽。

### 方法二：透過 Python 簡易伺服器
```bash
python -m http.server 8080
# 接著於瀏覽器打開 http://localhost:8080
```

---

## 🌐 上傳 GitHub 與啟用 GitHub Pages 步驟

完成專案後，請依以下步驟上傳至 GitHub 並開啟網頁成果：

1. **在 GitHub 建立一個新儲存庫（Repository）**（例如命名為 `taiwan-cabin-wiki`，設定為 Public）。
2. **在本地終端機將專案推送到 GitHub**（或直接在 GitHub 網頁拖曳上傳）：
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of taiwan mountain cabins field guide"
   git branch -M main
   git remote add origin https://github.com/<你的使用者名稱>/taiwan-cabin-wiki.git
   git push -u origin main
   ```
3. **開啟 GitHub Pages 免費網頁服務**：
   - 進入 GitHub 儲存庫頁面，點選上方的 **Settings**（設定）。
   - 在左側選單點選 **Pages**。
   - 在 **Build and deployment** 下方的 **Branch**：
     - 分支選擇：`main`
     - 資料夾選擇：`/ (root)`
     - 點擊 **Save**（儲存）。
   - 稍候 1~2 分鐘，頁面頂端即會顯示你的專屬公開網址（例如：`https://<username>.github.io/taiwan-cabin-wiki/`）。

---

## 🤖 未來如何讓 AI 依循 AGENTS.md 擴充新山屋？

當你走訪了一座新山屋（例如：*嘉明湖山屋*），你只需要把官方簡章丟入 `raw/`，並對任何 AI Agent 說：

> 「請閱讀 `AGENTS.md`，依照標準 SOP 將 `raw/jiaming-cabin.txt` 導入知識庫，並同步更新 `wiki/index.md`、`wiki/log.md` 與 `data/cabins.json`。」

AI 就會自動產出符合格式的 Markdown、更新圖鑑、並同步到網頁上，這就是 **AGENTS.md 規範化工程**的真正威力！

---
*本專案遵守無痕山林（Leave No Trace, LNT）原則，愛護高山自然環境與野生動物。*
