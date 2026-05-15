from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.platypus.flowables import Flowable
from reportlab.lib.colors import HexColor

# ── Palette ──────────────────────────────────────────────────────────────────
NAVY      = HexColor("#0F172A")
INDIGO    = HexColor("#4F46E5")
INDIGO_LT = HexColor("#818CF8")
SLATE     = HexColor("#334155")
SLATE_LT  = HexColor("#64748B")
MUTED     = HexColor("#94A3B8")
BG_CARD   = HexColor("#F1F5F9")
BG_PAGE   = HexColor("#FFFFFF")
HARSH_CLR = HexColor("#0EA5E9")   # sky-500  – Full Stack
PRANAV_CLR= HexColor("#8B5CF6")   # violet-500 – AIML
SHARED_CLR= HexColor("#10B981")   # emerald-500 – Shared
ACCENT    = HexColor("#F59E0B")    # amber
WHITE     = colors.white

PAGE_W, PAGE_H = A4
MARGIN = 18 * mm

# ── Helper: coloured side-bar card ───────────────────────────────────────────
class SideBar(Flowable):
    def __init__(self, w, h, bar_color, bg_color=BG_CARD, radius=4):
        Flowable.__init__(self)
        self.w, self.h = w, h
        self.bar_color = bar_color
        self.bg_color  = bg_color
        self.radius    = radius

    def draw(self):
        c = self.canv
        c.setFillColor(self.bg_color)
        c.roundRect(0, 0, self.w, self.h, self.radius, fill=1, stroke=0)
        c.setFillColor(self.bar_color)
        c.roundRect(0, 0, 4, self.h, 2, fill=1, stroke=0)

# ── Document Setup ────────────────────────────────────────────────────────────
doc = SimpleDocTemplate(
    "MVP_Architecture_Roadmap.pdf",
    pagesize=A4,
    leftMargin=MARGIN, rightMargin=MARGIN,
    topMargin=14*mm, bottomMargin=14*mm,
)

styles = getSampleStyleSheet()
W = PAGE_W - 2 * MARGIN  # usable width

def style(name, **kw):
    base = styles[name]
    return ParagraphStyle(name + "_custom", parent=base, **kw)

# Custom paragraph styles
S = {
    "cover_tag" : style("Normal",   fontSize=10, textColor=INDIGO_LT,  spaceAfter=4,  leading=14),
    "cover_title": style("Title",   fontSize=30, textColor=WHITE,       spaceAfter=6,  leading=36, fontName="Helvetica-Bold"),
    "cover_sub"  : style("Normal",  fontSize=13, textColor=HexColor("#CBD5E1"), spaceAfter=4, leading=18),
    "cover_meta" : style("Normal",  fontSize=10, textColor=MUTED,       spaceAfter=2,  leading=14),

    "h1"  : style("Heading1", fontSize=16, textColor=NAVY,    spaceBefore=16, spaceAfter=6,  fontName="Helvetica-Bold", leading=20),
    "h2"  : style("Heading2", fontSize=12, textColor=INDIGO,  spaceBefore=12, spaceAfter=4,  fontName="Helvetica-Bold", leading=16),
    "h3"  : style("Heading3", fontSize=10, textColor=SLATE,   spaceBefore=8,  spaceAfter=3,  fontName="Helvetica-Bold", leading=14),
    "body": style("Normal",   fontSize=9.5,textColor=SLATE,   spaceAfter=5,   leading=15),
    "mono": style("Code",     fontSize=8.5,textColor=NAVY,    spaceAfter=4,   leading=13, fontName="Courier", backColor=BG_CARD, leftIndent=8),
    "label":style("Normal",   fontSize=8,  textColor=SLATE_LT,spaceAfter=2,   leading=12, fontName="Helvetica-Oblique"),
    "tag_h": style("Normal",  fontSize=8,  textColor=WHITE,   spaceAfter=0,   leading=11, fontName="Helvetica-Bold"),
    "caption": style("Normal",fontSize=8,  textColor=MUTED,   spaceAfter=2,   leading=12, fontName="Helvetica-Oblique"),
    "bullet": style("Normal", fontSize=9.5,textColor=SLATE,   spaceAfter=3,   leading=14, leftIndent=12, bulletIndent=0),
}

def H1(txt): return Paragraph(txt, S["h1"])
def H2(txt): return Paragraph(txt, S["h2"])
def H3(txt): return Paragraph(txt, S["h3"])
def P(txt):  return Paragraph(txt, S["body"])
def SP(h=6): return Spacer(1, h)
def HR(clr=INDIGO, w=0.5): return HRFlowable(width="100%", thickness=w, color=clr, spaceAfter=4, spaceBefore=4)

def Bullet(items, color=INDIGO):
    rows = []
    for item in items:
        rows.append([
            Paragraph(f'<font color="#{color.hexval()[2:]}">▸</font>', S["body"]),
            Paragraph(item, S["body"])
        ])
    t = Table(rows, colWidths=[12, W-12])
    t.setStyle(TableStyle([("VALIGN", (0,0), (-1,-1), "TOP"), ("LEFTPADDING", (0,0), (-1,-1), 0),
                            ("RIGHTPADDING", (0,0), (-1,-1), 0), ("TOPPADDING", (0,0), (-1,-1), 1),
                            ("BOTTOMPADDING", (0,0), (-1,-1), 1)]))
    return t

def info_card(title, color, items):
    """A coloured-bar card for a layer."""
    content = [Paragraph(f'<font color="#{color.hexval()[2:]}" size="10"><b>{title}</b></font>', S["body"]), SP(3)]
    for item in items:
        content.append(Paragraph(f'<font color="#{SLATE_LT.hexval()[2:]}">›</font>  {item}', S["body"]))
    return KeepTogether(content)

def role_badge(name, role, clr):
    return Table(
        [[Paragraph(f'<b>{name}</b>', S["body"]),
          Paragraph(role, S["label"])]],
        colWidths=[W*0.5-4, W*0.5-4],
        hAlign="LEFT"
    )

# ── Page callbacks ────────────────────────────────────────────────────────────
def cover_page(canvas, doc):
    canvas.saveState()
    # Full navy background
    canvas.setFillColor(NAVY)
    canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # Indigo accent strip at top
    canvas.setFillColor(INDIGO)
    canvas.rect(0, PAGE_H - 10*mm, PAGE_W, 10*mm, fill=1, stroke=0)
    # Bottom amber line
    canvas.setFillColor(ACCENT)
    canvas.rect(0, 0, PAGE_W, 3*mm, fill=1, stroke=0)
    # Subtle diagonal grid lines for texture
    canvas.setStrokeColor(HexColor("#1E293B"))
    canvas.setLineWidth(0.4)
    for i in range(0, int(PAGE_W)+60, 30):
        canvas.line(i, 0, i - 40, PAGE_H)
    canvas.restoreState()

def normal_page(canvas, doc):
    canvas.saveState()
    # Top rule
    canvas.setFillColor(INDIGO)
    canvas.rect(MARGIN, PAGE_H - 11*mm, W, 1.5, fill=1, stroke=0)
    # Page number
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(PAGE_W - MARGIN, 8*mm, f"Page {doc.page}")
    # Footer label
    canvas.drawString(MARGIN, 8*mm, "AI Travel Planner · MVP Architecture & Roadmap")
    # Bottom rule
    canvas.setFillColor(HexColor("#E2E8F0"))
    canvas.rect(MARGIN, 6*mm, W, 0.5, fill=1, stroke=0)
    canvas.restoreState()

# ── Story ─────────────────────────────────────────────────────────────────────
story = []

# ══════════════════════════════════════════════════════════════════════════════
# COVER PAGE
# ══════════════════════════════════════════════════════════════════════════════
story.append(SP(60))
story.append(Paragraph("INTERNAL TECHNICAL DOCUMENT", S["cover_tag"]))
story.append(Paragraph("AI-Assisted Visual<br/>Travel Planner", S["cover_title"]))
story.append(SP(8))
story.append(Paragraph("MVP Architecture Deep-Dive &amp; Development Roadmap", S["cover_sub"]))
story.append(SP(16))
story.append(HRFlowable(width="40%", thickness=1.5, color=ACCENT, spaceAfter=16, hAlign="LEFT"))
story.append(Paragraph("Prepared for internal team use · May 2026", S["cover_meta"]))
story.append(SP(4))

team_data = [
    [Paragraph('<font color="#38BDF8"><b>Harsh Depura</b></font>', S["body"]),
     Paragraph('<font color="#C4B5FD"><b>Pranav Rana</b></font>', S["body"])],
    [Paragraph("Full Stack Engineering", S["label"]),
     Paragraph("AI / ML Engineering", S["label"])],
]
tt = Table(team_data, colWidths=[W*0.45, W*0.45], hAlign="LEFT", spaceBefore=6)
tt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (0,-1), HexColor("#0C2340")),
    ("BACKGROUND", (1,0), (1,-1), HexColor("#1E1040")),
    ("TOPPADDING",  (0,0), (-1,-1), 8),
    ("BOTTOMPADDING",(0,0), (-1,-1), 8),
    ("LEFTPADDING", (0,0), (-1,-1), 12),
    ("RIGHTPADDING",(0,0), (-1,-1), 12),
    ("ROUNDEDCORNERS", [6]),
]))
story.append(tt)
story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 1 — SYSTEM OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════
story.append(SP(4))
story.append(H1("1. System Overview"))
story.append(HR())
story.append(P(
    "The MVP is a <b>Retrieval-Augmented Generation (RAG) travel intelligence system</b>. "
    "Rather than relying on a language model to invent itinerary facts from scratch, "
    "the platform grounds every response in a curated internal knowledge base of real "
    "destinations, activities, constraints, and metadata. The LLM's role is limited to "
    "<b>sequencing, timing, and narrative</b> — not fact generation."
))
story.append(SP(6))

overview_data = [
    ["Layer", "Technology", "Responsibility"],
    ["Frontend", "React / Next.js + React Flow", "User input, itinerary graph visualisation"],
    ["API Layer", "Node.js / Express", "Request routing, auth, orchestration"],
    ["Retrieval", "Vector DB + embeddings", "Semantic search over knowledge base"],
    ["Knowledge Base", "PostgreSQL + pgvector", "Curated place/activity records"],
    ["LLM Engine", "OpenAI GPT-4o / 4o-mini", "Structured itinerary generation"],
    ["Scoring Engine", "Custom Node.js logic", "Rank places by optimisation preference"],
]
t = Table(overview_data, colWidths=[W*0.2, W*0.32, W*0.48])
t.setStyle(TableStyle([
    ("BACKGROUND",   (0,0), (-1,0), INDIGO),
    ("TEXTCOLOR",    (0,0), (-1,0), WHITE),
    ("FONTNAME",     (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",     (0,0), (-1,0), 9),
    ("FONTSIZE",     (0,1), (-1,-1), 8.5),
    ("TEXTCOLOR",    (0,1), (-1,-1), SLATE),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_CARD]),
    ("GRID",         (0,0), (-1,-1), 0.4, HexColor("#CBD5E1")),
    ("TOPPADDING",   (0,0), (-1,-1), 6),
    ("BOTTOMPADDING",(0,0), (-1,-1), 6),
    ("LEFTPADDING",  (0,0), (-1,-1), 8),
    ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ("VALIGN",       (0,0), (-1,-1), "MIDDLE"),
]))
story.append(t)

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 2 — ARCHITECTURE DEEP DIVE
# ══════════════════════════════════════════════════════════════════════════════
story.append(SP(10))
story.append(H1("2. Architecture Deep Dive"))
story.append(HR())

# 2.1 Data Layer
story.append(H2("2.1  Data Layer — PostgreSQL + pgvector"))
story.append(P(
    "The primary store is <b>PostgreSQL</b> with the <b>pgvector</b> extension, eliminating the need "
    "for a separate vector database service at MVP scale. Each record in the <i>places</i> table "
    "represents a single destination, activity, stay, or point of interest."
))
story.append(SP(4))
story.append(Paragraph("Core schema — places table:", S["h3"]))
schema_code = [
    "id            UUID PRIMARY KEY",
    "name          TEXT NOT NULL",
    "type          TEXT  -- 'activity' | 'stay' | 'restaurant' | 'transport'",
    "destination   TEXT NOT NULL",
    "coordinates   POINT  -- lat, lng",
    "budget_tier   TEXT  -- 'cheapest' | 'intermediate' | 'luxury'",
    "duration_min  INTEGER  -- estimated visit duration in minutes",
    "best_time     TEXT[]  -- e.g. ['morning', 'evening']",
    "tags          TEXT[]  -- e.g. ['nature', 'family', 'adventure']",
    "notes         TEXT",
    "booking_url   TEXT",
    "embedding     VECTOR(1536)  -- OpenAI text-embedding-3-small",
    "created_at    TIMESTAMPTZ DEFAULT now()",
]
for line in schema_code:
    story.append(Paragraph(line, S["mono"]))
story.append(SP(4))
story.append(Bullet([
    "<b>pgvector index:</b> Use HNSW index type for sub-millisecond ANN search at MVP scale (up to ~500k records).",
    "<b>PostGIS optional:</b> Add PostGIS later for advanced geo-radius filtering; plain POINT is sufficient now.",
    "<b>Embeddings model:</b> text-embedding-3-small (1536-dim) — 5× cheaper than ada-002 with comparable quality.",
    "<b>Curation pipeline:</b> CSV → validation script → bulk INSERT. Build an admin endpoint or Retool dashboard for ongoing additions.",
]))

# 2.2 Retrieval Pipeline
story.append(H2("2.2  Retrieval & Ranking Pipeline"))
story.append(P(
    "This is the core differentiator. The pipeline runs in two stages: "
    "<b>semantic retrieval</b> (vector similarity) followed by <b>structured re-ranking</b> (scoring function). "
    "Only the top-K re-ranked candidates are passed to the LLM."
))
story.append(SP(4))
story.append(H3("Stage 1 — Semantic Retrieval"))
story.append(Bullet([
    "Embed the user query (destination + trip type + preferences) using text-embedding-3-small.",
    "Pre-filter in SQL by hard constraints: <i>destination, budget_tier, tags</i>.",
    "Run cosine similarity ANN search within filtered candidates. Retrieve top 40.",
]))
story.append(SP(4))
story.append(H3("Stage 2 — Scoring & Re-ranking"))
story.append(P("Each candidate receives a composite score:"))
story.append(Paragraph(
    "score = α·sim + β·budget_match + γ·time_fit + δ·geo_proximity + ε·duration_fit",
    S["mono"]
))
story.append(SP(4))
weight_data = [
    ["Optimisation Mode", "α (semantic)", "β (budget)", "γ (time)", "δ (geo)", "ε (duration)"],
    ["Cheapest",          "0.25",         "0.45",       "0.10",     "0.10",    "0.10"],
    ["Intermediate",      "0.35",         "0.25",       "0.15",     "0.15",    "0.10"],
    ["Luxury",            "0.30",         "0.15",       "0.20",     "0.20",    "0.15"],
    ["Time-Efficient",    "0.30",         "0.10",       "0.15",     "0.15",    "0.30"],
    ["Fuel-Efficient",    "0.30",         "0.10",       "0.15",     "0.35",    "0.10"],
]
tw = Table(weight_data, colWidths=[W*0.28] + [W*0.144]*5)
tw.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), SLATE),
    ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 8),
    ("TEXTCOLOR",     (0,1), (-1,-1), SLATE),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_CARD]),
    ("GRID",          (0,0), (-1,-1), 0.4, HexColor("#CBD5E1")),
    ("ALIGN",         (1,0), (-1,-1), "CENTER"),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 6),
]))
story.append(tw)
story.append(Paragraph("Table: Recommended scoring weights per optimisation preference. Make these configurable — do not hard-code.", S["caption"]))

# 2.3 LLM Integration
story.append(H2("2.3  LLM Integration — Structured Output Contract"))
story.append(P(
    "The LLM receives a structured prompt containing: system instructions, user trip parameters, "
    "and the top-K ranked place objects as JSON context. It must respond with a strictly-typed "
    "itinerary JSON object. Use OpenAI's <b>response_format: json_schema</b> to enforce this."
))
story.append(SP(4))
story.append(H3("Output schema (enforced):"))
json_schema = [
    '{',
    '  "days": [',
    '    {',
    '      "day": 1,',
    '      "theme": "Arrival & Old City Exploration",',
    '      "activities": [',
    '        {',
    '          "id": "uuid",',
    '          "name": "Mehrangarh Fort",',
    '          "place_id": "uuid-from-kb",',
    '          "time": "09:00",',
    '          "duration_minutes": 120,',
    '          "budget_tier": "intermediate",',
    '          "notes": "Book tickets online to skip queue",',
    '          "booking_url": "https://..."',
    '        }',
    '      ]',
    '    }',
    '  ],',
    '  "total_estimated_cost": "INR 4,500",',
    '  "optimisation_mode": "intermediate"',
    '}',
]
for line in json_schema:
    story.append(Paragraph(line, S["mono"]))
story.append(SP(4))
story.append(Bullet([
    "<b>Model selection:</b> Use GPT-4o-mini for the structuring step (JSON-compliant, ~10× cheaper). Reserve GPT-4o for edge cases with complex constraints.",
    "<b>System prompt guardrail:</b> Explicitly instruct: <i>'Only reference place_ids provided in context. Never invent locations or facts.'</i>",
    "<b>Fallback:</b> If retrieved candidates < 5 for a given day, prompt the LLM to note limited coverage rather than fabricate.",
    "<b>Latency target:</b> Aim for < 6 s end-to-end. Stream the LLM response to unblock the UI render.",
]))

# 2.4 Backend API
story.append(H2("2.4  Backend API — Node.js / Express"))
story.append(P("The backend exposes a lean REST API and orchestrates the retrieval → ranking → LLM pipeline."))
story.append(SP(4))
api_data = [
    ["Endpoint", "Method", "Description"],
    ["POST /api/itinerary/generate", "POST", "Main pipeline — takes trip params, returns structured itinerary JSON"],
    ["GET  /api/places/search",      "GET",  "Debug endpoint — raw semantic search results for a query"],
    ["POST /api/places",             "POST", "Admin — insert a new place record into the knowledge base"],
    ["GET  /api/places/:id",         "GET",  "Fetch single place record with full metadata"],
    ["POST /api/itinerary/feedback", "POST", "Capture user rating/feedback for a generated itinerary"],
]
ta = Table(api_data, colWidths=[W*0.38, W*0.1, W*0.52])
ta.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), INDIGO),
    ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 8),
    ("FONTNAME",      (0,1), (0,-1), "Courier"),
    ("TEXTCOLOR",     (0,1), (-1,-1), SLATE),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_CARD]),
    ("GRID",          (0,0), (-1,-1), 0.4, HexColor("#CBD5E1")),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
]))
story.append(ta)
story.append(SP(6))
story.append(Bullet([
    "<b>Orchestration flow:</b> validate input → embed query → pgvector ANN search → score & rank → build LLM prompt → stream response → parse + return JSON.",
    "<b>Env config:</b> OPENAI_API_KEY, DATABASE_URL, EMBEDDING_MODEL, RETRIEVAL_TOP_K (default 40), RANKING_TOP_N (default 15) all in .env — never hard-coded.",
    "<b>Error handling:</b> Wrap the LLM call in retry logic (3 attempts, exponential backoff). Return 202 with polling if latency exceeds threshold.",
]))

# 2.5 Frontend
story.append(H2("2.5  Frontend — React / Next.js + React Flow"))
story.append(P(
    "The UI has two distinct screens: a <b>Trip Input Form</b> and an <b>Itinerary Graph View</b>. "
    "React Flow handles the DAG-style day/activity visualisation."
))
story.append(SP(4))
story.append(H3("Trip Input Form — fields:"))
story.append(Bullet([
    "Destination (text + autocomplete from /api/places/destinations)",
    "Trip duration (days)",
    "Trip type (Solo / Couple / Family / Group)",
    "Optimisation preference (Cheapest / Intermediate / Luxury / Time-Efficient / Fuel-Efficient)",
    "Optional: Start date, dietary restrictions, mobility constraints",
]))
story.append(SP(6))
story.append(H3("Itinerary Graph — React Flow design rules:"))
story.append(Bullet([
    "<b>Node types:</b> DayNode (summary card, collapsible) → ActivityNode (place name, time, duration, notes, booking link).",
    "<b>Performance:</b> Collapsed days render as single summary nodes only. Expand on click. Prevents render lag beyond 5-day trips.",
    "<b>State management:</b> Use Zustand. One store for itinerary data, one for UI state (which days expanded, selected activity).",
    "<b>Mobile fallback:</b> React Flow is desktop-first. Render a Timeline List View (vertical accordion) on viewports < 768px.",
    "<b>Streaming UX:</b> Show a progressive skeleton — Day 1 node appears as soon as Day 1 JSON chunk is received. Do not wait for the full response.",
]))

# 2.6 Risks
story.append(H2("2.6  Known Risks & Mitigations"))
story.append(SP(4))
risk_data = [
    ["Risk", "Impact", "Mitigation"],
    ["KB quality bottleneck",       "High",   "Build CSV import script + admin endpoint before launch. Seed 100+ records for 3 pilot destinations."],
    ["LLM output schema drift",     "High",   "Enforce json_schema response format. Add Zod validation on the backend before returning to client."],
    ["Retrieval cold start",        "Medium", "Define fallback: if < 5 candidates, return partial itinerary with 'limited data' flags. Never fabricate."],
    ["React Flow perf on mobile",   "Medium", "Accordion/timeline fallback view. Test on 375px viewport before launch."],
    ["Scoring weight mismatch",     "Medium", "Build a test harness comparing outputs across all 5 modes during Week 4. Adjust weights empirically."],
    ["OpenAI latency > 6s",         "Medium", "Stream LLM response. Show skeleton UI. Add loading copy ('Building your Day 1...')."],
    ["No edit / swap post-gen",     "Low",    "Design itinerary data model to support activity CRUD from day one, even if UI lands post-MVP."],
]
tr = Table(risk_data, colWidths=[W*0.30, W*0.10, W*0.60])
tr.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), SLATE),
    ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 8),
    ("TEXTCOLOR",     (0,1), (-1,-1), SLATE),
    ("ROWBACKGROUNDS",(0,1), (-1,-1), [WHITE, BG_CARD]),
    ("GRID",          (0,0), (-1,-1), 0.4, HexColor("#CBD5E1")),
    ("TOPPADDING",    (0,0), (-1,-1), 5),
    ("BOTTOMPADDING", (0,0), (-1,-1), 5),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("VALIGN",        (0,0), (-1,-1), "TOP"),
    # Colour-code impact
    ("TEXTCOLOR",     (1,1), (1,2), HexColor("#DC2626")),   # High = red
    ("TEXTCOLOR",     (1,3), (1,6), HexColor("#D97706")),   # Medium = amber
    ("TEXTCOLOR",     (1,7), (1,7), HexColor("#16A34A")),   # Low = green
    ("FONTNAME",      (1,1), (1,-1), "Helvetica-Bold"),
]))
story.append(tr)

story.append(PageBreak())

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 3 — WEEKLY ROADMAP
# ══════════════════════════════════════════════════════════════════════════════
story.append(H1("3. Development Roadmap — 8-Week Sprint Plan"))
story.append(HR())
story.append(P(
    "The roadmap is structured over <b>8 weeks</b> with clearly separated ownership. "
    "Work is divided by domain: Full Stack (Harsh Depura) and AIML (Pranav Rana). "
    "Shared milestones are synchronisation points that require both to align before the next phase begins."
))
story.append(SP(6))

# Legend
legend_data = [[
    Paragraph('<font color="#0EA5E9">■</font>  <b>Harsh Depura</b> — Full Stack', S["body"]),
    Paragraph('<font color="#8B5CF6">■</font>  <b>Pranav Rana</b> — AIML', S["body"]),
    Paragraph('<font color="#10B981">■</font>  <b>Shared / Sync Milestone</b>', S["body"]),
]]
lt = Table(legend_data, colWidths=[W/3]*3)
lt.setStyle(TableStyle([
    ("BACKGROUND", (0,0), (-1,-1), BG_CARD),
    ("TOPPADDING",  (0,0), (-1,-1), 7),
    ("BOTTOMPADDING",(0,0), (-1,-1), 7),
    ("LEFTPADDING", (0,0), (-1,-1), 10),
    ("GRID", (0,0), (-1,-1), 0.3, HexColor("#CBD5E1")),
]))
story.append(lt)
story.append(SP(10))

weeks = [
    {
        "num": "Week 1",
        "title": "Project Foundation & Environment Setup",
        "goal": "Both members have identical local dev environments. Schema agreed. Repos initialised.",
        "harsh": [
            "Initialise Next.js + React Flow repo; configure ESLint, Prettier, Tailwind.",
            "Set up Node.js / Express project with TypeScript; configure .env structure.",
            "Design and document the places table schema (coordinate with Pranav).",
            "Set up PostgreSQL locally + install pgvector extension.",
            "Create seed script skeleton for bulk importing place records from CSV.",
        ],
        "pranav": [
            "Set up Python environment: Jupyter, LangChain / LlamaIndex, OpenAI SDK.",
            "Obtain and test OpenAI API key; run first embedding call (text-embedding-3-small).",
            "Research and document pgvector HNSW index configuration + tuning parameters.",
            "Define semantic embedding strategy: what fields to embed, how to compose the embedding string.",
            "Spike: embed 10 test records, run a similarity query, validate results.",
        ],
        "shared": [
            "Agree on place record schema — both must sign off before Week 2.",
            "Define the API contract for POST /api/itinerary/generate (request/response shape).",
            "Set up shared Git repo, branching strategy (main / dev / feature branches), PR rules.",
        ],
    },
    {
        "num": "Week 2",
        "title": "Knowledge Base Build & Embedding Pipeline",
        "goal": "100+ real place records seeded across 3 pilot destinations. Embeddings stored in DB.",
        "harsh": [
            "Build CSV → PostgreSQL import script with data validation (required fields, type checks).",
            "Create admin API endpoint: POST /api/places (with simple API-key auth for internal use).",
            "Implement GET /api/places/:id and GET /api/places/destinations (autocomplete source).",
            "Write integration tests for the import pipeline.",
        ],
        "pranav": [
            "Curate 100+ place records across 3 pilot destinations (e.g. Jaipur, Goa, Manali).",
            "Build the embedding generation script: read records → compose text → embed → write back.",
            "Create HNSW index on the embedding column in pgvector.",
            "Validate embedding quality: query 'budget street food Jaipur' → confirm top results are sensible.",
            "Document edge cases: missing fields, ambiguous activity types.",
        ],
        "shared": [
            "Review curated data together — Harsh validates schema fit, Pranav validates semantic coverage.",
            "Run end-to-end: CSV → import script → DB → embedding script → vector index. Confirm working.",
        ],
    },
    {
        "num": "Week 3",
        "title": "Retrieval Pipeline & Scoring Engine",
        "goal": "Given a trip query, the pipeline returns top-N ranked candidates. Scoring weights configurable.",
        "harsh": [
            "Implement GET /api/places/search endpoint that accepts destination, budget_tier, tags, query_text.",
            "Integrate pgvector ANN query into the Express route (SQL: ORDER BY embedding <=> $1 LIMIT 40).",
            "Build the scoring engine module: take 40 ANN results + user prefs → return top 15 ranked.",
            "Make scoring weights configurable via environment or config JSON (not hard-coded).",
            "Write unit tests for the scoring function across all 5 optimisation modes.",
        ],
        "pranav": [
            "Build a Python test harness: for each optimisation mode, run 10 test queries and inspect top-5 results.",
            "Tune scoring weights empirically based on test harness results — document findings.",
            "Define the 'cold start' fallback rule: if < 5 candidates returned, what does the pipeline do?",
            "Validate retrieval latency: ANN query + scoring should complete in < 300ms.",
            "Prepare a benchmark report comparing retrieval quality before and after weight tuning.",
        ],
        "shared": [
            "Sync on scoring weights — Pranav's empirical findings feed Harsh's config implementation.",
            "Milestone: live demo of retrieval pipeline in Postman/curl. Input a query, get ranked JSON output.",
        ],
    },
    {
        "num": "Week 4",
        "title": "LLM Integration & Itinerary Generation",
        "goal": "POST /api/itinerary/generate returns a valid structured itinerary JSON end-to-end.",
        "harsh": [
            "Wire the orchestration pipeline: validate input → embed query → retrieve → rank → call LLM.",
            "Implement streaming response: pipe OpenAI stream through Express to the client.",
            "Add Zod schema validation for the LLM JSON output — reject and retry if invalid.",
            "Add retry logic: 3 attempts with exponential backoff on LLM call failures.",
            "Log all pipeline stages to structured logs (request_id, latency per stage, model used).",
        ],
        "pranav": [
            "Write the system prompt and user prompt templates. Enforce: only use provided place_ids.",
            "Implement response_format: json_schema config for GPT-4o-mini structured output.",
            "Test prompt across 5 trip types and 5 optimisation modes = 25 test cases. Document failure patterns.",
            "Tune prompt to handle edge cases: single-day trip, luxury 7-day, fuel-efficient route.",
            "Benchmark GPT-4o vs GPT-4o-mini output quality vs cost for this specific structuring task.",
        ],
        "shared": [
            "Milestone: generate a real 3-day Jaipur itinerary via API. Review output quality together.",
            "Agree on final prompt template and model choice before frontend integration begins.",
        ],
    },
    {
        "num": "Week 5",
        "title": "Frontend — Trip Input Form & API Integration",
        "goal": "User can fill the trip form, submit, and receive the raw itinerary JSON in the browser.",
        "harsh": [
            "Build the Trip Input Form component: destination, duration, trip type, optimisation preference.",
            "Implement destination autocomplete using GET /api/places/destinations.",
            "Connect form submission to POST /api/itinerary/generate with streaming fetch.",
            "Build itinerary state store in Zustand: store the parsed itinerary JSON, loading state, errors.",
            "Show skeleton loading UI while streaming — 'Building your Day 1...' style progressive feedback.",
        ],
        "pranav": [
            "Build a lightweight evaluation dashboard (Python / Streamlit) to score itinerary quality.",
            "Run 20 end-to-end tests through the live API; log quality issues and prompt failures.",
            "Investigate and fix any hallucination cases (LLM using place_ids not in context).",
            "Add a second pilot destination to the knowledge base (Goa or Manali — whichever not done).",
            "Instrument the pipeline: measure p50/p90/p99 latency per stage and document.",
        ],
        "shared": [
            "Sync: verify the JSON the frontend receives matches the Zod-validated backend output exactly.",
            "Agree on skeleton/loading UX before React Flow visualisation begins (Week 6).",
        ],
    },
    {
        "num": "Week 6",
        "title": "Frontend — React Flow Itinerary Visualisation",
        "goal": "Generated itinerary is rendered as an interactive, expandable day/activity graph.",
        "harsh": [
            "Implement DayNode and ActivityNode custom node types in React Flow.",
            "Build collapse/expand logic: collapsed day = summary node, expanded = full activity chain.",
            "Render ActivityNode with: place name, time, duration chip, notes tooltip, external booking link button.",
            "Add mobile fallback: detect viewport < 768px, render vertical timeline/accordion instead of graph.",
            "Implement 'Regenerate' button that re-calls the API with the same params.",
        ],
        "pranav": [
            "Add the third pilot destination to the knowledge base; validate embedding quality.",
            "Perform adversarial prompt testing: try to make the LLM break the schema or hallucinate.",
            "Add post-generation cost estimation logic: sum budget_tier weights across activities, return estimate string.",
            "Explore: can the LLM suggest alternative activities if the user flags a specific one? Spike and document.",
        ],
        "shared": [
            "Design review: both members review the itinerary graph UI for usability and correctness.",
            "Milestone: full end-to-end demo — form → API → React Flow graph — with real 3-day itinerary.",
        ],
    },
    {
        "num": "Week 7",
        "title": "Integration, Testing & Hardening",
        "goal": "The full system is stable, tested, and handles all known failure modes gracefully.",
        "harsh": [
            "End-to-end integration testing: all 5 optimisation modes × 3 destinations = 15 test scenarios.",
            "Add error boundary in React: graceful UI for API failures, timeouts, partial itineraries.",
            "Performance audit: bundle size, first load JS, React Flow render time on 7-day itinerary.",
            "Set up basic CI pipeline (GitHub Actions): lint, type check, unit tests on every PR.",
            "Implement rate limiting on the API (express-rate-limit) to prevent abuse.",
        ],
        "pranav": [
            "Final prompt and weight tuning based on 15 integration test outputs.",
            "Validate cold-start fallback: test destinations with < 5 KB records — confirm graceful degradation.",
            "Stress test the embedding pipeline: embed 500 records, verify index query latency stays < 300ms.",
            "Document the full AIML pipeline: embedding strategy, prompt templates, model config, scoring logic.",
            "Write KB curation guidelines document for adding new destinations post-MVP.",
        ],
        "shared": [
            "Bug bash: both spend one full session finding and filing issues on the integrated system.",
            "Agree on launch-blocking vs post-MVP bug list. Freeze feature scope.",
        ],
    },
    {
        "num": "Week 8",
        "title": "Polish, Documentation & MVP Launch",
        "goal": "MVP is deployed, documented, and ready for first real users.",
        "harsh": [
            "Deploy frontend to Vercel. Deploy backend + DB to Railway or Render.",
            "Set up environment variables in production. Smoke test all 5 optimisation modes in prod.",
            "Add basic analytics: track itinerary_generated events, optimisation_mode, destination, latency.",
            "Write user-facing README and short onboarding copy for the landing page.",
            "Post-launch: monitor error logs for 48h, fix any production-only issues.",
        ],
        "pranav": [
            "Final KB audit: ensure all 3 destinations have balanced coverage across budget tiers and activity types.",
            "Write internal technical doc: RAG pipeline architecture, how to add new destinations, how to tune weights.",
            "Set up OpenAI usage dashboard alert: notify if daily spend exceeds defined threshold.",
            "Evaluate: is pgvector sufficient at current KB size, or is a dedicated vector DB needed for V2?",
            "Post-launch: monitor LLM output quality on real user queries (sample 20 itineraries and review).",
        ],
        "shared": [
            "Final demo: run the full system for a real trip. Record a short walkthrough video.",
            "MVP retrospective: what worked, what didn't, what goes into V2 backlog.",
            "LAUNCH.",
        ],
    },
]

HARSH_BG  = HexColor("#EFF6FF")
PRANAV_BG = HexColor("#F5F3FF")
SHARED_BG = HexColor("#ECFDF5")

for wk in weeks:
    # Week header
    wk_header = Table(
        [[Paragraph(f'<font color="white"><b>{wk["num"]}</b></font>', S["body"]),
          Paragraph(f'<font color="white"><b>{wk["title"]}</b></font>', S["h2"])]],
        colWidths=[60, W-60]
    )
    wk_header.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), NAVY),
        ("TOPPADDING",  (0,0), (-1,-1), 10),
        ("BOTTOMPADDING",(0,0), (-1,-1), 10),
        ("LEFTPADDING", (0,0), (-1,-1), 10),
        ("VALIGN",      (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(KeepTogether([wk_header]))
    story.append(SP(3))

    # Goal strip
    goal_row = Table(
        [[Paragraph(f'<font color="#{ACCENT.hexval()[2:]}"><b>GOAL</b></font>  {wk["goal"]}', S["body"])]],
        colWidths=[W]
    )
    goal_row.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), HexColor("#FFFBEB")),
        ("LEFTPADDING",(0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING",(0,0), (-1,-1), 6),
        ("LINEABOVE",  (0,0), (-1,0), 0.5, ACCENT),
        ("LINEBELOW",  (0,0), (-1,0), 0.5, ACCENT),
    ]))
    story.append(goal_row)
    story.append(SP(5))

    def task_col(title, items, bg, bar_clr):
        header = Paragraph(
            f'<font color="#{bar_clr.hexval()[2:]}"><b>{title}</b></font>', S["body"]
        )
        rows = [[header]]
        for item in items:
            rows.append([Paragraph(f'<font color="#{bar_clr.hexval()[2:]}">▸</font>  {item}', S["body"])])
        col_t = Table(rows, colWidths=[W*0.47])
        col_t.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,-1), bg),
            ("LEFTPADDING",(0,0), (-1,-1), 10),
            ("TOPPADDING", (0,0), (-1,-1), 5),
            ("BOTTOMPADDING",(0,0), (-1,-1), 5),
            ("LINEAFTER",  (0,0), (0,-1), 2, bar_clr),
        ]))
        return col_t

    col_h = task_col("Harsh Depura — Full Stack", wk["harsh"], HARSH_BG, HARSH_CLR)
    col_p = task_col("Pranav Rana — AIML", wk["pranav"], PRANAV_BG, PRANAV_CLR)
    two_col = Table([[col_h, col_p]], colWidths=[W*0.49, W*0.49], hAlign="LEFT")
    two_col.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
        ("RIGHTPADDING",(0,0), (-1,-1), 4),
    ]))
    story.append(two_col)
    story.append(SP(5))

    # Shared milestones
    shared_rows = [[Paragraph(f'<font color="#{SHARED_CLR.hexval()[2:]}"><b>Shared Milestones / Sync Points</b></font>', S["body"])]]
    for s in wk["shared"]:
        shared_rows.append([Paragraph(f'<font color="#{SHARED_CLR.hexval()[2:]}">⬡</font>  {s}', S["body"])])
    st = Table(shared_rows, colWidths=[W])
    st.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), SHARED_BG),
        ("LEFTPADDING",(0,0), (-1,-1), 10),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING",(0,0), (-1,-1), 5),
        ("LINEAFTER",  (0,0), (0,-1), 2, SHARED_CLR),
    ]))
    story.append(st)
    story.append(SP(12))

# ══════════════════════════════════════════════════════════════════════════════
# SECTION 4 — RECOMMENDED BUILD ORDER
# ══════════════════════════════════════════════════════════════════════════════
story.append(PageBreak())
story.append(H1("4. Recommended Build Order & Key Principles"))
story.append(HR())

story.append(H2("4.1  Strict Build Sequence"))
order_data = [
    ["#", "Phase", "Why First"],
    ["1", "KB Schema + Seed Data",       "Everything downstream depends on real, clean place records."],
    ["2", "Embedding Pipeline",           "Without embeddings in the DB, retrieval cannot be validated."],
    ["3", "Retrieval + Scoring",          "Validate ranking quality in isolation before the LLM touches it."],
    ["4", "LLM Prompt + Structured Out", "Wire LLM last so it works with real retrieved data, not mocks."],
    ["5", "Backend API Routes",           "Expose pipeline as API only after each stage is independently tested."],
    ["6", "React Flow Visualisation",     "Build renderer against mock JSON first; connect live API last."],
    ["7", "Integration + UX Polish",      "Connect everything; fix latency, errors, and edge cases."],
    ["8", "Deploy + Monitor",             "Launch to prod. Watch logs. Fix fast."],
]
to = Table(order_data, colWidths=[W*0.06, W*0.34, W*0.60])
to.setStyle(TableStyle([
    ("BACKGROUND",    (0,0), (-1,0), INDIGO),
    ("TEXTCOLOR",     (0,0), (-1,0), WHITE),
    ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
    ("FONTSIZE",      (0,0), (-1,-1), 8.5),
    ("TEXTCOLOR",     (0,1), (-1,-1), SLATE),
    ("BACKGROUND",    (0,1), (0,-1), BG_CARD),
    ("FONTNAME",      (0,1), (0,-1), "Helvetica-Bold"),
    ("TEXTCOLOR",     (0,1), (0,-1), INDIGO),
    ("ROWBACKGROUNDS",(1,1), (-1,-1), [WHITE, BG_CARD]),
    ("GRID",          (0,0), (-1,-1), 0.4, HexColor("#CBD5E1")),
    ("TOPPADDING",    (0,0), (-1,-1), 6),
    ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ("LEFTPADDING",   (0,0), (-1,-1), 8),
    ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
]))
story.append(to)
story.append(SP(10))

story.append(H2("4.2  Non-Negotiable Engineering Principles"))
story.append(Bullet([
    "<b>Schema contract first.</b> Agree on the place record schema and the LLM output schema before writing any retrieval or generation code. Changes mid-build are expensive.",
    "<b>Never hard-code scoring weights.</b> All α/β/γ/δ/ε values live in config. Pranav will need to tune these empirically — make it easy.",
    "<b>Validate before you generate.</b> Zod-validate the LLM JSON output server-side. Reject and retry rather than passing malformed data to the frontend.",
    "<b>Build the test harness early.</b> Pranav's evaluation dashboard (Week 5) should be built as a first-class tool, not an afterthought. It's your quality gate.",
    "<b>Streaming is required, not optional.</b> A 6-second blank screen will tank the user experience. Stream from day one.",
    "<b>Design for editability.</b> The itinerary data model must support activity CRUD even if the edit UI ships post-MVP. Retrofitting the schema later is painful.",
]))

story.append(SP(10))
story.append(H2("4.3  V2 Backlog (Post-MVP)"))
story.append(Bullet([
    "In-itinerary activity swap / regenerate (replace a single activity without regenerating the full itinerary).",
    "User accounts, saved itineraries, and trip history.",
    "Real-time pricing via affiliate API integration (booking.com, Google Hotels).",
    "Route optimisation using Google Maps Distance Matrix API.",
    "Multi-city / multi-destination trips.",
    "Collaborative trip planning (shared itinerary with edit access).",
    "Expanding KB to 20+ destinations via a semi-automated curation pipeline.",
]))

# ── Build ─────────────────────────────────────────────────────────────────────
doc.build(story, onFirstPage=cover_page, onLaterPages=normal_page)
print("PDF generated successfully.")