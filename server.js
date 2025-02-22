require('dotenv').config(); // 📌 Charge les variables d'environnement
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

// 📌 Middleware
app.use(cors());
app.use(express.json());

// 📌 Servir les fichiers statiques (chatbot.html, CSS, JS...)
app.use(express.static(path.join(__dirname, "public")));

// 📌 Route pour afficher `chatbot.html`
app.get("/chatbot.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "chatbot.html"));
});

// 📌 Route de test pour vérifier si le serveur fonctionne
app.get("/", (req, res) => {
    res.send("🚀 Serveur backend opérationnel et prêt !");
});

// 📌 Route pour interagir avec OpenAI
app.post('/api/chat', async (req, res) => {
    console.log("📩 Requête reçue :", req.body); // 🔍 Log de la requête reçue

    const userMessage = req.body.message;
    const apiKey = process.env.OPENAI_API_KEY; // 🔑 Récupération de la clé API

    if (!apiKey) {
        console.error("❌ Clé API manquante !");
        return res.status(500).json({ error: "Clé API manquante dans .env" });
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo",
                messages: [{ role: "user", content: userMessage }]
            })
        });

        const data = await response.json();
        console.log("🔹 Réponse API OpenAI :", JSON.stringify(data, null, 2)); // 🔍 Voir la réponse brute

        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            res.json({ response: data.choices[0].message.content });
        } else {
            console.error("❌ Aucune réponse valide de OpenAI !");
            res.status(500).json({ error: "Erreur : aucune réponse reçue de l'IA." });
        }
    } catch (error) {
        console.error("❌ Erreur API OpenAI :", error);
        res.status(500).json({ error: "Erreur lors de l'appel à OpenAI." });
    }
});

// 📌 Lancer le serveur sur le port défini
app.listen(PORT, () => {
    console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
