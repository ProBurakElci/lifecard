# Your life, in numbers

[![tests](https://github.com/ProBurakElci/lifecard/actions/workflows/ci.yml/badge.svg)](https://github.com/ProBurakElci/lifecard/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Type the day you were born, and see it.**

### → [proburakelci.github.io/lifecard](https://proburakelci.github.io/lifecard/)

Your life laid out week by week, how many times your heart has beaten so far, how far you have travelled around the Sun while sitting still, how many full moons you have lived under, and how old you would be on Mars.

Then it makes a card you can post.

## The thing that matters most

**Your date never leaves the page.** There is no server, no account, no cookie, no analytics, no network call of any kind — the whole thing is three JavaScript files doing arithmetic in your browser. Close the tab and it has forgotten you.

That is not a promise, it is something you can check: open the network tab, or read `js/life.js`. It is 200 lines.

## What it shows

| | |
|---|---|
| **Your life in weeks** | one square per week, laid out to 80 years. The squares you have lived are filled, the one you are in right now is highlighted. It is the most quietly affecting way to look at a calendar. |
| **Heartbeats** | minutes lived × 75 beats, the resting adult average |
| **Breaths** | minutes lived × 16, same idea |
| **Hours asleep** | a third of your life so far |
| **Distance around the Sun** | hours lived × 107,208 km/h, Earth's real orbital speed |
| **Distance through the galaxy** | hours lived × 828,000 km/h, the Sun's speed around the galactic centre |
| **Full moons** | days lived ÷ 29.53, the real lunar month |
| **Your age on other planets** | Mercury through Saturn, by orbital period |
| **What is coming** | days to your next birthday, and to your next round-numbered day alive |

Where a number is an estimate, the page says so and prints the constant it used. A personal statistic that quietly invents its own physiology is a party trick, not a fact.

## Tests

```bash
node test/run-tests.js
```

69 checks, and nearly all of them are about dates, because that is where a page like this goes wrong:

- 29 February as a birthday, in both leap and common years
- the day before, the day of, and the day after a birthday
- ages across month and year boundaries
- a date typed as 31 February, or in the wrong format, or in the future
- 4,000 random birthdays, each checked for numbers that stay sane

The maths lives in `js/life.js` with no DOM in it at all, which is why the tests can run in Node with nothing mocked.

## Running it

It is a static page. Clone it and open `index.html`, or:

```bash
npx --yes http-server . -p 5174
```

```
index.html      the page
styles.css      the look
js/life.js      every number, and no DOM
js/grid.js      the weeks grid, drawn on a canvas
js/card.js      the downloadable 1080x1350 card
js/i18n.js      English and Turkish
js/app.js       wiring
```

Available in English and Turkish; it picks from your browser and you can switch in the corner.

## License

MIT — see [LICENSE](LICENSE). Take it, change the numbers, put your own name on it.
