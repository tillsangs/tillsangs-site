// api/feed/source.js  (CommonJS)
const episodes = require("../../content/episodes.json");

module.exports = async (req, res) => {
  // ---- Kanal-metadata (viktigt: iTunes author på kanalnivå) ----
  const CHANNEL = {
    title: "Till Sängs (Källfeed)",
    link: "https://www.tillsangs.se/",
    language: "sv-SE",
    description:
      "Lyssna på Till Sängs i full längd utan reklam. Med Samanda Ekman & Malena Ivarsson. Medlemskap ger hela arkivet och alla nya avsnitt.",
    itunesAuthor: "Samanda Ekman & Malena Ivarsson",
    itunesExplicit: "false",
    itunesImage: "https://www.tillsangs.se/cover.jpg",
    itunesOwnerName: "Samanda Ekman",
    itunesOwnerEmail: "info@tillsangs.com",
  };

  const items = episodes
    .map(
      (ep) => `
    <item>
      <title><![CDATA[${ep.title}]]></title>
      <description><![CDATA[${ep.descriptionHtml}]]></description>
      <pubDate>${new Date(ep.published).toUTCString()}</pubDate>
      <guid isPermaLink="false">${ep.id}</guid>
      <enclosure url="${ep.audio.private_mp3}" length="${ep.audio.bytes}" type="audio/mpeg" />
      <itunes:duration>${ep.audio.duration}</itunes:duration>
      <itunes:image href="${ep.image}" />
    </item>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0"
       xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <channel>
      <title><![CDATA[${CHANNEL.title}]]></title>
      <link>${CHANNEL.link}</link>
      <language>${CHANNEL.language}</language>

      <!-- Krävs av Spotify -->
      <description><![CDATA[${CHANNEL.description}]]></description>
      <itunes:author>${CHANNEL.itunesAuthor}</itunes:author>
      <itunes:explicit>${CHANNEL.itunesExplicit}</itunes:explicit>
      <itunes:image href="${CHANNEL.itunesImage}"/>
      <itunes:owner>
        <itunes:name>${CHANNEL.itunesOwnerName}</itunes:name>
        <itunes:email>${CHANNEL.itunesOwnerEmail}</itunes:email>
      </itunes:owner>

      ${items}
    </channel>
  </rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.status(200).send(xml);
};
