require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = process.env.PORT || 3000; // ✅ Render définit automatiquement le port

app.use(cors());
app.use(express.json()); // ✅ Lire les requêtes JSON

// 📌 Test du serveur
app.get("/", (req, res) => {
    res.send("🚀 Serveur backend opérationnel !");
});

// 📌 Vérifier si les routes sont bien chargées
app._router.stack.forEach(function(r){
    if (r.route && r.route.path) {
        console.log("🛠 Route disponible : " + r.route.path);
    }
});

// 📌 Route pour le chatbot OpenAI
app.post('/api/chat', async (req, res) => {
    console.log("📩 Requête reçue :", req.body);

    const userMessage = req.body.message;
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("❌ Clé API manquante !");
        return res.status(500).json({ error: "Clé API manquante sur Render." });
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
        console.log("🔹 Réponse API OpenAI :", JSON.stringify(data, null, 2));

        if (data.choices && data.choices.length > 0 && data.choices[0].message) {
            res.json({ response: data.choices[0].message.content });
        } else {
            console.error("❌ Aucune réponse valide reçue d'OpenAI !");
            res.status(500).json({ error: "Erreur OpenAI : aucune réponse." });
        }
    } catch (error) {
        console.error("❌ Erreur lors de l'appel OpenAI :", error);
        res.status(500).json({ error: "Erreur de connexion à OpenAI." });
    }
});

// 📌 Lancer le serveur sur le bon port
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Serveur backend lancé sur http://0.0.0.0:${PORT}`);
});
