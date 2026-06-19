# Tusq — Portfolio

ミニマル / モノクロのポートフォリオサイト。ビルド不要の素の HTML / CSS / JS で、そのまま GitHub Pages に公開できます。

## ページ構成

| ページ | ファイル | 内容 | 管理方法 |
| --- | --- | --- | --- |
| Home | `index.html` | トップ（ヒーロー） | HTML 直接 |
| Biography | `biography.html` | 自己紹介・基本情報・来歴（年表） | **`data/biography.json`** |
| Opus | `opus.html` | 作品集 | **`data/works.json`** |
| Project | `project.html` | 進行中のプロジェクト | **`data/projects.json`** |
| Contact | `contact.html` | 連絡先リンク集 | **`data/contact.json`** |

## ディレクトリ

```
portfolio/
├─ index.html / biography.html / opus.html / project.html / contact.html / 404.html
├─ data/
│  ├─ works.json      ← Opus（作品）をここに追加
│  └─ projects.json   ← Project をここに追加
└─ assets/
   ├─ css/style.css
   ├─ js/site.js        ← 共通のヘッダー/フッター（ナビはここで一元管理）
   ├─ js/collection.js  ← JSON を読み込んでカード表示＋詳細モーダル
   └─ img/
      ├─ opus/      ← 作品のジャケット画像を置く
      └─ project/   ← プロジェクトの画像を置く
```

## 作品（Opus）を追加する

1. ジャケット画像を `assets/img/opus/` に置く（正方形推奨）。
2. `data/works.json` に項目を追加する。

```json
{
  "id": "my-new-track",
  "title": "作品タイトル",
  "year": "2026",
  "type": "Single / Composition",
  "cover": "assets/img/opus/my-new-track.jpg",
  "description": "ここにキャプション。改行も使えます。",
  "tags": ["Composition", "Electronic"],
  "embed": { "type": "youtube", "url": "https://youtu.be/xxxxxxxxxxx" },
  "links": [
    { "label": "SoundCloud", "url": "https://soundcloud.com/..." },
    { "label": "Apple Music", "url": "https://music.apple.com/..." }
  ]
}
```

### フィールド説明

| キー | 必須 | 説明 |
| --- | --- | --- |
| `id` | △ | 一意のID（任意の英数字）|
| `title` | ◯ | タイトル |
| `year` | | 年（"2026" や "2024–" など）|
| `type` | | 種別ラベル（カードに小さく表示）|
| `cover` | | 画像パス。空 `""` ならタイトル頭文字のプレースホルダ |
| `description` | | 説明文。`\n` で改行 |
| `tags` | | タグ配列 |
| `embed` | | 詳細で再生するプレイヤー（下記）|
| `links` | | 外部リンクのボタン配列 `{label, url}` |

### `embed`（埋め込み）対応

| `type` | `url` に入れるもの |
| --- | --- |
| `youtube` | YouTube の URL または動画ID |
| `vimeo` | Vimeo の URL または動画ID |
| `soundcloud` | SoundCloud のトラック URL |
| `spotify` | Spotify の URL |
| `iframe` | 任意の埋め込み URL |

## Biography を編集する（`data/biography.json`）

- `intro` … 紹介文の段落（配列）。
- `facts` … 基本情報 `{label, value}` の配列。
- `timeline` … 来歴（年表）。`{year, title, detail}` を新しい順／古い順お好みで並べる。`detail` は空 `""` でも可。
- `name` / `reading` … 見出しの名前と読み。`portrait` … 顔写真のパス。

## Contact を編集する（`data/contact.json`）

- `intro` … 冒頭の一文。
- `links` … `{label, value, url}` の配列。`url` が `mailto:` 以外なら自動で別タブ＋「↗」が付きます。不要な行は削除、追加は項目を足すだけ。

## Project を追加する

`data/projects.json` も形式は同じです。加えて以下が使えます。

- `status`: `"Ongoing"` など。`"Released"` / `"公開"` 以外を入れるとカード左上にバッジ表示。
- `role`: 役割（例: "Concept / Development"）。

## ローカルで確認する

`fetch()` で JSON を読み込むため、ファイルを直接ダブルクリック（`file://`）で開くと Opus / Project が表示されません。簡易サーバー経由で開いてください。

```bash
cd portfolio
python3 -m http.server 8000
# → ブラウザで http://localhost:8000 を開く
```

## GitHub Pages で公開する

1. このフォルダの中身をリポジトリのルートに置く。
2. リポジトリ Settings → Pages → Source を `main` ブランチのルートに設定。
3. 数分後に `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開されます。

## フォント・配色（テーマ）

フォントと色は **`data/theme.json`** で一元管理します（CSS を触る必要はありません）。`assets/js/site.js` が読み込み、CSS変数として適用します。

```json
{
  "colors": {
    "light": { "--bg": "#FFFFFF", "--fg": "#080000", "...": "..." },
    "dark":  { "--bg": "#080000", "--fg": "#FFFFFF", "...": "..." }
  },
  "accents": {
    "default": "red",
    "options": [
      { "id": "red", "label": "赤", "value": "#E24215", "on": "#FFFFFF" },
      { "id": "orange", "label": "橙", "value": "#EA930A", "on": "#080000" }
    ]
  },
  "fonts": {
    "serif":  "Futura, \"Jost\", \"GenEi Chikugo Min\", serif",
    "label":  "Futura, \"Jost\", \"GenEi Chikugo Min\", sans-serif",
    "sans":   "\"GenEi Chikugo Min\", \"Noto Serif JP\", serif",
    "script": "\"Smooch\", cursive",
    "imports": ["https://fonts.googleapis.com/css2?family=Smooch&family=Jost:wght@400;500;600&family=Noto+Serif+JP:wght@500;600&display=swap"],
    "faces": [
      { "family": "GenEi Chikugo Min", "src": "assets/fonts/GenEiChikugoMin3-R.woff2", "format": "woff2", "weight": "100 900" }
    ]
  }
}
```

- `colors.light` … 通常時（背景 #FFFFFF / 文字 #080000）。`colors.dark` … OS がダークモードのとき自動適用（背景 #080000 / 文字 #FFFFFF）。
- 主要色：`--bg`（背景）/ `--fg`（文字）/ `--line`（罫線）。アクセントは下記 `accents` で別管理。
- **アクセントカラーは訪問者が選べます**（フッターのカラー丸）。`accents.options` に候補 `{id, label, value, on}` を並べ、`accents.default` で初期色を指定。`on` はそのアクセント上に乗る文字色（橙・黄など明るい色は黒推奨）。選択は各ブラウザの localStorage に保存され、ページ間で維持されます。
- フォントの役割：`serif` … 見出し・タイトル、`label` … ナビやラベル等の小さな欧文、`sans` … 本文、`script` … 「Tusq」専用（Smooch）。
- **欧文は Futura → Jost、和文は源暎ちくご明朝** に自動で切り替わります。Futura は有償でWeb配布できないため、Futura を持つ端末では本物の Futura を、無い場合は無料の Futura 系 **Jost**（Google Fonts）を表示。日本語は自動的に源暎ちくご明朝に落ちます。
- 「Tusq」の表示書体は **Smooch**（Google Fonts）。Home のヒーローと Biography タイトルにのみ適用（`.font-script`）。
- `imports` … 外部 Web フォント CSS（Smooch / Jost / Noto Serif JP）。`faces` … 自前ホストのフォント。源暎ちくご明朝（御琥祢屋, SIL OFL 1.1, woff2 約 4.3MB）は `assets/fonts/OFL.txt` にライセンスを同梱（再配布時も必須）。

## その他のカスタマイズ

- **ナビ項目 / サイト名**：`assets/js/site.js` の `NAV` と `SITE`。
- **favicon / ogp**：`assets/img/` の画像を差し替え。
- CSS の `:root` はテーマ未読み込み時のフォールバック値です。
