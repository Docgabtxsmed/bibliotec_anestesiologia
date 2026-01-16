import os
import re
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

NOTION_TOKEN = os.getenv("NOTION_TOKEN")
DATABASE_ID = (os.getenv("NOTION_DATABASE_ID") or "").strip()
DATABASE_ID = DATABASE_ID.split("?")[0].split("&")[0].strip()
DATABASE_ID = DATABASE_ID.replace("-", "")
TITLE_PROP = os.getenv("NOTION_TITLE_PROPERTY", "Título")
NOTION_VERSION = "2022-06-28"

if not NOTION_TOKEN or not DATABASE_ID:
    raise SystemExit("Faltou NOTION_TOKEN ou NOTION_DATABASE_ID no arquivo .env")

HEADERS = {
    "Authorization": f"Bearer {NOTION_TOKEN}",
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
}

OUT_DIR = Path("content/notion")
OUT_DIR.mkdir(parents=True, exist_ok=True)

def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-{2,}", "-", text).strip("-") or "resumo"

def notion_query_by_title(title: str) -> dict:
    url = f"https://api.notion.com/v1/databases/{DATABASE_ID}/query"
    payload = {
        "filter": {
            "property": TITLE_PROP,
            "title": {"equals": title}
        }
    }
    r = requests.post(url, headers=HEADERS, json=payload, timeout=60)
    r.raise_for_status()
    data = r.json()
    if not data.get("results"):
        raise SystemExit(f"Não achei uma página com {TITLE_PROP} = '{title}'.")
    return data["results"][0]  # pega a primeira

def fetch_block_children(block_id: str) -> list:
    all_blocks = []
    next_cursor = None

    while True:
        url = f"https://api.notion.com/v1/blocks/{block_id}/children"
        params = {"page_size": 100}
        if next_cursor:
            params["start_cursor"] = next_cursor

        r = requests.get(url, headers=HEADERS, params=params, timeout=60)
        r.raise_for_status()
        data = r.json()

        all_blocks.extend(data.get("results", []))
        if data.get("has_more"):
            next_cursor = data.get("next_cursor")
        else:
            break

    return all_blocks

def rich_text_to_plain(rt) -> str:
    # rt é uma lista de objetos rich_text
    return "".join(x.get("plain_text", "") for x in rt or [])

def blocks_to_simple_markdown(blocks: list) -> str:
    """
    Export “simples” para Markdown.
    Não é perfeito, mas é suficiente para o Codex ler e converter em HTML no seu template.
    """
    lines = []

    for b in blocks:
        t = b.get("type")
        obj = b.get(t, {})

        if t in ("heading_1", "heading_2", "heading_3"):
            text = rich_text_to_plain(obj.get("rich_text"))
            if not text.strip():
                continue
            prefix = {"heading_1": "# ", "heading_2": "## ", "heading_3": "### "}[t]
            lines.append(prefix + text)

        elif t == "paragraph":
            text = rich_text_to_plain(obj.get("rich_text"))
            if text.strip():
                lines.append(text)

        elif t == "bulleted_list_item":
            text = rich_text_to_plain(obj.get("rich_text"))
            if text.strip():
                lines.append(f"- {text}")

        elif t == "numbered_list_item":
            text = rich_text_to_plain(obj.get("rich_text"))
            if text.strip():
                lines.append(f"1. {text}")

        elif t == "to_do":
            text = rich_text_to_plain(obj.get("rich_text"))
            checked = obj.get("checked", False)
            box = "[x]" if checked else "[ ]"
            if text.strip():
                lines.append(f"- {box} {text}")

        elif t == "quote":
            text = rich_text_to_plain(obj.get("rich_text"))
            if text.strip():
                lines.append(f"> {text}")

        elif t == "divider":
            lines.append("---")

        # Se aparecer algo diferente, a gente ignora para manter simples.
        # Depois dá para melhorar.

    return "\n".join(lines).strip() + "\n"

def main():
    import sys
    if len(sys.argv) < 2:
        raise SystemExit('Uso: python scripts/notion_export.py "Título do Resumo"')

    title = sys.argv[1]
    page = notion_query_by_title(title)
    page_id = page["id"]

    blocks = fetch_block_children(page_id)

    # salva JSON bruto (útil se quiser evoluir depois)
    slug = slugify(title)
    json_path = OUT_DIR / f"{slug}.json"
    json_path.write_text(json.dumps(blocks, ensure_ascii=False, indent=2), encoding="utf-8")

    # salva um markdown “simples”
    md = blocks_to_simple_markdown(blocks)
    md_path = OUT_DIR / f"{slug}.md"
    md_path.write_text(md, encoding="utf-8")

    print(f"OK! Exportado:")
    print(f"- {md_path}")
    print(f"- {json_path}")

if __name__ == "__main__":
    main()

