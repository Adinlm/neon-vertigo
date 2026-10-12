# NEON VERTIGO — Kings of Coope City

Juego de carreras antigravitatorias cyberpunk para navegador, con campaña, takedowns, turbo, trece circuitos, seis naves y audio adaptativo. **3.6.2 — Campaña pública**.

Juego base creado por Claude, bugs y planificación de desarrollo se hizo con ChatGPT, la música utiliza Google Lyria y BandLab.

## Jugar

**[Abrir el juego en GitHub Pages](https://adinlm.github.io/neon-vertigo/)**

El HTML completo pesa aproximadamente 31,1 MB e incluye todos los gráficos y sonidos. La primera carga puede tardar. Descarga `index.html` y ábrelo en Chromium para jugar completamente offline, sin instalación.

Usa orientación horizontal para las carreras. Los finales también funcionan en vertical. En móvil: joystick a la izquierda para girar y cambiar altitud; freno y turbo a la derecha. La autoaceleración se configura en Ajustes. Teclado: A/D o flechas para girar, W/S para altitud, K/arriba para acelerar, J/abajo para frenar, L/espacio para turbo, P/Escape para pausar.

## Campaña pública

- Empieza con STRIX-01 y RAZOR-X; las otras cuatro naves se desbloquean jugando.
- Derrota a Sony, Vader y Cooper para obtener FANG GT, IRON WRAITH y SOVEREIGN.
- Conquista los tres territorios para acceder a THE CROWN.
- Gana los diez eventos en Fácil/Normal para desbloquear Difícil.
- Gana los diez eventos en Difícil para revelar PROJECT ZERO.
- Las carreras libres no completan la campaña. No hay botones ni accesos de diagnóstico.

![Jefes derrotados — Difícil desbloqueado](assets/ending_hardmode_unlocked.webp)

![Hangar orbital — PROJECT ZERO desbloqueada](assets/ending_project_zero_unlocked.webp)

## Guardado

El progreso se guarda en este navegador mediante las claves normales. La actualización conserva partidas normales anteriores e ignora las claves separadas de la antigua edición de pruebas. Exporta/importa desde **PARTIDA** para trasladar progreso entre el HTML local y la web, que utilizan orígenes diferentes.

Las exportaciones históricas sin marca de edición no permiten identificar con certeza un origen diagnóstico. Se preservan las partidas normales válidas; no se importa automáticamente el almacenamiento de pruebas ni se borra localStorage indiscriminadamente.

## Validación y publicación

Pasaron **91 comprobaciones locales** de progresión, finales, guardados, recursos, navegador, audio adaptativo, controles y colisiones. Los finales se comprobaron en seis viewports verticales/horizontales. Las victorias automatizadas usaron una copia QA aislada fuera del contenido servido. La campaña manual completa, el Galaxy Z Fold5 físico y la revisión de oído de la mezcla siguen pendientes.

Pages conserva su configuración: rama `main`, raíz, entrada `index.html`, HTTPS y `.nojekyll`. Existe un solo HTML ejecutable; el respaldo 3.6.1 se conserva mediante una etiqueta Git, sin otra ruta de juego en Pages.

- [Informe 3.6.2](docs/UPDATE_3.6.2.md)
- [Resultados de pruebas locales](docs/verification.json)
- [Historial de la actualización 3.6.1](docs/UPDATE_3.6.1.md)
