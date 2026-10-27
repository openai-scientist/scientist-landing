# OpenAI Scientist landing

User-directed brief. The supplied screenshot, existing platform, and follow-up instructions establish the visual direction; remaining composition decisions below are authored implementation choices.

- Vibe: monochrome, scientific, precise, dimensional. User: “phải thật đẹp, thật xịn, ko AI slop, các hạt pixel”.
- Reference: supplied split white/black OpenAI Scientist image. Preserve its scientific linework, pixel atmosphere and typography, adapting its composition for mobile.
- Journey: full landing approved by user: hero, interactive research workflow, workspace, FAQ. Added system overview, execution flow and review loop following “anatomy vẽ ra các UI phân tầng cho các diagram logic tổng quan hệ thống , chạy và luồng hoạt động”.
- Energy: ambitious opening, quiet explanation, one large interactive architecture reveal, concrete outputs, calm questions, decisive close.
- Emotion/peak: the layers separate and the visitor can trace a research case from workspace to engines, independent review and report.
- Signature: the research line. A run is a carriage on a bench rail; scrolling drives it past one instrument per engine, through gates, collecting tags for open findings while a dial reads the budget. Every step can also be picked, and the light/auto switch moves your levers.
- Range: technical editorial, high contrast, no invented customer counts, no gradient headlines, no generic colored cards.
- World: distinct sections in normal document flow, with one meaningful pinned architecture scene. No continuous video journey.
- Existing assets: logo mark, app icon, favicon, apple icon, Open Graph image, Geist fonts and login's line-bloom Lottie copied from ai-research-platform-fe. No generated bitmap imagery required.

## Feeling curve (before score)

1. Curiosity: a fine moving bloom appears against a pixel-eroded dark field.
2. Clarity: four research steps reveal actual outputs instead of marketing statistics.
3. Understanding (peak): the architecture separates into inspectable planes while a case follows a real execution path.
4. Confidence: the workspace specimen exposes evidence, an independent review, and open risks.
5. Reassurance: direct answers about automation, provenance and limitations.
6. Resolve: one next action, Start researching.

The tell-someone sentence: “It's the site where you can pull apart a research system and follow an idea through it.”

## Grammar and fingerprint

Research atlas, a project-specific grammar: persistent compact navigation; split title/bloom opening; four linked workflow specimens; a held exploded architecture; an inspectable evidence specimen; plain FAQ; decisive dark endplate. No video flythrough, no full-screen crossfading paragraphs, no fake product telemetry.

The eight stock grammars are not applied literally: filmic/worldflight conflict with the inspectable UI; editorial excludes the requested hero; live-surface forbids the requested marketing opening; poster excludes the Lottie; gallery describes a collection rather than a run; split-stage requires two real competing arguments; cutlist has the wrong tempo. This atlas has explicit boundaries and a single peak rather than borrowing all their devices.

First build in a new registry: no previous rows to compare.

## Score

| Beat         | Device                                                        | Purpose                                                    |
| ------------ | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Opening      | Measured split seam, pixel field, GSAP entrance, pointer depth | Match the reference: title on paper, bloom on night         |
| Statement    | Scroll Craft kinetic words                                    | The quiet act before the peak                              |
| Research line | GSAP pin + scrub over a pure state function, Anatomy Fig 1   | The peak: a run you can watch and stop at any step         |
| System       | Scroll Craft reveal, selectable parts, Anatomy Fig 2          | What each service owns and who it talks to                 |
| Using it     | Pinned GSAP scrub, camera zoom over Fig 3 (static on phones)  | Each step writes part of the report page                   |
| Terms, FAQ   | Poster lexicon with related terms, native disclosure          | Plain answers                                              |
| Close        | Dark endplate, Lottie bloom                                   | One next action                                            |

## Source truth

- `../logos/docs/architecture.md`: HTTP/SSE platform boundary, engine callbacks, dataset-first/default pipelines, PI, Critic, light/auto, closing obligations.
- `../ai-research-platform-fe/src/lib/run-stream/pipeline-adapter.ts`: visible pipeline steps and outputs.
- `../ai-research-platform-fe/src/config/app-config.ts`: brand and independence statement.

Diagrams are a conceptual visualization of documented software, not a measured physical device or a claim of live backend execution. Product specimens use clearly labelled example data; the landing makes no AI/provider calls.

## Anatomy figures

- Fig 1, the research line (Hero tier): bench, rail, carriage with the lit case card, intake hopper, three instruments with step lamps and loop pips, arms with a stage head and a review head, three gates with the Critic's loupe and your lever, tag slots, a token dial and a report tray. Gate plates are re-parented in front of or behind the carriage as it passes.
- Fig 2, the dispatch rack (Figure tier): desk, browser terminal, the Platform cabinet with six drawers, an audit spool, a budget meter and a patch strip, three engine bays and the oversight bay, each with request and callback cables.
- Built once by `scripts/build-figures.mjs`; the browser only moves groups and toggles lit parts. Words stay in HTML beside the drawings.

## Motion boundaries

Reduced motion: no pinning, looping, pointer parallax or scrub. All sections and complete diagrams remain visible in normal flow. Pause control stops ambient Lottie/canvas motion. SVG/HTML fallback is present before animation code loads. Small screens get a dedicated stacked composition and shorter architecture travel.
