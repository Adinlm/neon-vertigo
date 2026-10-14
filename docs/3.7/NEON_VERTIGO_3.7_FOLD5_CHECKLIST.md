# NEON VERTIGO 3.7 — GALAXY Z FOLD5 CHECKLIST

Este protocolo está pendiente de ejecución física. Edge/SwiftShader y los viewports emulados no certifican el Fold5.

## Registro y respaldo

- [ ] Registrar archivo, SHA-256, navegador/versión, Android, orientación, modo de pantalla, calidad elegida, batería y temperatura ambiente.
- [ ] Exportar NV3 antes de probar. Usar una campaña de prueba; conservar el export de la partida habitual aparte.
- [ ] Abrir el HTML descargado como archivo, con datos/Wi-Fi desactivados; repetir desde la web estable sólo para comparar, sin mezclar orígenes.
- [ ] Registrar cada caso como PASS/FAIL/INCONCLUSO, pasos, pista, ramal, nave, captura/video y duración. No marcar la lista automáticamente con resultados del laboratorio.

## Pantalla plegada y desplegada

- [ ] Selector inicial de idioma en ambas orientaciones y tamaños; ES/EN legibles, una pulsación abre título.
- [ ] Menús, hangar con seis naves desbloqueadas en la partida de prueba, ajustes, resultados y ambos finales sin cortes.
- [ ] Carrera horizontal plegada: joystick, freno/turbo/aceleración manual visibles, sin tapar información esencial con los dedos.
- [ ] Carrera horizontal desplegada: mismo recorrido, sin controles demasiado alejados ni regiones muertas.
- [ ] Plegar/desplegar durante pausa; revisar viewport, HUD, minimapa y controles al reanudar.
- [ ] Girar mientras están pulsados controles: no quedan turbo/freno/joystick pegados; pausar/reanudar si corresponde.
- [ ] Revisar áreas seguras, barra de navegación, barra del navegador, alto contraste y lectura de radio.

## Controles y conducción

- [ ] Joystick diagonal, deadzone, sensibilidad y altura; invertir Y y restaurar.
- [ ] Aceleración automática y manual; freno, turbo, entradas simultáneas con 2–3 dedos y liberación fuera de botones.
- [ ] Pausa, app en segundo plano, llamada/notificación y retorno: controles y audio recuperan sin saltos indebidos.
- [ ] Las seis naves conservan diferencias de manejo y sonidos de motor.
- [ ] Takedowns laterales/traseros, choque frontal, contacto con obstáculos y respawn con cámara cómoda.

## Matriz de pistas y ramales

Probar primero iab «BAJO LAS TUBERÍAS», ambos lados de la entrada y unión; seguir camiones sin destruirlos durante al menos una vuelta. No aceptar vehículos inmóviles como solución.

| Pista | Ramales | Plegado | Desplegado | Avenida/ramal/respawn/tráfico |
| --- | --- | --- | --- | --- |
| k9 | PASAJE AÉREO NEÓN / TÚNEL DEL MERCADO | [ ] | [ ] | [ ] |
| ia | TÚNEL DE MANTENIMIENTO 7 | [ ] | [ ] | [ ] |
| sv | AUTOPISTA EJECUTIVA | [ ] | [ ] | [ ] |
| k9a | CALLE DE SERVICIO DE LOS FANGS | [ ] | [ ] | [ ] |
| k9b | PUENTE DE CABLES | [ ] | [ ] | [ ] |
| k9c | AVENIDA DE LAS TORRES-CORONA / ATAJO DE LOS FANGS | [ ] | [ ] | [ ] |
| iaa | PLATAFORMA DE CARGA | [ ] | [ ] | [ ] |
| iab | BAJO LAS TUBERÍAS | [ ] | [ ] | [ ] |
| iac | PASARELA DE GRÚAS / CORREDOR DE CARGA | [ ] | [ ] | [ ] |
| sva | PUENTE DORADO | [ ] | [ ] | [ ] |
| svb | CARRIL REAL | [ ] | [ ] | [ ] |
| svc | TERRAZA CORPORATIVA / ATAJO DEL SOBERANO | [ ] | [ ] | [ ] |
| orb | CORREDOR ORBITAL SUPERIOR / PASO INFERIOR DEL PUERTO | [ ] | [ ] | [ ] |

- [ ] En cada ramal recorrer entrada/rampa/interior/salida, luego avenida; confirmar mismo tramo posterior.
- [ ] Seguir tráfico de sentido de carrera y contrario; comprobar pilones, puentes, tubos, divisores y túneles.
- [ ] Revisar señalética antes de elegir, barreras, huecos visibles y ausencia de colisión invisible.
- [ ] Morir en entrada, mitad y unión; comprobar corredor de respawn, altura y coste de progreso.
- [ ] Tres vueltas exactas, clasificación estable y minimapa coherente en ambos caminos.

## Audio

- [ ] Escuchar los 21 cues HUD en flujo normal, prioridades, repeticiones rápidas, mute UI/master y sliders.
- [ ] Sony/Vader turbo: bursts cortos, largos, repetidos, a ambos lados del loop y de cambio de vuelta.
- [ ] Confirmar música normal, Cooper, Crown y motores frente a 3.6.3 usando volumen comparable.
- [ ] Revisar parlantes/auriculares, picos, clics, sonidos fatigantes y ducking al terminar la alerta.
- [ ] Pausa, suspensión, segundo plano y resume con AudioContext inicialmente suspendido.

## Guardados y campaña

- [ ] Importar un NV3 válido de 3.6.3; verificar conquistas, naves, medallas y mejores tiempos antes de correr.
- [ ] Exportar/reimportar la partida 3.7; cerrar/reabrir el archivo y comprobar persistencia.
- [ ] Datos inválidos/checksum incorrecto no reemplazan la partida.
- [ ] Carrera libre no gana eventos de campaña; derrota tampoco concede medalla de victoria.
- [ ] Diez victorias Fácil/Normal habilitan Difícil; diez victorias Difícil conceden PROJECT ZERO y final correcto.
- [ ] Completar campaña manualmente en ambos idiomas; revisar 324 frases por idioma según aparezcan, retratos y finales.

## Rendimiento y sesión larga

- [ ] Medir calentamiento de 5 min y sesiones de 20–30 min por modo, con k9/iab/orb y misma calidad.
- [ ] Registrar intervalos/FPS sólo con herramienta fiable y condiciones; anotar caídas, thermal throttling y temperatura percibida.
- [ ] Repetir cambios de pista/hangar/música y observar cierres, recargas, context loss o degradación progresiva.
- [ ] Si no hay medidor fiable, registrar fluidez subjetiva sin inventar cifras de FPS/RAM.
- [ ] Comparar con 3.6.3 con misma resolución, navegador, temperatura, volumen y calidad; conservar resultados por separado.

**Criterio de aceptación manual:** cero bloqueos/corrupción de partidas, controles fiables, rutas y colisiones legibles, audio aceptable y rendimiento sostenido apropiado para jugar. Ante un fallo, conservar export y reproducción antes de modificar el código.

