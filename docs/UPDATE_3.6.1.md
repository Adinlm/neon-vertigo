# NEON VERTIGO 3.6.1 — HARDMODE ENDINGS

Fecha: 11 de octubre de 2026 (America/Santiago).

Actualización acotada sobre la base exacta **NEON_VERTIGO_3.6.0_CUSTOM_FLEET_ORBITAL_AUDIO.html**. El archivo original de Descargas no se sobrescribió.

## 1. Cambio de progresión

Las partidas nuevas incluyen `career.unlocks`, con un marcador propio `v:1` y estos campos:

```javascript
hardUnlocked, hardUnlockShown,
projectZeroUnlocked, projectZeroUnlockShown,
hardCompleted, legacyCampaignClear, legacyProjectZero
```

El formato general del guardado permanece en `v:3`. No se cambiaron los eventos, la campaña, las reglas de victoria ni la dificultad/balance de las carreras.

- Una partida nueva comienza con **Difícil bloqueado y PROJECT ZERO bloqueada**.
- Al ganar THE CROWN en Fácil o Normal, se habilita Difícil cuando existen victorias en los **diez eventos de campaña**, en Fácil/Normal. Se permite combinar ambos niveles para respetar el progreso acumulado.
- PROJECT ZERO se concede al ganar THE CROWN en Difícil cuando existen victorias en **los diez eventos en Difícil**.
- Las victorias se verifican mediante los datos reales existentes: `career.ev[evento].done` y `best[dificultad] > 0`. `completeEvent()` solo registra esos tiempos cuando el jugador gana. La disponibilidad de una pista y los intentos/derrotas no son victorias.
- Ganar únicamente THE CROWN mediante el acceso abierto de la Test Edition **no concede Difícil ni PROJECT ZERO** en una partida nueva. Hay que ganar también los otros nueve eventos. Si se ganó la final antes de reunir esas victorias, se vuelve a ganar THE CROWN después para obtener el desbloqueo.
- Completar la campaña en Normal no se considera una campaña completada en Difícil. Las conquistas y victorias anteriores permanecen; para el reto difícil se vuelven a ganar los diez eventos en ese nivel.

`PROGRESSION.completeFinal()` devuelve `hard`, `zero` o `null`. El nuevo metadato `res.reward` enlaza la recompensa con los resultados. `FLEET.earned('zero')` usa ahora el desbloqueo validado; `FLEET.onResult()` anuncia la nave únicamente cuando se concede la recompensa `zero`.

## 2. Migración de guardados antiguos

La migración vive en `PROGRESSION.migrate(o,c)`, llamada al finalizar la sanitización original. Las validaciones y campos originales se conservan.

| Guardado recibido | Migración |
|---|---|
| Legacy sin campaña terminada | Conserva eventos, tiempos, estadísticas, logros y nave elegida; recompensas siguen bloqueadas salvo evidencia completa de campaña |
| Legacy con `finalDone` coherente | Preserva PROJECT ZERO, habilita Difícil y registra `legacyProjectZero` / `legacyCampaignClear` |
| Legacy con solo una victoria final en Difícil | Preserva su derecho antiguo a ZERO, pero **no** declara una campaña difícil completada |
| Legacy con victorias de los diez eventos en Difícil | Reconoce `hardCompleted` por evidencia real |
| Guardado nuevo de 3.6.1 | Conserva y valida flags con sus registros de victorias; no vuelve a tratarlo como legacy |

En 3.6.0, PROJECT ZERO se derivaba de `career.finalDone`, no de un flag de nave. Por eso la migración conserva exactamente ese derecho cuando el progreso supera la coherencia original (`ev.final.done`). No usa como prueba la nave de diagnóstico seleccionada ni tener todas las pistas disponibles.

Los desbloqueos ya concedidos a un save legacy se marcan como ya presentados: no aparece una secuencia de popups al actualizar. No se borran sus victorias ni se obliga a perder PROJECT ZERO. Si su nave guardada era ZERO, esa selección se mantiene.

Las partidas nuevas guardan el marcador incluso después de una victoria aislada en la final; al recargar, esa victoria **no** se convierte accidentalmente en un derecho legacy a ZERO.

La migración ocurre al cargar/importar; los nuevos campos se incluyen en la exportación y en los guardados posteriores. No se fuerza una escritura de toda la partida antigua durante la lectura. Se conserva el exportador/importador `NV3` y su confirmación original.

## 3. Pantallas de recompensa y flujo

Se agregó `endingS` al registro `SCREENS` y un módulo pequeño `ENDINGS`. Es un panel de imagen y texto real de UI, con botón de continuación y cierre por toque sobre el arte. No se agregaron timers ni intervalos de recompensa.

Flujo principal:

1. Resultados originales de victoria.
2. Coronación original.
3. Al cerrar la coronación, arte y mensaje de desbloqueo correspondiente.
4. Continuación al menú; en la recompensa de ZERO, se abre el hangar enfocando PROJECT ZERO sin seleccionarla automáticamente.

La primera victoria en Difícil vuelve a ofrecer la coronación cuando concede ZERO, aunque la corona general ya se hubiera ganado en Fácil/Normal. Las repeticiones posteriores no fuerzan ese interludio de desbloqueo.

Si se usa «Menú» desde los resultados, se presenta la recompensa pendiente **después** de la navegación al mapa, evitando que otro panel la oculte. Si el juego se cerró antes de ver una recompensa ya obtenida, se recupera después de la carga inicial. Los flags `hardUnlockShown` y `projectZeroUnlockShown` se guardan al abrir su pantalla; las recompensas vistas no se repiten.

Se comprobó y corrigió el cierre táctil: el arte cierra al completarse el `click`/tap, evitando que el toque termine activando un botón del menú que acaba de aparecer debajo.

El panel usa `object-fit: contain`, con imagen y copy en columna en pantallas grandes, y lado a lado en pantallas horizontales bajas. No recorta los protagonistas ni introduce texto dentro de los PNG.

## 4. Restricción de Difícil

El botón original `.dif[data-d="2"]` se conserva. Cuando está bloqueado:

- Tiene atributo `disabled`, etiqueta `🔒 DIFÍCIL`, estilo de candado y atributos accesibles.
- Una línea visible explica que se habilita completando la campaña en Fácil/Normal.
- `PROGRESSION.chooseDifficulty()` rechaza la selección.
- Carga, importación, inicio de carreras y reinicio normalizan a Normal una selección de Difícil que carezca de desbloqueo.
- `completeEvent()` rechaza como práctica una victoria de diagnóstico en un Difícil bloqueado.

Una vez habilitado, el selector funciona normalmente. La línea de ayuda muestra el avance de victorias en Difícil (`0/10`, etc.) hasta desbloquear ZERO. El reset explícito de campaña vuelve a bloquear ambas recompensas y normaliza la dificultad; audio, controles y gráficos conservan sus ajustes.

## 5. PROJECT ZERO y Test Edition

Los seis modelos, sus stats, modificadores, sonidos y partículas no se editaron. PROJECT ZERO mantiene su modelo, colores, anillos y audio originales.

La Test Edition conserva sus **13 pistas disponibles**, `NV_TEST_ALL_TRACKS=true` y las claves separadas:

```text
nv3_career_unlocked_test_351
nv3_test_set_353
```

No se escriben las claves de campaña normal al validar esta actualización. En Chromium se usó una clave normal con contenido testigo y se comprobó que permaneciera intacta.

El botón «Probar todas las naves» se conserva. Su acceso a ZERO es temporal, anunciado como diagnóstico y almacenado solo en memoria; no concede `hardUnlocked` ni `projectZeroUnlocked` y no cambia la nave persistente cuando se selecciona una nave aún no ganada.

## 6. Generación e integración de los dos artes

Se utilizó el **generador integrado de imágenes de OpenAI** mediante `image_gen`, con dos llamadas: una por arte, sin iteraciones de imagen posteriores. Ambas se produjeron efectivamente; no son SVG antiguos convertidos ni prompts pendientes de ejecutar.

- **Arte 1:** Sony, Vader y Cooper agotados y simpáticamente derrotados en un pit lane cyberpunk. Se usaron como referencia los tres retratos neutrales extraídos del HTML 3.6.0 exacto. Conserva orejas/especie, gafas y auricular de Sony, armadura/implante de Vader, y corona/monóculo de Cooper.
- **Arte 2:** PROJECT ZERO revelada en un hangar orbital secreto. Se usó tu captura `project_zero.png` como referencia; conserva la silueta de aguja, placas blanco/gris/teal, quilla negra con línea cian, fragmentos laterales, anillos cian/magenta y dos aletas negras con puntas cian.

Originales generados: **1672×941 PNG**, horizontales, cercanos a 16:9. Integración: **1024×576 WebP sin pérdidas**, reducidos por vecino más cercano para conservar los bordes de pixel art. Pillow solo hizo el empaquetado y la codificación; el diseño fue generado con OpenAI.

| Arte | Archivo integrado | Peso binario |
|---|---|---:|
| Difícil habilitado | `ending_hardmode_unlocked.webp` | 1,026,928 bytes |
| PROJECT ZERO habilitada | `ending_project_zero_unlocked.webp` | 825,354 bytes |

Los dos WebP están embebidos exactamente una vez como data URI. El juego no necesita sus copias separadas ni Internet. La imagen de recompensa se asigna al abrir su panel, sin precargar ambos splash arts durante el arranque. Una imagen RGBA de ese tamaño representa unos 2,25 MiB de datos decodificados, sin contar la caché interna del navegador.

Copias para revisión:

- `ending_hardmode_unlocked.png` y `.webp`.
- `ending_project_zero_unlocked.png` y `.webp`.
- `generation-prompts.json`: prompts exactos, también reproducidos en el JSON de pruebas.

## 7. Preservación y pruebas ejecutadas

**45 comprobaciones aprobadas:** 18 de lógica/sintaxis y 27 en Chromium. El detalle, fixtures, hashes, prompts y capturas están referenciados en `verification.json`.

Preservación verificada:

- La inversión de todas las sustituciones autorizadas reconstruye **exactamente el HTML 3.6.0 original completo**.
- El CSS aprobado anterior permanece intacto; el CSS nuevo se agregó al final y afecta solo recompensas/dificultad.
- Comparación literal de los bloques de flota/modelos/WebGL/audio/música, retratos/diálogos/rivalidad, físicas/controles/simulación y garaje.
- Los 18 WebP de retratos originales permanecen exactamente iguales. Hay dos WebP adicionales para finales.
- **80 payloads Base64 largos originales** se conservan sin cambios, incluidos los recursos de audio; no se sustituyó música ni sonidos de naves.
- Archivo fuente de Descargas con el mismo SHA-256 al terminar.

Casos de lógica ejecutados:

- Nueva partida bloqueada, selección de Difícil rechazada, normalización de ajustes no ganados.
- Victoria final aislada, carrera libre, derrota y diagnóstico bloqueado sin desbloqueos indebidos.
- Campaña Fácil, Normal y combinación de ambas: solo habilitan Difícil.
- Final difícil aislada insuficiente; diez victorias difíciles habilitan ZERO.
- Repetición sin nuevas pantallas; flags vistos y pendientes persistentes.
- Exportación/importación, migración legacy, coherencia de flags, conservación de selección ZERO, y no inferir hard clear sin diez victorias difíciles.
- Diagnóstico de flota temporal sin convertirlo en progreso ganado.

Pruebas reales de navegador ejecutadas:

- HTML local en Microsoft Edge/Chromium sin interfaz, WebGL con SwiftShader, perfiles de almacenamiento aislados.
- 13 tarjetas de pistas disponibles; Difícil y ZERO bloqueados en perfiles nuevos.
- Preparación de los otros nueve registros mediante el diagnóstico original de campaña; paso por la final y sus handlers reales de resultados/coronación/recompensa con el diagnóstico original de meta.
- Fácil y Normal: resultado → coronación → arte 1 → menú, persistencia al recargar, selector Difícil habilitado, ZERO bloqueada.
- Difícil: resultado → coronación → arte 2 → hangar, ZERO disponible, selección y persistencia de ZERO comprobadas.
- Repeticiones sin interludios invasivos; reinicio de campaña; migración legacy con ZERO ya obtenida.
- Recompensa pendiente recuperada al arrancar; cierre por tap del arte; salida alternativa «Menú» desde resultados, sin panel oculto ni bloqueo de navegación.
- Presentación a **1280×720, 1080×884, 904×412 y 740×360**, para ambos artes. Botón en pantalla, imagen completa con `contain`, sin overflow horizontal ni del copy en los tamaños comprobados.
- Cero errores de página y **cero solicitudes HTTP/HTTPS** del juego.

Las pruebas de campaña son **dirigidas**: no se condujeron manualmente treinta carreras completas. Se usaron `__NV.completeEvent`, `__NV.finishRace` y fixtures temporales de estado/velocidad/invulnerabilidad en los perfiles de QA, conservando intactas las físicas del HTML entregado. Las recargas y los botones sí recorrieron el flujo integrado real. Las capturas fueron revisadas durante la validación local; este repositorio incluye el resumen de pruebas.

Tamaño de HTML: **25,433,956 → 27,912,735 bytes** (25.43 → 27.91 MB), incremento aproximado **9.75 %**.

SHA-256 base:

```text
cb67f1b124d44be3ec226b8f23ec69f3da9560ef898bebe8c41e7d959b86c7f4
```

SHA-256 HTML entregado:

```text
ab430cecac92ed6e47083b3ef2e6259f50be1092877ebf85fc37d9e235a2b4a1
```

## 8. Validación pendiente en tu Fold5 y uso

Pendiente en el **Galaxy Z Fold5 físico**:

- Lectura de los artes/textos en pantalla plegada y desplegada, y cierre con dedos reales.
- Importar tu copia exportada de 3.6.0 y revisar que mantenga progresión, flota y selección.
- Campaña manual completa, especialmente el recorrido de las diez victorias difíciles y el final.
- Comprobar fluidez/memoria al abrir y cerrar los artes después de una sesión larga.
- Escucha de la música adaptativa, motores y turbo en el dispositivo. Se preservaron sus bytes/código; esta entrega no incluye una escucha crítica nueva de la mezcla.

Abre `NEON_VERTIGO_3.6.1_HARDMODE_ENDINGS.html` como archivo local. Es autónomo. Usa la exportación/importación original para trasladar tu partida si el navegador no comparte almacenamiento entre rutas `file://`; conservar las claves del juego no garantiza que Chrome reutilice el mismo origen de almacenamiento al cambiar el nombre del archivo.

La aprobación física de 3.6.0 que indicaste es la base de preservación. No se presenta como una prueba física nueva de 3.6.1.
