// api/feed/[token].js  (CommonJS)
const { getMemberByToken } = require("../store.js");
const episodes = require("../../content/episodes.json");

module.exports = async (req, res) => {
  const { token } = req.query;
  const member = await getMemberByToken(token);
  if (!member || !member.active) return res.status(403).send("Forbidden");

  const items = episodes.map((ep) => `
    <item>
      <title><![CDATA[${ep.title}]]></title>
      <description><![CDATA[${ep.descriptionHtml}]]></description>
      <pubDate>${new Date(ep.published).toUTCString()}</pubDate>
      <guid isPermaLink="false">${ep.id}</guid>
      <enclosure url="${ep.audio.private_mp3}" length="${ep.audio.bytes}" type="audio/mpeg" />
      <itunes:duration>${ep.audio.duration}</itunes:duration>
      <itunes:image href="${ep.image}" />
    </item>
  `).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <channel>
      <title><![CDATA[Till Sängs (Medlem)]]></title>
      <link>https://www.tillsangs.se/</link>
      <language>sv-SE</language>
      <itunes:author>Till Sängs</itunes:author>
      <itunes:explicit>false</itunes:explicit>
      <itunes:image href="https://www.tillsangs.se/cover.jpg"/>
      ${items}
    </channel>
  </rss>`;

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
  res.status(200).send(xml);
};
