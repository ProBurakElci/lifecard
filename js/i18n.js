/* Every visible string, in both languages. */
(function (global) {
  "use strict";

  const dictionaries = {
    en: {
      "app.title": "Your life, in numbers",
      "app.subtitle": "Type the day you were born. Everything is worked out in your browser - the date never leaves this page.",
      "form.label": "Date of birth",
      "form.button": "Show me",
      "form.again": "Try another date",

      "error.invalid-date": "That date does not look right.",
      "error.future": "That day has not happened yet.",
      "error.too-old": "That is further back than this page can handle.",
      "error.empty": "Pick a date first.",

      "headline.years": "years old",
      "headline.days": "days alive",
      "headline.born": "You were born on a",

      "grid.title": "Your life in weeks",
      "grid.caption": "One square is one week. Each row is a year, laid out to 80.",
      "grid.lived": "weeks lived",
      "grid.left": "weeks to 80",

      "stats.title": "While you were living them",
      "stat.heartbeats": "heartbeats",
      "stat.breaths": "breaths",
      "stat.sleep": "hours asleep",
      "stat.sun": "km around the Sun",
      "stat.galaxy": "km through the galaxy",
      "stat.moons": "full moons",

      "planets.title": "How old you are elsewhere",
      "planets.unit": "years",

      "next.title": "Coming up",
      "next.birthday": "until you turn {age}",
      "next.milestone": "until your {days}th day alive",
      "next.days": "days",
      "next.tomorrow": "tomorrow",
      "next.today": "today",

      "card.download": "Download your card",
      "card.hint": "A picture you can post.",

      "note.estimates": "Heartbeats and breaths use resting adult averages ({bpm} and {breaths} per minute) and sleep is counted as a third of a life. The distances are real orbital speeds.",
      "note.privacy": "No accounts, no cookies, no analytics. Nothing you type is sent anywhere.",
      "footer.source": "Source code",
    },

    tr: {
      "app.title": "Hayatın, sayılarla",
      "app.subtitle": "Doğduğun günü yaz. Her şey tarayıcında hesaplanıyor - tarih bu sayfadan hiçbir yere gitmiyor.",
      "form.label": "Doğum tarihi",
      "form.button": "Göster",
      "form.again": "Başka bir tarih dene",

      "error.invalid-date": "Bu tarih doğru görünmüyor.",
      "error.future": "O gün henüz gelmedi.",
      "error.too-old": "Bu tarih sayfanın kaldırabileceğinden eski.",
      "error.empty": "Önce bir tarih seç.",

      "headline.years": "yaşındasın",
      "headline.days": "gündür hayattasın",
      "headline.born": "Doğduğun gün:",

      "grid.title": "Haftalarla hayatın",
      "grid.caption": "Bir kare bir hafta. Her satır bir yıl, 80 yıla kadar.",
      "grid.lived": "yaşanmış hafta",
      "grid.left": "80'e kalan hafta",

      "stats.title": "Sen onları yaşarken",
      "stat.heartbeats": "kalp atışı",
      "stat.breaths": "nefes",
      "stat.sleep": "saat uyku",
      "stat.sun": "km Güneş'in çevresinde",
      "stat.galaxy": "km galakside",
      "stat.moons": "dolunay",

      "planets.title": "Başka gezegenlerde yaşın",
      "planets.unit": "yaş",

      "next.title": "Yaklaşanlar",
      "next.birthday": "{age}. yaş gününe",
      "next.milestone": "{days}. gününe",
      "next.days": "gün",
      "next.tomorrow": "yarın",
      "next.today": "bugün",

      "card.download": "Kartını indir",
      "card.hint": "Paylaşabileceğin bir görsel.",

      "note.estimates": "Kalp atışı ve nefes, yetişkin dinlenme ortalamalarını kullanıyor (dakikada {bpm} ve {breaths}); uyku hayatın üçte biri sayıldı. Mesafeler gerçek yörünge hızlarından.",
      "note.privacy": "Hesap yok, çerez yok, takip yok. Yazdığın hiçbir şey hiçbir yere gönderilmiyor.",
      "footer.source": "Kaynak kod",
    },
  };

  const PLANET_NAMES = {
    en: { Mercury: "Mercury", Venus: "Venus", Mars: "Mars", Jupiter: "Jupiter", Saturn: "Saturn" },
    tr: { Mercury: "Merkür", Venus: "Venüs", Mars: "Mars", Jupiter: "Jüpiter", Saturn: "Satürn" },
  };

  const DAY_NAMES = {
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    tr: ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"],
  };

  const I18n = {
    current: "en",

    set(lang) {
      I18n.current = dictionaries[lang] ? lang : "en";
      return I18n.current;
    },

    t(key, values) {
      const dict = dictionaries[I18n.current] || dictionaries.en;
      let text = dict[key] !== undefined ? dict[key] : (dictionaries.en[key] !== undefined ? dictionaries.en[key] : key);
      if (values) {
        for (const name in values) text = text.split("{" + name + "}").join(values[name]);
      }
      return text;
    },

    planet(name) {
      const map = PLANET_NAMES[I18n.current] || PLANET_NAMES.en;
      return map[name] || name;
    },

    dayName(index) {
      const names = DAY_NAMES[I18n.current] || DAY_NAMES.en;
      return names[index];
    },

    locale() {
      return I18n.current === "tr" ? "tr-TR" : "en-US";
    },
  };

  global.I18n = I18n;
})(typeof window !== "undefined" ? window : globalThis);
