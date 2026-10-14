# NEON VERTIGO 3.7 — CHANGELOG

Estado: **FUNCIONAL CON PENDIENTES**. Código `fd9c5a8c6a3e5856cb8ef6a0e7b0ef9ac2212c4b`. Rama experimental; la web pública permanece en 3.6.3.

## Trabajo de Claude preservado

HUD de 21 recetas DSP/prioridades/cooldowns/ducking; nuevos stems turbo Sony/Vader; 20 civiles de cuatro distritos y cuatro modelos históricos; motor de 18 ramales en 13 pistas, cámara/minimapa/IA/obstáculos de corredor. Se conservaron todos sus commits y scripts ignorados. Backup local `backup/3.7-claude-wip-0a83587`.

## Trabajo terminado por Codex

- Corregir fallback de esquiva que movía camiones hacia destinos rechazados; reproducir divisor iab con historia/seed/posición.
- Modelar tasas independientes de x/y y amortiguación vertical; evitar giro prematuro hacia pilones y descenso sobre puente.
- Añadir barrido sólido y resolución de contacto inicial; conservar colisiones y geometría.
- Comprobar spawn local en lugar de exigir un carril libre en todo el circuito; validar bandas de túnel.
- Evitar fallback inseguro de respawn; mantener entidad oculta y reintentar si no hay hueco.
- Comprobar seguridad de cambio de carril durante toda la maniobra y cancelarla al recibir un golpe.
- Mejorar selección de avenida de la IA con margen de hull antes de la boca.
- Reparar arnés HUD con variable sobrescrita, cierre CDP de procesos y calidad/reseed de simulaciones; recuperar 44 pruebas DOM reales de 3.6.3.
- Añadir fixtures de incidentes, safety/determinismo, preservación de recursos, integración gráfica/controles, offline y medición de rendimiento.
- Identificar HTML y descriptor NV3 como 3.7 conservando esquema v3; producir copia externa con SHA idéntico e informes.

La ampliación de márgenes de esquiva se descartó porque introdujo regresiones; no se presenta como parte de la solución final. El test offline inicialmente usó una clase DOM incorrecta y esperaba 13 pistas desbloqueadas en una campaña nueva: se corrigió a `.tcard` y a las seis pistas realmente disponibles, sin modificar desbloqueos del juego.

## Resultados

| Suite | Aprobadas | Fallos |
| --- | ---: | ---: |
| routes | 210/210 | 0 |
| traffic | 71/71 | 0 |
| safety | 8/8 | 0 |
| incident_replays | 3/3 | 0 |
| hud | 19/19 | 0 |
| turbo | 22/22 | 0 |
| legacy_DOM | 44/44 | 0 |
| preservation | 25/25 | 0 |
| real_browser_integration | 57/57 | 0 |
| raw_file_offline | 7/7 | 0 |
| buildings | 13/13 | 0 |
| route_visual_geometry | 18/18 | 0 |

39 carreras por versión, 138 participantes por versión: todos terminaron. Tiempo medio Legacy 119.952 s; experimental 121.011 s: **+0.883%**. Destrucciones 216 → 252: **+16.67%**. No se ajustó globalmente el tráfico para ocultar dificultad. Los resultados por pista y causas están en JSON; daños de ramales/colisiones de pilotos se distinguen del solapamiento injusto de tráfico, que fue cero en las suites finales.

| Distrito | Cambio tiempo medio | Destrucciones Legacy → 3.7 |
| --- | ---: | ---: |
| k9 | +0.33% | 60 → 61 |
| ia | +0.74% | 90 → 98 |
| sv | +1.30% | 46 → 66 |
| orb | +1.28% | 20 → 27 |

Causas de destrucción (clasificación del motor, no diagnóstico subjetivo):

| Causa | Legacy | 3.7 |
| --- | ---: | ---: |
| dmg | 6 | 9 |
| frontal | 7 | 8 |
| obstacle | 111 | 146 |
| slam | 46 | 50 |
| wall | 46 | 39 |

Los ramales ofrecen pads/strips y separación del tráfico contrario; a cambio añaden rampas, bandas estrechas y obstáculos propios. Los tiempos naturales de segmento tienen auto-selección de pilotos y no son una comparación causal con el mismo conductor. El aumento de destrucciones requiere valoración humana del riesgo/legibilidad; se conserva como pendiente de balance manual, sin eliminar obstáculos para igualar una cifra histórica.

Firmas de edificios: 13/13 iguales, 14762 llamadas por versión. Esta metodología no reproduce el total histórico 16.762. Los 20 WebP y los recursos normales de música/motores se preservaron; no se compuso música nueva.

## Pendientes

- Validación física del Galaxy Z Fold5 plegado/desplegado y sesiones largas.
- Campaña manual completa en ambas lenguas/dificultades, comodidad de cámara y lectura de señalización.
- Escucha subjetiva de HUD/turbo/mezcla en parlantes y auriculares reales.
- Regresión de frame software medida: no garantiza rendimiento de GPU móvil.
- La relevancia/colisión entre corredores usa contratos locales y validadores discretos; extensiones de cruces compartidos requieren validación independiente.

HTML: 30859275 bytes, SHA-256 `4c56f772883dd79393a8a72f03546ecffc21cf337ed264508d63db05eb1d82f7`. Detalles y comandos en el handoff y JSON de resultados.

