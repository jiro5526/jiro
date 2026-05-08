from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "mobile-lp"
W = 750

CSS = """
  .jp{font-family:'Noto Sans JP','Hiragino Kaku Gothic ProN','Yu Gothic','Meiryo',system-ui,sans-serif;letter-spacing:-.02em}
  .display{font-weight:900;paint-order:stroke;stroke:#030711;stroke-width:8px;stroke-linejoin:round}
  .h1{font-size:56px;font-weight:900}.h2{font-size:42px;font-weight:900}.h3{font-size:30px;font-weight:800}.body{font-size:24px;font-weight:600}.small{font-size:17px;font-weight:500}
  .white{fill:#f6f7f0}.yellow{fill:#efc41f}.muted{fill:#b2becd}.ink{fill:#0b121e}.paper{fill:#f3f1e7}.blue{fill:#2a83ff}
  .shadow{filter:url(#shadow)}.glow{filter:url(#glow)}
"""

def defs(seed: int) -> str:
    return f"""
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050d1b"/><stop offset=".45" stop-color="#092047"/><stop offset="1" stop-color="#050b18"/></linearGradient>
  <radialGradient id="halo" cx="62%" cy="18%" r="70%"><stop offset="0" stop-color="#1e7fff" stop-opacity=".42"/><stop offset=".45" stop-color="#12416e" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <filter id="shadow"><feDropShadow dx="5" dy="6" stdDeviation="3" flood-color="#000" flood-opacity=".72"/></filter>
  <filter id="glow"><feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="#2a83ff" flood-opacity=".72"/></filter>
  <pattern id="grid" width="72" height="86" patternUnits="userSpaceOnUse"><path d="M0 0H72M0 0V86" stroke="#5f9bd9" stroke-opacity=".10"/><path d="M-20 86L72 -20" stroke="#5f9bd9" stroke-opacity=".06"/></pattern>
  <filter id="rough{seed}"><feTurbulence baseFrequency=".9" numOctaves="2" seed="{seed}" type="fractalNoise"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 .05"/></feComponentTransfer></filter>
</defs>"""

def bg(h: int, seed: int) -> str:
    return f"""<rect width="{W}" height="{h}" fill="url(#bg)"/><rect width="{W}" height="{h}" fill="url(#halo)"/><rect width="{W}" height="{h}" fill="url(#grid)"/><rect width="{W}" height="{h}" fill="#000" opacity=".08" filter="url(#rough{seed})"/>"""

def T(x, y, lines, cls="body white", size=None, lh=1.22, anchor="start"):
    if isinstance(lines, str): lines=[lines]
    attrs = f'class="jp {cls}" text-anchor="{anchor}"'
    if size: attrs += f' font-size="{size}"'
    s=f'<text x="{x}" y="{y}" {attrs}>'
    for i,line in enumerate(lines):
        dy = 0 if i==0 else f"{lh}em"
        s += f'<tspan x="{x}" dy="{dy}">{escape(line)}</tspan>'
    return s+'</text>'

def cta(y, label="無料LIVEを予約する"):
    return f"""<g id="cta-zone" class="jp"><rect x="70" y="{y}" width="610" height="92" rx="34" fill="#efc41f" stroke="#fff29c" stroke-width="4"/><text x="375" y="{y+58}" text-anchor="middle" font-size="32" font-weight="900" fill="#0b121e">{escape(label)}</text><text x="375" y="{y+122}" text-anchor="middle" font-size="17" fill="#b2becd">※後からHTMLボタンを重ねやすい余白を確保</text></g>"""

def foreman(x, y, s=1.0):
    def p(v): return round(v*s,1)
    return f"""<g transform="translate({x} {y}) scale({s})" opacity=".98">
  <ellipse cx="185" cy="96" rx="65" ry="64" fill="#986141" stroke="#180f0b" stroke-width="4"/><path d="M128 85c22-45 80-62 122-25-18-52-92-70-130-25-18 21-20 46-9 72" fill="#151116"/><path d="M150 115c12 13 28 13 40 0M203 107c18-7 34-4 48 8" stroke="#1b100b" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M45 160L180 215L310 160L280 380H80Z" fill="#20354e" stroke="#0c131e" stroke-width="5"/><path d="M62 175l98 42-42 163M296 176l-85 42 45 162" stroke="#4a6f9b" stroke-opacity=".65" stroke-width="4" fill="none"/>
  <rect x="25" y="295" width="275" height="135" rx="18" fill="#191e24" stroke="#5a7896" stroke-width="5"/><path d="M46 330L276 390" stroke="#5296f5" stroke-opacity=".8" stroke-width="5"/>
  <ellipse cx="45" cy="265" rx="40" ry="45" fill="#905c3d"/><ellipse cx="292" cy="295" rx="43" ry="45" fill="#905c3d"/>
  <ellipse cx="330" cy="435" rx="75" ry="45" fill="#b8ae94" stroke="#20242a" stroke-width="5"/><path d="M265 438c28 35 99 39 130 5" stroke="#2d343a" stroke-width="5" fill="none"/>
</g>"""

def svg(name, h, body, seed):
    OUT.mkdir(parents=True, exist_ok=True)
    content=f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{h}" viewBox="0 0 {W} {h}" role="img" aria-label="{escape(name)}">
{defs(seed)}<style>{CSS}</style>{bg(h,seed)}{body}</svg>"""
    (OUT/name).write_text(content, encoding='utf-8')

def card(x,y,w,h,rx=28,fill="#f4f6ee",op=.94): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" opacity="{op}"/>'

def make():
    svg('01-first-view.svg',1260, f"""
<rect width="750" height="1260" fill="#000" opacity=".35"/>{foreman(348,88,.95)}
<g class="shadow"><path d="M42 68L330 47L350 103L54 118Z" fill="#f8f7ef"/><text x="70" y="100" class="jp h2 ink" font-size="45">50代のDX</text></g>
{T(44,235,'AIが','display white shadow',88)}{T(44,340,'俺の12年を','display yellow shadow',74)}{T(44,442,'資産に変えた','display white shadow',74)}
<rect x="44" y="505" width="500" height="84" fill="#000" opacity=".72" stroke="#f6f7f0" stroke-width="3"/>{T(70,560,'32年の現場監督が','h3 white shadow',34)}
{T(50,690,'深夜に目頭を熱くした理由','h3 white shadow',31)}
{card(42,760,666,170,28)}{T(72,832,'無料LIVE講座','h2 ink',45)}{T(72,890,'経験をAIで“売れる知識”に変える90分','body ink',25)}{cta(990)}""",1)
    rows=''.join([f'{card(50,y,650,92,22)}{T(80,y+43,a,"body ink",27)}{T(80,y+78,b,"small ink",17)}' for y,a,b in [(735,'12年分の判断','失敗回避・段取り・指導ノウハウはAIで整理できる'),(847,'現場言語の強み','机上の一般論ではなく、一次情報として価値が出る'),(959,'実績の見せ方','日誌・写真・チェックリストが信頼の証拠になる')]])
    svg('02-proof-video-trust.svg',1120, f"""{T(50,122,'なぜ今、現場経験が','h1 white shadow')}{T(50,188,'AI時代の武器になるのか','h1 yellow shadow',48)}<rect x="55" y="250" width="640" height="400" rx="30" fill="#080c12" opacity=".9" stroke="#82aad8" stroke-opacity=".65" stroke-width="3"/><rect x="88" y="292" width="574" height="316" fill="#0f233e" stroke="#4680d2" stroke-opacity=".6"/><polygon points="335,430 335,510 420,470" fill="#f5f5ee" opacity=".9"/><text x="375" y="636" class="jp small muted" text-anchor="middle">動画 / VSL を後から配置</text>{rows}""",2)
    items=''.join([f'<g>{card(48,y,654,118,24,"#000",.5)}<rect x="48" y="{y}" width="654" height="118" rx="24" fill="none" stroke="#4178be" stroke-opacity=".55" stroke-width="2"/>{T(82,y+72,n,"h2 yellow",42)}{T(158,y+72,txt,"body white",26)}</g>' for y,n,txt in [(250,'01','経験を棚卸しする質問リスト'),(394,'02','AIに渡す現場メモの作り方'),(538,'03','商品化できるテーマの見つけ方'),(682,'04','顔出しなしでも信頼を作るLP骨子'),(826,'05','今日から試せる無料ツール導線')]])
    svg('03-benefits.svg',1120, f"""{T(50,124,'このLIVEで','h1 white shadow')}{T(50,190,'手に入るもの','h1 yellow shadow')}{items}{cta(950,'席だけ先に確保する')}""",3)
    checks=''.join([f'{card(55,y,640,100,22)}<circle cx="105" cy="{y+50}" r="23" fill="#efc41f"/><path d="M94 {y+51}l11 12 16-25" stroke="#0b121e" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>{T(150,y+62,c,"body ink",25)}' for y,c in [(245,'長年の現場経験を次の収入に変えたい'),(371,'AIに興味はあるが、何から始めるか迷う'),(497,'若手に任せきりのDXに不安がある'),(623,'日誌・資料・写真が眠ったままになっている'),(749,'自分の言葉で発信する型がほしい')]])
    svg('04-recommendation.svg',1080, f"""{T(50,122,'こんな方に','h1 white shadow')}{T(50,188,'おすすめです','h1 yellow shadow')}{checks}<text x="375" y="950" class="jp body muted" text-anchor="middle">派手な煽りではなく、実務に落ちる内容です。</text>""",4)
    steps=''
    for i,(y,s,tit) in enumerate([(250,'STEP 1','現場経験を資産として言語化'),(418,'STEP 2','AIに渡す素材とNG入力を整理'),(586,'STEP 3','売れるテーマを3つに絞る'),(754,'STEP 4','LP・動画・LINE導線の設計'),(922,'STEP 5','7日間の実践プランを作成')]):
        steps+=f'<rect x="92" y="{y}" width="586" height="112" rx="24" fill="#0c1420" opacity=".86" stroke="#5082c8" stroke-opacity=".65" stroke-width="2"/>{T(120,y+52,s,"h3 yellow",30)}{T(120,y+94,tit,"body white",25)}'
        if i<4: steps+=f'<path d="M375 {y+118}v28" stroke="#efc41f" stroke-width="5"/><path d="M363 {y+145}h24l-12 21z" fill="#efc41f"/>'
    svg('05-workflow.svg',1190, f"""{T(50,122,'当日の流れ','h1 white shadow')}{T(50,188,'90分で地図を作る','h1 yellow shadow',48)}{steps}{cta(1030,'LIVEの席を確保')}""",5)
    svg('06-speaker-profile.svg',1180, f"""{T(50,122,'登壇者','h1 white shadow')}{T(50,188,'現場×AI 実践ナビゲーター','h2 yellow shadow',39)}{foreman(232,210,1.0)}{card(50,655,650,385,30)}{T(80,750,'佐藤 誠','h1 ink')}{T(80,795,'32年の現場監督 / DX研修講師','body ink',25)}{T(80,870,['建設・製造の現場で安全、品質、工程管理に携わる。','紙の日誌と属人化した判断をAIで整理し、','若手育成と知識の商品化に転用する実践型プログラムを提供。'],'body ink',24,1.45)}<text x="375" y="1105" class="jp small muted" text-anchor="middle">※プロフィール・写真は差し替え前提の仮配置</text>""",6)
    inputs=''.join([f'<rect x="92" y="{520+i*62}" width="566" height="44" rx="12" fill="#fff" stroke="#cdd2da" stroke-width="2"/><text x="112" y="{549+i*62}" class="jp small" fill="#646e7a">{lab}</text>' for i,lab in enumerate(['お名前','メールアドレス','参加希望日'])])
    svg('07-final-cta-form.svg',1220, f"""<rect width="750" height="1220" fill="#000" opacity=".35"/>{T(50,128,'経験は、','h1 white shadow')}{T(50,198,'まだ終わっていない。','h1 yellow shadow',50)}{T(50,276,['AIを味方につけて、あなたの12年を','次の資産に変えよう。'],'h3 white shadow',31,1.45)}{card(50,410,650,315,28)}<text x="375" y="475" class="jp h2 ink" text-anchor="middle">無料LIVE予約フォーム</text>{inputs}{cta(800,'無料で参加する')}<text x="375" y="1015" class="jp body muted" text-anchor="middle">登録後、視聴URLをメールでお送りします。</text><text x="375" y="1060" class="jp body muted" text-anchor="middle">いつでも解除できます。</text><text x="375" y="1140" class="jp small muted" text-anchor="middle">プライバシーポリシー / 特商法リンク配置エリア</text>""",7)
    full_parts=[]; y=0
    for file,h in [('01-first-view.svg',1260),('02-proof-video-trust.svg',1120),('03-benefits.svg',1120),('04-recommendation.svg',1080),('05-workflow.svg',1190),('06-speaker-profile.svg',1180),('07-final-cta-form.svg',1220)]:
        full_parts.append(f'<image href="{file}" x="0" y="{y}" width="750" height="{h}"/>'); y+=h
    (OUT/'00-mobile-lp-full-preview.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="750" height="{y}" viewBox="0 0 750 {y}">'+''.join(full_parts)+'</svg>',encoding='utf-8')
    readme = """# Mobile LP image assets

Reference tone: dark industrial DX/AI visual, deep navy background, white/yellow distressed headline emphasis, readable mobile-first blocks, and CTA/form/video zones that can later be overlaid with HTML.

The supplied LP structure was a template without filled campaign details, so these images use a provisional campaign based on the reference creative: **無料LIVE予約 for 50代のDX / AI活用**. Replace copy and profile details as needed before final production.

## Generated sections

| Section | File | Intended HTML overlay zone |
|---|---|---|
| 1. ファーストビュー | `01-first-view.svg` | CTA button area near lower third |
| 2. 証明 / 実績 / 動画 / 信頼 | `02-proof-video-trust.svg` | Video slot centered in the upper half |
| 3. ベネフィット / 得られるもの | `03-benefits.svg` | CTA button area near bottom |
| 4. こんな人におすすめ | `04-recommendation.svg` | Static reading section |
| 5. 流れ / ワークフロー / 違い | `05-workflow.svg` | CTA button area near bottom |
| 6. 登壇者 / サービス紹介 | `06-speaker-profile.svg` | Profile/photo replacement area |
| 7. 最終CTA | `07-final-cta-form.svg` | Form inputs, CTA button, footer links |
| Full preview | `00-mobile-lp-full-preview.svg` | Visual QA only |

## Design system

- Canvas width: 750px mobile LP slices.
- Colors: deep navy/black base, steel blue glow, paper white cards, caution yellow CTA/highlights.
- Typography intent: bold Japanese Gothic headline treatment with strong contrast and system Japanese font fallbacks.
- Slices are designed to stack vertically in filename order as one continuous smartphone LP.
"""
    (OUT/'README.md').write_text(readme, encoding='utf-8')
    print('Generated:')
    for p in ['00-mobile-lp-full-preview.svg','01-first-view.svg','02-proof-video-trust.svg','03-benefits.svg','04-recommendation.svg','05-workflow.svg','06-speaker-profile.svg','07-final-cta-form.svg','README.md']:
        print(f'assets/mobile-lp/{p}')

if __name__ == '__main__': make()
