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

// Configuration OpenAI très simple
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// CORS permissif
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Route test simple
app.get("/", (req, res) => {
  res.send("Serveur opérationnel");
});

// Route echo simple pour tester si le serveur reçoit bien les requêtes
app.post("/api/echo", (req, res) => {
  console.log("Echo requis:", req.body);
  res.json({ echo: req.body });
});

// Route API extrêmement simplifiée
app.post("/api/chat", async (req, res) => {
  console.log("Requête reçue:", req.body);
  
  try {
    // Réponse statique pour tester si le client reçoit bien les réponses du serveur
    res.json({ 
      response: "Ceci est une réponse statique pour tester la connexion. Si vous voyez ce message, le problème n'est pas dans la communication entre votre frontend et le backend, mais plutôt avec l'API OpenAI."
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Démarrage serveur
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Serveur lancé sur port ${PORT}`);
});