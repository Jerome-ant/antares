import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// CORS permissif
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route de test
app.get("/", (req, res) => {
  res.send("🚀 Serveur opérationnel avec OpenAI !");
});

// Route API pour tester la connexion serveur
app.post("/api/echo", (req, res) => {
  console.log("🔄 Echo requis:", req.body);
  res.json({ echo: req.body });
});

// 📌 Route principale pour interagir avec OpenAI
app.post("/api/chat", async (req, res) => {
  console.log("📩 Requête reçue:", req.body);
  
  const userMessage = req.body.message;
  
  // Vérification de la clé API
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Clé API OpenAI manquante !");
    return res.status(500).json({ error: "Clé API manquante dans .env" });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-2024-08-06", // ✅ Dernière version du modèle
      messages: [
        { role: "system", content: "Tu es un expert en RH en Belgique. Utilise un ton formel et donne des conseils précis et factuels." },
        { role: "user", content: userMessage }
      ]
    });

    console.log("🔹 Réponse API OpenAI:", JSON.stringify(completion, null, 2));

    if (completion.choices?.length > 0) {
      res.json({ response: completion.choices[0].message.content });
    } else {
      console.error("❌ Aucune réponse valide reçue d'OpenAI !");
      res.status(500).json({ error: "Erreur : aucune réponse reçue de l'IA." });
    }
  } catch (error) {
    console.error("❌ Erreur API OpenAI :", error);
    res.status(500).json({ error: "Erreur lors de l'appel à OpenAI." });
  }
});

// Démarrage serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Serveur lancé sur port ${PORT}`);
});
