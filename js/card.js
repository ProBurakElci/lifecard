/*
 * The downloadable card.
 *
 * 1080x1350 is the portrait size social feeds treat best. It has to read at
 * thumbnail size, so it carries four numbers and the grid - not everything on
 * the page.
 */
(function (global) {
  "use strict";

  const W = 1080;
  const H = 1350;

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

  function number(value, locale) {
    return value.toLocaleString(locale);
  }

  function compact(value, locale) {
    if (value >= 1e9) return (value / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    if (value >= 1e6) return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    return number(value, locale);
  }

  /**
   * canvas  the target canvas element (1080x1350)
   * data    result of Life.compute()
   * grid    result of Life.weeksGrid()
   * t       a translate function
   */
  function draw(canvas, data, grid, t, locale) {
    const ctx = canvas.getContext("2d");
    canvas.width = W;
    canvas.height = H;

    // background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0d1526");
    bg.addColorStop(1, "#070c17");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#1d4ed8";
    ctx.beginPath();
    ctx.arc(W * 0.85, 120, 260, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#a78bfa";
    ctx.beginPath();
    ctx.arc(80, H - 80, 220, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // headline
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";

    ctx.fillStyle = "#92a3c0";
    ctx.font = "26px system-ui, 'Segoe UI', sans-serif";
    ctx.fillText(t("app.title"), 72, 96);

    const years = String(data.years);
    ctx.font = "800 190px system-ui, 'Segoe UI', sans-serif";
    const gradient = ctx.createLinearGradient(72, 130, 620, 300);
    gradient.addColorStop(0, "#38bdf8");
    gradient.addColorStop(1, "#a78bfa");
    ctx.fillStyle = gradient;
    ctx.fillText(years, 72, 270);

    const yearsWidth = ctx.measureText(years).width;
    ctx.font = "44px system-ui, 'Segoe UI', sans-serif";
    ctx.fillStyle = "#e8eefb";
    ctx.fillText(t("headline.years"), 72 + yearsWidth + 22, 270);

    ctx.font = "30px system-ui, 'Segoe UI', sans-serif";
    ctx.fillStyle = "#92a3c0";
    ctx.fillText(
      number(data.daysLived, locale) + " " + t("headline.days") +
      "   -   " + t("headline.born") + " " + t("__bornDay"),
      72,
      322
    );

    // the grid
    const gridTop = 370;
    const gridBox = { x: 72, y: gridTop, width: W - 144, height: 430 };
    global.WeeksGrid.drawWeeks(ctx, gridBox, grid, { gap: 2, showDecades: false });

    ctx.font = "24px system-ui, 'Segoe UI', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(t("grid.caption"), 72, gridTop + 508);

    // four numbers
    const stats = [
      { value: compact(data.heartbeats, locale), label: t("stat.heartbeats"), color: "#f87171" },
      { value: compact(data.breaths, locale), label: t("stat.breaths"), color: "#38bdf8" },
      { value: compact(data.kmAroundSun, locale), label: t("stat.sun"), color: "#34d399" },
      { value: number(data.fullMoons, locale), label: t("stat.moons"), color: "#fbbf24" },
    ];

    const cardTop = 940;
    const cardW = (W - 144 - 24) / 2;
    const cardH = 150;

    stats.forEach((stat, i) => {
      const x = 72 + (i % 2) * (cardW + 24);
      const y = cardTop + Math.floor(i / 2) * (cardH + 22);

      ctx.fillStyle = "#111b2e";
      roundRect(ctx, x, y, cardW, cardH, 18);
      ctx.fill();
      ctx.strokeStyle = "#1e2b45";
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, cardW, cardH, 18);
      ctx.stroke();

      ctx.fillStyle = stat.color;
      ctx.font = "800 58px system-ui, 'Segoe UI', sans-serif";
      ctx.fillText(stat.value, x + 28, y + 80);

      ctx.fillStyle = "#92a3c0";
      ctx.font = "24px system-ui, 'Segoe UI', sans-serif";
      ctx.fillText(stat.label, x + 28, y + 118);
    });

    // footer
    ctx.fillStyle = "#64748b";
    ctx.font = "24px system-ui, 'Segoe UI', sans-serif";
    ctx.fillText("proburakelci.github.io/lifecard", 72, H - 56);

    return canvas;
  }

  global.LifeCard = { draw, W, H };
})(typeof window !== "undefined" ? window : globalThis);
