import re
import unicodedata
from pathlib import Path

# -----------------------------
# Helpers (bem simples)
# -----------------------------
def slugify(text: str) -> str:
    text = text.strip().lower()
    text = unicodedata.normalize("NFKD", text)
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9]+", "-", text)
    text = re.sub(r"-{2,}", "-", text).strip("-")
    return text or "resumo"

def html_escape(s: str) -> str:
    return (s.replace("&", "&amp;")
             .replace("<", "&lt;")
             .replace(">", "&gt;"))

def inline_format(s: str) -> str:
    # escape
    s = html_escape(s)
    # **negrito**
    s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
    # *itálico*
    s = re.sub(r"(?<!\*)\*(?!\s)(.+?)(?<!\s)\*(?!\*)", r"<em>\1</em>", s)
    return s

# -----------------------------
# Markdown simples -> HTML no seu padrão
# - headings viram sections
# - listas viram ul.bullet-list-dots
# - --- vira hr.divider
# - boxes ✅ ⚠️ ❗: título + conteúdo inteiro dentro
# -----------------------------
BOX_MAP = {
    "✅": "success",
    "⚠️": "warning",
    "❗": "danger",
    "ℹ️": "info",
}

def md_to_sections(md: str):
    lines = md.splitlines()

    sections = []
    current = None
    current_buf = []

    def flush_current():
        nonlocal current, current_buf
        if current:
            current["html"] = current_buf[:]
            sections.append(current)
        current = None
        current_buf = []

    def start_section(title: str):
        nonlocal current, current_buf
        flush_current()
        current = {"title": title, "id": slugify(title), "html": []}
        current_buf = []

    # list handling (normal e dentro do box)
    def start_ul(buf):
        buf.append('<ul class="bullet-list-dots">')

    def end_ul(buf):
        buf.append("</ul>")

    in_ul = False

    # box state
    in_box = False
    box_kind = None
    box_buf = []   # conteúdo do box

    def flush_ul_if_needed(buf):
        nonlocal in_ul
        if in_ul:
            end_ul(buf)
            in_ul = False

    def flush_box():
        nonlocal in_box, box_kind, box_buf, current_buf, in_ul
        if not in_box:
            return
        # fecha lista dentro do box se aberta
        flush_ul_if_needed(box_buf)
        current_buf.append(f'<aside class="highlight-box {box_kind}" role="note">')
        current_buf.extend("  " + x for x in box_buf)
        current_buf.append("</aside>")
        in_box = False
        box_kind = None
        box_buf = []

    # iniciar seção padrão se não houver H2 no markdown
    start_section("Resumo")

    for raw in lines:
        line = raw.rstrip()

        if not line.strip():
            # linha vazia: fecha lista (no buffer correto), mas mantém box aberto
            if in_box:
                flush_ul_if_needed(box_buf)
            else:
                flush_ul_if_needed(current_buf)
            continue

        if line.strip() == "---":
            flush_box()
            flush_ul_if_needed(current_buf)
            current_buf.append('<hr class="divider">')
            continue

        # heading 1/2/3
        if line.startswith("# "):
            # se tiver H1 no md, vira título geral, mas nós já usamos H1 do template.
            # então tratamos como uma section grande
            flush_box()
            start_section(line[2:].strip())
            continue

        if line.startswith("## "):
            flush_box()
            start_section(line[3:].strip())
            continue

        if line.startswith("### "):
            flush_box()
            flush_ul_if_needed(current_buf)
            current_buf.append(f"<h3>{inline_format(line[4:].strip())}</h3>")
            continue

        # BOX start? (linha começa com ✅/⚠️/❗/ℹ️)
        first_char = line.strip()[0]
        if first_char in BOX_MAP and line.strip().startswith(first_char):
            # fecha box anterior
            flush_box()

            in_box = True
            box_kind = BOX_MAP[first_char]
            box_buf = []
            # título do box: somente a linha inteira
            box_title = line.strip()
            box_buf.append(f"<p><strong>{inline_format(box_title)}</strong></p>")
            continue

        # bullets "- " ou "1. "
        m_bullet = re.match(r"^\s*-\s+(.*)$", line)
        m_num = re.match(r"^\s*\d+\.\s+(.*)$", line)

        target_buf = box_buf if in_box else current_buf

        if m_bullet:
            item = m_bullet.group(1).strip()
            if not in_ul:
                start_ul(target_buf)
                in_ul = True
            target_buf.append(f"<li>{inline_format(item)}</li>")
            continue

        if m_num:
            item = m_num.group(1).strip()
            if not in_ul:
                start_ul(target_buf)
                in_ul = True
            target_buf.append(f"<li>{inline_format(item)}</li>")
            continue

        # fallback: parágrafo
        if in_box:
            flush_ul_if_needed(box_buf)
            box_buf.append(f"<p>{inline_format(line.strip())}</p>")
        else:
            flush_ul_if_needed(current_buf)
            current_buf.append(f"<p>{inline_format(line.strip())}</p>")

    # fechar o que ficou aberto
    flush_box()
    flush_ul_if_needed(current_buf)
    flush_current()

    # remover seções vazias geradas por “Resumo” se não tiver conteúdo
    sections = [s for s in sections if s.get("html")]
    return sections

def build_sidebar(sections):
    items = []
    for s in sections:
        items.append(f'            <li><a href="#{s["id"]}">{inline_format(s["title"])}</a></li>')
    return "\n".join(items)

def build_article(sections):
    parts = []
    for s in sections:
        parts.append(f'<section class="section" id="{s["id"]}">')
        parts.append(f'  <h2>{inline_format(s["title"])}</h2>')
        for h in s["html"]:
            parts.append("  " + h)
        parts.append("</section>")
    return "\n".join(parts)

# -----------------------------
# Encaixar no template resumos.html
# -----------------------------
def inject_into_template(template_html: str, title: str, subtitle: str, sidebar_items: str, article_html: str):
    html = template_html

    # Título da página (tag <title>)
    html = re.sub(r"<title>.*?</title>", f"<title>{inline_format(title)}</title>", html, flags=re.DOTALL)

    # H1 do conteúdo
    html = re.sub(
        r'(<h1[^>]*class="content-title"[^>]*>)(.*?)(</h1>)',
        r"\1" + inline_format(title) + r"\3",
        html,
        flags=re.DOTALL
    )

    # subtítulo (se existir)
    html = re.sub(
        r'(<p[^>]*class="content-subtitle"[^>]*>)(.*?)(</p>)',
        r"\1" + inline_format(subtitle) + r"\3",
        html,
        flags=re.DOTALL
    )

    # sidebar nav list
    html = re.sub(
        r'(<ul[^>]*class="sidebar-nav"[^>]*>)(.*?)(</ul>)',
        r"\1\n" + sidebar_items + r"\n          \3",
        html,
        flags=re.DOTALL
    )

    # article content
    html = re.sub(
        r'(<article\b[^>]*>)(.*?)(</article>)',
        r"\1\n" + article_html + r"\n        \3",
        html,
        flags=re.DOTALL
    )

    return html

def set_paths_and_backlinks(html: str, back_href: str, css_href: str, js_src: str, logo_target: str):
    # back-link
    html = re.sub(r'(<a\b[^>]*class="back-link"[^>]*href=")[^"]*(")',
                  r"\1" + back_href + r"\2", html)
    html = re.sub(r'(<a\b[^>]*href=")[^"]*("(?=[^>]*class="back-link"))',
                  r"\1" + back_href + r"\2", html)

    # logo onclick/href (suporta ambos)
    html = re.sub(r"(window\.location\.href\s*=\s*')[^']*(')",
                  r"\1" + logo_target + r"\2", html)
    html = re.sub(r'(<a\b[^>]*class="logo"[^>]*href=")[^"]*(")',
                  r"\1" + logo_target + r"\2", html)

    # css/js
    html = re.sub(r'(href=")style-resumo\.css(")', r'\1' + css_href + r'\2', html)
    html = re.sub(r'(src=")script-resumo\.js(")', r'\1' + js_src + r'\2', html)

    return html

# -----------------------------
# Atualizar página HUB (Cardiaca/mitral.html) com card
# -----------------------------
def ensure_card_in_hub(hub_path: Path, card_href: str, title: str):
    hub = hub_path.read_text(encoding="utf-8")

    if card_href in hub:
        # já existe
        return False, hub

    card_html = f"""
            <!-- Card: {html_escape(title)} -->
            <article class="component-card" onclick="window.location.href='{card_href}'">
                <div class="card-thumbnail" style="background: linear-gradient(135deg, #3059ef 0%, #36c8e0 100%);">
                    🫀
                </div>
                <div class="card-info">
                    <h3 class="card-title">{html_escape(title)}</h3>
                    <p class="card-description">Resumo didático: definição, fisiopatologia, achados no eco e manejo perioperatório.</p>
                    <div class="card-tags">
                        <span class="tag">Mitral</span>
                        <span class="tag">LVOT</span>
                        <span class="tag">IM</span>
                    </div>
                </div>
            </article>
"""

    # Tentativa 1: inserir antes do fechamento de um container comum de cards (se existir)
    # Você pode criar um marcador fixo no hub (melhor): <!-- AUTO-CARDS -->
    if "<!-- AUTO-CARDS -->" in hub:
        hub = hub.replace("<!-- AUTO-CARDS -->", "<!-- AUTO-CARDS -->" + card_html)
        return True, hub

    # Tentativa 2: inserir antes de </main> (funciona na maioria dos hubs)
    hub = hub.replace("</main>", card_html + "\n</main>")
    return True, hub

# -----------------------------
# MAIN
# -----------------------------
def main():
    import sys

    if len(sys.argv) < 2:
        raise SystemExit('Uso: python scripts/publish_resumo.py "TITULO DO RESUMO"')

    page_title = sys.argv[1]
    slug = slugify(page_title)

    md_path = Path("content/notion") / f"{slug}.md"
    if not md_path.exists():
        raise SystemExit(f"Não achei o arquivo {md_path}. Primeiro rode: python scripts/notion_export.py \"{page_title}\"")

    template_path = Path("resumos.html")
    if not template_path.exists():
        raise SystemExit("Não achei resumos.html na raiz do projeto.")

    template_html = template_path.read_text(encoding="utf-8")
    md = md_path.read_text(encoding="utf-8")

    sections = md_to_sections(md)
    sidebar_items = build_sidebar(sections)
    article_html = build_article(sections)

    subtitle = "Resumo didático para revisão rápida."
    final_html = inject_into_template(template_html, page_title, subtitle, sidebar_items, article_html)

    # Saída: resumos/cardiaca/<slug>.html
    out_dir = Path("resumos/cardiaca")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"{slug}.html"

    # Paths e navegação (porque está em resumos/cardiaca/)
    final_html = set_paths_and_backlinks(
        final_html,
        back_href="../../Cardiaca/mitral.html",
        css_href="../../style-resumo.css",
        js_src="../../script-resumo.js",
        logo_target="../../Cardiaca/mitral.html",
    )

    out_path.write_text(final_html, encoding="utf-8")
    print(f"OK: gerado {out_path}")

    # Atualizar hub: Cardiaca/mitral.html
    hub_path = Path("Cardiaca/mitral.html")
    if hub_path.exists():
        # do hub (Cardiaca/) para o resumo (resumos/cardiaca/) => ../resumos/cardiaca/<slug>.html
        card_href = f"../resumos/cardiaca/{slug}.html"
        changed, new_hub = ensure_card_in_hub(hub_path, card_href, "SAM – Movimento Anterior Sistólico (Mitral)")
        if changed:
            hub_path.write_text(new_hub, encoding="utf-8")
            print("OK: mitral.html atualizado com card")
        else:
            print("OK: card já existia em mitral.html")
    else:
        print("ATENÇÃO: não achei Cardiaca/mitral.html (pulando criação do card).")

if __name__ == "__main__":
    main()
