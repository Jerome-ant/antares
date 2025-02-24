require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require("path"); // ✅ Garder UNE SEULE FOIS cette ligne
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // ✅ Sert `chatbot.html`

// 📌 Route de test pour voir si le serveur fonctionne
app.get('/', (req, res) => {
    res.send('🚀 Serveur backend opérationnel');
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
                model: "gpt-4o-2024-08-06",
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

// 📌 Lancer le serveur sur le bon port
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur backend lancé sur http://0.0.0.0:${PORT}`);
});
