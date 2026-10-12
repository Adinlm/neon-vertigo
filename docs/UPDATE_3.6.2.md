# NEON VERTIGO 3.6.2 — Campaña pública

## Base y publicación

Repositorio: https://github.com/Adinlm/neon-vertigo. URL existente: https://adinlm.github.io/neon-vertigo/.

La base consolidada fue **3.6.1**, commit `e15678f5bfe332955e722375003a10d67f9cafa4`, con dificultad Difícil, recompensas y finales implementados. Se verificaron el remoto y Pages mediante la API de GitHub. Pages sirve `main:/index.html`, con HTTPS, despliegue estático `legacy`. La configuración, dominio y ruta se conservan.

Rama de trabajo: `update-3.6.2-public-campaign`. Respaldo anterior recuperable, creado y enviado antes de editar: etiqueta `backup-3.6.1-test-before-3.6.2`. El respaldo está en el historial Git; no hay otro HTML de diagnóstico en el árbol servido por Pages.

## Artes definitivos

Se sustituyeron únicamente las dos ilustraciones finales por los PNG adjuntos aprobados. No se generaron imágenes, no se rediseñaron y no se redujo su resolución. Los archivos recibidos se llaman «Derrota real entre neones y coronas.png» y «Hangar orbital cyberpunk con nave flotante.png»; el sufijo `(1)` del texto de encargo no figura en los adjuntos reales.

| Arte | Resolución | PNG original | WebP sin pérdida | Reducción |
| --- | --- | --- | --- | --- |
| Jefes derrotados / Difícil | 1672 × 941 | 2.916.797 bytes | 2.474.484 bytes | 15,16 % |
| Hangar / PROJECT ZERO | 1672 × 941 | 2.187.334 bytes | 1.781.170 bytes | 18,57 % |

Se compararon los píxeles RGBA decodificados con los PNG originales: coincidencia exacta. Cada imagen está incrustada una sola vez como Data URI en el HTML y los recursos anteriores fueron retirados. Las copias WebP en `assets/` ilustran el README; el juego no las solicita. Los 18 retratos originales permanecen idénticos.

El HTML autónomo final ocupa **31,102,908 bytes** (31,1 MB decimales). Es mayor que el 3.6.1 porque conserva los nuevos artes sin pérdida a su resolución original, en lugar de los antiguos 1024 × 576. SHA-256: `3d91fe904e9ee241177382690fbf8f64c5e88854e6379a25ef2c47c5e05f8187`.

Los finales usan `object-fit: contain`, muestran la composición completa y mantienen el texto separado de la imagen. Se conserva el diseño aprobado y se permite la pantalla de final en vertical, sin alterar el bloqueo de orientación ni el HUD durante la carrera. Se verificaron botones, cierre al tocar la imagen y recuperación de una recompensa pendiente.

## Diagnósticos retirados

Se eliminaron el botón y DOM/CSS de diagnóstico de flota, su evento de toque, el estado `allDiag`/`diagSel`/`bypass`, la selección forzada de naves, la función `setDiag`, la bandera `NV_TEST_ALL_TRACKS`, los atajos de eventos y CROWN y la activación de piloto de prueba por hash de URL. Se eliminó completamente `window.__NV`, incluyendo sus métodos para forzar victorias, coordenadas, daño, coches, dificultad y campaña; también las cámaras diagnósticas y el método de rivalidad `forcePass`.

No se ocultan botones funcionales mediante CSS. El acceso de campaña y el acceso desde carrera libre comprueban las condiciones originales del evento asociado. El rechazo de eventos bloqueados ya existente en el registro de resultados se conserva. La autoaceleración normal, la demostración del menú, las cinemáticas y las previsualizaciones normales de audio siguen disponibles.

## Progresión pública

- Partida nueva: solo STRIX-01 y RAZOR-X; Fácil y Normal disponibles, Difícil bloqueado, cero victorias.
- Dos pruebas de crew habilitan el duelo de su territorio; Sony → FANG GT, Vader → IRON WRAITH, Cooper → SOVEREIGN.
- THE CROWN requiere conquistar los tres territorios, con las mismas condiciones anteriores.
- Los diez eventos ganados en Fácil/Normal, incluida THE CROWN, habilitan Difícil y el arte A. PROJECT ZERO sigue bloqueada.
- Los diez eventos ganados en Difícil, incluida THE CROWN, habilitan PROJECT ZERO y el arte B.
- Ganar carreras libres, perder un evento o ganar únicamente la final sin el resto del registro requerido no concede estas recompensas.
- Las recompensas y la marca de presentación se guardan y no se repiten después de obtenerlas. Una recompensa pendiente puede recuperarse al abrir el juego.
- Los trece circuitos se conservan: seis carreras libres disponibles inicialmente y trece tras las conquistas. Las pistas asociadas a eventos bloqueados siguen la disponibilidad de campaña; las tres pistas base sin evento asociado permanecen disponibles.

## Guardados y migración

La edición pública usa las claves normales históricas `nv3_career`, `nv3_set` y `nv3_best_*`. No lee ni borra las claves independientes de pruebas `nv3_career_unlocked_test_351`, `nv3_test_set_353` y `nv3_test_best_*`. No se vacía localStorage y se conserva el almacenamiento de otros juegos.

Se mantienen la estructura v3, el código NV3 con checksum, la importación/exportación y las reglas de migración aprobadas en 3.6.1. Las partidas normales antiguas conservan victorias, estadísticas, selección y PROJECT ZERO adquirida mediante las reglas antiguas; no se inventan victorias de Difícil. La dificultad guardada se normaliza a Normal si no existe el desbloqueo requerido.

Los nuevos guardados/exportaciones llevan `edition: public`. Se rechazan registros o envoltorios importados marcados explícitamente `test` o `diagnostic`.

**Limitación histórica:** las exportaciones antiguas de la edición de pruebas carecían de una marca de origen y usaban el mismo formato de las normales. No es posible distinguir con seguridad una exportación histórica sin marca ni un registro que alguien haya copiado manualmente a la clave normal. Se eligió conservar las partidas normales válidas y no importar automáticamente las claves de diagnóstico, en lugar de destruir progreso legítimo mediante conjeturas. Esto no es un mecanismo antitrampas ni impide editar manualmente archivos de guardado.

## Conservación y pruebas

**91 comprobaciones locales aprobadas:** 28 de lógica/sintaxis, 43 de navegador, 10 de recursos/preservación y 10 de regresión de audio/controles/colisiones. Los resultados estructurados están en `docs/verification.json`.

La reconstrucción inversa de todos los cambios reproduce exactamente el archivo base, verificando que no hubo modificaciones fuera del alcance registrado. Son idénticos los circuitos/ciudad, seis modelos y modificadores, audio completo incluyendo Cooper/CROWN/DSP, 18 retratos, 324 frases, render, HUD, entrada y controles. La física/IA/colisiones/takedowns es idéntica salvo la eliminación de dos ramas de autopiloto diagnóstico.

Se ejecutaron campañas controladas de Fácil, Normal y Difícil, los flujos resultados → coronación → final → menú/hangar, las recompensas sin repetición, exportación/importación, migración de partida normal anterior, persistencia, reinicio y aislamiento del almacenamiento diagnóstico. Los 18 retratos y ambos artes decodifican. El archivo de producción exacto se abrió directamente por `file://`, con menús normales y sin API de QA. No hubo solicitudes HTTP/HTTPS ni errores JavaScript en las pruebas offline.

Se comprobaron seis naves en el garaje WebGL y doce previsualizaciones de motores/turbos. Las cuatro bandas sonoras adaptativas de Sony, Vader, Cooper y CROWN se decodificaron y reprodujeron. Se ejercitaron joystick, freno y turbo mediante eventos táctiles de Chromium, teclado, pausa/reanudación, una colisión controlada y destrucción/reaparición con sus funciones originales.

Los finales se probaron en **1280×720, 1080×884, 904×412, 740×360, 414×896 y 892×1100**; ambas imágenes conservan composición, texto y botón visibles. Se inspeccionaron capturas vertical y horizontal.

Las victorias automatizadas se prepararon en perfiles aislados y una copia temporal con instrumentación, ubicada fuera del repositorio de Pages. Usan la lógica original de campaña y detección de llegada. Ninguna función QA está en el HTML de producción. Estas pruebas no equivalen a conducir manualmente toda la campaña, probar un teléfono físico ni evaluar de oído la mezcla de audio.

## Pendientes de validación manual

Prueba física del Galaxy Z Fold5: pantalla exterior/interior, plegado durante el juego, áreas seguras, comodidad de controles multitáctiles, rendimiento, memoria y mezcla de sonido. También sigue pendiente una campaña completa conducida manualmente. No se afirma haber probado el dispositivo directamente.

## Estado de entrega

El paquete pasó la validación local antes de integrar la rama de publicación. El informe de entrega local `NEON_VERTIGO_3.6.2_DEPLOY_REPORT.md` y `NEON_VERTIGO_3.6.2_TEST_RESULTS.json` registran el SHA definitivo y la comprobación posterior del despliegue y del HTML servido por la URL existente.
