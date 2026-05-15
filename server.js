require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const RSSParser = require("rss-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const parser = new RSSParser({ timeout: 8000, headers: { "User-Agent": "Signal-PR-Bot/2.0" } });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// -------------------------------------------------------
// DONNEES : JOURNALISTES (editables via PUT /api/journalists)
// -------------------------------------------------------
const JOURNALISTS_FILE = path.join(__dirname, "data", "journalists.json");
const CLIENTS_FILE = path.join(__dirname, "data", "clients.json");

function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch { return []; }
}
function writeJSON(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Init fichiers si absents
if (!fs.existsSync(JOURNALISTS_FILE)) {
  writeJSON(JOURNALISTS_FILE, [
    { id: 1, name: "Oumar Maiga", media: "Jeune Afrique", location: "Abidjan / Paris", beats: ["Business CI", "Finance", "BRVM", "Startups"], email: "", twitter: "", linkedin: "", lastArticle: "L'IPO BRVM : nouveau souffle pour les marches financiers ouest-africains", status: "actif" },
    { id: 2, name: "Aminata Fall", media: "RFI Afrique", location: "Dakar", beats: ["Culture", "Mode", "Societe", "Senegal / CI"], email: "", twitter: "@aminatafall_rfi", linkedin: "", lastArticle: "Mode africaine : Abidjan s'impose comme nouvelle capitale", status: "actif" },
    { id: 3, name: "Karine Dupont", media: "Strategies", location: "Paris", beats: ["Publicite creative", "Agences", "Brand strategy"], email: "", twitter: "", linkedin: "", lastArticle: "Les agences independantes africaines bousculent les reseaux globaux", status: "actif" },
    { id: 4, name: "Marie-Blanche Ossah", media: "Debonair Afrik", location: "Dakar", beats: ["Mode africaine", "Createurs CI", "Luxe emergent"], email: "", twitter: "", linkedin: "", lastArticle: "10 createurs ivoiriens qui redefinissent le luxe africain", status: "actif" },
    { id: 5, name: "Jerome Lamy", media: "CB News", location: "Paris", beats: ["Communication", "PR agencies", "Medias"], email: "", twitter: "", linkedin: "", lastArticle: "PR et IA : comment les agences parisiennes absorbent le tournant", status: "actif" },
    { id: 6, name: "Nadia Teki", media: "L'Intelligent d'Abidjan", location: "Abidjan", beats: ["Lifestyle CI", "Mode", "Business"], email: "", twitter: "", linkedin: "", lastArticle: "Les nouvelles boutiques premium qui transforment Marcory", status: "actif" }
  ]);
}

if (!fs.existsSync(CLIENTS_FILE)) {
  writeJSON(CLIENTS_FILE, [
    {
      id: "bbgci",
      name: "Bridge Bank Group CI",
      shortName: "BBGCI",
      sector: "Finance / Banque",
      status: "actif",
      campaign: "IPO BRVM 2026",
      contact: "Agnes Marie Kouadjane",
      description: "Introduction en bourse sur la BRVM. Visa AMF-UMOA en attente. Phase 1 communication financiere institutionnelle.",
      axes: [
        "Leadership financier en Afrique de l'Ouest",
        "Confiance et stabilite pour les investisseurs BRVM",
        "Vision long terme de Yerim Sow",
        "Impact sur le developpement economique CI",
        "Transparence et gouvernance exemplaire",
        "Opportunite d'investissement pour les particuliers ivoiriens"
      ],
      keywords: ["BBGCI", "Bridge Bank", "BRVM", "IPO", "AMF-UMOA", "bourse Abidjan", "Yerim Sow"],
      mediaTargets: ["Jeune Afrique", "L'Intelligent d'Abidjan", "Fraternite Matin", "RFI Afrique", "Les Echos"],
      budget: 12700000,
      currency: "FCFA"
    },
    {
      id: "boss",
      name: "BOSS Cote d'Ivoire",
      shortName: "BOSS CI",
      sector: "Pret-a-porter premium",
      status: "actif",
      campaign: "Soft Opening Marcory + Developpement notoriete",
      contact: "Nathy",
      description: "Boutique BOSS Cap Sud Marcory. Ouverture VIP realisee le 3 avril 2026. Phase post-ouverture : ancrage dans la scene lifestyle abidjanaise.",
      axes: [
        "BOSS se reconnait, ne s'annonce pas",
        "L'excellence allemande s'installe a Abidjan",
        "La scene lifestyle abidjanaise au niveau global",
        "Pret-a-porter premium accessible"
      ],
      keywords: ["BOSS", "Cap Sud Marcory", "pret-a-porter premium", "Abidjan lifestyle", "mode Abidjan"],
      mediaTargets: ["L'Intelligent d'Abidjan", "Debonair Afrik", "Fraternite Matin", "Cosmopolitan France"],
      budget: 0,
      currency: "FCFA"
    },
    {
      id: "mfp",
      name: "Mouvement Femmes et Paroles",
      shortName: "MFP",
      sector: "ONG / Droits des femmes",
      status: "actif",
      campaign: "Le van d'excision",
      contact: "Direction MFP",
      description: "Campagne de sensibilisation aux MGF. 333 personnes sensibilisees en 5 jours. Conference de presse au Ministere des Femmes avec la Ministre Nasseneba Toure.",
      axes: [
        "MGF : prevalence 36.7% en CI (MICS 2016, INS/UNICEF, confirme UNFPA 2025)",
        "Sensibilisation communautaire de proximite",
        "Soutien institutionnel au plus haut niveau",
        "Coalition societe civile et Etat"
      ],
      keywords: ["MGF", "excision", "van d'excision", "MFP", "Nasseneba Toure", "droits femmes CI"],
      mediaTargets: ["Fraternite Matin", "RFI Afrique", "L'Intelligent d'Abidjan", "Jeune Afrique", "Brut Afrique"],
      budget: 0,
      currency: "FCFA"
    },
    {
      id: "agence-x",
      name: "L'Agence X",
      shortName: "L'Agence X",
      sector: "Publicite / Communication 360",
      status: "actif",
      campaign: "Notoriete agence + Prix d'Excellence",
      contact: "Najib Ghaddar (CEO), Fanny Taffaneau (DGA)",
      description: "Agence 360 creative basee a Abidjan. Candidature Prix d'Excellence pour le Developpement de la Communication adressee au Premier Ministre CI.",
      axes: [
        "Reference creative en Afrique de l'Ouest francophone",
        "Excellence operationnelle et resultats mesures",
        "Engagement en faveur du marche pub ivoirien"
      ],
      keywords: ["L'Agence X", "agence Abidjan", "publicite Cote d'Ivoire", "communication 360", "Najib Ghaddar"],
      mediaTargets: ["CB News", "Strategies", "Influencia", "L'Intelligent d'Abidjan"],
      budget: 0,
      currency: "FCFA"
    }
  ]);
}

// -------------------------------------------------------
// FLUX RSS : sources selectionnees PR + Afrique + Pub
// -------------------------------------------------------
const RSS_SOURCES = [
  { name: "The Drum", url: "https://www.thedrum.com/rss", category: "creative", region: "global" },
  { name: "Campaign", url: "https://www.campaignlive.co.uk/rss", category: "creative pr", region: "global" },
  { name: "CB News", url: "https://www.cbnews.fr/feed", category: "pr brand", region: "europe" },
  { name: "Influencia", url: "https://www.influencia.net/feed/", category: "creative brand", region: "europe" },
  { name: "Strategies", url: "https://www.strategies.fr/rss/actu.xml", category: "pr creative", region: "europe" },
  { name: "Adweek", url: "https://www.adweek.com/feed/", category: "creative expe brand", region: "global" },
  { name: "Jeune Afrique", url: "https://www.jeuneafrique.com/feed/", category: "afrique brand", region: "afrique" },
  { name: "RFI Afrique", url: "https://www.rfi.fr/fr/rss-podcasts-afrique.xml", category: "afrique", region: "afrique" },
  { name: "PR Week", url: "https://www.prweek.com/rss", category: "pr", region: "global" },
  { name: "Les Echos", url: "https://www.lesechos.fr/rss/rss_finance.xml", category: "brand afrique", region: "europe" }
];

// Cache RSS (5 minutes)
let rssCache = { data: [], timestamp: 0 };
const RSS_CACHE_TTL = 5 * 60 * 1000;

async function fetchAllRSS() {
  const now = Date.now();
  if (rssCache.data.length > 0 && now - rssCache.timestamp < RSS_CACHE_TTL) {
    return rssCache.data;
  }

  const results = [];
  await Promise.allSettled(
    RSS_SOURCES.map(async (source) => {
      try {
        const feed = await parser.parseURL(source.url);
        const items = (feed.items || []).slice(0, 6).map((item) => ({
          source: source.name,
          title: item.title || "",
          link: item.link || "",
          date: item.pubDate || item.isoDate || new Date().toISOString(),
          category: source.category,
          region: source.region,
          summary: (item.contentSnippet || item.content || "").substring(0, 180)
        }));
        results.push(...items);
      } catch (err) {
        console.warn(`RSS fetch failed: ${source.name} - ${err.message}`);
      }
    })
  );

  // Tri par date decroissante
  results.sort((a, b) => new Date(b.date) - new Date(a.date));
  rssCache = { data: results, timestamp: now };
  return results;
}

// -------------------------------------------------------
// ROUTES API
// -------------------------------------------------------

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "2.0", timestamp: new Date().toISOString() });
});

// GET flux RSS live
app.get("/api/radar", async (req, res) => {
  try {
    const items = await fetchAllRSS();
    res.json({ items, count: items.length, sources: RSS_SOURCES.length, cached: Date.now() - rssCache.timestamp < RSS_CACHE_TTL });
  } catch (err) {
    res.status(500).json({ error: "Erreur fetch RSS", details: err.message });
  }
});

// GET journalistes
app.get("/api/journalists", (req, res) => {
  const data = readJSON(JOURNALISTS_FILE);
  const { beat, media, search } = req.query;
  let filtered = data;
  if (beat) filtered = filtered.filter(j => j.beats.some(b => b.toLowerCase().includes(beat.toLowerCase())));
  if (media) filtered = filtered.filter(j => j.media.toLowerCase().includes(media.toLowerCase()));
  if (search) filtered = filtered.filter(j =>
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    j.media.toLowerCase().includes(search.toLowerCase()) ||
    j.beats.some(b => b.toLowerCase().includes(search.toLowerCase()))
  );
  res.json(filtered);
});

// POST ajouter journaliste
app.post("/api/journalists", (req, res) => {
  const data = readJSON(JOURNALISTS_FILE);
  const newJ = { id: Date.now(), ...req.body, status: "actif" };
  data.push(newJ);
  writeJSON(JOURNALISTS_FILE, data);
  res.json({ success: true, journalist: newJ });
});

// PUT modifier journaliste
app.put("/api/journalists/:id", (req, res) => {
  const data = readJSON(JOURNALISTS_FILE);
  const idx = data.findIndex(j => String(j.id) === String(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Journaliste non trouve" });
  data[idx] = { ...data[idx], ...req.body };
  writeJSON(JOURNALISTS_FILE, data);
  res.json({ success: true, journalist: data[idx] });
});

// DELETE journaliste
app.delete("/api/journalists/:id", (req, res) => {
  let data = readJSON(JOURNALISTS_FILE);
  data = data.filter(j => String(j.id) !== String(req.params.id));
  writeJSON(JOURNALISTS_FILE, data);
  res.json({ success: true });
});

// GET clients
app.get("/api/clients", (req, res) => {
  res.json(readJSON(CLIENTS_FILE));
});

// PUT modifier client
app.put("/api/clients/:id", (req, res) => {
  const data = readJSON(CLIENTS_FILE);
  const idx = data.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Client non trouve" });
  data[idx] = { ...data[idx], ...req.body };
  writeJSON(CLIENTS_FILE, data);
  res.json({ success: true, client: data[idx] });
});

// POST proxy Anthropic (securise : cle API jamais exposee au frontend)
app.post("/api/claude", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "Cle API Anthropic non configuree. Ajoute ANTHROPIC_API_KEY dans les variables d'environnement Render." });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        ...req.body
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erreur API Claude", details: err.message });
  }
});

// GET veille : recherche mentions clients dans le flux RSS
app.get("/api/veille", async (req, res) => {
  try {
    const items = await fetchAllRSS();
    const clients = readJSON(CLIENTS_FILE);
    const results = clients.map(client => {
      const mentions = items.filter(item => {
        const text = (item.title + " " + item.summary).toLowerCase();
        return client.keywords.some(kw => text.includes(kw.toLowerCase()));
      }).map(item => ({ ...item, client: client.shortName }));
      return { client: client.shortName, clientId: client.id, mentions: mentions.slice(0, 5), count: mentions.length };
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback vers le frontend pour toutes les autres routes
app.get("*", (req, res) => {
 res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Signal V2 backend actif sur le port ${PORT}`));
