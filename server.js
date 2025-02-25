import "dotenv/config"; // Charge les variables d'environnement
import express from "express";
import cors from "cors";
import path from "path";
import OpenAI from "openai";

const app = express();
const PORT = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); // ✅ API OpenAI avec SDK

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public"))); // ✅ Sert `chatbot.html`

// 📌 Route de test pour voir si le serveur fonctionne
app.get("/", (req, res) => {
    res.send("🚀 Serveur backend opérationnel");
});

// 📌 Route pour interagir avec OpenAI
app.post("/api/chat", async (req, res) => {
    console.log("📩 Requête reçue :", req.body); // 🔍 Log de la requête reçue

    const userMessage = req.body.message;

    if (!process.env.OPENAI_API_KEY) {
        console.error("❌ Clé API manquante !");
        return res.status(500).json({ error: "Clé API manquante dans .env" });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-realtime-preview-2024-12-17", // ✅ Modèle OpenAI
            role: "system", content: "Tu es un expert en Ressources Humaines en Belgique. Utilise un ton formel et donne des conseils RH précis et factuels.",
            role: "user", content: userMessage,
            store: true, // ✅ Enregistre la conversation (optionnel)

        });

        console.log("🔹 Réponse API OpenAI :", JSON.stringify(response, null, 2));

        if (response.choices?.length > 0) {
            res.json({ response: response.choices[0].message.content });
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
