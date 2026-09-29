/*
 * The weeks grid.
 *
 * 4,160 squares is too many for the DOM to enjoy, and this drawing has to be
 * reused on the downloadable card anyway, so it is drawn straight onto a
 * canvas. The function takes a context and a rectangle, which is what makes it
 * reusable at two completely different sizes.
 */
(function (global) {
  "use strict";

  const COLORS = {
    lived: "#38bdf8",
    livedEdge: "#7dd3fc",
    left: "#1e2b45",
    current: "#a78bfa",
    label: "#64748b",
  };

  /**
   * ctx    canvas context
   * box    { x, y, width, height }
   * grid   from Life.weeksGrid()
   * opts   { showDecades: bool, gap: number }
   */
  function drawWeeks(ctx, box, grid, opts) {
    const options = opts || {};
    const gap = options.gap === undefined ? 2 : options.gap;
    const leftGutter = options.showDecades ? Math.round(box.width * 0.035) : 0;

    const usableWidth = box.width - leftGutter;
    const cell = Math.max(
      1,
      Math.min(
        (usableWidth - gap * (grid.cols - 1)) / grid.cols,
        (box.height - gap * (grid.rows - 1)) / grid.rows
      )
    );
    const size = Math.max(1, cell);
    const radius = size > 5 ? 1.5 : 0;

    const gridWidth = grid.cols * size + (grid.cols - 1) * gap;
    const startX = box.x + leftGutter + Math.max(0, (usableWidth - gridWidth) / 2);

    let index = 0;
    for (let row = 0; row < grid.rows; row++) {
      const y = box.y + row * (size + gap);

      if (options.showDecades && row % 10 === 0) {
        ctx.fillStyle = COLORS.label;
        ctx.font = Math.max(9, Math.round(size * 1.1)) + "px system-ui, sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        ctx.fillText(String(row), startX - gap * 3, y);
        ctx.textAlign = "left";
      }

      for (let col = 0; col < grid.cols; col++) {
        const x = startX + col * (size + gap);
        const isLived = index < grid.lived;
        const isCurrent = index === grid.lived;

        ctx.fillStyle = isCurrent ? COLORS.current : isLived ? COLORS.lived : COLORS.left;

        if (radius) {
          roundRect(ctx, x, y, size, size, radius);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, size, size);
        }

        if (isCurrent && size > 4) {
          ctx.strokeStyle = "#c4b5fd";
          ctx.lineWidth = Math.max(1, size * 0.18);
          if (radius) {
            roundRect(ctx, x, y, size, size, radius);
            ctx.stroke();
          } else {
            ctx.strokeRect(x, y, size, size);
          }
        }

        index++;
      }
    }

    return { cell: size, startX, width: gridWidth, height: grid.rows * (size + gap) - gap };
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  global.WeeksGrid = { drawWeeks, roundRect, COLORS };
})(typeof window !== "undefined" ? window : globalThis);
