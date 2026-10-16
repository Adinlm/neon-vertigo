Referencia de publicación: `v3.7.4-html-final`, SHA-256 `1b37ddc66e03e939984b8d60f63bab913eda027fd9332a2e1616b0713f5809e0`, 30908623 bytes. El código y herramientas detalladas de extracción se conservan en la rama local `fix/3.7.4-architecture-performance` y el commit `4b80735f7e9f2ba2703a87ccd567f05a4c14abd3`; no se añaden herramientas de pruebas al sitio público.

# Handoff para NEON VERTIGO nativo (Godot 4, Android) — desde el HTML 3.7.4

El HTML 3.7.4 queda como **referencia funcional**. Esta entrega no crea proyecto Godot, escenas ni importadores; solo documenta qué hay, dónde está y cómo extraerlo sin perder contratos. El propietario declara superada la prueba física en el Fold5 y aprueba la publicación el 2026-10-16. La referencia congelada es el tag v3.7.4-html-final de main.

Base: `index.html` de la rama `fix/3.7.4-architecture-performance` (SHA en `FINAL_TEST_RESULTS.json`). Herramienta de lectura del código sin medios: `node tools/extract_source.mjs index.html work/source-view.js`. Todo lo que sigue se puede leer en una copia instrumentada con `tests/harness.mjs` (`window.__NVT.ev`), nunca en el HTML distribuido.

## 1. Sistemas de coordenadas y unidades

- Unidades en metros, Y hacia arriba, mundo WebGL de mano derecha (cámara `lookAt`).
- **Coordenadas de vía** `(s, x, y)`: `s` = distancia a lo largo de la avenida principal (0..L, envuelve), `x` lateral (+ = derecha del sentido de marcha, vector `R`), `y` a lo largo de `U` (normal de vía). Conversión: `tf(s)` llena el marco `F` (P, T, R, U, curvatura, banda `yMin/yMax`), `wp(s,x,y,o)` → mundo; `wpv` usa vertical mundial en lugar de `U`.
- **Ramales** (`rt>0`): misma `s` de progreso que la avenida; `tfr(s,rt)` y `routePoint(r,d,x,y,o)` usan el marco propio del ramal (`r.P/T/R/U`, muestreado cada `r.ds`). `K = ds_avenida/ds_real` corrige la velocidad de avance para que el progreso siga siendo continuo. `x,y` de una entidad son siempre locales a su corredor.
- Exportar a Godot como: curva de avenida (puntos `TP`, tangentes `TT`, laterales `TRr`, normales `TU`, `CV`, bandas `YMn/YMx`) y, por ramal, `P/T/R/U/K/CV/YMn/YMx/lat/up` + metadatos (`sA, span, sSep, sJoin, side, xs, ax, hw, deck, roofH, kind, roof`). Un `Path3D` con `Curve3D` sirve para la visualización; la física debe seguir usando el marco discreto exportado para no cambiar el comportamiento.

## 2. Pistas, splines y atajos

| Dato | Fuente HTML | Exportable como datos |
|---|---|---|
| 13 circuitos | `TRACKS` (+`LPTS`), `buildTrack()` | Sí: puntos de control, semilla, tema, `hw, ymin, ymax, tun, tunnels, bridges, boxes, pylons, pads, pipes, narrows, gates, strips, presses, vents, traffic, music, words` |
| 18 atajos | `ROUTEDEFS` → `makeRoute()` | Sí: perfiles `lat`/`up` por `u`, `kind high/low`, `roof`, `hw`, bandas, pads, franjas, preferencias de IA |
| Divisores | `routeFeatures()` → `OB{k:'div', rt:-1}` | Sí (cajas por tramos de 8 m en coordenadas de avenida). 3.7.4: en ramales con techo, toda la zona de boca/unión es de altura completa |
| Geometría de ciudad | `buildWorld()`, chunks `CHL` (stride 12), glow `GCHL` (stride 10) | Recomendado: exportar mallas resultantes por chunk con su semilla, no regenerar con otro RNG |

Contratos: `rtCheck/rtSwitch` cambian de corredor en `sA/sB`; `roofEntryFits` (3.7.3) impide entrar por encima de la banda; `rel()` traduce objetos entre corredores en zonas de boca/unión.

## 3. Geometría y colisión (incluye 3.7.4)

- Regla de oro heredada y aplicada en 3.7.4: **lo visible y lo sólido representan el mismo volumen**. Las piezas nuevas se validan con SAT contra los volúmenes de vuelo y con proyección al marco de avenida contra los divisores (`tests/architecture_374/geometry.mjs`, 71/71).
- Portales de túnel (3.7.4, `routePortals`): bloque arquitectónico que ocupa exactamente el volumen del divisor de altura completa (lado del ramal, `x` de `xs` a `HW+6`, `YMIN-6` a `YMAX+6+H`). Muros verticales en marco mundial (`wpv`) para evitar deriva lateral respecto del marco inclinado del ramal; tapas en marco de avenida. Sustituye las carcasas escalonadas de 3.7.3 (`routeRoofGuards`, conservada sin uso).
- Vigas bajo rampas (3.7.4, `routeRampRibs`): su cara inferior coincide con el techo de colisión de cada tramo de 8 m del divisor de los ramales elevados.
- Ménsulas/pilonos exteriores (3.7.4, `routeSupports`): fuera de `HW+0.65` (margen del volumen de avenida) y validados con SAT; en la práctica quedan junto a fachadas.
- Turbos de avenida en bocas/uniones (3.7.4, `routeMainBoostFit`): reubica anillos y recorta franjas en el divisor; presentación y activación usan los mismos datos.
- Techo de túnel: material básico iluminado (`1.0`), no la clase metálica 4.x que reflejaba el cielo.
- Colisión de nave: semiejes `CHX/CHY/CHS`; `obstacleCol`, `racerCol`, `trafficCol`, `ventHit` (+`plasmaClear`).

## 4. Física, turbo e IA

- `physics(c,dt,live)` con subpasos de 1/60 s en `tick()`. Velocidades `VMAX=125·vmax`, `VBOOST=168·vmax`, `DRIFT`. No reequilibrar al portar: usar el HTML como oráculo determinista (`tests/simlib.js` + `NVSIM.race` con semillas).
- Turbo: capacidad 1, consumo 1/3, pad de ramal rectangular `hx=hy=3.3` (activación `padHit`), pad de avenida círculo 3,8, franja `boost≥0.4`, regeneración pasiva `0.0255·shRg·dt` (aprobada en 3.7.3, intacta).
- IA: `aiPick`, `aiDrive`, `aiRoutePlan` (decisión de ramal por personalidad `pref`), `progress/rank` por checkpoints (`CPS`, 8 por vuelta).
- Tráfico físico `TF` (flotas por distrito, `TKIND`) ≠ tráfico ambiental `AMB` (solo luces; desde 3.7.3/3.7.4 con cascos `AM` ≤64 en vistas elevadas, incluido Beagle's Crown).

## 5. Cámara, accidente y reaparición

`camFrame`, `camRay`, `camClearEye`, `camChase`, `updateCam` (`lastRtDist` evita saltos ramal↔avenida), `crashPose`, `cinePose`, `wreckRacer/wreckUpdate/respawnRacer` con `rtW`/`wRt` (corrección de Gemini Argon, 3.7.1). Contratos validados por 253 + 55 casos; deben reproducirse en Godot antes de añadir decoración.

## 6. Audio adaptativo

Bancos embebidos (`STEMB64`), `makeStemPlayer`, `STEM.CFG/VCFG/CCFG/RCFG`, capa de turbo con rampa de cancelación 0,12 s, `HUDSFX/HUDCFG` (21 recetas DSP), motores `makeEngine`. Extraer PCM con hashes y las curvas de ganancia; mapear a `AudioStreamPlayer` + buses con los mismos estados (`MU.setState`, `MU.setBoost`, `MU.respawn`).

## 7. Publicidad, atlas y materiales

- Atlas: `TEX` (palabras por distrito, `hcell` 4×8 horizontales, `vcell` 8×2 verticales, generado por `makeAtlas(CFG.words)`), `TEX2` (anuncios, `acell` 8×16 y `bcell`), material 10.06 para `TEX2`, 0 para `TEX`.
- Ranuras por distrito: `K9SHOP`, `IAADS`, `SVADS`, orbital `hcell`.
- Capas: 3.7.2/3.7.3 `routeAdLayout/routeAdvertising` (RNG privado) y 3.7.4 `routeTunnelAds` (RNG privado `seed*5003+id*911+374`): tableros 4,3–5,5 m y carteles verticales 1,8×4,4 m en paredes, cada 14–22 m, alternando lados y solo pared exterior en bocas/uniones.
- Exportar como lista de instancias (centro, ejes, tamaño, atlas, celda UV, color de marco) → `MultiMeshInstance3D` o `Decal`/`Sprite3D` con un único material por atlas.

## 8. Naves, campaña y guardados

- `SHIPS` (6), `DESIGNS`, `MESH`, `shipMods`; estadísticas sin cambios desde 3.6.3/3.7.
- Campaña: `EVENTS`, `PROGRESSION`, `TERRS`, `LINES` (ES/EN), retratos y desbloqueos; `I18N` + `LANGCAT`.
- Guardados: `careerSave/careerLoad/sanitizeCareer`, claves `nv3_career`, `nv3_set`, `nv3_best_*`, `nv3_lang`; código de intercambio `NV3:<base64>:<fnv>` (`exportCode/parseImport`). 3.7.4 añade solo `nv3_perf` (preferencias del monitor), fuera del esquema NV3. Probado: códigos 3.7.3 ↔ 3.7.4 en ambos sentidos.

## 9. Métricas de rendimiento para la etapa nativa

El JSON del monitor (ver `PERFORMANCE_DIAGNOSTICS_SPEC.md`) define el contrato de comparación: mismas carreras, mismos sectores (`L·S·`), mismos ramales. En Godot conviene reproducir: histograma de intervalo de cuadro, p95/p99, episodios >33,3/50 ms con contexto, tiempo de CPU de simulación y render, tiempo GPU (Godot expone `RenderingServer.get_frame_setup_time_cpu/get_frame_render_time_gpu` cuando el backend lo permite), draw calls y primitivas (`Performance.RENDER_TOTAL_DRAW_CALLS_IN_FRAME`, `RENDER_TOTAL_PRIMITIVES_IN_FRAME`). Así los JSON del HTML y del nativo serán comparables en el mismo Fold5.

## 10. Qué se puede exportar como datos y qué hay que reescribir

| Sistema | Exportar como datos | Reescribir |
|---|---|---|
| Pistas, ramales, bandas, divisores, pads, franjas, peligros | Sí (JSON por circuito) | Constructores de malla si se quiere LOD nativo |
| Mallas de ciudad | Sí (buffers por chunk + materiales) | Shaders (GLSL ES 1.0 → Godot shading language) |
| Publicidad y atlas | Sí (instancias + PNG de atlas) | Material de anuncio |
| Naves | Sí (mallas, parámetros) | Controladores |
| Física, IA, tráfico, cámara | Parámetros sí; lógica no | GDScript/C# fiel al oráculo HTML |
| Audio | PCM + curvas | Mezclador y estados |
| Campaña, diálogos, guardados | Sí (JSON, esquema NV3) | Pantallas/UI |
| Monitor | Formato JSON | Recolección con APIs de Godot |

Orden recomendado (sin ejecutar todavía): congelar el HTML aprobado; extraer datos con hashes; reproducir una avenida + un ramal con colisión y cámara validadas contra el HTML; física/IA/tráfico con el oráculo determinista; después atlas, audio, campaña y guardados; medir en el Fold5 desde la primera escena.
