require('dotenv').config(); // Charge les variables d'environnement
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json()); // 📌 Permet de lire le JSON dans les requêtes

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

// 📌 Lancement du serveur sur le port 3000
app.listen(3000, () => {
    console.log("🚀 Serveur backend lancé sur http://localhost:3000");
});
