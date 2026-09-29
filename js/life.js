/*
 * The numbers.
 *
 * Every figure here comes from one date. No accounts, no storage, no network -
 * the birthday you type never leaves the page, which is the only reason a site
 * like this deserves to ask for it.
 *
 * Where a number is an estimate it says so in the label, and the constant it
 * uses is written down next to it. A personal statistic that quietly invents
 * its own physiology is just a party trick.
 */
(function (global) {
  "use strict";

  const MS_PER_DAY = 86400000;

  // Averages, stated so they can be argued with.
  const HEART_BPM = 75;            // resting adult average
  const BREATHS_PER_MIN = 16;      // resting adult average
  const SLEEP_SHARE = 1 / 3;       // a third of a life, roughly
  const EARTH_ORBIT_KMH = 107208;  // Earth around the Sun
  const SUN_GALAXY_KMH = 828000;   // the Sun around the galactic centre
  const LUNAR_MONTH_DAYS = 29.53059;

  // Orbital periods in Earth years.
  const PLANETS = [
    { name: "Mercury", years: 0.2408467 },
    { name: "Venus", years: 0.61519726 },
    { name: "Mars", years: 1.8808158 },
    { name: "Jupiter", years: 11.862615 },
    { name: "Saturn", years: 29.447498 },
  ];

  const DAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];

  /** Parses YYYY-MM-DD as a local date at noon, which dodges DST edges. */
  function parseDate(value) {
    if (value instanceof Date) return new Date(value.getTime());
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || "").trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);

    // Rejects 2026-02-31 and friends, which Date would happily roll over.
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  /** Whole days between two dates, counting calendar days rather than 24h blocks. */
  function daysBetween(from, to) {
    const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    return Math.round((b - a) / MS_PER_DAY);
  }

  /** Full years lived, the way a birthday works and not the way division does. */
  function ageInYears(birth, now) {
    let years = now.getFullYear() - birth.getFullYear();
    const hadBirthday =
      now.getMonth() > birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
    if (!hadBirthday) years--;
    return Math.max(0, years);
  }

  /** The next birthday, handling 29 February by falling back to 1 March. */
  function nextBirthday(birth, now) {
    const makeFor = (year) => {
      const candidate = new Date(year, birth.getMonth(), birth.getDate(), 12);
      if (candidate.getMonth() !== birth.getMonth()) {
        // 29 February in a common year
        return new Date(year, 2, 1, 12);
      }
      return candidate;
    };

    let next = makeFor(now.getFullYear());
    if (daysBetween(now, next) <= 0) next = makeFor(now.getFullYear() + 1);
    return next;
  }

  /**
   * The next round number of days worth waiting for: 1,000 / 5,000 / 10,000 and
   * every 5,000 after that, plus the next 1,000 if it comes sooner.
   */
  function nextDayMilestone(daysLived) {
    const steps = [1000, 5000, 10000, 15000, 20000, 25000, 30000, 40000];
    for (const step of steps) {
      if (daysLived < step) return step;
    }
    return Math.ceil((daysLived + 1) / 10000) * 10000;
  }

  function planetAges(daysLived) {
    const earthYears = daysLived / 365.2425;
    return PLANETS.map((planet) => ({
      name: planet.name,
      age: earthYears / planet.years,
    }));
  }

  /**
   * Builds the whole card.
   * `now` is injectable so the tests are not at the mercy of today's date.
   */
  function compute(birthInput, nowInput) {
    const birth = parseDate(birthInput);
    if (!birth) return { valid: false, reason: "invalid-date" };

    const now = nowInput ? parseDate(nowInput) || new Date(nowInput) : new Date();
    const daysLived = daysBetween(birth, now);

    if (daysLived < 0) return { valid: false, reason: "future" };
    if (daysLived > 45000) return { valid: false, reason: "too-old" }; // ~123 years

    const hoursLived = daysLived * 24;
    const minutesLived = hoursLived * 60;
    const weeksLived = Math.floor(daysLived / 7);
    const years = ageInYears(birth, now);

    const birthday = nextBirthday(birth, now);
    const milestone = nextDayMilestone(daysLived);

    return {
      valid: true,
      birth,
      now,
      bornOn: DAY_NAMES[birth.getDay()],
      years,
      daysLived,
      weeksLived,
      hoursLived,
      heartbeats: Math.round(minutesLived * HEART_BPM),
      breaths: Math.round(minutesLived * BREATHS_PER_MIN),
      hoursAsleep: Math.round(hoursLived * SLEEP_SHARE),
      kmAroundSun: Math.round(hoursLived * EARTH_ORBIT_KMH),
      kmThroughGalaxy: Math.round(hoursLived * SUN_GALAXY_KMH),
      fullMoons: Math.floor(daysLived / LUNAR_MONTH_DAYS),
      planets: planetAges(daysLived),
      nextBirthdayIn: daysBetween(now, birthday),
      nextBirthdayAge: years + 1,
      milestone: { days: milestone, inDays: milestone - daysLived },
      constants: {
        heartBpm: HEART_BPM,
        breathsPerMin: BREATHS_PER_MIN,
        sleepShare: SLEEP_SHARE,
        earthOrbitKmh: EARTH_ORBIT_KMH,
        sunGalaxyKmh: SUN_GALAXY_KMH,
        lunarMonthDays: LUNAR_MONTH_DAYS,
      },
    };
  }

  /**
   * The weeks grid: one row per year of an expected lifespan.
   * Returns { rows, cols, lived, total } where `lived` is how many squares fill.
   */
  function weeksGrid(daysLived, lifespanYears, columns) {
    const years = lifespanYears || 80;
    const cols = columns || 52;
    // 52 columns puts one year on a row, which is the shape people know. A
    // wider count (104 = two years a row) is for the share card, where the
    // canvas is much wider than it is tall.
    const total = years * 52;
    const rows = Math.ceil(total / cols);
    const lived = Math.floor(daysLived / 7);

    return {
      rows,
      cols,
      total,
      lived: Math.min(lived, total),
      overflow: Math.max(0, lived - total),
    };
  }

  const Life = { compute, weeksGrid, parseDate, daysBetween, ageInYears, nextBirthday, nextDayMilestone, planetAges, DAY_NAMES };

  global.Life = Life;
  if (typeof module !== "undefined" && module.exports) module.exports = Life;
})(typeof window !== "undefined" ? window : globalThis);
