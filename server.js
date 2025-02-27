// Modifiez votre code server.js comme suit:

import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configuration CORS améliorée
app.use(cors({
  origin: '*', // Ou spécifiez votre domaine exact
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route de test
app.get("/", (req, res) => {
  res.send("🚀 Serveur backend opérationnel");
});

// Route API pour le chat
app.post("/api/chat", async (req, res) => {
  console.log("📩 Requête reçue:", req.body);

  const userMessage = req.body.message;

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Clé API manquante!");
    return res.status(500).json({ error: "Clé API manquante dans .env" });
  }

  try {
    // Version simplifiée sans format JSON structuré pour déboguer
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { 
          role: "system", 
          content: "Tu es un expert en Ressources Humaines en Belgique. Utilise un ton formel et donne des conseils RH précis et factuels."
        },
        { role: "user", content: userMessage }
      ],
      // Pas de response_format pour l'instant
      max_tokens: 1500, // Limite la taille de la réponse
      temperature: 0.7  // Ajustez selon vos besoins
    });

    console.log("🔹 Réponse OpenAI reçue");

    if (completion.choices?.length > 0) {
      // Réponse simple en texte
      res.json({ response: completion.choices[0].message.content });
    } else {
      console.error("❌ Aucune réponse valide de OpenAI!");
      res.status(500).json({ error: "Erreur: aucune réponse reçue de l'IA." });
    }
  } catch (error) {
    console.error("❌ Erreur API OpenAI:", error);
    res.status(500).json({ error: "Erreur lors de l'appel à OpenAI." });
  }
});

// Démarrage du serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur backend lancé sur http://0.0.0.0:${PORT}`);
});