#!/usr/bin/env python3
"""Génère le PDF détaillé de soutenance via HTML + Playwright (accents FR)."""

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_MD = ROOT / "docs" / "SOUTENANCE_SCRIPTS_ORAUX.md"
CONTENT_PY = Path(__file__).resolve()  # sections in generate-soutenance-pdf.py
OUTPUT_HTML = ROOT / "docs" / "SOUTENANCE_DETAILLEE_SCRIPTS.html"
OUTPUT_PDF = ROOT / "docs" / "SOUTENANCE_DETAILLEE_SCRIPTS.pdf"

# Import sections from sibling script
import importlib.util

_spec = importlib.util.spec_from_file_location("pdf_data", ROOT / "scripts" / "generate-soutenance-pdf.py")
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
SECTIONS = _mod.SECTIONS
JURY_QA = _mod.JURY_QA

CSS = """
@page { size: A4; margin: 18mm 16mm; }
* { box-sizing: border-box; }
body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 10.5pt;
  line-height: 1.55;
  color: #1e293b;
  max-width: 100%;
}
.cover {
  text-align: center;
  padding: 40px 0 30px;
  border-bottom: 3px solid #0A66C2;
  margin-bottom: 28px;
}
.cover h1 { color: #0A66C2; font-size: 26pt; margin: 0 0 8px; }
.cover h2 { font-size: 13pt; font-weight: 500; color: #475569; margin: 0; }
.cover .meta { margin-top: 24px; font-size: 10pt; color: #64748b; }
.slide {
  page-break-before: always;
  padding-top: 8px;
}
.slide:first-of-type { page-break-before: avoid; }
.slide-header {
  border-left: 4px solid #0A66C2;
  padding-left: 12px;
  margin-bottom: 16px;
}
.slide-header h2 { margin: 0; color: #0A66C2; font-size: 14pt; }
.slide-header .duration {
  font-size: 9pt;
  color: #64748b;
  margin-top: 4px;
}
h3 {
  font-size: 10.5pt;
  color: #0A66C2;
  margin: 18px 0 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
ul { margin: 0 0 12px; padding-left: 20px; }
li { margin-bottom: 5px; }
.script {
  background: #f0f7ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  padding: 14px 16px;
  font-style: italic;
  white-space: pre-wrap;
  font-size: 10pt;
  line-height: 1.6;
}
.demo {
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 6px;
  padding: 10px 14px;
  font-size: 9.5pt;
  margin-bottom: 12px;
}
.demo strong { color: #b45309; }
.annexe { page-break-before: always; }
.qa-item { margin-bottom: 18px; }
.qa-item .q { font-weight: 600; color: #0A66C2; margin-bottom: 4px; }
.qa-item .a { margin: 0; }
.footer-note {
  margin-top: 40px;
  font-size: 8.5pt;
  color: #94a3b8;
  text-align: center;
}
@media print {
  .slide { page-break-inside: avoid; }
}
"""


def build_html() -> str:
    parts = [
        "<!DOCTYPE html><html lang='fr'><head><meta charset='utf-8'>",
        f"<title>Soutenance PatentIQ — Guide détaillé</title><style>{CSS}</style></head><body>",
        "<div class='cover'>",
        "<h1>PatentIQ</h1>",
        "<h2>Guide de soutenance détaillé<br>Contenu approfondi + scripts oraux</h2>",
        "<div class='meta'>",
        "<p><strong>[Prénom NOM]</strong> — Stage I2PA — [Dates]<br>",
        "Durée cible : 15–18 min (slides) + 5 min démo optionnelle + questions<br>",
        "Associé : SOUTENANCE_PATENTIQ_SCRIPTS.pptx · RAPPORT_DE_STAGE_COMPLET.md</p>",
        "</div></div>",
        "<h3>Timing récapitulatif</h3><ul>",
        "<li>Intro + contexte (slides 1–4) : ~4 min</li>",
        "<li>Objectifs + méthode + architecture (5–8) : ~5 min</li>",
        "<li>4 piliers + cycles (9–13) : ~7 min</li>",
        "<li>Avancé + sécurité + tests + bilan (14–18) : ~4 min</li>",
        "<li>Conclusion + questions (19–21) : ~2 min</li>",
        "<li>Démo live optionnelle : +5 min</li>",
        "</ul>",
    ]

    for sec in SECTIONS:
        parts.append("<div class='slide'>")
        parts.append("<div class='slide-header'>")
        parts.append(f"<h2>Slide {sec['num']} — {html.escape(sec['title'])}</h2>")
        parts.append(f"<div class='duration'>Durée conseillée : {html.escape(sec['duration'])}</div>")
        parts.append("</div>")

        if sec.get("demo"):
            parts.append(f"<div class='demo'><strong>Démo :</strong> {html.escape(sec['demo'])}</div>")

        parts.append("<h3>Contenu détaillé</h3><ul>")
        for item in sec["content"]:
            parts.append(f"<li>{html.escape(item)}</li>")
        parts.append("</ul>")

        parts.append("<h3>Script oral</h3>")
        parts.append(f"<div class='script'>{html.escape(sec['script'])}</div>")
        parts.append("</div>")

    parts.append("<div class='annexe'>")
    parts.append("<h2 style='color:#0A66C2'>Annexe A — Banque de réponses au jury</h2>")
    for q, a in JURY_QA:
        parts.append("<div class='qa-item'>")
        parts.append(f"<p class='q'>Q : {html.escape(q)}</p>")
        parts.append(f"<p class='a'>R : {html.escape(a)}</p>")
        parts.append("</div>")

    parts.append("<h2 style='color:#0A66C2; margin-top:28px'>Annexe B — Checklist jour J (démo)</h2><ul>")
    checklist = [
        "Terminal 1 : npm run dev",
        "Terminal 2 : npm run ai:worker:loop",
        ".env.local : SUPABASE, EPO_OPS, HUGGINGFACE, OMPIC_SEARCH_MODE=hybrid",
        "Comptes porteur + CPI : emails confirmés",
        "2 projets prêts : 1 marque, 1 brevet",
        "Guide : docs/DEMO_ENCADRANTE.md",
    ]
    for item in checklist:
        parts.append(f"<li>{html.escape(item)}</li>")
    parts.append("</ul></div>")

    parts.append("<p class='footer-note'>PatentIQ / I2PA — Document généré pour la soutenance de stage</p>")
    parts.append("</body></html>")
    return "".join(parts)


def main():
    html_content = build_html()
    OUTPUT_HTML.write_text(html_content, encoding="utf-8")
    print(f"HTML généré : {OUTPUT_HTML}")

    try:
        import subprocess

        subprocess.run(
            ["node", str(ROOT / "scripts" / "html-to-pdf.mjs")],
            check=True,
            cwd=str(ROOT),
        )
        print(f"PDF genere : {OUTPUT_PDF}")
    except Exception as e:
        print(f"PDF non genere ({e}). Ouvrez {OUTPUT_HTML} dans Chrome > Imprimer > PDF.")


if __name__ == "__main__":
    main()
