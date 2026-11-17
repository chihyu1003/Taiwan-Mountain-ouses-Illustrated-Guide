# 知識庫運作紀錄 (Knowledge Base Log)

> 依照 Karpathy LLM Wiki 規範維護之 Chronological Ledger (依時間遞增紀錄)。
> 格式規範：`## [YYYY-MM-DD] <操作類型> | <主旨與說明>`

---

## [2026-11-16] schema | 建立專案核心規格 AGENTS.md
- 確立 Karpathy 三層架構 (Raw Sources -> Wiki -> Web Frontend)。
- 訂定山屋 YAML Frontmatter 欄位規範（含供餐、廁所、睡袋、PAC醫療、野生動物防範、通訊）。
- 明定前端手寫野外手帳視覺指南與 GitHub Pages 零依賴部署原則。

## [2026-11-16] raw | 匯入 5 大經典山屋原始參考資料
- 建立 `raw/yushan-paiyun.txt` (玉山排雲山莊官方入園規章與協作隊資料)
- 建立 `raw/yushan-dongpu.txt` (玉山前哨東埔山莊公路基地資料)
- 建立 `raw/nenggao-tianchi.txt` (能高越嶺天池山莊五星木屋規章)
- 建立 `raw/syue-sanliujiu.txt` (雪山三六九山莊臨時營舍與黑森林資料)
- 建立 `raw/beidawu-kuaigu.txt` (北大武檜谷山莊與喜多麗斷崖資料)

## [2026-11-16] ingest | 排雲山莊 (paiyun)
- 完成 `wiki/cabins/paiyun.md` 萃取與建檔。
- 註記重點：海拔 3,402m、需抽籤、卡里布灣供餐、沖水廁所、配置 PAC、黃喉貂強盜警戒。

## [2026-11-16] ingest | 東埔山莊 (dongpu)
- 完成 `wiki/cabins/dongpu.md` 萃取與建檔。
- 註記重點：海拔 2,580m、線上預約免抽籤、有插座/熱水淋浴/棉被枕頭、塔塔加獼猴防搶警戒。

## [2026-11-16] ingest | 天池山莊 (tianchi)
- 完成 `wiki/cabins/tianchi.md` 萃取與建檔。
- 註記重點：海拔 2,860m、林業署抽籤、天池廚房、烘鞋乾燥室、水鹿夜間奪鹽與嚴禁隨地尿尿。

## [2026-11-16] ingest | 三六九山莊 (sanliujiu)
- 完成 `wiki/cabins/sanliujiu.md` 萃取與建檔。
- 註記重點：海拔 3,150m、臨時營舍施工中 (36床位)、布農隊協作、防貂第一警戒、黑森林前哨。

## [2026-11-16] ingest | 檜谷山莊 (kuaigu)
- 完成 `wiki/cabins/kuaigu.md` 萃取與建檔。
- 註記重點：海拔 2,150m、北大武神木林、頂級活水源、喜多麗雲海夕陽、台灣黑熊與百步蛇生態警戒。

## [2026-11-16] index | 建立知識庫總目錄 index.md
- 彙編五大山屋速查表、設施交叉比對矩陣、野生動物生態警戒防範總表。

## [2026-11-16] lint | 知識庫完整性驗證通過
- 檢查 5 篇 cabin Markdown 皆具備合規 YAML Frontmatter 與齊全欄位。
- 所有交叉索引連結與路徑均正確，無孤立頁面。
