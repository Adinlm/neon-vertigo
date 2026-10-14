# NEON VERTIGO 3.7 — AUDIO REPORT

Código `fd9c5a8c6a3e5856cb8ef6a0e7b0ef9ac2212c4b`. HUD: 19/19. Turbo: 18 renders + 4 reproducciones en juego, 22/22. Motores, SFX originales y recursos se conservaron.

## Banco HUD DSP

21 recetas DSP; prioridades 0–3, hasta cuatro voces de HUD, navegación monofónica, cooldown por evento, normalización -3 dBFS antes de ganancia, fade final de 4 ms. Limitador HUD → bus UI; buses music/sfx/ui → master → compresor maestro. Volumen usa pow(v/100,1.6). Ducking entra en 40 ms, mantiene el intervalo por evento y recupera en 450 ms; motores reciben 60% de los dB musicales.

| Cue | Prioridad | Cooldown s | Volumen | Duck dB/hold s |
| --- | ---: | ---: | ---: | --- |
| nav | 0 | 0.06 | 0.5 | — |
| confirm | 1 | 0.12 | 0.62 | — |
| back | 1 | 0.12 | 0.6 | — |
| hangar | 1 | 0.6 | 0.6 | — |
| shipSwap | 1 | 0.1 | 0.62 | — |
| locked | 1 | 0.3 | 0.62 | — |
| unlock | 2 | 1.5 | 0.62 | [2, 0.9] |
| diff | 1 | 0.1 | 0.6 | — |
| raceGo | 2 | 1 | 0.62 | [2, 0.6] |
| count | 3 | 0.5 | 0.75 | — |
| go | 3 | 1 | 0.72 | [3, 0.7] |
| turboReady | 2 | 2 | 0.56 | — |
| turboEnd | 2 | 1.2 | 0.5 | — |
| overtake | 1 | 2.5 | 0.58 | [1.5, 0.4] |
| takedown | 2 | 0.4 | 0.7 | [2.5, 0.6] |
| critical | 3 | 8 | 0.6 | [1.5, 0.6] |
| lapNew | 2 | 2 | 0.58 | [1.5, 0.5] |
| lastLap | 3 | 5 | 0.72 | [3, 1] |
| finish | 3 | 3 | 0.72 | [3, 1.1] |
| resultWin | 1 | 2 | 0.62 | — |
| resultLose | 1 | 2 | 0.58 | — |

Los 300 starts terminaron y desconectaron sus nodos. AudioContext suspendido no reprodujo cues y volvió tras resume. El stress de cuatro cues y el stress fuera del límite no produjeron clipping medido. El espectro nuevo pasó los umbrales definidos; los valores completos están en evidence/hud-spectrum.json. La referencia espectral antigua de los tres sonidos procede del archivo conservado de Claude; no se afirma haber re-renderizado ese comparador histórico en este paso.

## Turbo y recursos preservados

Sony: «Neon Fang Rush», brillante y sincopado. Vader: «Iron Press Protocol», industrial y marcial. Implementaciones Opus/DSP de Claude, 145 BPM, 16 compases, turboIn 0.5 s, turboOut 1.4 s. La comparación PCM usa eventos de vueltas, reactivaciones y cruce de loop; incluye controles Legacy vs Legacy para jitter. Sin turbo, mezclas normales coinciden con Legacy dentro del jitter observado. Cooper/Crown y motores permanecen intactos.

| Banco/capa | SHA-256 final | SHA-256 Legacy |
| --- | --- | --- |
| STEMB64/mel | `8170def4259e44a8bb046e84b1723746a37db2f2e6233a416013fcfae3b029c6` | `8170def4259e44a8bb046e84b1723746a37db2f2e6233a416013fcfae3b029c6` |
| STEMB64/chd | `c966c964ea5d21919744614b38cae15ee9fd08e4980c19ed9387905327016909` | `c966c964ea5d21919744614b38cae15ee9fd08e4980c19ed9387905327016909` |
| STEMB64/bas | `e0abbaef3d1feba4956810e5982016a8cfb8b368429eeee73ba0812314340459` | `e0abbaef3d1feba4956810e5982016a8cfb8b368429eeee73ba0812314340459` |
| STEMB64/drm | `2a25838c26277e0a1cf847175697dcf4e7cea46f0439a98ec3a8cd81e803f936` | `2a25838c26277e0a1cf847175697dcf4e7cea46f0439a98ec3a8cd81e803f936` |
| STEMB64/tur | `4952ee5ee06e87048c6ebf3173caf072faf076b37d3968b050bce07f2e5dc9b2` | `6d1c2ff2dddae221d448effbb240a467aa48593b6a0f7cf087e0c39bd1042ce9` |
| VADERSTEMB64/mel | `a9377a80db4f0d538f413e64365085e0f2e3132804df4f31621f7d95b2220f41` | `a9377a80db4f0d538f413e64365085e0f2e3132804df4f31621f7d95b2220f41` |
| VADERSTEMB64/chd | `5abcbc177de37f78673dfe4bb2833e27ab14428989b86471ffdea143a7924a31` | `5abcbc177de37f78673dfe4bb2833e27ab14428989b86471ffdea143a7924a31` |
| VADERSTEMB64/bas | `e9acf4c9698166ea24f7ecc4080166d3c14c6339848f63d2a19c6df8b7a3cacc` | `e9acf4c9698166ea24f7ecc4080166d3c14c6339848f63d2a19c6df8b7a3cacc` |
| VADERSTEMB64/drm | `aeb7ec8b68818c08eed9ac84be6608d8cd886149878ada9b56ffa1dc714780da` | `aeb7ec8b68818c08eed9ac84be6608d8cd886149878ada9b56ffa1dc714780da` |
| VADERSTEMB64/tur | `b37b2062abbe032135de98d0f52403e5118c2649700cf50b14b4ea5a84be79c7` | `e89927d1b55e8eedfc4d9befeec9a2a1fc02402657825af62f1aeac0d4c8badd` |
| COOPERSTEMB64/mel | `93974e0d888156974ad6f82f7a4d241be360760dffc3fc2a10b997999a84e499` | `93974e0d888156974ad6f82f7a4d241be360760dffc3fc2a10b997999a84e499` |
| COOPERSTEMB64/chd | `87007acd87022a5584f3360a0f23e4bbb73cfbee6cac9d5a2b177a0af4dc1ce9` | `87007acd87022a5584f3360a0f23e4bbb73cfbee6cac9d5a2b177a0af4dc1ce9` |
| COOPERSTEMB64/bas | `250060c23e1ab46a59fe1614f30e11532e86c784d2a7a6e9dc9b1aa14df7d19b` | `250060c23e1ab46a59fe1614f30e11532e86c784d2a7a6e9dc9b1aa14df7d19b` |
| COOPERSTEMB64/drm | `1ac0176245955993d783b4ff0ba9959108284932fb6625101189256a58bb3ff8` | `1ac0176245955993d783b4ff0ba9959108284932fb6625101189256a58bb3ff8` |
| COOPERSTEMB64/tur | `9d56fd6ebb5ef1f5a653e207ce2bc5e20839bf871e70643714092967391b85c9` | `9d56fd6ebb5ef1f5a653e207ce2bc5e20839bf871e70643714092967391b85c9` |
| CROWNSTEMB64/mel | `d5b5fe9e86a6c3d1e592b495fcd293c6a4d3f70875722a9593efb788484c13ac` | `d5b5fe9e86a6c3d1e592b495fcd293c6a4d3f70875722a9593efb788484c13ac` |
| CROWNSTEMB64/chd | `2f0d26bb22025df4ed86812a5a13c5abdf4a723b506018fbcfdc1e9bd5732ac9` | `2f0d26bb22025df4ed86812a5a13c5abdf4a723b506018fbcfdc1e9bd5732ac9` |
| CROWNSTEMB64/bas | `f4051597c98dc1affd7561a469c3bbc189f2352c80e1f6af09726103cbc82e8d` | `f4051597c98dc1affd7561a469c3bbc189f2352c80e1f6af09726103cbc82e8d` |
| CROWNSTEMB64/drm | `2f95e1b9fc788164bb4492e811a147efad5769d11dd64b3552f02d083e27a93f` | `2f95e1b9fc788164bb4492e811a147efad5769d11dd64b3552f02d083e27a93f` |
| CROWNSTEMB64/tur | `f34f34888921a8670cb937033e3e45e948aa5e66cdd7d6ef7bf142b9fcdbdfba` | `f34f34888921a8670cb937033e3e45e948aa5e66cdd7d6ef7bf142b9fcdbdfba` |

El informe estructurado de preservación incluye además los hashes de 18 retratos y dos finales WebP. Revisar en Fold5 volumen relativo, inteligibilidad, clicks percibidos, auriculares/parlantes, pausa, background/resume y bursts repetidos. Los umbrales de laboratorio no constituyen aprobación auditiva subjetiva.
