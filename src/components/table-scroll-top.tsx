"use client";

import { useEffect, useRef, useState } from "react";

/** Añade una barra de scroll horizontal sincronizada arriba de la tabla,
 * además de la que el navegador ya muestra abajo. */
export function TableScrollTop({ children }: { children: React.ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const container = wrapperRef.current?.querySelector<HTMLDivElement>(
      '[data-slot="table-container"]',
    );
    if (!container) return;

    function updateSizes() {
      setScrollWidth(container!.scrollWidth);
      setContainerWidth(container!.clientWidth);
    }
    updateSizes();

    const resizeObserver = new ResizeObserver(updateSizes);
    resizeObserver.observe(container);

    let syncing = false;
    function onContainerScroll() {
      if (syncing || !topRef.current) return;
      syncing = true;
      topRef.current.scrollLeft = container!.scrollLeft;
      syncing = false;
    }
    function onTopScroll() {
      if (syncing || !container) return;
      syncing = true;
      container.scrollLeft = topRef.current!.scrollLeft;
      syncing = false;
    }

    container.addEventListener("scroll", onContainerScroll);
    const topEl = topRef.current;
    topEl?.addEventListener("scroll", onTopScroll);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener("scroll", onContainerScroll);
      topEl?.removeEventListener("scroll", onTopScroll);
    };
  });

  const showTopScrollbar = scrollWidth > containerWidth + 1;

  return (
    <div ref={wrapperRef}>
      {showTopScrollbar && (
        <div ref={topRef} className="mb-1.5 overflow-x-auto" style={{ height: 14 }}>
          <div style={{ width: scrollWidth, height: 1 }} />
        </div>
      )}
      {children}
    </div>
  );
}
