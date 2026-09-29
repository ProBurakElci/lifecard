/*
 * Tests:  node test/run-tests.js
 *
 * Date arithmetic is where this kind of page quietly goes wrong: leap days,
 * birthdays that have not happened yet this year, someone born on 29 February,
 * a timezone that shifts a date by one. Every one of those has a test.
 */
"use strict";

const Life = require("../js/life.js");

let passed = 0;
let failed = 0;

function ok(label, condition) {
  if (condition) passed++;
  else {
    failed++;
    console.error("  FAILED: " + label);
  }
}

function eq(label, actual, expected) {
  ok(label + " (got " + JSON.stringify(actual) + ", expected " + JSON.stringify(expected) + ")",
    actual === expected);
}

function section(name) {
  console.log("\n" + name);
}

/* ---------------- parsing ---------------- */

section("Reading a date");

ok("accepts a normal date", Life.parseDate("1995-06-15") !== null);
ok("rejects an empty value", Life.parseDate("") === null);
ok("rejects nonsense", Life.parseDate("hello") === null);
ok("rejects a wrong format", Life.parseDate("15/06/1995") === null);
ok("rejects 31 February", Life.parseDate("2026-02-31") === null);
ok("rejects month 13", Life.parseDate("2026-13-01") === null);
ok("accepts 29 February in a leap year", Life.parseDate("2024-02-29") !== null);
ok("rejects 29 February in a common year", Life.parseDate("2023-02-29") === null);

const parsed = Life.parseDate("1995-06-15");
eq("keeps the year", parsed.getFullYear(), 1995);
eq("keeps the month", parsed.getMonth(), 5);
eq("keeps the day", parsed.getDate(), 15);

/* ---------------- days ---------------- */

section("Counting days");

const d = (text) => Life.parseDate(text);

eq("the same day is zero days", Life.daysBetween(d("2026-01-01"), d("2026-01-01")), 0);
eq("one day", Life.daysBetween(d("2026-01-01"), d("2026-01-02")), 1);
eq("a common year", Life.daysBetween(d("2025-01-01"), d("2026-01-01")), 365);
eq("a leap year", Life.daysBetween(d("2024-01-01"), d("2025-01-01")), 366);
eq("across a leap day", Life.daysBetween(d("2024-02-28"), d("2024-03-01")), 2);
eq("across a non-leap February", Life.daysBetween(d("2023-02-28"), d("2023-03-01")), 1);
eq("a decade", Life.daysBetween(d("2010-05-20"), d("2020-05-20")), 3653);

/* ---------------- age ---------------- */

section("Age in years");

eq("the day before a birthday", Life.ageInYears(d("1990-07-10"), d("2026-07-09")), 35);
eq("on the birthday", Life.ageInYears(d("1990-07-10"), d("2026-07-10")), 36);
eq("the day after", Life.ageInYears(d("1990-07-10"), d("2026-07-11")), 36);
eq("earlier in the year", Life.ageInYears(d("1990-11-30"), d("2026-03-01")), 35);
eq("a newborn", Life.ageInYears(d("2026-01-01"), d("2026-01-02")), 0);
eq("born on a leap day, before it comes round",
  Life.ageInYears(d("2004-02-29"), d("2026-02-28")), 21);
eq("born on a leap day, on 1 March",
  Life.ageInYears(d("2004-02-29"), d("2026-03-01")), 22);

/* ---------------- next birthday ---------------- */

section("The next birthday");

const nb1 = Life.nextBirthday(d("1990-07-10"), d("2026-07-09"));
eq("tomorrow", Life.daysBetween(d("2026-07-09"), nb1), 1);

const nb2 = Life.nextBirthday(d("1990-07-10"), d("2026-07-10"));
eq("on the day itself it points to next year", nb2.getFullYear(), 2027);

const nb3 = Life.nextBirthday(d("1990-01-05"), d("2026-12-31"));
eq("late in the year it rolls over", nb3.getFullYear(), 2027);

const leapBirthday = Life.nextBirthday(d("2004-02-29"), d("2026-01-01"));
eq("a leap-day birthday falls back to 1 March in a common year",
  leapBirthday.getMonth() + "-" + leapBirthday.getDate(), "2-1");

const leapInLeapYear = Life.nextBirthday(d("2004-02-29"), d("2028-01-01"));
eq("and stays on 29 February in a leap year",
  leapInLeapYear.getMonth() + "-" + leapInLeapYear.getDate(), "1-29");

/* ---------------- milestones ---------------- */

section("Milestones");

eq("before the first thousand", Life.nextDayMilestone(400), 1000);
eq("just after a thousand", Life.nextDayMilestone(1001), 5000);
eq("approaching ten thousand", Life.nextDayMilestone(9999), 10000);
eq("exactly on ten thousand looks ahead", Life.nextDayMilestone(10000), 15000);
ok("always in the future", [0, 1, 999, 12345, 33333].every((n) => Life.nextDayMilestone(n) > n));

/* ---------------- the card ---------------- */

section("The card");

const card = Life.compute("1995-06-15", "2026-06-15");

ok("it is valid", card.valid);
eq("age on the birthday", card.years, 31);
eq("days lived", card.daysLived, Life.daysBetween(d("1995-06-15"), d("2026-06-15")));
eq("born on a Thursday", card.bornOn, "Thursday");
eq("weeks lived", card.weeksLived, Math.floor(card.daysLived / 7));

ok("heartbeats use the stated rate",
  card.heartbeats === Math.round(card.daysLived * 24 * 60 * card.constants.heartBpm));
ok("breaths use the stated rate",
  card.breaths === Math.round(card.daysLived * 24 * 60 * card.constants.breathsPerMin));
ok("distance uses the stated orbital speed",
  card.kmAroundSun === Math.round(card.daysLived * 24 * card.constants.earthOrbitKmh));
ok("full moons are plausible",
  card.fullMoons === Math.floor(card.daysLived / card.constants.lunarMonthDays));

ok("sleep is a third of life, in hours",
  card.hoursAsleep === Math.round(card.daysLived * 24 / 3));

ok("every planet age is positive", card.planets.every((p) => p.age > 0));
const mars = card.planets.find((p) => p.name === "Mars");
ok("Mars age is smaller than Earth age", mars.age < card.years);
const mercury = card.planets.find((p) => p.name === "Mercury");
ok("Mercury age is larger than Earth age", mercury.age > card.years);

eq("on a birthday the next one is a year away", card.nextBirthdayIn > 364, true);
eq("the next birthday is one year older", card.nextBirthdayAge, card.years + 1);
ok("the milestone is ahead", card.milestone.inDays > 0);

/* ---------------- refusals ---------------- */

section("What it refuses");

eq("a date in the future", Life.compute("2030-01-01", "2026-01-01").reason, "future");
eq("an impossible age", Life.compute("1850-01-01", "2026-01-01").reason, "too-old");
eq("a broken date", Life.compute("not-a-date", "2026-01-01").reason, "invalid-date");
ok("today is valid", Life.compute("2026-01-01", "2026-01-01").valid);
eq("someone born today has lived zero days",
  Life.compute("2026-01-01", "2026-01-01").daysLived, 0);
ok("a newborn still gets numbers",
  Life.compute("2026-01-01", "2026-01-01").heartbeats === 0);

/* ---------------- the grid ---------------- */

section("The weeks grid");

const grid = Life.weeksGrid(365 * 30, 80);
eq("one column per week", grid.cols, 52);
eq("one row per year", grid.rows, 80);
eq("total squares", grid.total, 80 * 52);
eq("squares filled", grid.lived, Math.floor(365 * 30 / 7));
ok("filled is never more than total", grid.lived <= grid.total);

const longLife = Life.weeksGrid(365 * 95, 80);
eq("a life past the grid fills it completely", longLife.lived, longLife.total);
ok("and reports the overflow", longLife.overflow > 0);

const newborn = Life.weeksGrid(3, 80);
eq("a newborn fills nothing", newborn.lived, 0);

// The share card lays two years on a row so the grid fills a wide canvas.
const wide = Life.weeksGrid(365 * 30, 80, 104);
eq("a wider layout keeps the same number of squares", wide.total, grid.total);
eq("and halves the rows", wide.rows, 40);
eq("and fills the same number of them", wide.lived, grid.lived);

/* ---------------- consistency over many dates ---------------- */

section("Consistency across 4,000 random dates");

let consistent = true;
for (let i = 0; i < 4000; i++) {
  const year = 1930 + Math.floor(Math.random() * 95);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  const text = year + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");

  const result = Life.compute(text, "2026-09-30");
  if (!result.valid) {
    if (result.reason !== "too-old") {
      consistent = false;
      console.error("  unexpected refusal for " + text + ": " + result.reason);
    }
    continue;
  }

  if (result.daysLived < 0) consistent = false;
  if (result.years < 0 || result.years > 123) consistent = false;
  if (result.nextBirthdayIn < 0 || result.nextBirthdayIn > 366) consistent = false;
  if (result.weeksLived * 7 > result.daysLived) consistent = false;
  if (result.milestone.inDays <= 0) consistent = false;
  if (Math.abs(result.years - result.daysLived / 365.2425) > 1.1) consistent = false;
}
ok("every random birthday produces sane numbers", consistent);

console.log("\n" + passed + " passed, " + failed + " failed.");
process.exit(failed ? 1 : 0);
