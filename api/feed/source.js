// api/feed/source.js  (CommonJS)
const episodes = require("../../content/episodes.json");

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

    // Lägg till minst en kategori (du kan ändra dessa om du vill)
    categoryTop: "Society & Culture",
    categorySub: "Personal Journals",
  };

  // ---- Avsnitt ----
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

      // Skapa fallback-länk till sajt
      const itemLink = ep.link || `${CHANNEL.link}#${encodeURIComponent(guid)}`;

      return `
        <item>
          <title><![CDATA[${title}]]></title>
          <link>${itemLink}</link>
          <description><![CDATA[${desc}]]></description>
