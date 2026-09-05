import { useRef, useState, useCallback, useEffect } from "react";

const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;
const ZOOM_SPEED = 0.0015;

// `children` es una función que recibe el `scale` actual: children(scale).
// Así el tablero puede cambiar su tamaño REAL en vez de estirarse con
// transform: scale(), lo que evita que el texto se pixelee al hacer zoom.
export default function PanZoom({ children, initialScale = 1 }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [transform, setTransform] = useState({
    x: 0,
    y: 0,
    scale: initialScale,
  });
  const dragState = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });
  const touchState = useRef(null);

  // Evita que el tablero se pueda arrastrar/zoomear fuera de la pantalla:
  // siempre deja al menos `margin` px de contenido visible en cada eje.
  const clamp = useCallback((x, y) => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return { x, y };

    const containerRect = container.getBoundingClientRect();
    const contentWidth = content.offsetWidth;
    const contentHeight = content.offsetHeight;
    const margin = 80;

    const minX = margin - contentWidth;
    const maxX = containerRect.width - margin;
    const minY = margin - contentHeight;
    const maxY = containerRect.height - margin;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  }, []);

  // Zoom con la rueda del mouse, centrado en la posición del cursor.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setTransform((prev) => {
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, prev.scale - e.deltaY * ZOOM_SPEED * prev.scale),
        );
        const scaleRatio = nextScale / prev.scale;

        const nextX = cursorX - (cursorX - prev.x) * scaleRatio;
        const nextY = cursorY - (cursorY - prev.y) * scaleRatio;

        return { ...clamp(nextX, nextY), scale: nextScale };
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [clamp]);

  // Vuelve a aplicar el clamp una vez que el tablero terminó de re-renderizarse
  // a su nuevo tamaño real.
  useEffect(() => {
    setTransform((prev) => ({ ...clamp(prev.x, prev.y), scale: prev.scale }));
  }, [transform.scale, clamp]);

  // Arrastrar (pan) sosteniendo click. Si el mousedown empieza sobre una
  // ficha ya colocada (celda ocupada, "draggable" por su cuenta), no
  // iniciamos el paneo: dejamos que el drag nativo de la ficha tome el control.
  const handleMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      if (e.target.closest(".cell--occupied")) return;

      dragState.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        origX: transform.x,
        origY: transform.y,
      };
    },
    [transform],
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      setTransform((prev) => ({
        ...prev,
        ...clamp(dragState.current.origX + dx, dragState.current.origY + dy),
      }));
    },
    [clamp],
  );

  const stopDragging = useCallback(() => {
    dragState.current.dragging = false;
  }, []);

  const handleTouchStart = useCallback(
    (event) => {
      const touches = Array.from(event.touches);
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (touches.length === 2) {
        const [first, second] = touches;
        touchState.current = {
          mode: "pinch",
          distance: Math.hypot(
            second.clientX - first.clientX,
            second.clientY - first.clientY,
          ),
          midpointX: (first.clientX + second.clientX) / 2 - rect.left,
          midpointY: (first.clientY + second.clientY) / 2 - rect.top,
          originalX: transform.x,
          originalY: transform.y,
          originalScale: transform.scale,
        };
      } else if (touches.length === 1) {
        const [touch] = touches;
        touchState.current = {
          mode: "pan",
          startX: touch.clientX,
          startY: touch.clientY,
          originalX: transform.x,
          originalY: transform.y,
        };
      }
    },
    [transform],
  );

  const handleTouchMove = useCallback(
    (event) => {
      const gesture = touchState.current;
      if (!gesture) return;
      event.preventDefault();
      const touches = Array.from(event.touches);

      if (gesture.mode === "pan" && touches.length === 1) {
        const [touch] = touches;
        setTransform((current) => ({
          ...current,
          ...clamp(
            gesture.originalX + touch.clientX - gesture.startX,
            gesture.originalY + touch.clientY - gesture.startY,
          ),
        }));
      } else if (gesture.mode === "pinch" && touches.length === 2) {
        const [first, second] = touches;
        const distance = Math.hypot(
          second.clientX - first.clientX,
          second.clientY - first.clientY,
        );
        const nextScale = Math.min(
          MAX_SCALE,
          Math.max(MIN_SCALE, gesture.originalScale * (distance / gesture.distance)),
        );
        const ratio = nextScale / gesture.originalScale;
        const nextX =
          gesture.midpointX - (gesture.midpointX - gesture.originalX) * ratio;
        const nextY =
          gesture.midpointY - (gesture.midpointY - gesture.originalY) * ratio;
        setTransform({ ...clamp(nextX, nextY), scale: nextScale });
      }
    },
    [clamp],
  );

  const stopTouchGesture = useCallback(() => {
    touchState.current = null;
  }, []);

  // Red de seguridad: si un drag nativo (mover una ficha) termina fuera del
  // contenedor, esto garantiza que el estado de paneo quede limpio.
  useEffect(() => {
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("dragend", stopDragging);
    return () => {
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("dragend", stopDragging);
    };
  }, [stopDragging]);

  return (
    <div
      ref={containerRef}
      className="panzoom-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopTouchGesture}
      onTouchCancel={stopTouchGesture}
    >
      <div
        ref={contentRef}
        className="panzoom-content"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px)`,
        }}
      >
        {children(transform.scale)}
      </div>
    </div>
  );
}
