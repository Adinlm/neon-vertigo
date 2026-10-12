# NEON VERTIGO — Kings of Coope City

Juego de carreras antigravitatorias cyberpunk para navegador, con campaña, takedowns, turbo, seis naves y audio adaptativo. Versión **3.6.1 — Hardmode Endings**.

## Jugar

**[Abrir el juego en GitHub Pages](https://adinlm.github.io/neon-vertigo/)**

Usa orientación horizontal. El juego está diseñado para Chromium y controles táctiles, con compatibilidad de teclado. El archivo completo pesa aproximadamente 27,9 MB; la primera carga descarga también el audio y los gráficos embebidos.

En móvil: joystick en la mitad izquierda para girar/subir/bajar; freno y turbo a la derecha. El acelerador automático se configura en Ajustes. En teclado: flechas izquierda/derecha o A/D para girar, W/S para altitud, K o flecha arriba para acelerar, J o flecha abajo para frenar, L o espacio para turbo, P/Escape para pausar.

## Partida guardada

El progreso se guarda localmente en el navegador. Para trasladar una partida desde el HTML local, exporta el código desde **PARTIDA** e impórtalo en la versión web. El archivo local y GitHub Pages utilizan orígenes de almacenamiento distintos.

## Progresión 3.6.1

- Gana los diez eventos de campaña en Fácil/Normal para habilitar Difícil.
- Gana los diez eventos en Difícil para desbloquear PROJECT ZERO.
- Las dos recompensas presentan artes pixel art y se muestran una sola vez.
- Los guardados antiguos conservan PROJECT ZERO si ya la habían obtenido.
- Se conserva la Test Edition con 13 pistas abiertas y el diagnóstico temporal de flota; abrir pistas no equivale a ganar la campaña.

![Jefes derrotados](assets/ending_hardmode_unlocked.webp)

![PROJECT ZERO](assets/ending_project_zero_unlocked.webp)

## Uso local y desarrollo

`index.html` contiene el juego completo, incluidos música, sonidos y recursos gráficos. No necesita instalación, dependencias, servidor de juego ni una compilación. Descarga ese archivo y ábrelo en un navegador para jugar sin Internet.

GitHub Pages publica la rama `main`, desde la raíz. `.nojekyll` permite servir los archivos estáticos directamente. Los cambios enviados a `main` actualizan el sitio.

## Validación

La actualización pasó **45 comprobaciones**: 18 de lógica/sintaxis y 27 en Chromium con perfiles aislados. Los tests de campañas se prepararon y terminaron con los diagnósticos originales del juego; no equivalen a una campaña completa conducida manualmente. Se revisaron vistas de 1280×720, 1080×884, 904×412 y 740×360, migración, guardado, botones y cierre táctil.

El HUD aprobado, flota, modelos, música, motores, turbo, retratos, diálogos, controles y físicas se preservaron. La validación física de esta versión en el Galaxy Z Fold5 y la campaña manual completa siguen pendientes.

- [Informe de actualización](docs/UPDATE_3.6.1.md)
- [Resultados de pruebas](docs/verification.json)
- [Prompts de generación de arte](docs/generation-prompts.json)
