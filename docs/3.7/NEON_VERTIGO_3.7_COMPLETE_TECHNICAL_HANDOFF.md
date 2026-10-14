# NEON VERTIGO 3.7 — DISTRICT OVERDRIVE
# COMPLETE TECHNICAL HANDOFF

Fecha: 14 de octubre de 2026, America/Santiago. Estado: **FUNCIONAL CON PENDIENTES**.

Repositorio: https://github.com/Adinlm/neon-vertigo. Rama exclusiva: `feat/3.7-district-overdrive`.
Commit de código de la entrega: `fd9c5a8c6a3e5856cb8ef6a0e7b0ef9ac2212c4b`. El commit posterior de documentación se identifica con `git rev-parse HEAD` y en el manifiesto externo de entrega. Esta distinción evita introducir una referencia imposible al hash del propio documento dentro de su commit.

HTML: `index.html`; copia externa: `NEON_VERTIGO_3.7_DISTRICT_OVERDRIVE.html`. Tamaño: 30859275 bytes. SHA-256 de ambas copias: `4c56f772883dd79393a8a72f03546ecffc21cf337ed264508d63db05eb1d82f7`.

Este informe describe el código recuperado y terminado, no una arquitectura propuesta. El inventario complementario `NEON_VERTIGO_3.7_ARCHITECTURE.json` contiene configuraciones reales, ubicaciones de símbolos y relaciones entre subsistemas. Los resultados estructurados y comandos se encuentran en `NEON_VERTIGO_3.7_TEST_RESULTS.json` y en `evidence/`. Las comprobaciones automatizadas no equivalen a una campaña manual completa ni a una prueba física del Galaxy Z Fold5.

## 1. Recuperación y límites de la entrega

El punto inicial fue `0a835874ec77b36cd97752f880fa3155042b0c84`, exactamente el HEAD solicitado. El árbol versionado estaba limpio; existían numerosos archivos de desarrollo ignorados en `work/`. Antes de modificar el juego se creó `backup/3.7-claude-wip-0a83587`, que apunta a ese mismo commit. Los scripts y registros ignorados se conservaron; la referencia de Git conserva el código versionado, mientras que el inventario y las evidencias externas registran los auxiliares.

La línea estable es `16a83f77b794391b641b7f2ac656d7849354ed30`; corresponde a `main` y a `origin/legacy/3.6.3-international-stable`. El HTML estable tiene SHA-256 `f194b6d190406574869caf5dcd358804205a25914bcaa7ecbf3c27e17b9c928a`. Se comprobó además la respuesta HTTP real de GitHub Pages, no solamente la referencia local. No hubo merge, rebase, squash, reset destructivo ni publicación sobre Pages.

Historial de Claude conservado:

- `da5efb3`: arnés CDP y comparación inicial de carreras.
- `4a1b5c1`: banco DSP del HUD y su gestor.
- `d447858`: exclusivamente los stems de turbo de Sony y Vader.
- `77d751a`: flotas por distrito y esquiva de obstáculos.
- `0a83587`: corredores alternativos, 18 ramales en 13 circuitos e integración de tráfico.

La ejecución inicial de Codex encontró 207/210 pruebas de rutas y 68/71 de tráfico. Estos resultados están guardados como `routes-before.json` y `traffic-before.json`. El resultado histórico 209/210 no validaba el último WIP. `work/patch_routes17.py` existía, no estaba versionado y estaba ignorado por la regla `work/`; se inspeccionó, sin reaplicarlo.

Dos cantidades del resumen de trabajo necesitaban corrección: el código contiene **20 vehículos civiles nuevos**, cinco por distrito, además de cuatro modelos históricos; y la verificación musical ejecutada comprende **18 comprobaciones de render PCM más cuatro pruebas de reproducción en juego**, 22 resultados en total. No se eliminaron vehículos para ajustarse a una cifra histórica.

## 2. Estructura del HTML y arranque

La distribución es un único HTML con CSS, DOM, JavaScript y recursos incorporados. No necesita npm, Python, ffmpeg, servidor, CDN, fuente externa, telemetría, login ni claves. Las herramientas separadas son exclusivamente de desarrollo.

El JavaScript principal vive en una IIFE. Sus variables y funciones no constituyen una API pública. Para las pruebas, `tests/harness.mjs` crea una copia ignorada en `work/nv_test.html` y añade un evaluador de la clausura. Ese evaluador **no aparece en el HTML entregado**. No copiar el archivo instrumentado como distribución.

El DOM incluye el canvas principal `gl`, el minimapa `mini`, el canvas del hangar `gCv`, las pantallas de idioma, título, selección libre, campaña, resultados, ajustes, guardados y finales. `I18N` conserva un selector inicial en cada apertura completa. La elección recordada se resalta, pero no omite el selector. Cambiar de idioma afecta la presentación y mantiene carrera y partidas.

`STORE` prueba la disponibilidad de localStorage y encapsula accesos con excepciones controladas. Las preferencias normales usan `nv3_set`, con una migración limitada desde `nv2_set`. Se mantiene el aviso de exportación cuando el almacenamiento no está disponible. Abrir la web y abrir un archivo local son orígenes distintos; el protocolo NV3 permite transferir explícitamente la partida entre ambos.

El arranque carga preferencias y carrera, prepara geometría, WebGL y UI y deja el juego en la pantalla de título detrás de la selección de idioma. `AU.init()` se activa por interacción y puede reanudar un AudioContext existente. La edición entregada conserva esa estrategia; las pruebas con autoplay permitido solamente facilitan el laboratorio de audio.

## 3. Modelo de pistas, coordenadas y geometría

`TRACKS` conserva los trece identificadores originales. Cada configuración aporta seed, trazado, semiancho, bandas de altura, túneles, tráfico, tema, arte, música y parámetros de carrera. Las listas reales aparecen en el informe de mapas y en el inventario JSON.

`buildTrack` construye muestras del spline cerrado. El motor trabaja con progreso longitudinal `s` sobre una longitud principal `L`, más coordenadas laterales `x` y verticales `y` en un marco local. Las matrices de muestras son `TP` (posición), `TT` (tangente), `TRr` (derecha), `TU` (arriba), `CV` (curvatura), `YMn` y `YMx` (límites verticales), con `N` muestras y paso `DS`. `wrapS` conserva el dominio circular; `wrapD` produce una distancia longitudinal con signo alrededor de la pista.

`tf` calcula el marco principal en una coordenada; `wp`/`wpv` convierten coordenadas locales en mundo. `buildHash`, `nearTrack`, `trackDist`, `trackDistY` y `rectClear` permiten generar ciudad y comprobar separación respecto a la pista. El mundo no se sustituyó por una escena nueva.

`buildFeatures` genera `TUN`, `OB`, `PADS`, `CPS`, `STRIPS` y `HAZ`. Un obstáculo contiene coordenada longitudinal `s`, semilongitud `hs`, límites transversales `x0/x1/y0/y1`, clase `k`, eje de respuesta `ax` y, para rutas, `rt` o `route`. Las prensas actualizan su límite por `pressY`/`hazUpdate`; los respiraderos tienen fase, aviso y daño propios.

`buildWorld` y sus auxiliares producen geometría estática por chunks. `loadTrack` libera el mundo anterior, reconstruye el nuevo, genera atlas, sube buffers y compone el minimapa. `dropCPU` libera copias de geometría después de subirlas; el restablecimiento de WebGL regenera los recursos. No introducir una segunda copia persistente de cada ciudad sin medir la memoria.

Se repitió la firma de edificios de los trece circuitos frente a Legacy. Resultado: 13/13 firmas idénticas; 14,762 llamadas registradas a addBuilding en cada versión (14.762 según esta metodología; la cifra histórica 16.762 no se reprodujo). Esa firma registra posición, huella, altura y material de las llamadas a `addBuilding`; no afirma que toda la geometría de 3.7 sea idéntica, porque los ramales añaden plataformas, túneles y señalización.

## 4. Renderizador, bucle y calidad

El renderizador WebGL es propio. `initGL` y `compile` preparan programas; `uploadTrackGPU`, `gbuf` y `gdel` gestionan buffers; `MESH` conserva mallas de vehículos. `CHL` y `GCHL` contienen chunks opacos y luminosos. Las funciones de matrices, frustum y `visible` permiten proyectar y limitar dibujo. `render` combina mundo, elementos dinámicos, vehículos, luces, partículas y efectos.

`tick(dt,nr)` coordina estados, entradas, paso de simulación, poses, cámara, audio, HUD y renderizado. La animación real utiliza requestAnimationFrame y limita los dt largos. Las pruebas NVSIM emplean pasos explícitos de 1/60 s y omiten el render por frame; esa diferencia se declara en los resultados.

`QL` conserva cuatro presupuestos de render y efectos. `settings.qual >= 0` fija calidad; `-1` usa `qLevel` adaptativo. `perf` baja calidad bajo carga y permite recuperarla después de un intervalo. No se ha cambiado el sistema automático de producción.

Una limitación histórica del motor es que simulación, efectos y algunas presentaciones comparten `Math.random`. El número de partículas depende de la calidad. Por eso una semilla sin una calidad fija no determina por sí sola el resultado de una carrera. La corrección se hizo **en el arnés**: `NVSIM.prepare` fija calidad alta antes de cargar pista, restablece reloj de prueba y resembra después de cargar. También neutraliza KEY/TCH/IN, incluyendo `turEdge/turPrev`, y reinicia las bolsas de diálogo del fixture. La política anti-repeat del juego distribuido conserva su comportamiento normal.

La prueba adversarial confirmó que un turbo pendiente cambiaba una misma carrera sembrada: el jugador pasaba de 74.45 s a 65.06 s sin cambiar seed ni HTML. Después del aislamiento, los resultados de todos los participantes volvieron a ser idénticos. La regresión también intercala otra pista y cambia calidad, diálogo y entradas antes de repetir. Las mediciones anteriores al arreglo se conservan como intermedias; el balance final fue ejecutado nuevamente. Comparaciones futuras deben mantener estas condiciones o separar formalmente los generadores del motor mediante un cambio independiente.

`AU.play/at` también seleccionan variantes con el RNG compartido y con límites de voces medidos por el reloj real; `at` decide relevancia por la cámara. Para que velocidad del host, cooldowns y posición visual no cambien las carreras sembradas, `NVSIM.race` suprime temporalmente `AU.play/at/explode/hud/ui` durante el bucle síncrono y los restaura en `finally`. **Es un fixture de física, no una prueba de mezcla sonora.** HUD, turbo, carrera por tick y apertura offline se prueban aparte con AudioContext real. Las métricas de rendimiento usan animación real y no esta supresión síncrona.

El tráfico sólido incorpora un barrido de hull contra `OB` cada paso. Su coste se suma a la esquiva periódica, pero evita que una predicción aproximada permita atravesar geometría. Los datos medidos de frame, draw calls, memoria de buffers y heap están en el informe de rendimiento. `GPU.bytes` es contabilidad de buffers del motor, no RAM total ni VRAM completa; `Runtime.getHeapUsage` informa memoria de JavaScript de ese target.

## 5. Física, IA y carrera

`newRacer0`, `shipDefaults`, `applyShip` y `newRacer` construyen entidades. `resetRace` prepara pilotos, línea de salida, personalidad/velocidad de rivales, tráfico, hazards y contadores. Los estados son `RS.ACT`, `RS.WRECK`, `RS.DEAD` y `RS.RESP`. La nave elegida modifica solamente el jugador; los rivales conservan multiplicadores neutrales de nave.

`physics` integra aceleración, freno, turbo, regeneración, velocidades lateral/vertical, curvatura, desplazamiento y límites del corredor. `vehPose` construye posición y orientación para renderizar. No se sustituyeron las constantes de motores, el conjunto de seis naves ni la física arcade por otra implementación.

`aiRoutePlan`, `aiPick`, `aiDrive` y `pathDanger` coordinan elección de ruta y conducción. La IA combina curvatura, preferencia de altitud, riesgo, precisión, obstáculos, tráfico, pilotos, pads, strips, agresión y bloqueo. La decisión de ramal usa longitud real frente al tramo sustituido, bonus, riesgo del diseño, crew, daño y una perturbación aleatoria. No todos los pilotos tienen que tomar cada ramal en cada vuelta; la suite comprueba tanto travesías dirigidas como variedad natural con varias semillas.

Al seguir por la avenida, el criterio anterior solamente penalizaba posiciones completamente dentro del lado del ramal y muy cerca de la boca. Se amplió la comprobación al hull y a la aproximación, evitando que un centro ligeramente del lado del ramal se interpretara como una entrada involuntaria. Los obstáculos mantienen prioridad; no se eliminaron para dirigir artificialmente la IA.

`progress` utiliza `dist` y ocho sectores por vuelta. `rank` ordena primero por llegada y después por distancia. El ramal no recibe un bonus de clasificación al entrar: cambia el factor de avance físico, no el contador por un salto. Las simulaciones verifican continuidad de `dist` frente a `s`, checkpoints 8/16/24 y ausencia de NaN.

`racerCol`, `trafficCol`, `obstacleCol`, `ventHit`, `wreckRacer`, `wreckUpdate` y `respawnRacer` gestionan contacto, daño y recuperación. Los takedowns siguen generando eventos de HUD, audio, progresión y presentación. Las exclusiones por `rt` para pilotos/tráfico son parte de la arquitectura existente: requieren atención independiente si en el futuro se permite cruzar libremente entre corredores fuera de sus bocas.

`freeSpot` prueba posiciones con banda local, obstáculos, tráfico y rivales. Antes existía un último fallback al centro del corredor aunque todas las posiciones estuvieran ocupadas. Ahora el piloto mantiene `RS.DEAD` y reintenta; no aparece dentro de un obstáculo. La recuperación normal conserva corredor cuando sigue siendo válido y retrocede a la avenida cuando el punto queda fuera del ramal. El retroceso también reduce `dist`, conservando el coste de la recuperación.

## 6. Rutas alternativas: contrato de datos

`ROUTEDEFS` está indexado por id de pista. Cada definición usa `name`, `kind`, `a/b` normalizados, `side`, `hw`, `ymin/ymax`, `roof`, color, `tp`, riesgo, bonus, preferencias de crew y perfiles opcionales `lat`/`up`. `obs`, `pads` y `strips` añaden contenido propio. `side` controla el lado de la boca; los símbolos `'m'` e `'iN'` en el perfil lateral se resuelven en `makeRoute`.

`buildRoutes` produce `ROUTES=[null,...]`, dejando `rt=0` para la avenida. `makeRoute` calcula:

- `sA/sB`, `span`, paso `ds`, número de segmentos `n` e identificador local.
- Desplazamientos de entrada/salida `ax/ay/bx/by` y separación lateral `xs`.
- Muestras `P`, `T`, `R`, `U`, curvatura `CV`, bandas `YMn/YMx` y factor longitudinal `K`.
- `Lreal`, `lat`, `up`, coberturas, grosor de deck/roof y ventanas `sSep/sJoin` de separación física.

El dominio longitudinal del ramal sigue siendo el de la avenida: `span=(b-a)*L`. La geometría puede tener otra longitud. `K=ds_principal/ds_real` transforma avance físico en progreso principal. Esta parametrización conserva el orden de checkpoints y vueltas sin crear un grafo general de navegación.

Los marcos siguen la tangente de la geometría elevada o inferior. `tfr(s,rt)` interpola el corredor y escribe el objeto compartido `F`; `tfc` usa el corredor de una entidad; `wpr` convierte coordenadas locales del ramal a mundo. **F es mutable y global**: guardar sus valores antes de llamar a otro helper de marcos, en lugar de conservar una referencia suponiendo que no cambia.

`rtD` mide distancia con signo desde la boca; `rtIn` comprueba el dominio del ramal; `rtLook` predice el corredor de una entidad considerando su plan. `rel` devuelve desplazamiento local o `null` para determinar relevancia espacial. Tiene lógica específica para objetos principales vistos desde un ramal en boca/unión, para planes de IA y para divisores (`rt=-1`). No reemplazar sus usos por una simple comparación de `s`.

`rtCheck` detecta cruzar entrada/salida después de avanzar. El tráfico en sentido contrario se mantiene en la avenida; el tráfico del sentido de carrera entra si lo planeó y el hull cabe del lado correcto. `rtSwitch` traslada coordenadas locales, objetivos y estado auxiliar; también ajusta la cámara del jugador y deja eventos `inN/outN` cuando el arnés habilita `routeLog`.

## 7. Divisores, decoración, cámara y minimapa

`routeFeatures` añade volúmenes de división a la avenida, obstáculos propios, pads y strips. Los divisores se muestrean en tramos de hasta 8 m entre la boca y la separación, y entre la unión física y la salida. No son obstáculos del ramal: excluyen en la avenida el volumen ocupado por su plataforma/techo. Cuando no hay suficiente holgura vertical, se usa un divisor de altura completa para evitar una cuña que atrape entidades.

Las bocas y uniones tienen una excepción geométrica para un hull completamente del lado del ramal; se usa consistentemente en el monitor y en el barrido de tráfico. No se eliminaron los divisores. `rtDivAt` informa si existe separación de un lado; `rtSpan` informa si un ramal ocupa la región para adaptar decoración y barreras principales.

`buildRouteWorld`, `routeGeom` y `withRouteGeom` añaden los ramales sin sustituir el mundo original. La generación de rutas usa un generador dedicado, y `withRouteGeom` guarda/restaura los arrays principales con `finally`. Es esencial preservar esa restauración incluso ante un error; de otro modo el siguiente circuito puede quedar con longitud, semiancho o muestras del ramal.

`routeValidate` detecta cercanía a meta, conflictos con túneles principales, obstáculos altos bajo/sobre ramales, puentes/tuberías completos en bocas, checkpoints próximos y contacto con suelo/plataformas. Es un validador de reglas concretas, **no una demostración exhaustiva de ausencia de intersecciones entre todos los triángulos del mundo**. Las pruebas de navegación, render y contacto lo complementan.

`camFrame` devuelve el marco adecuado detrás de la nave y los offsets de entrada/salida. El seguimiento conserva la cámara original y su transición; no se introdujo otra cámara. `buildMini` incorpora geometría de rutas y `drawMini` posiciona entidades con el corredor correspondiente. Las capturas reales verifican representación y render; comodidad y lectura de señalización en pantalla física siguen siendo pruebas humanas.

Los 18 ramales son corredores únicos que salen y vuelven a la misma pista. No hay bifurcaciones recursivas, rutas anidadas ni conexiones entre pistas distintas. `rt` es un índice local que cambia al cargar circuito; no almacenarlo como identificador permanente de campaña. No asumir que un ramal de índice 1 en otra pista representa la misma ruta.

## 8. Tráfico: flotas y maniobras

`TKIND` conserva índices 0–3 (`car`, `bus`, `taxi`, `cargo`) como respaldo histórico. Los índices 4–23 son 20 tipos civiles con tamaños `hx/hy/hs`, velocidades `v`, capacidades `lc`, tintes, luces y otros rasgos. `DTRAF` define modelos y pesos por sentido, densidad y estilo. `trafficProfile` selecciona el perfil por distrito de `CFG.art`.

Kowloon usa tráfico urbano libre y cambios de carril; Industrial usa convoyes lentos y no programa cambios voluntarios; Skyline mantiene carriles ordenados, velocidad alta y algunos vehículos de seguridad con cambios; THE CROWN usa tránsito de servicio, drones y luces tecnológicas. Las densidades heredadas de Claude se conservaron: Kowloon 1.15, Industrial 0.85, Skyline/Orbital 1 respecto a cantidades configuradas. El número total no se redujo para obtener resultados verdes.

`newTraffic`, `pickKind`, `pickLane` e `initTraffic` crean entidades. La selección de carril original exigía que una misma posición transversal fuera válida respecto a obstáculos a lo largo de toda la pista; cuando no existía, caía en un centro de respaldo. Para tráfico que ahora esquiva, ese contrato era excesivo. La selección inicial comprueba el **espacio local de spawn**, tamaño y banda mediante `trafficPlaceOk`; los obstáculos posteriores se atienden durante conducción.

`trafficPlaceOk` excluye posiciones dentro/próximas a sólidos y reserva divisores por delante. También valida ancho y altura local del túnel/corredor. `respawnTraffic` mantiene distancias al jugador y a todos los pilotos después de los desplazamientos de búsqueda; si agota candidatos, continúa oculto en `TFS.DEAD` y reintenta. No marca `TFS.SPAWN` sobre una posición no aprobada.

`laneSafe` comprueba pilotos y otros vehículos en el corredor. `trafficLane` señaliza 0.9 s antes del movimiento y comprueba seguridad al terminar la señal. Codex añadió la comprobación durante el desplazamiento completo. Si se aproxima un piloto, conserva el punto actual y cancela destino/señal; si recibe un golpe que produce `TFS.NUDGE`, también cancela la maniobra pendiente. El contacto y las colisiones del vehículo siguen activos.

`trafficAvoid` se evalúa aproximadamente cada 0.1 s y mira unos tres segundos por delante. Construye obstáculos relevantes con offsets de `rel`, calcula la banda segura y busca objetivos transversales. La ventana alrededor del obstáculo bloqueante define destinos; el trayecto decide si se puede llegar sin cruzar obstáculos anteriores.

Tres correcciones son esenciales:

1. El fallback de `patch_routes17.py` elegía un destino incluso cuando `pathOk` lo rechazaba. El vehículo lo seguía mientras reducía velocidad a 0.45, produciendo los cruces de divisor en `iab`. Ahora un trayecto rechazado mantiene las coordenadas actuales.
2. El predictor interpolaba x/y usando el mayor tiempo de ambos ejes. El eje corto parecía desplazarse más despacio que en `trafficUpdate`. Ahora predice x a su tasa real de maniobra, y y con la tasa real del objetivo y el seguimiento amortiguado de `cy`. La comprobación usa muestras temporales de 0.05 s y margen para el hull.
3. La predicción no sustituye contacto físico: `trafficSweep` comprueba continuamente el segmento de hull expandido contra sólidos, limita movimiento en la normal y permite deslizar en tangentes. También resuelve una penetración inicial causada por cambio de relevancia de corredor o geometría móvil, mediante la cara válida de menor desplazamiento. No hace intangibles los vehículos ni elimina obstáculos.

`trafficUpdate` mantiene ACT/NUDGE/SPIN/DEAD/SPAWN, la velocidad efectiva, route planning/checks, posición amortiguada y el barrido sólido. `trafficMatrix` convierte la pose local al corredor y añade animación visual. `destroyTraffic` conserva las destrucciones por impactos y sus recompensas.

Los fixtures dirigidos reconstruyen estados locales registrados antes de los incidentes de `iab`, puente de `k9` y pilón de `k9c`. Verifican tanto ausencia de solapamiento como avance y recuperación de velocidad, para no aceptar un camión inmóvil como éxito. Son reproducciones locales de incidentes, mientras la suite completa sigue ejecutando carreras con todos los pilotos y tráfico.

## 9. Audio: buses, DSP y turbo

`AU` es el motor Web Audio; `MU` gestiona música adaptativa; `STEM` reproduce bancos; `MENU_APEX` mantiene la música de menús. `ENGINE_PROFILES` y `makeEngine` mantienen síntesis de motores. `DSPSFX` y `DSPSFX_ORDER` mantienen los efectos previamente incorporados; `SFXD` queda como respaldo de síntesis.

El flujo principal es: buses `music/sfx/ui` → master gain → compresor maestro → destino. Música pasa por filtro y ducking musical; motores pasan por `engHud`; HUD pasa por `hudIn` y un limitador dedicado hacia UI. Los sliders conservan la curva `pow(vol/100,1.6)`, y mute ajusta buses/maestro.

`HUDSFX` tiene 21 recetas DSP, `HUDCFG` fija prioridad, cooldown, volumen, monofonía y ducking. `AU.renderHud` usa OfflineAudioContext, normaliza pico a aproximadamente -3 dBFS antes de ganancia de evento y aplica un fade final de 4 ms. Se renderiza una vez por contexto.

`AU.hudMax=4` limita voces de HUD. `AU.hud` elimina registros terminados, aplica cooldown, rechaza navegación cerca de cues importantes, mantiene monofonía y roba la voz de menor prioridad/más antigua solamente si el evento entrante tiene prioridad superior. `AU.hudStop` utiliza fade; `onended` desconecta source/gain. `AU.hudInfo` expone métricas de pruebas. `HUDFB` conserva sonidos históricos si el banco no está disponible.

El ducking tiene entrada de 40 ms, retención específica por evento y recuperación de 450 ms. El motor recibe 60% de los dB del duck musical. El watcher `HUDW`/`hudWatch` reacciona a transiciones de energía/boost/integridad; no reproduce un cue cada frame.

Sony y Vader conservan 145 BPM y 16 compases. El turbo Sony, «Neon Fang Rush», y el de Vader, «Iron Press Protocol», son los motivos DSP incorporados por Claude y codificados en Opus. No se generó música nueva en esta continuación. Los stems normales `mel/chd/bas/drm` son byte-idénticos a Legacy; Cooper y Crown conservan también `tur`. Los hashes completos figuran en el informe de audio y en `preservation.json`.

`STEM.cfg` aporta duración del compás y loop. Las rampas `turboIn=0.5` s y `turboOut=1.4` s se conservaron. `stemOffline` usa el mismo reproductor para renders controlados; la comparación introduce cambios de vuelta, reactivaciones cortas y un burst que cruza el límite de loop. Los controles Legacy-vs-Legacy estiman jitter de decodificación/resampling antes de comparar PCM.

Las pruebas de audio miden valores y funcionamiento en Web Audio real de Edge con salida de laboratorio. Los filtros/umbrales espectrales son indicadores objetivos, no una aprobación de escucha de los parlantes Fold5. Revisar volumen relativo, fatiga, clicks percibidos y adaptación musical en el dispositivo real.

## 10. Carrera persistente, NV3, idiomas y recursos

`careerNew` crea `v:3`, `edition:'public'`, eventos, conquistas, selección de flota, unlocks, stats y achievements. `sanitizeCareer` acepta datos de forma estricta, conserva solo datos compatibles y rechaza ediciones `test/diagnostic`. `careerLoad` y `careerSave` mantienen `nv3_career`.

`PROGRESSION.hasWin` requiere una victoria con tiempo válido en la dificultad correspondiente. `lowClear` y `hardClear` recorren los diez eventos de campaña. `migrate` conserva derechos anteriores sin inventar medallas; `chooseDifficulty`, `completeFinal`, `pending` y `ENDINGS` controlan dificultad/recompensas y su presentación. `completeEvent`, `evUnlocked`, `finalUnlocked` y `nextUnlockedAfter` conservan el avance territorial y el siguiente evento.

Las claves de mejores tiempos son `nv3_best_<track>_<difficulty>`. Idioma usa `nv3_lang`. Las claves diagnósticas antiguas se ignoran, no se eliminan. No renombrar claves ni cambiar `v` solamente porque cambia el número de versión visible.

`exportCode` serializa JSON UTF-8/Base64 con prefijo NV3 y checksum FNV; `parseImport` valida formato, checksum, JSON y campos. No usa eval. Cambiar el nombre de versión descriptivo en el export no modifica el esquema. Para compatibilidad futura, mantener importación de `v:3` y hacer migraciones explícitas para nuevos datos.

Un evento nuevo afecta las funciones `EVENTS.every` de finalización: sin una migración o estrategia de versión puede volver a bloquear Hard/PROJECT ZERO de una campaña existente. Una pista libre nueva no debe implicar automáticamente una victoria de campaña. Nunca inferir victorias por disponibilidad de pista o por un mejor tiempo libre.

`I18N`, los catálogos incorporados, `LINES`, `DIALOGUE`, `TX`, `RIV`, `PORT` y `ENDINGS` mantienen radio y recursos. Cada jefe conserva 108 líneas por idioma, 324 para los tres, con las mismas expresiones/retratos. Los 18 retratos y dos finales WebP se verificaron por hash y por las regresiones DOM/recursos. Las pruebas recorren las 324 entradas en ES y EN y comprueban presentación, estado de radio y anti-repeat.

Las seis naves son las definidas por `SHIPS`/`SHIPI`; la prueba gráfica las selecciona en una campaña sintética dentro de un perfil aislado. Ese fixture no se escribe sobre una partida real. La prueba física debe comenzar respaldando NV3, y preferiblemente usar una partida de prueba independiente.

## 11. Validación ejecutada y límites

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

Todos los comandos completos, semillas, hashes de fuente, fechas y archivos de salida quedan en el JSON de pruebas. Las ejecuciones intermedias fallidas se conservaron: no son el resultado final, pero explican qué se reprodujo y qué ajustes se descartaron. Se separan del resultado final para no inflar la cantidad de pruebas aprobadas.

Las suites de rutas comprueban construcciones, continuidad de joins, factores de avance, travesías de ruta/avenida, progreso por frame, checkpoints, colisiones por corredor, respawn, espacios navegables, variedad IA y tráfico. La suite de tráfico comprueba flotas, densidad, salida, obstáculos/bandas, distancia de respawn, cambios de carril, finalización y perfiles de velocidad. Las regresiones adicionales prueban incidentes y agotamiento de búsqueda de spawn.

Se corrigió otro error del contador original: NVSIM continúa conduciendo al jugador que ya terminó hasta que llegan todos los rivales. Esos eventos de celebración podían contarse como visitas de carrera. Las aserciones finales filtran a las primeras tres vueltas y exigen entradas/salidas en tres vueltas distintas; el uso natural por IA aplica el mismo límite de distancia. No se usa una visita posterior a meta para declarar recorrible un ramal.

El arnés HUD tenía una variable `r` sobrescrita antes de leer `r.counts` en la aserción de pausa. Se conservó el resultado de flujo de carrera por separado. Esto corrige un fallo del test, no un sonido. El arnés CDP también se corrigió para cerrar el browser por protocolo y evitar procesos huérfanos del relanzamiento de compatibilidad de Edge. Los perfiles fueron aislados y solamente se cerraron los procesos de prueba identificados.

Los 91/53 resultados históricos de 3.6.2/3.6.3 no se presentaron como suites reejecutadas completas. Se recuperó el arnés DOM real de 3.6.3 y sus fixtures, se adaptó al HTML experimental y se repitieron sus 44 pruebas. `jsdom` es dependencia exclusivamente de ese arnés; no entra en el HTML.

Limitaciones de cobertura: pruebas de pasos fijos no simulan comodidad de cámara ni dedos reales; emulación de viewport no prueba densidad física ni teclado virtual; SwiftShader no representa GPU del Fold5; métricas de heap no prueban RAM total; análisis PCM/espectral no sustituye escucha; simulación de progresión con fixtures no es una campaña manual de principio a fin. El validador geométrico es discreto y específico a estas configuraciones. Mantener un protocolo manual después de cambios posteriores.

## 12. Balance, rendimiento y presupuesto

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

La comparación usa Legacy y experimental ejecutados de nuevo con seeds 1,2,3, pasos 1/60 s, mismas personalidades del jugador y calidad fija. Es un escenario reproducible de laboratorio, no una distribución estadística de jugadores humanos. Las cifras históricas +0.12%/+7% se mantienen como referencia anterior, no como medición actual.

Los tiempos de ramal frente a avenida se miden con seis semillas y se publican por pista/ruta. El muestreo de `tests/route_balance.mjs` descarta segmentos con destrucción para comparar tiempo de paso exitoso; por tanto no estima por sí solo riesgo o esperanza de tiempo incluyendo respawn. Combinarlo con causas de wrecks y la suite de carreras completas.

| Fuente | Pista | Intervalo rAF medio ms | Tick CPU medio ms | Buffers GPU contabilizados MiB |
| --- | --- | ---: | ---: | ---: |
| legacy | k9 | 76.37 | 0.63 | 16.48 |
| legacy | iab | 77.15 | 0.78 | 29.62 |
| legacy | orb | 52.50 | 0.64 | 33.81 |
| experimental | k9 | 84.93 | 1.38 | 18.36 |
| experimental | iab | 90.21 | 1.19 | 30.91 |
| experimental | orb | 54.01 | 1.38 | 36.02 |

180 requestAnimationFrame intervals and lastFrameMs samples after 60 warmup frames; fixed high quality, DPR 1, Edge SwiftShader. JS heap is not whole-process RAM. Sequential runs on the same host; no physical GPU/device claim.

La memoria de audio puede crecer al decodificar cinco stems estéreo por banco; la prueba en juego registra unos 51–52 MB de PCM por banco Sony/Vader en ese contexto. Eso no incluye todos los demás buffers, navegador, geometría o texturas. `STEM` gestiona preparación/release del banco y fuentes; evitar mantener todos los bancos decodificados permanentemente sin justificarlo. HUD mantiene 21 buffers renderizados y hasta cuatro voces activas; los 300 starts/ends de stress completaron su ciclo.

La ciudad se divide en chunks, con frustum y distancia de dibujo según `QL`. Los ramales añaden geometría estática, divisores y decoración; el tráfico usa modelos y luces específicas de distrito. La escena más costosa no se determina solamente por cantidad de civiles: triángulos visibles, glow, efectos y resolución influyen. El checklist Fold5 exige medir después de calentamiento y con sesiones prolongadas para detectar throttling.

## 13. Reproducir el laboratorio

Usar Node 22 o posterior con WebSocket/fetch globales, Chromium moderno y Python con NumPy para comparaciones PCM/espectro. Edge se localiza en `tests/cdp.mjs`; puede cambiarse con `NV_BROWSER`. Python puede seleccionarse con `NV_PYTHON`. `ffmpeg` se utiliza solamente para hojas de revisión visual, y `jsdom` para DOM.

Comandos desde la raíz:

```powershell
git status -sb
git branch --show-current
$env:NV_PYTHON='C:\Users\Adinl\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
node tools/extract_legacy.mjs
# Si el arnés DOM no tiene jsdom disponible: npm install --prefix tests/legacy-regression
node tests/preservation.mjs
$env:SEEDS='1,2,3,4,5,6'
node tests/traffic.mjs
node tests/safety.mjs
node tests/incidents.mjs
$env:SEEDS='1,2,3'
node tests/routes.mjs
node tests/hud.mjs
node tests/turbo.mjs work/index_363.html index.html
node tests/legacy-regression/dom_tests.cjs
node tests/integration.mjs
node tests/route_visual.mjs
node tests/offline.mjs index.html
node tests/performance.mjs
node tests/buildings_signature.mjs work/index_363.html
node tests/buildings_signature.mjs index.html
node tests/baseline.mjs work/index_363.html work/legacy-races.json
node tests/baseline.mjs index.html work/current-races.json
& $env:NV_PYTHON tests/compare_races.py work/legacy-races.json work/current-races.json work/comparison.json
$env:SEEDS='1,2,3,4,5,6'
node tests/route_balance.mjs index.html k9,ia,sv,k9a,k9b,k9c,iaa,iab,iac,sva,svb,svc,orb
node tests/track_maps.mjs
node tests/traffic_shots.mjs
```

`work/index_363.html` es una referencia extraída y comprobada, no un archivo que Git descargue al clonar porque `work/` está ignorado. Crear una copia del blob `16a83f7:index.html` con escritura binaria/UTF-8 exacta; comprobar SHA-256 antes de usarla. Evitar redirecciones de PowerShell que cambien encoding. Para DOM, instalar los paquetes del `package.json` de `tests/legacy-regression` o establecer `NODE_PATH` al entorno de pruebas existente.

No ejecutar suites que escriben `work/nv_test.html` simultáneamente sin darles salidas independientes. El arnés añade instrumentación, el driver lanza un perfil temporal y el test cierra el browser. No reutilizar el perfil personal ni sus partidas. Registrar exit code además de leer los mensajes PASS: una excepción al final invalida la ejecución aunque hubiera muchos PASS previos.

## 14. GEMINI ARGON — NEXT AGENT HANDOFF

1. **Obtener repositorio.** Clonar la URL indicada y consultar ramas; para continuar localmente, utilizar el checkout existente sin recrearlo. Confirmar acceso, `status -sb`, rama, log y remotes antes de editar.
2. **Rama.** Usar únicamente `feat/3.7-district-overdrive`. `main` y Legacy son las versiones públicas protegidas. No fusionar ni activar Pages experimental sin autorización nueva.
3. **Commit.** El código de esta entrega está en `fd9c5a8c6a3e5856cb8ef6a0e7b0ef9ac2212c4b`. El manifiesto externo identifica el HEAD final con documentación. Comparar el SHA del HTML; un nombre de versión no prueba identidad del archivo.
4. **Leer primero.** Este handoff, `ARCHITECTURE.json`, `TEST_RESULTS.json`, mapas, audio, changelog, luego los scripts concretos de pruebas. Consultar el diff desde `0a83587` para separar implementación de Claude y correcciones posteriores.
5. **Analizar JS sin Base64.** Usar `tools/extract_source.mjs` para producir una vista de análisis. Mantener `index.html` original y no distribuir la vista con recursos omitidos. Las líneas del inventario se refieren al HTML real.
6. **Rutas.** Leer `ROUTEDEFS`, `makeRoute`, `tfr`, `rtLook`, `rel`, `rtCheck`, `rtSwitch`, `routeFeatures`, `routeGeom`, `routeValidate`, `camFrame` y `buildMini`; cambios en uno de estos contratos afectan varios subsistemas.
7. **Tráfico.** Leer `TKIND`, `DTRAF`, `newTraffic`, `pickLane`, `trafficPlaceOk`, `laneSafe`, `trafficLane`, `trafficAvoid`, `trafficSweep`, `trafficPlan`, `trafficUpdate`, `respawnTraffic`, `trafficCol` y `trafficMatrix`.
8. **Audio.** Leer `HUDSFX/HUDCFG`, `AU.renderHud/hud/hudDuck/hudStop`, `STEM`, `stemOffline`, `ENGINE_PROFILES`, `makeEngine`, `MU` y `MENU_APEX`. Los nuevos turbos ya están armonizados y validados; no sustituir música normal.
9. **Protecciones.** Conservar arte aprobado, motores, Cooper/Crown, stems normales, frases, flota, progresión, claves NV3 y la distribución autónoma. No volver a añadir diagnósticos/unlock-all al HTML. No agregar servicios externos.
10. **Pruebas.** Repetir comandos con calidad y seeds fijados, perfiles aislados, entradas/historial neutralizados por el fixture y una fuente identificada por hash. Las semillas solas no controlan el viejo acoplamiento entre efectos y gameplay. No copiar los resets del fixture a la campaña real. Resultados anteriores no validan un parche nuevo.
11. **Pistas futuras.** Empezar por un nuevo id estable en TRACKS, completar geometría/tema/feature data y medir L/bandas. Probar generación, salida, IA, tráfico, carrera y guardado. No añadir a EVENTS sin revisar migración de derechos de campaña.
12. **Tráfico futuro.** Añadir un TKIND con dimensiones/velocidad y una malla en la arquitectura existente, asignar pesos en DTRAF y probar todos los casos de spawn/obstáculos. Conservar los índices históricos; no confundir aspecto visual con volumen de colisión.
13. **Sonidos futuros.** Añadir receta DSP y configuración explícita de prioridad/cooldown/volumen. Medir render, pico, espectro, monofonía, polyphony, nodos, mute y ducking. Escuchar también en dispositivo; un espectro aprobado no basta.
14. **Guardados.** Exportar NV3 antes de ensayos, mantener `v:3` y claves salvo migración planificada, comprobar partidas antiguas, datos inválidos y edición diagnóstica. No usar disponibilidad de pista como prueba de victoria.
15. **Bugs históricos.** No mover hacia un waypoint rechazado; no predecir ambos ejes como interpolación de duración común; no regresar de carril dentro del hull trasero de un pilón; no confiar en una única comprobación al señalizar; no spawnear en un fallback no validado; no generar rampas atravesando prensas/pilones altos.
16. **Legacy.** Comparar con `16a83f7` y la rama estable, con copias de recursos verificadas. La igualdad esperada de edificios y stems normales tiene suites específicas. Comparar métricas nuevas con ejecuciones actuales del mismo arnés, no con cifras copiadas de informes.
17. **Rollback.** Para inspección, usar un checkout separado de `backup/3.7-claude-wip-0a83587`; para deshacer cambios integrados, crear commits revert pequeños y auditables. No resetear un checkout con trabajo de otra persona ni limpiar `work/` a ciegas. El respaldo del WIP no incluye los archivos ignorados.
18. **Mejoras viables.** Separar RNG de física/efectos, ampliar stress con semillas, mejores métricas de contacto, perfil físico Fold5, señalética legible, documentación localizada de ramales y escenarios de navegación más variados. Evaluar cada mejora sobre el motor existente.
19. **Límites del motor.** Los ramales comparten el dominio s y vuelven al principal; no constituyen un grafo de rutas arbitrario. Obstáculos usan volúmenes en marcos locales y validadores discretos. Una ruta nueva sobre un cruce/túnel/bifurcación exige validar relevancia y altura, no sólo continuidad del spline.
20. **Validación independiente.** Galaxy Z Fold5, comodidad de cámara en rampas/uniones, señalización y HUD bajo dedos, audio subjetivo, campaña manual completa, throttling/memoria de sesión larga y cualquier extensión de contacto entre corredores deben comprobarse fuera del laboratorio actual.

## 15. Símbolos y evidencia navegable

| Símbolo real | Línea del HTML final |
| --- | ---: |
| `TRACKS` | 553 |
| `buildTrack` | 745 |
| `tf` | 766 |
| `wp` | 772 |
| `wpv` | 773 |
| `buildHash` | 898 |
| `ROUTEDEFS` | 786 |
| `makeRoute` | 824 |
| `tfr` | 848 |
| `tfc` | 854 |
| `rtLook` | 856 |
| `rel` | 861 |
| `rtCheck` | 872 |
| `rtSwitch` | 879 |
| `routeFeatures` | 2054 |
| `routeGeom` | 2082 |
| `routeValidate` | 2151 |
| `camFrame` | 887 |
| `buildWorld` | 1891 |
| `loadTrack` | 4762 |
| `initGL` | 2723 |
| `compile` | 2712 |
| `render` | 4873 |
| `buildDynamic` | 4815 |
| `buildMini` | 4918 |
| `drawMini` | 4926 |
| `resetRace` | 4160 |
| `newRacer` | 4158 |
| `physics` | 4525 |
| `vehPose` | 4447 |
| `racerCol` | 4608 |
| `obstacleCol` | 4592 |
| `trafficCol` | 4636 |
| `wreckRacer` | 4559 |
| `respawnRacer` | 4587 |
| `freeSpot` | 4579 |
| `progress` | 4700 |
| `rank` | 4705 |
| `aiRoutePlan` | 890 |
| `aiPick` | 4471 |
| `aiDrive` | 4505 |
| `pathDanger` | 4469 |
| `TKIND` | 2471 |
| `DTRAF` | 2504 |
| `newTraffic` | 4171 |
| `pickLane` | 4173 |
| `trafficPlaceOk` | 4179 |
| `trafficLane` | 4191 |
| `laneSafe` | 4188 |
| `trafficAvoid` | 4201 |
| `trafficSweep` | 4652 |
| `trafficPlan` | 4687 |
| `trafficUpdate` | 4671 |
| `respawnTraffic` | 4692 |
| `trafficMatrix` | 4695 |
| `updateCam` | 4741 |
| `HUDL` | 4268 |
| `HUDW` | 4954 |
| `layoutControls` | 4397 |
| `readInput` | 4435 |
| `hudWatch` | 4955 |
| `updateHUD` | 4934 |
| `AU` | 3175 |
| `HUDSFX` | 2905 |
| `HUDCFG` | 2942 |
| `makeEngine` | 3102 |
| `ENGINE_PROFILES` | 3061 |
| `STEM` | 3601 |
| `stemOffline` | 3595 |
| `MU` | 3406 |
| `MENU_APEX` | 3307 |
| `STORE` | 542 |
| `PROGRESSION` | 4037 |
| `careerNew` | 4083 |
| `sanitizeCareer` | 4086 |
| `careerLoad` | 4101 |
| `careerSave` | 4102 |
| `completeEvent` | 5303 |
| `exportCode` | 4132 |
| `parseImport` | 4134 |
| `FLEET` | 5022 |
| `ENDINGS` | 5277 |
| `I18N` | 5444 |
| `LINES` | 3920 |
| `DIALOGUE` | 3923 |
| `TX` | 3936 |
| `RIV` | 3993 |
| `PORT` | 3671 |

Las ubicaciones son verificables por búsqueda en el HTML final. El inventario lista también declaraciones adicionales; las funciones locales dentro de generadores/recetas no se presentan como APIs globales. No atribuir a esta arquitectura clases o módulos externos inexistentes.

## 16. Pendientes explícitos

- Validación física del Galaxy Z Fold5 plegado/desplegado y sesiones largas.
- Campaña manual completa en ambas lenguas/dificultades, comodidad de cámara y lectura de señalización.
- Escucha subjetiva de HUD/turbo/mezcla en parlantes y auriculares reales.
- Regresión de frame software medida: no garantiza rendimiento de GPU móvil.
- La relevancia/colisión entre corredores usa contratos locales y validadores discretos; extensiones de cruces compartidos requieren validación independiente.

Seguir el `NEON_VERTIGO_3.7_FOLD5_CHECKLIST.md` y registrar archivo/hash, navegador, orientación, calidad, duración de sesión, prueba y resultado. Esta versión es una entrega experimental conservada en su rama; la versión pública continúa siendo 3.6.3.

