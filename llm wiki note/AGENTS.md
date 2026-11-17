# AGENTS.md - 台灣百岳山屋野外筆記圖鑑 (LLM Wiki & Field Guide)

> 本文件為此專案之核心規範手冊（Schema & Operational Rules）。所有協同維護此專案的 AI Agent 皆必須嚴格遵守本文所定義之三層架構、YAML Frontmatter 規格、知識庫維護流程（Ingest / Query / Lint）與前端典藏圖鑑風格規範。

---

## 1. 專案願景與核心哲學 (Philosophy)

本專案參考 **Andrej Karpathy 提出的 "LLM Wiki"** 模式，將個人登山知識庫從傳統的「臨時 RAG 檢索」轉化為「可持續累積、結構化、自我生長」的 persistent wiki 知識體系。

- **人類的角色 (Human)**：探索、提供一手原始資料（山友遊記、官方公告、協作價格）、審查與提出核心問題。
- **AI 的角色 (Agent)**：整理者、圖鑑繪編者、跨檔案關聯維護者。負責精確萃取資訊、更新索引、維護歷史日誌、並確保前端圖鑑展示正確無誤。
- **核心產出**：
  1. 一套標準化的 Markdown 知識庫（包含 index、log、個別山屋檔案）。
  2. 一個具備**「野外調查典藏手帳風格」**的靜態網頁，可一鍵部署至 GitHub Pages 供山友公開查閱。

---

## 2. 專案架構與目錄規範 (Directory Structure)

專案嚴格區分為三層架構：

```text
llm-wiki-note/
├── AGENTS.md               # [規範層] 本文件：AI 操作守則與 Schema 規範
├── README.md               # [說明層] 專案介紹、GitHub Pages 網址與作業說明
│
├── raw/                    # [Layer 1: 原始資料層] (只讀、不可竄改之 Truth Source)
│   ├── yushan-paiyun.txt   # 官方規章、協作公告、山友行程紀錄等原始文字
│   └── ...
│
├── wiki/                   # [Layer 2: 結構化知識庫] (由 AI 完全接管維護)
│   ├── index.md            # 全山屋快速檢索目錄、狀態總覽
│   ├── log.md              # 依時間遞增的變更歷史 (Append-only Ledger)
│   └── cabins/             # 各山屋 Markdown 頁面 (含標準 YAML Frontmatter)
│       ├── paiyun.md
│       ├── dongpu.md
│       ├── tianchi.md
│       ├── sanliujiu.md
│       └── kuaigu.md
│
├── data/                   # [資料傳遞層] 由 wiki 匯出供前端讀取的 JSON
│   └── cabins.json         # 網頁自動載入的資料庫（由 wiki 自動同步）
│
├── index.html              # [Layer 3: 網頁展示層] 手寫手帳圖鑑主頁面 (支援 GitHub Pages)
├── css/
│   └── style.css           # 牛皮紙質感、手繪墨水線條、圖章與卡片風格
└── js/
    └── app.js              # 圖鑑互動邏輯：卡片網格、翻頁展開、篩選搜尋
```

---

## 3. 山屋資料規格 (Cabin Schema Specification)

每座山屋必須於 `wiki/cabins/<id>.md` 建立，且開頭必須包含完整的 YAML Frontmatter。所有 Agent 新增或修改資料時，必須遵循以下欄位型態與定義：

```yaml
---
id: string               # 唯一英數識別碼 (例如: "paiyun", "dongpu-lodge")
name: string             # 正式名稱 (例如: "排雲山莊")
alias: string            # 別名或副標 (例如: "玉山攻頂最後基地")
elevation: number        # 海拔高度 (公尺，如: 3402)
mountain_range: string   # 所屬山系 (如: "玉山山脈", "雪山山脈")
route: string            # 常見攀登路線 (如: "玉山主峰線", "能高越嶺古道西段")
difficulty: string       # 路線難易度 ("入門級" | "中級百岳" | "挑戰級")
status: string           # 目前營運狀態 ("正常營運" | "整建中" | "暫時封閉")
summary: string          # 100字以內的手帳感精簡介紹

booking:
  type: string           # 預約機制 (如: "玉山國家公園線上抽籤", "免抽籤預約")
  draw_required: boolean # 是否需抽籤
  capacity: number       # 床位總數
  price_per_night: number# 每人每晚收費 (新台幣)
  notice: string         # 預約注意事項 (如: "需於入園日前 1~2 個月提出申請")

facilities:
  bed_type: string       # 床位型態 (如: "木板通鋪附厚發泡軟墊", "上下舖")
  bedding: string        # 寢具型態 (如: "需自備睡袋或向協作租借", "提供棉被枕頭")
  toilets: string        # 廁所資訊 (如: "室內水沖式廁所 4 間、小便斗 6 座")
  showers: string        # 淋浴設備 (如: "無洗澡設施", "投幣式熱水淋浴")
  cooking: string        # 開火規定 (如: "嚴禁寢室開火，僅限指定戶外炊事區")
  charging: string       # 充電設施 (如: "無提供遊客插座，須自備行動電源", "有公共插座")
  dry_room: string       # 乾燥室/濕衣處 (如: "有專屬烘鞋乾燥室", "廊道滴水掛勾")

meals:
  provided: boolean      # 是否有協作供餐服務
  provider: string       # 協作團隊名稱 (如: "布農卡里布灣企業社", "天池廚房")
  serve_times:           # 供餐時段說明
    early_breakfast: string # 早早餐 (攻頂前)
    breakfast: string       # 早餐 (下山或返程)
    dinner: string          # 晚餐
  hot_water: string      # 熱水與補給 (如: "提供保溫熱開水與黑糖薑茶時段")

water_source:
  type: string           # 水源型式 (如: "重力引山澗活水", "大型雨水蓄水塔")
  stability: string      # 穩定度 (如: "全年穩定", "冬季枯水期需節約用水")

emergency_and_medical:
  aed: boolean           # 是否配置 AED
  pac: boolean           # 是否配置高山症攜帶型加壓艙 (PAC)
  oxygen: boolean        # 是否常備氧氣瓶/製造機
  notes: string          # 醫療急救注意事項

wildlife:
  species: list[string]  # 常見物種 (如: ["黃喉貂", "金翼白眉", "台灣黑熊"])
  cautions: list[string] # 防範重點與生態保護注意事項 (LNT 原則)

signals:
  chunghwa: string       # 中華電信收訊 (如: "4G 良好 (2~3格)")
  taiwan_mobile: string  # 台灣大哥大
  far_easTone: string    # 遠傳電信
  best_spot: string      # 最佳收訊點位置手帳筆記

hiker_tips: list[string] # 資深山友私房提醒 (如: 耳塞必帶、紅光頭燈禮儀、排遺規範)
---

# 正式介紹內文 (Markdown 格式)
包含歷史簡介、山友真實體驗筆記、步道水源點銜接提醒。
```

---

## 4. 知識庫操作標準作業程序 (Operations SOP)

協同 Agent 在執行任何操作時，必須遵照 Karpathy 定義的三大操作規範：

### 4.1 Ingest (新增/導入新山屋資訊)
1. **讀取原始資料**：讀取 `/raw/` 目錄下的文件。
2. **資訊萃取與驗證**：比對官方規範，確認各欄位正確性（尤其是供餐時間、床位數、水源狀況）。
3. **撰寫山屋筆記**：於 `wiki/cabins/<id>.md` 依 Schema 建立完整內容。
4. **更新索引目錄**：更新 `wiki/index.md`，將新山屋加入表格與統計清單。
5. **同步前端資料**：將新山屋資料同步產出/更新至 `data/cabins.json`。
6. **寫入稽核紀錄**：於 `wiki/log.md` 附加紀錄，格式固定為：
   `## [YYYY-MM-DD] ingest | <山屋名稱> (<id>) - <簡要備註>`

### 4.2 Lint (知識庫健檢與一致性檢查)
定期或在使用者要求時執行：
- 檢查 `wiki/cabins/*.md` 是否有遺漏必填欄位。
- 檢查 `data/cabins.json` 是否與 `wiki/cabins/` 同步。
- 檢查是否有過期的山屋狀態（例如公告已完成整建，但狀態仍標示為整建中）。
- 於 `wiki/log.md` 紀錄：`## [YYYY-MM-DD] lint | 檢查通過，無孤立頁面或欄位缺失`。

### 4.3 Query (資訊檢索與手帳洞察)
- 當使用者詢問山屋相關問題（例如「哪幾間山屋有熱水澡？」、「排雲山莊如何防黃喉貂？」），Agent 應優先翻閱 `wiki/index.md` 與 `wiki/cabins/*.md` 進行精準回答。
- 若產出深入的比較分析（例如「高山協作供餐型態大評比」），Agent 應主動詢問使用者是否將該回答轉化為知識庫的專題頁面。

---

## 5. 前端展示與視覺風格手冊 (Field Guide Visual Guidelines)

前端成果必須維持**「戶外調查手帳 / 森林野外圖鑑」**的溫度與質感：

1. **色彩系統**：
   - 背景紙質：溫暖米白、復古牛皮紙 (`#FBF9F4`, `#F5EFEB`, `#EFE8DE`)
   - 墨水文字：深炭黑綠 (`#242B24`, `#2D372E`)
   - 強調色：山林松綠 (`#2E5A44`)、地圖標記赭紅 (`#C85A32`)、暖陽黃 (`#E0A838`)
2. **排版與組件質感**：
   - **卡片風格**：拍立得照片感、野外標本採集籤、粗手繪邊框（仿鋼筆速寫筆觸）。
   - **徽章與印章**：如「需抽籤 (紅色郵戳章)」、「有熱水 (綠色手繪章)」、「PAC 配備 (安全盾牌章)」。
   - **互動細節**：
     - 首頁呈現山屋圖鑑網格，支持「海拔」、「山系」、「是否供餐」快速標籤篩選。
     - 點擊卡片時，具備流暢的「翻開野外手帳」動畫或精緻彈窗展開，完整呈現兩欄式筆記資訊。
3. **零環境依賴 (Zero Dependency)**：
   - 採用純 HTML5 / CSS3 / ES Module JavaScript，不使用複雜的 node 打包指令，確保 push 至 GitHub 倉庫後，開啟 GitHub Pages 即可 100% 完美運行。

---

## 6. 核心行動清單 (Agent Action Checklist)

當使用者指示新增或修改山屋時，請務必按照此清單逐一打勾驗收：
- [ ] 原始資料已歸檔至 `raw/`
- [ ] YAML Frontmatter 通過欄位檢查
- [ ] `wiki/cabins/<id>.md` 已建立且內文完整
- [ ] `wiki/index.md` 目錄已更新
- [ ] `data/cabins.json` 已同步更新
- [ ] `wiki/log.md` 記錄已附加
- [ ] 網頁瀏覽正常，點擊卡片能完整顯示山友私房情報與野生動物防範

---
*遵循本文件規範，能確保知識庫永續擴充，打造台灣最實用且富有溫度的百岳山屋數位圖鑑。*
