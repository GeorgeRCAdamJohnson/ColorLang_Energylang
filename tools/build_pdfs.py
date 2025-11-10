import os
import sys
from pathlib import Path
from datetime import datetime, UTC

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.styles import ParagraphStyle
import markdown as md


WATERMARK_TEXT = os.environ.get(
    "PDF_WATERMARK",
    "CONFIDENTIAL — DRAFT — Not for Distribution"
)


def draw_watermark(c: canvas.Canvas, text: str):
    c.saveState()
    c.setFillGray(0.85)
    c.setFont("Helvetica-Bold", 44)
    width, height = LETTER
    c.translate(width/2, height/2)
    c.rotate(45)
    c.drawCentredString(0, 0, text)
    c.restoreState()


def md_to_flowables(markdown_text: str):
    # Convert Markdown to simple HTML, then feed as Paragraphs.
    # Keep it robust and simple to avoid external binaries.
    html = md.markdown(markdown_text)
    styles = getSampleStyleSheet()
    body = ParagraphStyle(
        name="Body",
        parent=styles["BodyText"],
        alignment=TA_LEFT,
        fontName="Helvetica",
        fontSize=10,
        leading=14,
    )
    title = ParagraphStyle(
        name="Title",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
    )

    # Naive split: treat block-level tags as sections
    # This is intentionally simple; for richer layout, add proper HTML parsing.
    flow = []
    # Add generated-on banner
    ts = datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC")
    flow.append(Paragraph(f"Generated: {ts}", body))
    flow.append(Spacer(1, 0.2 * inch))

    # Break on <h1>.. and other headings to style them slightly larger
    # Simple replacements to help Paragraph rendering
    html = html.replace("<h1>", "<h1 style='font-size:16px'><b>").replace("</h1>", "</b></h1>")
    html = html.replace("<h2>", "<h2 style='font-size:14px'><b>").replace("</h2>", "</b></h2>")

    # Split into paragraphs on block tags we care about
    blocks = html.replace("</p>", "</p>\n").split("\n")
    for block in blocks:
        b = block.strip()
        if not b:
            continue
        # Minimal mapping: feed as Paragraph
        style = body
        if b.startswith("<h1") or b.startswith("<h2"):
            style = title
        flow.append(Paragraph(b, style))
        flow.append(Spacer(1, 0.12 * inch))
    return flow


def build_pdf(md_path: Path, out_dir: Path):
    out_dir.mkdir(parents=True, exist_ok=True)
    pdf_path = out_dir / (md_path.stem + ".pdf")
    content = md_path.read_text(encoding="utf-8")

    # Create doc
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=LETTER,
        leftMargin=0.9 * inch,
        rightMargin=0.9 * inch,
        topMargin=0.9 * inch,
        bottomMargin=0.9 * inch,
        title=md_path.stem,
        author="ColorLang Project",
    )

    flow = md_to_flowables(content)

    def on_page(c: canvas.Canvas, _doc):
        draw_watermark(c, WATERMARK_TEXT)

    doc.build(flow, onFirstPage=on_page, onLaterPages=on_page)
    return pdf_path


def main():
    if len(sys.argv) < 2:
        print("Usage: python tools/build_pdfs.py <file1.md> [file2.md ...]")
        sys.exit(2)
    out_dir = Path("thesis") / "pdf"
    out_dir.mkdir(parents=True, exist_ok=True)
    for arg in sys.argv[1:]:
        p = Path(arg)
        if not p.exists():
            print(f"Skipping missing file: {p}")
            continue
        out = build_pdf(p, out_dir)
        print(f"Wrote: {out}")


if __name__ == "__main__":
    main()
