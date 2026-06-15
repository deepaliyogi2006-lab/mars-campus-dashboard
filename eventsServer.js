const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 4003;

app.use(cors());
app.use(express.json());

let eventsData = {
    upcomingEvents: [
        { name: "MARS Tech Fest 2026 Keynote Meeting", time: "11:00 AM", location: "Main Seminar Hall" }
    ]
};

app.get('/api/events', (req, res) => res.json(eventsData));

// Write route
app.post('/api/events', (req, res) => {
    const { name, time, location } = req.body;
    if (name && time && location) {
        eventsData.upcomingEvents.push({ name, time, location });
        return res.status(201).json({ success: true, data: eventsData });
    }
    res.status(400).json({ error: "Missing event parameters" });
});

app.listen(PORT, () => console.log(`📅 Events Server updated at http://localhost:${PORT}`));