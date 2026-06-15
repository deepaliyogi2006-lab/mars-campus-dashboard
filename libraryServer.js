const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4001;

app.use(cors());
app.use(express.json());

let libraryData = {
    booksAvailable: [
        { title: "Introduction to Algorithms", floor: "3rd Floor - Shelf A", status: "Available" }
    ]
};

app.get('/api/library', (req, res) => res.json(libraryData));

// Write route
app.post('/api/library', (req, res) => {
    const { title, floor, status } = req.body;
    if (title && floor) {
        libraryData.booksAvailable.push({ title, floor, status: status || "Available" });
        return res.status(201).json({ success: true, data: libraryData });
    }
    res.status(400).json({ error: "Missing title or floor parameters" });
});

app.listen(PORT, () => console.log(`📚 Library Server updated at http://localhost:${PORT}`));