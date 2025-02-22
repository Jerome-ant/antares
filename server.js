const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Serveur backend opérationnel');
});

app.listen(3000, () => {
    console.log('Serveur lancé sur http://localhost:3000');
});
