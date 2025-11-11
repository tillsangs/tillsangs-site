// api/feed/source.js  (CommonJS)
const episodes = require("../../content/episodes.json");

// Minimal XML-escape för ATTRIBUT (t.ex. href="", url="")
const escAttr = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");

module.exports = async (req, res) => {
  // ---- Kanal-metadata ----
  const CHANNEL = {
    title: "Till Sängs (Källfeed)",
    link: "https://www.tillsangs.se/",
    language: "sv-SE",
    description:
      "Lyssna på Till Sängs i full längd utan reklam. Med Samanda Ekman & Malena Ivarsson. Medlemskap ger hela arkivet och alla nya avsnitt.",
    author: "Samanda Ekman & Malena Ivarsson",
    explicit: "false",
    image: "https://www.tillsangs.se/cover.jpg",
    ownerName: "Samanda Ekman",
    ownerEmail: "info@tillsangs.com",

    // Kategori (OBS: & måste bli &amp;)
    categoryTop: "Society &amp; Culture",
    categorySub: "Personal Journals",
  };

  const items = (episodes || [])
    .map((ep) => {
      const title = ep.title || "Avsnitt";
      const desc = ep.descriptionHtml || "";
      const pub = ep.published ? new Date(ep.published).toUTCString() : new Date().toUTCString();
      const guid = ep.id || `${Date.now()}`;

      const audioUrl = ep?.audio?.private_mp3 || ep?.audio?.url || "";
      const audioBytes = ep?.audio?.bytes || 0;
      const duration = ep?.audio?.duration || 0;
      const image = ep.image || CHANNEL.image;

      // Länk till avsnittssida; fallback = startsidan med ankare
      const itemLink = ep.link || `${CHANNEL.link}#${encodeURIComponent(guid)}`;

      return `
        <item>
          <title><![CDATA[${title}]]></title>
          <link>${itemLink}</link>
          <description><![CDATA[${desc}]]></description>
          <pubDate>${pub}</pubDate>
          <guid isPermaLink="false">${guid}</guid>
          <enclosure url="${escAttr(audioUrl)}" length="${audioBytes}" type="audio/mpeg" />
          <itunes:duration>${duration}</itunes:duration>
          <itunes:image href="${escAttr(image)}" />
        </item>
      `;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <channel>
      <title><![CDATA[${CHANNEL.title}]]></title>
      <link>${CHANNEL.link}</link>
      <language>${CHANNEL.language}</language>

      <description><![CDATA[${CHANNEL.description}]]></description>
      <itunes:author><![CDATA[${CHANNEL.author}]]></itunes:author>
      <itunes:explicit>${CHANNEL.explicit}</itunes:explicit>
      <itunes:image href="${escAttr(CHANNEL.image)}"/>
      <itunes:owner>
        <itunes:name>${CHANNEL.ownerName}</itunes:name>
        <itunes:email>${CHANNEL.ownerEmail}</itunes:email>
      </itunes:owner>

      <itunes:category text="${CHANNEL.categoryTop}">
        <itunes:category text="${CHANNEL.categorySub}" />
      </itunes:category>

      ${items}
    </channel>
  </rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
  res.status(200).send(xml);
};
