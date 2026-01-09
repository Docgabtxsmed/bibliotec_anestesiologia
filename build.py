from pathlib import Path
import re
import markdown

SRC = Path("content")
TPL = Path("templates/resumo.html").read_text(encoding="utf-8")
OUT = Path("dist")
OUT.mkdir(exist_ok=True)

def _fix_relative_urls(html, prefix="../"):
    def repl(match):
        attr = match.group(1)
        url = match.group(2)
        if url.startswith(("#", "/", "../", "http://", "https://", "mailto:", "tel:")):
            return f'{attr}="{url}"'
        return f'{attr}="{prefix}{url}"'
    return re.sub(r'(src|href)="([^"]+)"', repl, html)

for md_file in SRC.glob("*.md"):
    html = markdown.markdown(md_file.read_text(encoding="utf-8"), extensions=["tables"])
    html = _fix_relative_urls(html)
    page = TPL.replace("{{content}}", html)
    out_file = OUT / f"{md_file.stem}.html"
    out_file.write_text(page, encoding="utf-8")
    print("Gerado:", out_file)
