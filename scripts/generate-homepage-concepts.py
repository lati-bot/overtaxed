#!/usr/bin/env python3
"""Generate non-factual art-direction studies for the professional homepage."""

from __future__ import annotations

import base64
import json
import pathlib
import time
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "artifacts" / "homepage-redesign" / "concepts"
SECRET = pathlib.Path("/Users/lab/.openclaw/secrets/azure-image-gen.json")

PROMPTS = {
    "a-editorial-case-file": """Art-direction study only; absolutely no legible text, words, numbers, logos, seals, signatures, or factual UI. Create a wide editorial hero composition showing fragmented municipal property-record papers resolving into one precise professional case-file object. Warm ivory uncoated paper, near-black ink, deep desaturated civic green, tiny restrained rust annotation marks, subtle paper grain, blind embossing and registration marks. Orthographic three-quarter top-down view, calm museum-catalog lighting, generous negative space around the case file, quietly premium, evidence-led, sober and exact. Suggest parcel geometry, tabular rhythms, source tabs, and an unresolved-evidence marker only as abstract shapes. No people, no hands, no buildings, no courthouse, no gavel, no scales of justice, no laptop mockup, no glossy dashboard, no glowing AI gradient, no blue neon, no fake government insignia. Designed as a background study that will receive real HTML typography and verified Cook County data later.""",
    "a-architectural-case-file": """Art-direction study only; no legible text or numbers. Wide landscape composition of a rigorous professional evidence case file built like an architectural drawing set: one central ivory dossier, narrow source tabs, measured grid lines, parcel-map geometry, transparent vellum overlays, punched registration holes, and one visible human-review gate represented by a simple empty frame. Deep ink green, carbon black, warm paper, minimal rust accent. Crisp orthographic system, restrained depth, abundant clean negative space, sophisticated civic-document aesthetic. Never resemble generic SaaS, fintech, AI, a law office advertisement, or a literal government form. No people, courthouse, gavel, handshake, device frame, glass cards, gradients, logos, readable labels, fake seals, or invented records. Real interface text will be rebuilt separately in HTML.""",
    "a-warm-tactile-case-file": """Art-direction study only; no readable writing, numbers, logos, or official marks. A warm premium archival case-file scene for a Cook County property evidence workflow: carefully aligned cream papers, one forest-green cloth file cover, translucent tracing-paper parcel lines, small paper clips, restrained terracotta review flags, and a structured comparison sheet expressed only through abstract line rhythms. Side-lit but not moody, tactile and human without showing people, quiet confidence, editorial legal-research publication quality, wide horizontal framing with clean space for headline. No gavel, courthouse, house photography, laptop, dashboard, AI glow, blue gradient, stock-business scene, fake government seal, or legible generated content.""",
    "b-editorial-convergence": """Art-direction study only; no legible text, numbers, logos, or seals. Wide editorial visualization of scattered public-record fragments on the left—abstract parcel map, assessment rows, source slips, historical decision card—moving through a disciplined screening channel into one clean inspectable case file on the right. Warm ivory background, deep ink green rules, charcoal type-like marks, restrained rust for adverse evidence, high-end information-design annual-report style. Make the transformation immediately understandable but subtle, with generous negative space and no magical effects. No people, no courthouse, no gavel, no house photo, no device mockup, no glowing AI gradient, no glass cards, no fake official documents. All factual text will be rendered later in HTML.""",
    "b-systematic-convergence": """Art-direction study only; no readable text or numbers. A precise horizontal evidence pipeline shown as physical paper layers and abstract data marks: multiple fragmented county-source cards enter from the left, pass through transparent filters that reveal exclusions and conflicts, and emerge as a single organized professional review file on the right. Orthographic, systematic, quiet, deep desaturated green and near-black on warm off-white, minimal rust warning accents, measured spacing, subtle technical-grid and parcel-line motifs. Professional instrument, not tech spectacle. No arrows with words, logos, seals, people, law clichés, dashboard UI, neon, gradients, fake records, or decorative clutter.""",
    "b-warm-collage-convergence": """Art-direction study only; no legible writing or official marks. A tactile documentary collage where loosely stacked municipal-record papers, map fragments and comparison strips gradually align into one composed case-file spread. Warm cream stock, forest-green folder edge, carbon pencil grid, tiny muted clay-red flags, soft natural shadows, sophisticated editorial art direction, wide horizontal hero crop, calm and credible. The organization journey must read clearly from disorder to inspectable structure. No hands or people, no courthouse, no gavel, no generic home image, no computer, no AI glow, no blue gradient, no readable generated text, no fake seals.""",
    "c-editorial-workflow": """Art-direction study only; no legible text, words, numbers, logos, or seals. A refined three-stage professional evidence workflow in a wide horizontal composition: stage one reconstructs fragmented record layers; stage two examines a small field of comparable candidates with supporting, adverse and excluded states; stage three prepares one clean review file that stops at a visible human approval gate. Use abstract papers, parcel geometry, dots, brackets and line rhythms—not software screens. Warm ivory, near-black, deep civic green and restrained rust. Editorial information design, quiet premium, clear enough for a homepage supporting graphic. No people, courthouse, gavel, handshake, house photo, device frames, neon, glass, AI gradients, fake records, or readable text.""",
    "c-architectural-workflow": """Art-direction study only; no readable text or numbers. Three connected architectural plates on a warm-paper field represent reconstruct, examine, prepare: layered source sheets with explicit gaps; a comparison matrix with visible alternate and excluded paths; a composed case file ending before a simple empty review frame. Strict grid, fine ink rules, parcel-map contours, deep desaturated forest green, charcoal, one muted terracotta alert. Precise civic-research aesthetic, broad landscape layout, restrained and professional. No generic SaaS, no magical automation, no AI glow, no gradients, no official seals, no people, no courthouse or law clichés.""",
    "c-tactile-workflow": """Art-direction study only; no legible labels, numbers, logos, or seals. A tactile triptych on an archivist's work surface: left, mixed paper fragments and map vellum; center, carefully compared evidence slips with green, rust and neutral edge marks; right, a bound cream case file paused at an empty dark-green review gate. Warm natural paper, subtle shadows, quiet human craft, premium documentary magazine style, plenty of open space, wide horizontal crop. No visible people or hands, no law-office stock scene, no courthouse, gavel, scales, home photography, laptop, dashboard, neon or generated fake text.""",
}


def request_image(prompt: str) -> bytes:
    cfg = json.loads(SECRET.read_text())["azure_openai"]
    deployment = cfg["models"]["gpt-image-1.5"]["deployment"]
    url = f'{cfg["base_url"]}/{deployment}/images/generations?api-version={cfg["api_version"]}'
    payload = {
        "prompt": prompt,
        "size": "1536x1024",
        "n": 1,
        "quality": "high",
        "output_format": "png",
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "api-key": cfg["api_key"]},
    )
    with urllib.request.urlopen(req, timeout=300) as response:
        data = json.load(response)
    item = data["data"][0]
    if "b64_json" in item:
        return base64.b64decode(item["b64_json"])
    if "url" in item:
        with urllib.request.urlopen(item["url"], timeout=300) as response:
            return response.read()
    raise RuntimeError("Image response contained neither b64_json nor url")


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for index, (name, prompt) in enumerate(PROMPTS.items(), start=1):
        target = OUTPUT / f"{name}.png"
        if target.exists():
            print(f"[{index}/{len(PROMPTS)}] exists: {target.name}", flush=True)
            continue
        print(f"[{index}/{len(PROMPTS)}] generating: {target.name}", flush=True)
        try:
            target.write_bytes(request_image(prompt))
            print(f"[{index}/{len(PROMPTS)}] wrote {target.stat().st_size:,} bytes", flush=True)
        except urllib.error.HTTPError as exc:
            body = exc.read().decode(errors="replace")
            raise RuntimeError(f"Image API returned HTTP {exc.code}: {body[:800]}") from exc
        if index < len(PROMPTS):
            time.sleep(8)


if __name__ == "__main__":
    main()
