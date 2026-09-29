/*
 * Wiring.
 *
 * The date is read, the numbers are computed, the page is filled. Nothing is
 * stored and nothing is sent: reload the page and it has forgotten you, which
 * is the promise printed at the bottom of the screen.
 */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);
  const t = (key, values) => I18n.t(key, values);

  const form = $("#form");
  const input = $("#birth");
  const errorBox = $("#error");
  const intro = $("#intro");
  const result = $("#result");
  const gridCanvas = $("#grid");

  let current = null; // the last valid computation

  /* ---------------- language ---------------- */

  function applyLanguage(lang) {
    const active = I18n.set(lang);
    document.documentElement.lang = active;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll(".lang").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.lang === active);
    });

    if (current) render(current);
    else errorBox.textContent = "";
  }

  document.querySelectorAll(".lang").forEach((btn) => {
    btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
  });

  /* ---------------- helpers ---------------- */

  function number(value) {
    return value.toLocaleString(I18n.locale());
  }

  function statCard(value, label) {
    const div = document.createElement("div");
    div.className = "stat";
    const b = document.createElement("b");
    b.textContent = value;
    const span = document.createElement("span");
    span.textContent = label;
    div.appendChild(b);
    div.appendChild(span);
    return div;
  }

  function listRow(label, value) {
    const li = document.createElement("li");
    const left = document.createElement("span");
    left.className = "label";
    left.textContent = label;
    const right = document.createElement("span");
    right.className = "value";
    right.textContent = value;
    li.appendChild(left);
    li.appendChild(right);
    return li;
  }

  /* ---------------- rendering ---------------- */

  function render(data) {
    current = data;

    const grid = Life.weeksGrid(data.daysLived, 80);

    $("#years").textContent = number(data.years);
    $("#days").textContent = number(data.daysLived);
    $("#born-day").textContent = I18n.dayName(data.birth.getDay());

    // the weeks grid
    const ctx = gridCanvas.getContext("2d");
    ctx.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
    WeeksGrid.drawWeeks(
      ctx,
      { x: 6, y: 6, width: gridCanvas.width - 12, height: gridCanvas.height - 12 },
      grid,
      { gap: 3, showDecades: true }
    );

    $("#weeks-lived").textContent = number(grid.lived);
    $("#weeks-left").textContent = number(Math.max(0, grid.total - grid.lived));

    // the numbers
    const stats = $("#stats");
    stats.textContent = "";
    stats.appendChild(statCard(number(data.heartbeats), t("stat.heartbeats")));
    stats.appendChild(statCard(number(data.breaths), t("stat.breaths")));
    stats.appendChild(statCard(number(data.hoursAsleep), t("stat.sleep")));
    stats.appendChild(statCard(number(data.kmAroundSun), t("stat.sun")));
    stats.appendChild(statCard(number(data.fullMoons), t("stat.moons")));
    stats.appendChild(statCard(number(data.kmThroughGalaxy), t("stat.galaxy")));

    // planets
    const planets = $("#planets");
    planets.textContent = "";
    for (const planet of data.planets) {
      planets.appendChild(
        listRow(I18n.planet(planet.name), planet.age.toFixed(1) + " " + t("planets.unit"))
      );
    }

    // what is coming
    const next = $("#next");
    next.textContent = "";

    const birthdayText =
      data.nextBirthdayIn === 0 ? t("next.today")
        : data.nextBirthdayIn === 1 ? t("next.tomorrow")
          : number(data.nextBirthdayIn) + " " + t("next.days");
    next.appendChild(
      listRow(t("next.birthday", { age: data.nextBirthdayAge }), birthdayText)
    );
    next.appendChild(
      listRow(
        t("next.milestone", { days: number(data.milestone.days) }),
        number(data.milestone.inDays) + " " + t("next.days")
      )
    );

    $("#note-estimates").textContent = t("note.estimates", {
      bpm: data.constants.heartBpm,
      breaths: data.constants.breathsPerMin,
    });

    intro.hidden = false;
    result.hidden = false;
  }

  /* ---------------- events ---------------- */

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorBox.textContent = "";

    if (!input.value) {
      errorBox.textContent = t("error.empty");
      return;
    }

    const data = Life.compute(input.value);
    if (!data.valid) {
      errorBox.textContent = t("error." + data.reason);
      result.hidden = true;
      current = null;
      return;
    }

    render(data);
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("#again").addEventListener("click", () => {
    result.hidden = true;
    current = null;
    input.value = "";
    intro.scrollIntoView({ behavior: "smooth", block: "start" });
    input.focus();
  });

  $("#download").addEventListener("click", () => {
    if (!current) return;

    const canvas = $("#card-canvas");
    const grid = Life.weeksGrid(current.daysLived, 80, 104);

    // the card needs the translated day name, handed in through the same t()
    const translate = (key, values) =>
      key === "__bornDay" ? I18n.dayName(current.birth.getDay()) : t(key, values);

    LifeCard.draw(canvas, current, grid, translate, I18n.locale());

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "my-life-card.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  });

  /* ---------------- start ---------------- */

  // A sensible upper bound on the picker, so nobody can choose tomorrow.
  const today = new Date();
  input.max = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

  // English is the default for everyone: the audience this is published to is
  // English-speaking, and a page that greets half of them in another language
  // reads like a different site. Turkish is one tap away in the corner.
  applyLanguage("en");
})();
