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
    gameSetup.js         Preparación independiente de jugadores y bolsa
    turnResult.js        Historial, mensajes y celebración de una jugada

  hooks/
    useGameState.js      Estado mutable centralizado
    useGameController.js Compone la API que consume la interfaz
    useBoardState.js     Valores derivados del tablero y vista previa
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
    WordMeaningsModal.jsx    Significados de las palabras confirmadas

  services/
    dictionary.js          Valida palabras con un diccionario español local
                            y funciona sin conexión ni claves externas
    supabaseClient.js       Cliente opcional de Supabase
    gameService.js           Capa de "partida": local hoy, lista para Supabase

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
- Una casilla multiplicadora sólo se activa cuando recibe una ficha nueva; no
  vuelve a aplicarse por tener encima una ficha confirmada.
- Antes de aplicar la palabra se valida contra un diccionario real en
  español. Si no existe, no se aplica y el turno sigue en el mismo jugador
  para que pueda corregir la jugada.
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
- Las fichas pueden colocarse arrastrándolas o pulsando primero la ficha y luego
  la casilla. La segunda opción también funciona en pantallas táctiles.
- Una confirmación válida muestra una celebración breve y anima las fichas de
  la palabra sin bloquear el siguiente turno.
- De 1 a 4 jugadores, por turnos, con marcador visible para todos.
- La partida termina cuando la bolsa de letras se queda sin fichas.

## Modo online con Supabase (opcional)

Por defecto el juego funciona 100% local ("pasar y jugar" en un mismo
dispositivo), sin necesitar backend.

Para habilitar el modo online:

1. Creá un proyecto gratis en [supabase.com](https://supabase.com).
2. Copiá `.env.example` a `.env` y completá `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` (los encontrás en Project Settings → API).
3. Creá las tablas sugeridas en el comentario de `src/services/gameService.js`
   (`games`, `players`, `moves`).
4. Activá Realtime en las tablas `games` y `players`.

Toda la lógica de "cómo se guarda y sincroniza una partida" vive en
`src/services/gameService.js` y `src/services/supabaseClient.js`: son los
únicos archivos que hace falta tocar para pasar de local a online, ya que
`GameContext.jsx` no depende de si el backend existe o no.

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
