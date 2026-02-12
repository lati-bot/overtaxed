#!/usr/bin/env python3
"""
Generate 3 sample PDFs for the Overtaxed PDF restructure proposal.
  1. current-sample.pdf  — approximation of current monolithic PDF
  2. proposed-guide.pdf   — new Quick Start Guide
  3. proposed-evidence.pdf — new Evidence Packet
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import (
    HexColor, black, white, Color
)
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus.flowables import KeepTogether

OUT_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Fake data ────────────────────────────────────────────────────────
PROP = dict(
    address="1234 Oak Street, Houston, TX 77001",
    account="1234567890",
    sqft="2,150",
    year_built="2005",
    current_value="$385,000",
    fair_value="$342,000",
    reduction="$43,000",
    savings="$946",
    per_sqft="$179.07",
    median_sqft="$159.07",
    nbhd="Oak Meadows (NBHD 4521)",
    county="Harris",
    over_pct="12.6",
)

COMPS = [
    ("1", "1240 Oak Street",  "1234567891", "2,080", "2004", "$328,000", "$157.69"),
    ("2", "1256 Oak Street",  "1234567892", "2,200", "2006", "$348,000", "$158.18"),
    ("3", "1310 Elm Drive",   "1234567893", "2,100", "2003", "$335,000", "$159.52"),
    ("4", "1322 Elm Drive",   "1234567894", "2,250", "2007", "$360,000", "$160.00"),
    ("5", "1401 Maple Lane",  "1234567895", "1,950", "2005", "$308,000", "$157.95"),
    ("6", "1415 Maple Lane",  "1234567896", "2,300", "2004", "$365,000", "$158.70"),
    ("7", "1502 Cedar Court", "1234567897", "2,050", "2006", "$330,000", "$160.98"),
    ("8", "1518 Cedar Court", "1234567898", "2,180", "2005", "$345,000", "$158.26"),
    ("9", "1600 Birch Way",   "1234567899", "2,120", "2003", "$340,000", "$160.38"),
]

# ── Colors ───────────────────────────────────────────────────────────
BRAND_BLUE  = HexColor("#1a73e8")
BRAND_GREEN = HexColor("#0f9d58")
BRAND_RED   = HexColor("#d93025")
LIGHT_GRAY  = HexColor("#f5f5f5")
MED_GRAY    = HexColor("#e0e0e0")
DARK_GRAY   = HexColor("#333333")
YELLOW_BG   = HexColor("#fff8e1")
GREEN_BG    = HexColor("#e8f5e9")
BLUE_BG     = HexColor("#e3f2fd")
ROW_ALT     = HexColor("#f9f9f9")
SUBJECT_BG  = HexColor("#fce4ec")

# =====================================================================
# PDF 1 — CURRENT SAMPLE (monolithic)
# =====================================================================

def build_current():
    path = os.path.join(OUT_DIR, "current-sample.pdf")
    doc = SimpleDocTemplate(
        path, pagesize=letter,
        leftMargin=0.6*inch, rightMargin=0.6*inch,
        topMargin=0.5*inch, bottomMargin=0.5*inch,
    )
    styles = getSampleStyleSheet()

    # Custom styles
    sHeader = ParagraphStyle("CurHeader", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9, textColor=white)
    sTitle = ParagraphStyle("CurTitle", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=16, textColor=BRAND_BLUE,
        spaceAfter=4)
    sSubtitle = ParagraphStyle("CurSub", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9, textColor=DARK_GRAY, spaceAfter=6)
    sBody = ParagraphStyle("CurBody", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9, leading=12, textColor=DARK_GRAY)
    sBodySmall = ParagraphStyle("CurBodySm", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, leading=10, textColor=DARK_GRAY)
    sSectionHead = ParagraphStyle("CurSecH", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=11, textColor=BRAND_BLUE,
        spaceBefore=10, spaceAfter=4)
    sLegal = ParagraphStyle("CurLegal", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8.5, leading=11, textColor=DARK_GRAY,
        spaceAfter=6)
    sStep = ParagraphStyle("CurStep", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=10, textColor=DARK_GRAY,
        spaceBefore=8, spaceAfter=2)
    sStepBody = ParagraphStyle("CurStepBody", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9, leading=12, textColor=DARK_GRAY,
        leftIndent=12, spaceAfter=4)
    sScript = ParagraphStyle("CurScript", parent=styles["Normal"],
        fontName="Times-Roman", fontSize=9.5, leading=13, textColor=DARK_GRAY)
    sFooter = ParagraphStyle("CurFooter", parent=styles["Normal"],
        fontName="Helvetica", fontSize=7, textColor=HexColor("#999999"),
        alignment=TA_CENTER)

    story = []

    # ── Brand header bar ──
    header_data = [[
        Paragraph("<b>OVERTAXED</b>", sHeader),
        Paragraph("Property Tax Protest Evidence Package", sHeader),
        Paragraph("Harris County · February 12, 2026", sHeader),
    ]]
    header_table = Table(header_data, colWidths=[1.5*inch, 3.5*inch, 2.2*inch])
    header_table.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BRAND_BLUE),
        ("TEXTCOLOR", (0,0), (-1,-1), white),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (0,0), 10),
        ("RIGHTPADDING", (-1,-1), (-1,-1), 10),
        ("ALIGN", (-1,0), (-1,0), "RIGHT"),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # ── Title block ──
    story.append(Paragraph(PROP["address"], sTitle))
    story.append(Paragraph(
        f"Account: {PROP['account']}  ·  {PROP['sqft']} sqft  ·  "
        f"Built {PROP['year_built']}  ·  {PROP['nbhd']}", sSubtitle))
    story.append(Spacer(1, 8))

    # ── Summary cards (3-up) ──
    def make_card(label, value, color):
        return Table(
            [[Paragraph(f'<font size="8" color="#666666">{label}</font>', styles["Normal"])],
             [Paragraph(f'<font size="16"><b>{value}</b></font>', ParagraphStyle("x", parent=styles["Normal"], textColor=color, alignment=TA_CENTER))]],
            colWidths=[2.2*inch], rowHeights=[18, 36],
        )

    card1 = make_card("Current Appraised Value", PROP["current_value"], BRAND_RED)
    card2 = make_card("Fair Value (Comps)", PROP["fair_value"], BRAND_GREEN)
    card3 = make_card("Estimated Annual Savings", PROP["savings"], BRAND_BLUE)

    cards = Table([[card1, card2, card3]], colWidths=[2.4*inch]*3)
    cards.setStyle(TableStyle([
        ("BOX", (0,0), (0,0), 0.5, MED_GRAY),
        ("BOX", (1,0), (1,0), 0.5, MED_GRAY),
        ("BOX", (2,0), (2,0), 0.5, MED_GRAY),
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_GRAY),
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(cards)
    story.append(Spacer(1, 10))

    # ── Breakdown tables (2 column) ──
    left_data = [
        ["Property Details", ""],
        ["Address", PROP["address"]],
        ["Account Number", PROP["account"]],
        ["Square Footage", PROP["sqft"]],
        ["Year Built", PROP["year_built"]],
        ["Neighborhood", PROP["nbhd"]],
    ]
    right_data = [
        ["Appraisal Summary", ""],
        ["Current Value", PROP["current_value"]],
        ["Fair Value", PROP["fair_value"]],
        ["Potential Reduction", PROP["reduction"]],
        ["Subject $/sqft", PROP["per_sqft"]],
        ["Median Comp $/sqft", PROP["median_sqft"]],
        ["Est. Tax Savings", PROP["savings"] + "/year"],
    ]

    def detail_table(data, w):
        t = Table(data, colWidths=[w*0.45, w*0.55])
        style_cmds = [
            ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE", (0,0), (-1,-1), 8),
            ("TEXTCOLOR", (0,0), (-1,-1), DARK_GRAY),
            ("BACKGROUND", (0,0), (-1,0), BRAND_BLUE),
            ("TEXTCOLOR", (0,0), (-1,0), white),
            ("TOPPADDING", (0,0), (-1,-1), 3),
            ("BOTTOMPADDING", (0,0), (-1,-1), 3),
            ("LEFTPADDING", (0,0), (-1,-1), 5),
            ("GRID", (0,0), (-1,-1), 0.25, MED_GRAY),
            ("SPAN", (0,0), (-1,0)),
        ]
        for i in range(2, len(data), 2):
            style_cmds.append(("BACKGROUND", (0,i), (-1,i), ROW_ALT))
        t.setStyle(TableStyle(style_cmds))
        return t

    lt = detail_table(left_data, 3.4*inch)
    rt = detail_table(right_data, 3.4*inch)
    two_col = Table([[lt, rt]], colWidths=[3.5*inch, 3.5*inch])
    two_col.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]))
    story.append(two_col)
    story.append(Spacer(1, 12))

    # ── Statement of Unequal Appraisal ──
    story.append(Paragraph("Statement of Unequal Appraisal", sSectionHead))
    story.append(Paragraph(
        'Under Section 42.26(a)(3) of the Texas Property Tax Code, a property owner is entitled to relief '
        'if the appraised value of the property exceeds the median appraised value of a reasonable number '
        'of comparable properties, appropriately adjusted. The subject property at '
        f'{PROP["address"]} (Account #{PROP["account"]}) is currently appraised at {PROP["current_value"]}, '
        f'equating to {PROP["per_sqft"]} per square foot.',
        sLegal))
    story.append(Paragraph(
        f'An analysis of {len(COMPS)} comparable properties within the same neighborhood ({PROP["nbhd"]}) '
        f'reveals a median appraised value of {PROP["median_sqft"]} per square foot. The subject property\'s '
        f'appraisal exceeds this median by approximately {PROP["over_pct"]}%, indicating a clear inequity '
        'in the district\'s valuation methodology.',
        sLegal))
    story.append(Paragraph(
        f'Accordingly, the property owner requests a reduction in the appraised value to {PROP["fair_value"]}, '
        'which aligns the subject property with the median valuation of comparable properties as required by '
        '§42.26. The comparable properties analysis and supporting data are presented below.',
        sLegal))
    story.append(Spacer(1, 6))

    # ── Comps table ──
    story.append(Paragraph("Comparable Properties", sSectionHead))

    comp_header = ["#", "Address", "Account", "Sqft", "Yr Built", "2025 Appraised", "$/SF"]
    comp_data = [comp_header]
    # Subject row
    comp_data.append(["S", PROP["address"].split(",")[0], PROP["account"],
                       PROP["sqft"], PROP["year_built"], PROP["current_value"], PROP["per_sqft"]])
    for c in COMPS:
        comp_data.append(list(c))

    cw = [0.3*inch, 1.6*inch, 1.0*inch, 0.6*inch, 0.6*inch, 1.1*inch, 0.7*inch]
    ct = Table(comp_data, colWidths=cw, repeatRows=1)
    comp_style = [
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 7.5),
        ("TEXTCOLOR", (0,0), (-1,0), white),
        ("BACKGROUND", (0,0), (-1,0), BRAND_BLUE),
        ("BACKGROUND", (0,1), (-1,1), SUBJECT_BG),
        ("GRID", (0,0), (-1,-1), 0.25, MED_GRAY),
        ("TOPPADDING", (0,0), (-1,-1), 2),
        ("BOTTOMPADDING", (0,0), (-1,-1), 2),
        ("LEFTPADDING", (0,0), (-1,-1), 3),
        ("ALIGN", (3,0), (-1,-1), "RIGHT"),
        ("ALIGN", (0,0), (0,-1), "CENTER"),
    ]
    for i in range(3, len(comp_data), 2):
        comp_style.append(("BACKGROUND", (0,i), (-1,i), ROW_ALT))
    ct.setStyle(TableStyle(comp_style))
    story.append(ct)
    story.append(Spacer(1, 6))

    # Summary row
    sum_data = [
        ["Subject $/SF", PROP["per_sqft"], "Comp Median $/SF", PROP["median_sqft"],
         "Difference", f'{PROP["over_pct"]}%'],
    ]
    st = Table(sum_data, colWidths=[1.0*inch, 0.8*inch, 1.2*inch, 0.8*inch, 0.8*inch, 0.6*inch])
    st.setStyle(TableStyle([
        ("FONTNAME", (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_GRAY),
        ("BOX", (0,0), (-1,-1), 0.5, MED_GRAY),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("ALIGN", (1,0), (1,-1), "RIGHT"),
        ("ALIGN", (3,0), (3,-1), "RIGHT"),
        ("ALIGN", (5,0), (5,-1), "RIGHT"),
    ]))
    story.append(st)

    # ── PAGE BREAK — Filing Instructions ──
    story.append(PageBreak())

    # Header bar again
    h2_data = [[
        Paragraph("<b>OVERTAXED</b>", sHeader),
        Paragraph("📋  HOW TO PROTEST — HARRIS COUNTY STEP BY STEP", sHeader),
    ]]
    h2 = Table(h2_data, colWidths=[1.5*inch, 5.7*inch])
    h2.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BRAND_BLUE),
        ("TEXTCOLOR", (0,0), (-1,-1), white),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (0,0), 10),
    ]))
    story.append(h2)
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        "Texas law gives every property owner the right to protest their appraised value. "
        "Harris County makes this easy — you can do it entirely online. No attorney or agent needed.",
        sBody))
    story.append(Spacer(1, 4))

    # Deadline warning box
    warn = Table(
        [[Paragraph(
            '<font color="#b35900"><b>⏰ Deadline:</b> Harris County protest season typically opens in late March '
            'when appraisal notices are mailed. The deadline is usually May 15 (or 30 days after your notice date, '
            'whichever is later). Homestead properties may have an earlier deadline of April 30. '
            'File as soon as you receive your notice for the best results.</font>',
            ParagraphStyle("warn", parent=sBody, fontSize=8.5))]],
        colWidths=[6.8*inch],
    )
    warn.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), YELLOW_BG),
        ("BOX", (0,0), (-1,-1), 0.5, HexColor("#ffcc80")),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(warn)
    story.append(Spacer(1, 8))

    # 5 steps
    steps = [
        ("Step 1: Wait for Your Appraisal Notice",
         "HCAD mails appraisal notices in late March to early April. Your notice will show your property's "
         f"appraised value for the current year. You need the Account Number from this notice (your account: {PROP['account']})."),
        ("Step 2: File Online via iFile",
         f"Go to hcad.org and click \"File a Protest\" or go directly to HCAD iFile Protest. "
         f"Enter your Account Number: {PROP['account']}. Select \"Unequal Appraisal\" as your reason for protest "
         "(this is the strongest legal argument). You can also check \"Value is Over Market Value\" as an additional reason. "
         f"Enter your opinion of value: {PROP['fair_value']}. Upload this PDF as your supporting evidence. Submit your protest."),
        ("Step 3: Check for an iSettle Offer",
         f"After filing, HCAD may send you a settlement offer via iSettle (check your email and your iFile account). "
         f"This is HCAD's automated settlement system — they may offer to reduce your value without a hearing. "
         f"If the offer is at or below {PROP['fair_value']} → Accept it! You're done. "
         "If the offer is still too high → Reject it and proceed to your ARB hearing. "
         "If you don't get an iSettle offer → proceed to your hearing."),
        ("Step 4: Prepare for Your ARB Hearing",
         "If iSettle doesn't work, you'll be scheduled for an Appraisal Review Board (ARB) hearing. "
         "Hearings run from May through July. You can attend in person or by phone. "
         "Bring this PDF — it has everything you need. Present your comparable properties and explain why your "
         f"value should be lower. Focus on the $/sqft comparison — your property is at {PROP['per_sqft']}/sqft "
         f"while comparable properties average {PROP['median_sqft']}/sqft. Be polite and factual. "
         "The appraiser may offer a compromise."),
        ("Step 5: After the Hearing",
         "The ARB panel will issue a decision, usually within a few weeks. If you're not satisfied with the "
         "result, you can appeal further to District Court or pursue binding arbitration (for properties under "
         "$5 million). However, most protests are resolved at the iSettle or ARB stage."),
    ]
    for title, body in steps:
        story.append(Paragraph(title, sStep))
        story.append(Paragraph(body, sStepBody))

    # ── PAGE BREAK — Hearing Script + Important Info ──
    story.append(PageBreak())

    h3_data = [[
        Paragraph("<b>OVERTAXED</b>", sHeader),
        Paragraph("🎤  WHAT TO SAY AT YOUR HEARING", sHeader),
    ]]
    h3 = Table(h3_data, colWidths=[1.5*inch, 5.7*inch])
    h3.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BRAND_BLUE),
        ("TEXTCOLOR", (0,0), (-1,-1), white),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (0,0), 10),
    ]))
    story.append(h3)
    story.append(Spacer(1, 10))

    # Hearing script in a dashed border box
    script_text = (
        f'<i>"Good morning. I\'m here to protest the appraised value of my property at '
        f'{PROP["address"]}, Account Number {PROP["account"]}.</i><br/><br/>'
        f'<i>I\'m protesting on the basis of unequal appraisal under Section 42.26 of the Texas '
        f'Property Tax Code. My property is currently appraised at {PROP["current_value"]}, which '
        f'equates to {PROP["per_sqft"]} per square foot.</i><br/><br/>'
        f'<i>I\'ve identified {len(COMPS)} comparable properties in the {PROP["nbhd"]} neighborhood '
        f'with a median appraisal of {PROP["median_sqft"]} per square foot — approximately '
        f'{PROP["over_pct"]}% less than my property.</i><br/><br/>'
        f'<i>Based on this analysis, I\'m requesting a reduction to {PROP["fair_value"]}, which aligns '
        f'my property with the median valuation of comparable properties in the area.</i><br/><br/>'
        f'<i>I\'ve provided the comparable properties data as supporting evidence for the board\'s review. '
        f'Thank you."</i>'
    )
    script_box = Table(
        [[Paragraph(script_text, sScript)]],
        colWidths=[6.5*inch],
    )
    script_box.setStyle(TableStyle([
        ("BOX", (0,0), (-1,-1), 1, HexColor("#999999")),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING", (0,0), (-1,-1), 12),
        ("RIGHTPADDING", (0,0), (-1,-1), 12),
    ]))
    story.append(script_box)
    story.append(Spacer(1, 14))

    # Green tip box — Uniform & Equal
    tip = Table(
        [[Paragraph(
            '<font color="#1b5e20"><b>💡 Why "Uniform &amp; Equal" Is Your Strongest Argument</b><br/>'
            'Texas law requires that similar properties be appraised at similar values. You don\'t need '
            'to prove your home is worth less — just that it\'s appraised higher than comparable homes. '
            'This is a much easier argument to make, and it works even if property values are rising.</font>',
            ParagraphStyle("tip", parent=sBody, fontSize=8.5))]],
        colWidths=[6.8*inch],
    )
    tip.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), GREEN_BG),
        ("BOX", (0,0), (-1,-1), 0.5, HexColor("#81c784")),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(tip)
    story.append(Spacer(1, 10))

    # Blue info box
    info = Table(
        [[Paragraph(
            '<font color="#0d47a1"><b>ℹ️ Texas Reassesses Every Year</b><br/>'
            'Unlike some states, Texas appraisal districts reassess every property every year. '
            'This means even if you successfully protest this year, you\'ll need to check your '
            'value again next year. Overtaxed will send you a new analysis automatically.</font>',
            ParagraphStyle("info", parent=sBody, fontSize=8.5))]],
        colWidths=[6.8*inch],
    )
    info.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), BLUE_BG),
        ("BOX", (0,0), (-1,-1), 0.5, HexColor("#90caf9")),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(info)
    story.append(Spacer(1, 14))

    # Important info bullets
    story.append(Paragraph("Important Information", sSectionHead))
    bullets = [
        "No attorney or agent is required to file a property tax protest in Texas.",
        "There is no cost to file a protest — it is your legal right as a property owner.",
        "If you haven't already, apply for a Homestead Exemption at your county appraisal district's website.",
        "Texas law caps annual appraised value increases at 10% for homestead properties.",
        "Property tax protests can only reduce your appraised value — they cannot increase it.",
    ]
    for b in bullets:
        story.append(Paragraph(f"•  {b}", sBodySmall))
        story.append(Spacer(1, 2))

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MED_GRAY))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Generated by Overtaxed · hello@getovertaxed.com · February 12, 2026 · "
        "Data sourced from Harris County Appraisal District public records. "
        "This document does not constitute legal advice.",
        sFooter))

    doc.build(story)
    print(f"✅ Created {path}")


# =====================================================================
# PDF 2 — PROPOSED QUICK START GUIDE
# =====================================================================

def build_guide():
    path = os.path.join(OUT_DIR, "proposed-guide.pdf")
    doc = SimpleDocTemplate(
        path, pagesize=letter,
        leftMargin=0.6*inch, rightMargin=0.6*inch,
        topMargin=0.45*inch, bottomMargin=0.4*inch,
    )
    styles = getSampleStyleSheet()

    sHero = ParagraphStyle("GHero", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=20, leading=24, textColor=DARK_GRAY,
        spaceAfter=2)
    sSubHero = ParagraphStyle("GSubHero", parent=styles["Normal"],
        fontName="Helvetica", fontSize=10, leading=13, textColor=HexColor("#555555"),
        spaceAfter=2)
    sLabel = ParagraphStyle("GLabel", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9, textColor=HexColor("#888888"))
    sBody = ParagraphStyle("GBody", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9.5, leading=13, textColor=DARK_GRAY)
    sBodySm = ParagraphStyle("GBodySm", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8.5, leading=12, textColor=DARK_GRAY)
    sBold = ParagraphStyle("GBold", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=DARK_GRAY)
    sStepNum = ParagraphStyle("GStepNum", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=24, textColor=BRAND_BLUE, alignment=TA_CENTER)
    sStepTitle = ParagraphStyle("GStepTitle", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=12, textColor=DARK_GRAY, spaceAfter=2)
    sStepBody = ParagraphStyle("GStepBody", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9.5, leading=13, textColor=DARK_GRAY)
    sSmall = ParagraphStyle("GSmall", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, textColor=HexColor("#999999"))
    sFooter = ParagraphStyle("GFoot", parent=styles["Normal"],
        fontName="Helvetica", fontSize=7, textColor=HexColor("#bbbbbb"), alignment=TA_CENTER)
    sAcctBig = ParagraphStyle("GAcct", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=20, textColor=DARK_GRAY, alignment=TA_CENTER,
        spaceAfter=2)
    sTimeline = ParagraphStyle("GTime", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9, textColor=BRAND_BLUE, alignment=TA_RIGHT)
    sSectionH = ParagraphStyle("GSec", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=13, textColor=DARK_GRAY, spaceBefore=6, spaceAfter=4)
    sScript = ParagraphStyle("GScript", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9.5, leading=13, textColor=DARK_GRAY)
    sScriptItalic = ParagraphStyle("GScriptI", parent=styles["Normal"],
        fontName="Helvetica-Oblique", fontSize=9.5, leading=13, textColor=DARK_GRAY,
        leftIndent=10, rightIndent=10, spaceBefore=3, spaceAfter=3)

    story = []

    # ── Minimal header ──
    year_label = Table(
        [[Paragraph('<font size="8" color="#999999">2025 Tax Year</font>', styles["Normal"]),
          Paragraph('<font size="8" color="#999999">overtaxed</font>',
                    ParagraphStyle("r", parent=styles["Normal"], alignment=TA_RIGHT))]],
        colWidths=[3.4*inch, 3.4*inch],
    )
    year_label.setStyle(TableStyle([
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(year_label)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MED_GRAY))
    story.append(Spacer(1, 10))

    # ── Hero ──
    story.append(Paragraph(f"Save {PROP['savings']}/year on your property taxes", sHero))
    story.append(Paragraph(
        f"<b>{PROP['address']}</b>  ·  Account: {PROP['account']}", sSubHero))
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        f"Your property is appraised at <b>{PROP['current_value']}</b> — that's "
        f"<b>{PROP['over_pct']}% higher</b> than similar homes nearby. "
        f"Based on {len(COMPS)} comparable properties, a fair value is <b>{PROP['fair_value']}</b>.",
        sBody))
    story.append(Spacer(1, 8))

    # ── Section title ──
    story.append(Paragraph("How to file your protest", sSectionH))
    story.append(Paragraph("Online. 15 minutes. No lawyer needed.", sBodySm))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MED_GRAY))
    story.append(Spacer(1, 6))

    # ── Step 1 ──
    def make_step(num, title, timeline, body_flowables):
        num_cell = Paragraph(num, sStepNum)
        title_p = Paragraph(title, sStepTitle)
        time_p = Paragraph(timeline, sTimeline)
        top_row = Table([[title_p, time_p]], colWidths=[4.5*inch, 1.5*inch])
        top_row.setStyle(TableStyle([
            ("VALIGN", (0,0), (-1,-1), "BOTTOM"),
            ("TOPPADDING", (0,0), (-1,-1), 0),
            ("BOTTOMPADDING", (0,0), (-1,-1), 0),
            ("LEFTPADDING", (0,0), (-1,-1), 0),
            ("RIGHTPADDING", (0,0), (-1,-1), 0),
        ]))
        body_items = [top_row, Spacer(1, 4)] + body_flowables
        body_cell = body_items  # will be a list in a single cell
        # We need to build a table where left col is the big number, right col is content
        # Since platypus doesn't easily nest lists in cells, we'll create a KeepTogether
        # Actually, let's use a slightly different approach:
        return body_items, num

    # Step 1 content
    step1_form = Table([
        [Paragraph("<b>Account number:</b>", sBodySm),
         Paragraph(f"<font name='Courier'>{PROP['account']}</font>", sBodySm)],
        [Paragraph("<b>Reason:</b>", sBodySm),
         Paragraph("Unequal Appraisal", sBodySm)],
        [Paragraph("<b>Your value:</b>", sBodySm),
         Paragraph(PROP["fair_value"], sBodySm)],
        [Paragraph("<b>Evidence:</b>", sBodySm),
         Paragraph("Upload the <b>Evidence Packet</b> PDF", sBodySm)],
    ], colWidths=[1.4*inch, 3.2*inch])
    step1_form.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_GRAY),
        ("BOX", (0,0), (-1,-1), 0.5, MED_GRAY),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
    ]))

    s1_title = Table([
        [Paragraph("1", sStepNum),
         Table([[Paragraph("File online", sStepTitle),
                 Paragraph("By May 15", sTimeline)]],
               colWidths=[4.0*inch, 1.8*inch])],
    ], colWidths=[0.5*inch, 5.8*inch])
    s1_title.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
    ]))

    story.append(s1_title)
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        f'Go to <b>hcad.org</b> → "File a Protest" and enter:', sStepBody))
    story.append(Spacer(1, 4))
    story.append(step1_form)
    story.append(Spacer(1, 3))
    story.append(Paragraph("That's it. You'll get a confirmation email.", sStepBody))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.3, color=MED_GRAY))
    story.append(Spacer(1, 6))

    # Step 2
    s2_title = Table([
        [Paragraph("2", sStepNum),
         Table([[Paragraph("Check for an offer", sStepTitle),
                 Paragraph("1–3 weeks later", sTimeline)]],
               colWidths=[4.0*inch, 1.8*inch])],
    ], colWidths=[0.5*inch, 5.8*inch])
    s2_title.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(s2_title)
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "The county may offer to lower your value <b>without a hearing</b>. Check your email.",
        sStepBody))
    story.append(Spacer(1, 4))

    offer_data = [
        [Paragraph(f"<b>Good offer</b> (≤ {PROP['fair_value']})?", sBodySm),
         Paragraph("Accept it. You're done!", sBodySm)],
        [Paragraph("<b>Bad offer or no offer?</b>", sBodySm),
         Paragraph("You'll get a hearing date.", sBodySm)],
    ]
    offer_t = Table(offer_data, colWidths=[2.8*inch, 3.0*inch])
    offer_t.setStyle(TableStyle([
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("LINEBELOW", (0,0), (-1,0), 0.25, MED_GRAY),
    ]))
    story.append(offer_t)
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=0.3, color=MED_GRAY))
    story.append(Spacer(1, 6))

    # Step 3
    s3_title = Table([
        [Paragraph("3", sStepNum),
         Table([[Paragraph("Your hearing (if needed)", sStepTitle),
                 Paragraph("May – July", sTimeline)]],
               colWidths=[4.0*inch, 1.8*inch])],
    ], colWidths=[0.5*inch, 5.8*inch])
    s3_title.setStyle(TableStyle([
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
        ("LEFTPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(s3_title)
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "Most protests settle before this step. But if you get a hearing:", sStepBody))
    story.append(Spacer(1, 2))
    story.append(Paragraph("•  Bring the <b>Evidence Packet</b> (printed or on your phone)", sStepBody))
    story.append(Paragraph("•  Use the <b>hearing script</b> on the next page", sStepBody))
    story.append(Paragraph("•  Total time: ~15 minutes", sStepBody))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "<b>The worst case? Your value stays the same. There is zero risk to protesting.</b>",
        ParagraphStyle("hl", parent=sBody, textColor=BRAND_BLUE, fontSize=10)))
    story.append(Spacer(1, 10))

    # ── Account number box ──
    story.append(HRFlowable(width="100%", thickness=0.5, color=MED_GRAY))
    story.append(Spacer(1, 6))
    story.append(Paragraph("YOUR ACCOUNT NUMBER (you'll need this)",
        ParagraphStyle("acl", parent=sLabel, alignment=TA_CENTER, fontSize=9)))
    story.append(Spacer(1, 4))

    acct_box = Table(
        [[Paragraph(f"<font name='Courier'><b>1 2 3 4 5 6 7 8 9 0</b></font>", sAcctBig)]],
        colWidths=[4.0*inch],
    )
    acct_box.setStyle(TableStyle([
        ("ALIGN", (0,0), (-1,-1), "CENTER"),
        ("BOX", (0,0), (-1,-1), 1.5, DARK_GRAY),
        ("TOPPADDING", (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
    ]))
    story.append(acct_box)
    story.append(Spacer(1, 8))

    # ── Worry table ──
    story.append(Paragraph("Things you might be worried about:", sBold))
    story.append(Spacer(1, 3))

    sWorry = ParagraphStyle("GWorry", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, leading=11, textColor=DARK_GRAY)

    worry_header = [
        Paragraph("<b>Worry</b>", ParagraphStyle("wh", parent=sWorry, textColor=white)),
        Paragraph("<b>Reality</b>", ParagraphStyle("wh", parent=sWorry, textColor=white)),
    ]
    worry_data = [worry_header]
    worries = [
        ('"Can they raise my taxes?"', "<b>No.</b> Texas law prohibits retaliation. Worst case: your value stays the same."),
        ('"Do I need a lawyer?"', "<b>No.</b> You have everything you need right here."),
        ('"What if I mess up?"', "<b>You won't.</b> Stick to the script. The data does the talking."),
        (f'"Is this worth my time?"', f"<b>At {PROP['savings']}/year?</b> That's $79/month back in your pocket."),
    ]
    for w, r in worries:
        worry_data.append([Paragraph(w, sWorry), Paragraph(r, sWorry)])

    wt = Table(worry_data, colWidths=[2.4*inch, 4.0*inch])
    wt_style = [
        ("BACKGROUND", (0,0), (-1,0), DARK_GRAY),
        ("TEXTCOLOR", (0,0), (-1,0), white),
        ("GRID", (0,0), (-1,-1), 0.25, MED_GRAY),
        ("TOPPADDING", (0,0), (-1,-1), 5),
        ("BOTTOMPADDING", (0,0), (-1,-1), 5),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
    ]
    for i in range(2, len(worry_data), 2):
        wt_style.append(("BACKGROUND", (0,i), (-1,i), ROW_ALT))
    wt.setStyle(TableStyle(wt_style))
    story.append(wt)

    # ── PAGE 2: Hearing Script ──
    story.append(PageBreak())

    # Header
    year_label2 = Table(
        [[Paragraph('<font size="8" color="#999999">2025 Tax Year</font>', styles["Normal"]),
          Paragraph('<font size="8" color="#999999">overtaxed</font>',
                    ParagraphStyle("r", parent=styles["Normal"], alignment=TA_RIGHT))]],
        colWidths=[3.4*inch, 3.4*inch],
    )
    year_label2.setStyle(TableStyle([
        ("TOPPADDING", (0,0), (-1,-1), 0),
        ("BOTTOMPADDING", (0,0), (-1,-1), 0),
    ]))
    story.append(year_label2)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.5, color=MED_GRAY))
    story.append(Spacer(1, 10))

    story.append(Paragraph("What to say at your hearing", sHero))
    story.append(Paragraph("Read this if you're headed to a hearing. Keep it simple — 2 minutes max.", sSubHero))
    story.append(Spacer(1, 10))

    # Opening
    story.append(Paragraph("<b>Your opening:</b>", sBold))
    story.append(Paragraph(
        f'"Good morning. I\'m protesting the value of my property at <b>{PROP["address"]}</b>, '
        f'Account {PROP["account"]}, on the basis of <b>unequal appraisal</b>."',
        sScriptItalic))
    story.append(Spacer(1, 8))

    # Argument
    story.append(Paragraph("<b>Your argument:</b>", sBold))
    story.append(Paragraph(
        f'"My property is appraised at <b>{PROP["per_sqft"]}/sqft</b>. I\'ve identified '
        f'{len(COMPS)} comparable properties in the same neighborhood that are appraised at a median of '
        f'<b>{PROP["median_sqft"]}/sqft</b> — that\'s <b>{PROP["over_pct"]}% lower</b> than mine.<br/><br/>'
        f'Under Texas Tax Code Section 42.26, properties must be appraised equally. '
        f'I\'m requesting a reduction to <b>{PROP["fair_value"]}</b>, which matches the median '
        f'of comparable properties."',
        sScriptItalic))
    story.append(Spacer(1, 8))

    # Close
    story.append(Paragraph("<b>Your close:</b>", sBold))
    story.append(Paragraph(
        f'"I\'ve provided {len(COMPS)} comparable properties with addresses, account numbers, '
        f'and appraised values as supporting evidence. I respectfully request the board adjust my '
        f'value to {PROP["fair_value"]}."',
        sScriptItalic))
    story.append(Spacer(1, 12))

    # Pushback table
    story.append(HRFlowable(width="100%", thickness=0.5, color=MED_GRAY))
    story.append(Spacer(1, 6))
    story.append(Paragraph("If they push back:", sSectionH))
    story.append(Spacer(1, 4))

    pb_header = [
        Paragraph("<b>They say...</b>", ParagraphStyle("pbh", parent=sBodySm, textColor=white)),
        Paragraph("<b>You say...</b>", ParagraphStyle("pbh", parent=sBodySm, textColor=white)),
    ]
    pb_data = [pb_header,
        [Paragraph('"Your home has upgrades/features they don\'t"', sBodySm),
         Paragraph('"The comparables are in the same neighborhood with similar build year and '
                   'square footage. I\'m asking for equal treatment, not a discount."', sBodySm)],
        [Paragraph('"Those comps aren\'t similar enough"', sBodySm),
         Paragraph('"They\'re in the same appraisal neighborhood, same era construction, similar size. '
                   'Section 42.26 requires the board to consider the median of comparable properties."', sBodySm)],
        [Paragraph('"We can offer you $X" (a compromise)', sBodySm),
         Paragraph(f'If ≤ {PROP["fair_value"]}: "I\'ll accept that."<br/>'
                   f'If higher: "I appreciate the offer, but the comparable data supports '
                   f'{PROP["fair_value"]}. I\'d like the board to consider the evidence."', sBodySm)],
    ]
    pb_t = Table(pb_data, colWidths=[2.6*inch, 3.8*inch])
    pb_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), DARK_GRAY),
        ("TEXTCOLOR", (0,0), (-1,0), white),
        ("GRID", (0,0), (-1,-1), 0.25, MED_GRAY),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 6),
        ("RIGHTPADDING", (0,0), (-1,-1), 6),
        ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("BACKGROUND", (0,2), (-1,2), ROW_ALT),
    ]))
    story.append(pb_t)

    story.append(Spacer(1, 16))
    story.append(HRFlowable(width="100%", thickness=0.3, color=MED_GRAY))
    story.append(Spacer(1, 3))
    story.append(Paragraph(
        "Questions? Reply to your email or contact hello@getovertaxed.com",
        ParagraphStyle("ft", parent=sFooter, fontSize=8, textColor=HexColor("#aaaaaa"))))

    doc.build(story)
    print(f"✅ Created {path}")


# =====================================================================
# PDF 3 — PROPOSED EVIDENCE PACKET
# =====================================================================

def build_evidence():
    path = os.path.join(OUT_DIR, "proposed-evidence.pdf")
    doc = SimpleDocTemplate(
        path, pagesize=letter,
        leftMargin=0.7*inch, rightMargin=0.7*inch,
        topMargin=0.6*inch, bottomMargin=0.6*inch,
    )
    styles = getSampleStyleSheet()

    sTitle = ParagraphStyle("ETitle", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=14, textColor=black, alignment=TA_CENTER,
        spaceAfter=2)
    sSub = ParagraphStyle("ESub", parent=styles["Normal"],
        fontName="Helvetica", fontSize=10, textColor=HexColor("#444444"), alignment=TA_CENTER,
        spaceAfter=8)
    sSecH = ParagraphStyle("ESecH", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=11, textColor=black,
        spaceBefore=14, spaceAfter=6,
        borderWidth=0, borderPadding=0)
    sBody = ParagraphStyle("EBody", parent=styles["Normal"],
        fontName="Helvetica", fontSize=9.5, leading=13, textColor=black)
    sBodyBold = ParagraphStyle("EBodyB", parent=styles["Normal"],
        fontName="Helvetica-Bold", fontSize=9.5, leading=13, textColor=black)
    sSmall = ParagraphStyle("ESmall", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, textColor=HexColor("#666666"))
    sFooter = ParagraphStyle("EFoot", parent=styles["Normal"],
        fontName="Helvetica", fontSize=7, textColor=HexColor("#999999"), alignment=TA_CENTER)
    sLabel = ParagraphStyle("ELabel", parent=styles["Normal"],
        fontName="Helvetica", fontSize=8, textColor=HexColor("#666666"))

    story = []

    # ── Header ──
    story.append(Paragraph("2025 Tax Year — Uniform &amp; Equal Analysis", sTitle))
    story.append(Paragraph("Harris County Appraisal District  ·  Property Tax Protest", sSub))
    story.append(HRFlowable(width="100%", thickness=1, color=black))
    story.append(Spacer(1, 14))

    # ── Subject Property Box ──
    subj_data = [
        [Paragraph("<b>Subject Property</b>", ParagraphStyle("sp", parent=sBody, textColor=white)),
         "", "", ""],
        [Paragraph("<b>Address:</b>", sSmall), Paragraph(PROP["address"], sBody),
         Paragraph("<b>Account:</b>", sSmall), Paragraph(PROP["account"], sBody)],
        [Paragraph("<b>Living Area:</b>", sSmall), Paragraph(f'{PROP["sqft"]} sqft', sBody),
         Paragraph("<b>Year Built:</b>", sSmall), Paragraph(PROP["year_built"], sBody)],
        [Paragraph("<b>Neighborhood:</b>", sSmall), Paragraph(PROP["nbhd"], sBody),
         Paragraph("<b>$/sqft:</b>", sSmall), Paragraph(PROP["per_sqft"], sBody)],
    ]
    subj_t = Table(subj_data, colWidths=[1.1*inch, 2.5*inch, 1.0*inch, 2.0*inch])
    subj_t.setStyle(TableStyle([
        ("SPAN", (0,0), (-1,0)),
        ("BACKGROUND", (0,0), (-1,0), black),
        ("TEXTCOLOR", (0,0), (-1,0), white),
        ("TOPPADDING", (0,0), (-1,0), 5),
        ("BOTTOMPADDING", (0,0), (-1,0), 5),
        ("LEFTPADDING", (0,0), (-1,0), 8),
        ("BOX", (0,0), (-1,-1), 0.75, black),
        ("LINEBELOW", (0,0), (-1,0), 0.75, black),
        ("TOPPADDING", (0,1), (-1,-1), 4),
        ("BOTTOMPADDING", (0,1), (-1,-1), 4),
        ("LEFTPADDING", (0,1), (-1,-1), 8),
        ("GRID", (0,1), (-1,-1), 0.25, MED_GRAY),
    ]))
    story.append(subj_t)
    story.append(Spacer(1, 6))

    # Value summary
    val_data = [
        [Paragraph("<b>2025 Appraised Value (HCAD):</b>", sBody),
         Paragraph(f"<b>{PROP['current_value']}</b>", sBody),
         Paragraph("<b>Requested Value:</b>", sBody),
         Paragraph(f"<b>{PROP['fair_value']}</b>", sBody)],
    ]
    val_t = Table(val_data, colWidths=[2.2*inch, 1.4*inch, 1.7*inch, 1.3*inch])
    val_t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), LIGHT_GRAY),
        ("BOX", (0,0), (-1,-1), 0.5, black),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(val_t)
    story.append(Spacer(1, 14))

    # ── Statement of Unequal Appraisal ──
    story.append(HRFlowable(width="100%", thickness=0.5, color=black))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Statement of Unequal Appraisal", sSecH))

    story.append(Paragraph(
        f'The subject property at {PROP["address"]} (Account #{PROP["account"]}) is appraised by the '
        f'Harris County Appraisal District at {PROP["current_value"]} for the 2025 tax year. The property '
        f'owner requests a reduction to {PROP["fair_value"]} based on the following grounds:',
        sBody))
    story.append(Spacer(1, 8))

    # 3 numbered arguments (Deji format)
    arg_style = ParagraphStyle("arg", parent=sBody, leftIndent=20, spaceAfter=8)
    arg_head = ParagraphStyle("argH", parent=sBodyBold, leftIndent=0, spaceAfter=2)

    story.append(Paragraph("1.  Unequal Appraisal — $/sqft Disparity (§42.26)", arg_head))
    story.append(Paragraph(
        f'The subject property is appraised at {PROP["per_sqft"]} per square foot. An analysis of '
        f'{len(COMPS)} comparable properties within the same neighborhood ({PROP["nbhd"]}) yields a '
        f'median appraised value of {PROP["median_sqft"]} per square foot. The subject exceeds the '
        f'comparable median by {PROP["over_pct"]}%. Under Section 42.26(a)(3) of the Texas Property Tax '
        f'Code, the property owner is entitled to relief when the appraised value exceeds the median '
        f'of comparable properties.',
        arg_style))

    story.append(Paragraph("2.  Comparable Properties Support Lower Valuation", arg_head))
    story.append(Paragraph(
        f'Nine (9) comparable properties were selected from the same neighborhood based on proximity, '
        f'similar living area (1,950–2,300 sqft), similar year built (2003–2007), and identical property '
        f'classification. All values are 2025 HCAD certified appraisals. The comparable properties are '
        f'detailed in the table below.',
        arg_style))

    story.append(Paragraph("3.  Requested Action", arg_head))
    story.append(Paragraph(
        f'Based on the uniform and equal analysis of comparable properties, the owner respectfully requests '
        f'the Appraisal Review Board reduce the appraised value of the subject property from '
        f'{PROP["current_value"]} to {PROP["fair_value"]} ({PROP["median_sqft"]}/sqft × {PROP["sqft"]} sqft), '
        f'consistent with the median valuation of comparable properties in the same neighborhood.',
        arg_style))
    story.append(Spacer(1, 10))

    # ── Comparable Properties Table ──
    story.append(HRFlowable(width="100%", thickness=0.5, color=black))
    story.append(Spacer(1, 2))
    story.append(Paragraph("2025 Appraised Values — Comparable Properties", sSecH))

    comp_header = [
        Paragraph("<b>#</b>", ParagraphStyle("ch", parent=sSmall, textColor=white, alignment=TA_CENTER)),
        Paragraph("<b>Address</b>", ParagraphStyle("ch", parent=sSmall, textColor=white)),
        Paragraph("<b>Account</b>", ParagraphStyle("ch", parent=sSmall, textColor=white)),
        Paragraph("<b>Living Area</b>", ParagraphStyle("ch", parent=sSmall, textColor=white, alignment=TA_RIGHT)),
        Paragraph("<b>Year Built</b>", ParagraphStyle("ch", parent=sSmall, textColor=white, alignment=TA_CENTER)),
        Paragraph("<b>2025 Appraised</b>", ParagraphStyle("ch", parent=sSmall, textColor=white, alignment=TA_RIGHT)),
        Paragraph("<b>$/sqft</b>", ParagraphStyle("ch", parent=sSmall, textColor=white, alignment=TA_RIGHT)),
    ]

    rStyle = ParagraphStyle("cr", parent=sSmall, textColor=black)
    rStyleR = ParagraphStyle("crr", parent=sSmall, textColor=black, alignment=TA_RIGHT)
    rStyleC = ParagraphStyle("crc", parent=sSmall, textColor=black, alignment=TA_CENTER)

    comp_data = [comp_header]

    # Subject row
    subj_row_style = ParagraphStyle("sr", parent=sSmall, textColor=black)
    subj_row_styleB = ParagraphStyle("srb", parent=subj_row_style, fontName="Helvetica-Bold")
    comp_data.append([
        Paragraph("<b>S</b>", ParagraphStyle("src", parent=subj_row_styleB, alignment=TA_CENTER)),
        Paragraph(f"<b>{PROP['address'].split(',')[0]}</b>", subj_row_styleB),
        Paragraph(f"<b>{PROP['account']}</b>", subj_row_styleB),
        Paragraph(f"<b>{PROP['sqft']}</b>", ParagraphStyle("srr", parent=subj_row_styleB, alignment=TA_RIGHT)),
        Paragraph(f"<b>{PROP['year_built']}</b>", ParagraphStyle("src2", parent=subj_row_styleB, alignment=TA_CENTER)),
        Paragraph(f"<b>{PROP['current_value']}</b>", ParagraphStyle("srr2", parent=subj_row_styleB, alignment=TA_RIGHT)),
        Paragraph(f"<b>{PROP['per_sqft']}</b>", ParagraphStyle("srr3", parent=subj_row_styleB, alignment=TA_RIGHT)),
    ])

    for c in COMPS:
        comp_data.append([
            Paragraph(c[0], rStyleC),
            Paragraph(c[1], rStyle),
            Paragraph(c[2], rStyle),
            Paragraph(c[3], rStyleR),
            Paragraph(c[4], rStyleC),
            Paragraph(c[5], rStyleR),
            Paragraph(c[6], rStyleR),
        ])

    cw = [0.3*inch, 1.5*inch, 0.95*inch, 0.7*inch, 0.65*inch, 1.05*inch, 0.65*inch]
    ct = Table(comp_data, colWidths=cw, repeatRows=1)
    comp_style_cmds = [
        ("BACKGROUND", (0,0), (-1,0), black),
        ("TEXTCOLOR", (0,0), (-1,0), white),
        ("FONTSIZE", (0,0), (-1,-1), 8),
        ("BACKGROUND", (0,1), (-1,1), HexColor("#e8e8e8")),
        ("BOX", (0,0), (-1,-1), 0.75, black),
        ("LINEBELOW", (0,0), (-1,0), 0.75, black),
        ("LINEBELOW", (0,1), (-1,1), 0.5, black),
        ("GRID", (0,0), (-1,-1), 0.25, HexColor("#cccccc")),
        ("TOPPADDING", (0,0), (-1,-1), 3),
        ("BOTTOMPADDING", (0,0), (-1,-1), 3),
        ("LEFTPADDING", (0,0), (-1,-1), 4),
        ("RIGHTPADDING", (0,0), (-1,-1), 4),
    ]
    for i in range(3, len(comp_data), 2):
        comp_style_cmds.append(("BACKGROUND", (0,i), (-1,i), HexColor("#f5f5f5")))
    ct.setStyle(TableStyle(comp_style_cmds))
    story.append(ct)
    story.append(Spacer(1, 12))

    # ── Statistical Summary ──
    story.append(HRFlowable(width="100%", thickness=0.5, color=black))
    story.append(Spacer(1, 2))
    story.append(Paragraph("Statistical Summary", sSecH))

    stat_data = [
        [Paragraph("<b>Metric</b>", ParagraphStyle("sh", parent=sSmall, textColor=white)),
         Paragraph("<b>$/sqft</b>", ParagraphStyle("sh", parent=sSmall, textColor=white, alignment=TA_RIGHT)),
         Paragraph("<b>Implied Value</b>", ParagraphStyle("sh", parent=sSmall, textColor=white, alignment=TA_RIGHT))],
        [Paragraph("Subject Property", sBodyBold),
         Paragraph(PROP["per_sqft"], ParagraphStyle("x", parent=sBody, alignment=TA_RIGHT)),
         Paragraph(PROP["current_value"], ParagraphStyle("x", parent=sBody, alignment=TA_RIGHT))],
        [Paragraph("Comparable Median", sBody),
         Paragraph(PROP["median_sqft"], ParagraphStyle("x", parent=sBody, alignment=TA_RIGHT)),
         Paragraph(PROP["fair_value"], ParagraphStyle("x", parent=sBody, alignment=TA_RIGHT))],
        [Paragraph("Comparable Average", sBody),
         Paragraph("$159.07", ParagraphStyle("x", parent=sBody, alignment=TA_RIGHT)),
         Paragraph("$341,901", ParagraphStyle("x", parent=sBody, alignment=TA_RIGHT))],
        [Paragraph("<b>Difference (Subject vs. Median)</b>", sBodyBold),
         Paragraph(f"<b>+$20.00</b>", ParagraphStyle("x", parent=sBodyBold, alignment=TA_RIGHT)),
         Paragraph(f"<b>+{PROP['reduction']}</b>", ParagraphStyle("x", parent=sBodyBold, alignment=TA_RIGHT))],
    ]
    stat_t = Table(stat_data, colWidths=[2.8*inch, 1.5*inch, 1.5*inch])
    stat_style = [
        ("BACKGROUND", (0,0), (-1,0), black),
        ("TEXTCOLOR", (0,0), (-1,0), white),
        ("BOX", (0,0), (-1,-1), 0.75, black),
        ("GRID", (0,0), (-1,-1), 0.25, HexColor("#cccccc")),
        ("TOPPADDING", (0,0), (-1,-1), 4),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
        ("RIGHTPADDING", (0,0), (-1,-1), 8),
        ("BACKGROUND", (0,2), (-1,2), HexColor("#f5f5f5")),
        ("BACKGROUND", (0,4), (-1,4), HexColor("#e8e8e8")),
    ]
    stat_t.setStyle(TableStyle(stat_style))
    story.append(stat_t)

    story.append(Spacer(1, 20))

    # ── Footer ──
    story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#cccccc")))
    story.append(Spacer(1, 4))
    story.append(Paragraph(
        "All values reflect 2025 Harris County Appraisal District certified appraisals.  ·  "
        "Data sourced from HCAD public records.  ·  Generated February 12, 2026.",
        sFooter))
    story.append(Spacer(1, 2))
    story.append(Paragraph(
        "Prepared by Overtaxed  ·  hello@getovertaxed.com",
        sFooter))

    doc.build(story)
    print(f"✅ Created {path}")


# =====================================================================
# Run
# =====================================================================

if __name__ == "__main__":
    build_current()
    build_guide()
    build_evidence()
    print("\n🎉 All 3 PDFs generated in:", OUT_DIR)
