# Letra Liga

Juego de palabras estilo Scrabble en español, hecho con React + Vite.

El trabajo pendiente y su orden recomendado están en [`PLAN.md`](PLAN.md).

## Cómo correrlo

```bash
pnpm install
pnpm dev
```

Abrí la URL que te muestra Vite (por defecto `http://localhost:5173`).

## Estructura del proyecto

```
src/
  App.jsx               Enrutador simple entre lobby / juego / fin de partida
  main.jsx              Punto de entrada de React
  index.css             Estilos globales (incluye tema claro/oscuro)

  context/
    GameContext.jsx      Proveedor liviano de la API pública del juego

  game/
    constants.js         Reglas y fases compartidas
    finalScoring.js      Penalizaciones y transferencias del cierre
    gameSetup.js         Preparación independiente de jugadores y bolsa
    tileExchange.js      Cambio seguro de fichas con la bolsa
    turnResult.js        Historial, mensajes y celebración de una jugada

  hooks/
    useGameState.js      Estado mutable centralizado
    useGameController.js Compone la API que consume la interfaz
    useBoardState.js     Valores derivados del tablero y vista previa
    useGamePersistence.js Guardado automático de la partida local
    useTileActions.js    Colocar, devolver, mezclar y asignar comodines
    useTurnActions.js    Validar, puntuar, confirmar y pasar turnos

  pages/
    Lobby.jsx             Pantalla inicial: nombres de jugadores (1 a 4)
    Game.jsx               Pantalla de juego: tablero + atril + jugadores
    GameOver.jsx            Pantalla de resultados al terminar la partida

  components/
    Board.jsx, Cell.jsx     Tablero y casillas (multiplicadores 2L/3L/2W/3W)
    Rack.jsx, LetterTile.jsx  Atril de fichas del jugador activo
    PanZoom.jsx              Pan/zoom del tablero (sin cambios de lógica)
    PlayerList.jsx           Lista de jugadores con su puntaje y turno activo
    ThemeToggle.jsx          Botón de luna/sol para el tema oscuro
    WordStatusBar.jsx        Vista previa de las palabras armadas + validación
    BagContentsModal.jsx     Inventario de letras restantes en la bolsa
    ExchangeTilesModal.jsx   Selección y confirmación del cambio de fichas
    GameOptionsModal.jsx     Reiniciar o abandonar la partida
    WordMeaningsModal.jsx    Significados de las palabras confirmadas

  services/
    dictionary.js          Valida palabras con un diccionario español local
                            y funciona sin conexión ni claves externas
    supabaseClient.js       Cliente opcional de Supabase
    gameStorage.js           Persistencia automática de la partida local
    onlineGameService.js     Autenticación, salas y suscripciones de Supabase

  layout/
    boardLayout.js          Grid de 19x27 con las casillas especiales
    letterData.js            Distribución oficial de letras y sus puntos

  utils/
    boardWords.js            Detecta la palabra principal y sus cruces, y suma
                              el puntaje completo de la jugada
    rackBalance.js           Mantiene el mínimo de vocales y consonantes
```

## Reglas implementadas

- Se usa la puntuación Wild de Letter League: al confirmar, las mejoras de
  puntuación quedan guardadas en las fichas para palabras futuras.
- Las casillas 2L/3L mejoran la ficha nueva colocada sobre ellas. Las casillas
  2W/3W mejoran todas las fichas de la palabra confirmada.
- Las dos casillas especiales más cercanas a los lados de la estrella son 2L,
  para evitar que la jugada inaugural active dos multiplicadores de palabra.
- Una casilla multiplicadora sólo se activa cuando recibe una ficha nueva; no
  vuelve a aplicarse por tener encima una ficha confirmada.
- Antes de aplicar la palabra se valida contra un diccionario real en
  español. Si no existe, no se aplica y el turno sigue en el mismo jugador
  para que pueda corregir la jugada.
- La jugada inaugural debe colocar como mínimo dos fichas nuevas. Desde la
  siguiente jugada basta una ficha nueva si forma una palabra válida y queda
  conectada al tablero.
- La primera palabra debe cubrir la estrella central. Las siguientes jugadas
  deben conectarse ortogonalmente con al menos una ficha ya confirmada y no
  pueden contener huecos internos.
- Al confirmar una palabra válida, el atril se rellena automáticamente con
  fichas nuevas de la bolsa. Al comenzar hay al menos dos vocales y dos
  consonantes; en las reposiciones hay al menos dos vocales y una consonante,
  siempre que la bolsa tenga suficientes fichas de cada tipo.
- Las palabras nuevas que se cruzan se validan por separado y sus puntajes se
  suman. Si una de ellas no existe, se rechaza toda la jugada.
- El botón de ojo junto al contador de la bolsa muestra cuántas fichas quedan
  de cada letra y cuántos comodines siguen disponibles. Las letras agotadas
  aparecen atenuadas en gris.
- El botón de significados bajo la bolsa lista todas las palabras confirmadas,
  su autor, su puntaje y hasta tres acepciones consultadas en Wikcionario. Esta
  consulta sí necesita conexión, pero nunca bloquea la partida.
- Al presionar un comodín se abre el abecedario para elegir la letra que
  representa. Sigue valiendo cero puntos y se reinicia si vuelve al atril.
- Usar las siete fichas del atril en una jugada concede un bono de 25 puntos.
- La pantalla final conserva el tablero visible y destaca la palabra más
  larga y la palabra individual que consiguió mayor puntaje.
- Cuando una reposición deja la bolsa vacía, el mismo jugador recibe un último
  turno para utilizar las fichas que acaba de robar; después termina la partida.
- El jugador puede cambiar una o más fichas si la bolsa tiene suficientes para
  reemplazarlas. Las fichas devueltas no pueden salir inmediatamente y el cambio
  consume el turno. Antes de ejecutarlo se muestra una segunda confirmación para
  evitar cambios accidentales.
- Pasar o cambiar fichas cuenta como turno sin palabra. La partida termina tras
  dos rondas completas consecutivas sin palabras; una palabra válida reinicia
  el contador.
- Al finalizar, cada jugador pierde los puntos de las fichas que conserva. Si
  alguien vació su atril, recibe la suma de las penalizaciones de sus rivales.
- Las fichas pueden colocarse arrastrándolas o pulsando primero la ficha y luego
  la casilla. La segunda opción también funciona en pantallas táctiles.
- En móviles, el tablero admite paneo con un dedo y zoom con dos dedos. Con
  teclado se seleccionan fichas con Enter/Espacio y se recorren las casillas
  usando las flechas. En pantallas de más de 1200 px, el área visible del tablero
  se amplía hasta un ancho máximo de 1200 px.
- Una confirmación válida muestra una celebración breve y anima las fichas de
  la palabra sin bloquear el siguiente turno.
- De 1 a 4 jugadores, por turnos, con marcador visible para todos.

## Modo online con Supabase (opcional)

Por defecto el juego funciona 100% local ("pasar y jugar" en un mismo
dispositivo), sin necesitar backend.

La partida se guarda automáticamente en el almacenamiento local del navegador,
incluyendo el tablero y una jugada aún no confirmada, y se recupera después de
recargar la página.

El menú de opciones permite reiniciar con los mismos jugadores o abandonar la
partida y volver al lobby.

Para habilitar el modo online:

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. Copiá `.env.example` a `.env` y completá `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_PUBLISHABLE_KEY` (los encontrás en el diálogo Connect o en
   Project Settings → API Keys). También se admite `VITE_SUPABASE_ANON_KEY`
   para proyectos que todavía usen la clave pública heredada.
3. Ejecutá `supabase/schema.sql` en el SQL Editor.
4. Habilitá Anonymous Sign-Ins en Authentication. El script registra en
   Realtime las tablas públicas necesarias.

El esquema separa la bolsa y los atriles privados de los datos públicos y usa
políticas RLS. El cliente utiliza autenticación anónima y permite crear o unirse
a una sala mediante un código de seis caracteres. El anfitrión inicia cuando hay
al menos dos jugadores y los cambios de tablero, marcador y turno se propagan
mediante Realtime.

Cada participante recibe únicamente su propio atril. El orden de la bolsa se
mantiene privado y el estado público conserva sólo las cantidades por letra. Al
finalizar se revelan los atriles para calcular las penalizaciones. Las funciones
SQL rechazan acciones fuera de turno y actualizaciones basadas en una versión
antigua de la partida.

La validación de palabras y el cálculo detallado todavía se ejecutan en el
cliente. El backend comprueba identidad, turno, versión, tamaño del atril y
coherencia básica del puntaje; trasladar toda la resolución al servidor queda
como endurecimiento antitrampas antes de una publicación competitiva.

La conexión vive en `src/services/supabaseClient.js` y el contrato de salas en
`src/services/onlineGameService.js`. El modo local sigue siendo independiente.

Después de actualizar el código se puede volver a ejecutar
`supabase/schema.sql` completo: sus tablas, políticas y funciones son
idempotentes. Para probar desde una misma computadora usa navegadores distintos
o una ventana privada, porque cada participante necesita una sesión anónima
independiente.

## Publicación en Netlify

El repositorio incluye `netlify.toml`. Netlify ejecutará `pnpm build`, publicará
la carpeta `dist` y utilizará Node.js 20. En **Project configuration →
Environment variables** deben configurarse:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

El archivo `.env` local está ignorado por Git y no debe subirse. Tampoco se debe
usar una clave `service_role` o `sb_secret_` en el navegador.

## Diccionario de validación

Se usa el paquete local `an-array-of-spanish-words`, por lo que la validación
funciona sin conexión y sin claves externas. Las vocales acentuadas se
normalizan porque no existen como fichas separadas, mientras que la `Ñ` se
conserva como una letra distinta de la `N`.

Los significados se consultan por separado en la API pública de Wikcionario.
Si una entrada no existe o la conexión falla, el historial sigue disponible y
se muestra un aviso únicamente en esa palabra.

Las pruebas unitarias y de interacción se ejecutan con:

```bash
pnpm test
```

Durante el desarrollo, `pnpm test:watch` vuelve a ejecutar las pruebas de
interfaz al guardar cambios.
