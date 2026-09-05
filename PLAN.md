# Plan de trabajo de Letra Liga

Este documento es la referencia para retomar el proyecto. Las tareas están
ordenadas para que cada etapa deje una versión jugable y verificable antes de
avanzar a la siguiente.

## 1. Recuperar el juego local

- [x] Reparar la carga asíncrona del diccionario.
- [x] Corregir la codificación y la normalización de `Ñ` y palabras con tilde.
- [x] Añadir pruebas del diccionario con palabras válidas, inválidas y dígrafos.
- [x] Exigir al menos dos fichas nuevas sólo en la jugada inaugural; en las
  jugadas posteriores permitir una ficha nueva conectada al tablero.
- [x] Exigir que la primera palabra pase por la estrella central.
- [x] Exigir que las jugadas posteriores estén conectadas al tablero.
- [x] Detectar, validar y sumar todas las palabras cruzadas de una jugada.
- [x] Aplicar los multiplicadores Wild sólo cuando una ficha nueva activa la casilla.
- [x] Añadir pruebas de puntuación y cruces.
- [x] Añadir pruebas de huecos y conexión.

Resultado esperado: una partida local permite confirmar jugadas válidas y
rechaza jugadas ilegales con mensajes comprensibles.

## 2. Completar las fichas y los turnos

- [x] Asegurar vocales y consonantes mínimas en el reparto y cada reposición.
- [x] Mostrar el inventario actual de la bolsa por letra.
- [x] Mostrar los significados de todas las palabras confirmadas.
- [x] Permitir elegir y reiniciar la letra representada por un comodín.
- [x] Completar la ronda y dar el último turno al jugador que vacía la bolsa al
  reponer su atril.
- [x] Restar o transferir los puntos de las fichas restantes al finalizar.
- [x] Aplicar una bonificación de 25 puntos por usar las siete fichas.
- [x] Añadir intercambio de fichas con la bolsa consumiendo el turno.
- [x] Terminar tras dos rondas completas consecutivas sin palabras.

Resultado esperado: se puede jugar una partida completa sin situaciones sin
salida ni cálculos ambiguos.

## 3. Mejorar la interacción

- [x] Implementar selección por clic: elegir ficha y luego casilla.
- [x] Evitar la selección accidental de texto dentro del tablero.
- [x] Añadir paneo y zoom táctiles para móviles y tabletas.
- [x] Permitir operar tablero y atril con teclado.
- [x] Mostrar claramente la ficha seleccionada y las casillas disponibles.
- [x] Revisar el diseño en pantallas pequeñas.

Resultado esperado: el juego se puede usar con ratón, tacto o teclado.

## 4. Guardado y calidad

- [x] Guardar la partida local para sobrevivir a una recarga de página.
- [x] Añadir acciones para abandonar o reiniciar una partida.
- [x] Configurar pruebas unitarias y de interacción automatizadas.
- [x] Cargar el diccionario de forma diferida para no bloquear el inicio.
- [x] Actualizar el README para reflejar el comportamiento real.
- [x] Inicializar Git y crear el primer punto de recuperación estable.

Resultado esperado: el proyecto es fácil de mantener y una sesión no se pierde
por accidente.

## 5. Multijugador online

- [x] Definir creación y unión a salas mediante código de seis caracteres.
- [x] Diseñar las tablas, funciones y políticas de seguridad de Supabase.
- [x] Guardar el estado compartido y aceptar turnos sólo del jugador activo y
  sobre la versión vigente de la partida.
- [x] Sincronizar tablero, jugadores, bolsa y turnos en tiempo real.
- [x] Ocultar el atril y el orden de la bolsa a los demás participantes.
- [x] Recuperar una sala al recargar mientras se conserve la sesión anónima.
- [x] Permitir salir de una sala de espera y finalizar una partida abandonada.
- [ ] Mover la validación del diccionario y la resolución completa de puntaje
  al backend para obtener protección antitrampas total.
- [ ] Gestionar reconexiones, jugadores ausentes y partidas abandonadas.
- [ ] Probar dos o más navegadores jugando simultáneamente.

Resultado esperado: varios jugadores participan desde dispositivos distintos
sin poder alterar datos que no les corresponden.

## Orden recomendado inmediato

1. Volver a ejecutar `supabase/schema.sql` para instalar las funciones online.
2. Probar creación, unión y una partida completa en dos navegadores distintos.
3. Gestionar presencia y expiración de jugadores desconectados.
4. Mover la validación completa de cada jugada al backend.
