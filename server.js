import "dotenv/config"; // Charge les variables d'environnement
import express from "express";
import cors from "cors";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";

// Configuration des chemins pour ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Schéma JSON pour les réponses structurées
const RH_SCHEMA = {
  "type": "object",
  "properties": {
    "conseil": {
      "type": "string",
      "description": "Recommandation ou conseil spécifique en matière de ressources humaines belge."
    },
    "exemple_loi": {
      "type": "string",
      "description": "Exemple de texte de loi applicable en matière de ressources humaines en Belgique."
    },
    "situation_cible": {
      "type": "string",
      "description": "Description de la situation ou du contexte auquel le conseil s'applique."
    }
  },
  "required": [
    "conseil",
    "exemple_loi",
    "situation_cible"
  ],
  "additionalProperties": false
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Sert les fichiers statiques

// Route de test pour voir si le serveur fonctionne
app.get("/", (req, res) => {
  res.send("🚀 Serveur backend opérationnel");
});

// Route pour interagir avec OpenAI avec réponses structurées
app.post("/api/chat", async (req, res) => {
  console.log("📩 Requête reçue :", req.body);

  const userMessage = req.body.message;

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Clé API manquante !");
    return res.status(500).json({ error: "Clé API manquante dans .env" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en Ressources Humaines en Belgique. Utilise un ton formel et donne des conseils RH précis et factuels. Tu dois répondre en suivant strictement le format JSON demandé." 
        },
        { role: "user", content: userMessage }
      ],
      response_format: { 
        type: "json_schema", 
        schema: RH_SCHEMA,
        strict: true
      }
    });

    console.log("🔹 Réponse API OpenAI :", JSON.stringify(completion, null, 2));

    if (completion.choices?.length > 0) {
      // Convertir la chaîne JSON en objet
      const responseObject = JSON.parse(completion.choices[0].message.content);
      
      // Envoyer la réponse complète au frontend
      res.json({ response: responseObject });
    } else {
      console.error("❌ Aucune réponse valide de OpenAI !");
      res.status(500).json({ error: "Erreur : aucune réponse reçue de l'IA." });
    }
  } catch (error) {
    console.error("❌ Erreur API OpenAI :", error);
    res.status(500).json({ error: "Erreur lors de l'appel à OpenAI." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur backend lancé sur http://0.0.0.0:${PORT}`);
});