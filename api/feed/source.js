// api/feed/source.js  (CommonJS)
const episodes = require("../../content/episodes.json");

// Minimal XML-escape för attribut (href="", url="")
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

    // iTunes/Spotify-kategori (OBS: & ska vara &amp;)
    categoryTop: "Society &amp; Culture",
    categorySub: "Personal Journals",

    // Self-link för parser
    selfFeedUrl: "https://www.tillsangs.se/api/feed/source",
  };

  // ---- Avsnitt → RSS-items ----
  const items = (episodes || [])
    .map((ep) => {
      const title = ep.title || "Avsnitt";
      const desc = ep.descriptionHtml || "";
      const pub = ep.published
        ? new Date(ep.published).toUTCString()
        : new Date().toUTCString();
      const guid = ep.id || `${Date.now()}`;

      const audioUrl = ep?.audio?.private_mp3 || "";
      const audioBytes = ep?.audio?.bytes || 0;
      const duration = ep?.audio?.duration || 0;
      const image = ep.image || CHANNEL.image;
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
          <itunes:episodeType>full</itunes:episodeType>
        </item>
      `;
    })
    .join("");

  // ---- RSS XML ----
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0"
       xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
       xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title><![CDATA[${CHANNEL.title}]]></title>
      <link>${CHANNEL.link}</link>
      <language>${CHANNEL.language}</language>

      <!-- Viktigt för vissa parser -->
      <atom:link href="${CHANNEL.selfFeedUrl}" rel="self" type="application/rss+xml"/>
      <itunes:type>episodic</itunes:type>

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
