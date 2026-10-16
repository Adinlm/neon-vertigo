# NEON VERTIGO 3.7.4 — FINAL HTML EDITION

Final normal public edition approved by the owner after Samsung Galaxy Z Fold5 testing. Publication adds no gameplay or asset changes: index.html is byte-identical to the approved artifact from 4b80735f7e9f2ba2703a87ccd567f05a4c14abd3 on fix/3.7.4-architecture-performance.

- SHA-256: 1b37ddc66e03e939984b8d60f63bab913eda027fd9332a2e1616b0713f5809e0
- Size: 30908623 bytes
- Release reference: annotated tag v3.7.4-html-final on main.
- Site: https://adinlm.github.io/neon-vertigo/ (GitHub Pages, main /).
- Prior public release: 3.6.3, commit 16a83f77b794391b641b7f2ac656d7849354ed30, SHA-256 f194b6d190406574869caf5dcd358804205a25914bcaa7ecbf3c27e17b9c928a, retained on legacy/3.6.3-international-stable without modification.

## Normal campaign and fleet

Start with STRIX-01 and RAZOR-X. FANG GT, IRON WRAITH and SOVEREIGN require Sony, Vader and Cooper respectively, after each territory's two crew races. THE CROWN requires all three conquests. The original progression remains: ten Easy/Normal wins unlock Hard; all ten Hard wins reveal PROJECT ZERO. Six tracks are initially available in free race, three first events in campaign; all thirteen become available through the existing progression. Free race does not count as a campaign victory.

There is no public unlock-all control, URL privilege, simulation hook or old test-save namespace reader. Marked test/diagnostic NV3 imports are rejected. Valid earlier saves retain their earned content. Performance Diagnostics is preserved, off by default and stored separately from campaign; recording/export does not unlock ships or events.

## Release validation

Reexecuted on this exact SHA: 420 route checks, 308 camera/respawn checks, 90 traffic checks including six civilian seeds, 44 DOM checks, 22 turbo PCM/live checks, 19 HUD, 57 integration and 7 offline checks. All eighteen historical suite executions pass. Additional progression/NV3: 65/65; raw UI/offline: 21/21; protected systems/media: 77/77; turbo audio lifecycle: 73/73; Performance Diagnostics: 29/29.

New/fresh and legitimately earned profiles are distinct. Wins are supplied to the unchanged result handler only through external test copies; this does not claim manually driving a full campaign. Browser close/reopen, actual NV3 import/export controls, 3.6.3 saves and retained records were checked. The existing sanitizer's timestamp normalization and pending reward-notice consumption are recorded explicitly; no save schema or game logic is changed for release.

The owner supplies the physical Fold5 acceptance; this release validation uses real Edge/WebGL rendering on PC, including mobile viewports. It does not independently measure phone temperature, battery or long-session performance. The engine retains its existing WebGL1 API.

The publication commit contains only index.html, this release record/validation/handoff and the updated README. Test profiles, completed-save fixtures, instrumented HTML, temporary output and historical evidence folders are excluded.

[Validation manifest](PUBLIC_VALIDATION.json) · [Godot reference](GODOT_MIGRATION_HANDOFF.md). No native migration is started. The deployment commit and served-file hash are recorded in the external publication receipt after GitHub Pages completes.
