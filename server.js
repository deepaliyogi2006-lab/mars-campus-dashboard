const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const MICROSERVICES = {
    library: 'http://localhost:4001/api/library',
    cafeteria: 'http://localhost:4002/api/cafeteria',
    events: 'http://localhost:4003/api/events'
};

// Health Check Route
app.get('/api/health', async (req, res) => {
    const statusReport = { library: false, cafeteria: false, events: false };
    try { const r = await fetch(MICROSERVICES.library); if (r.ok) statusReport.library = true; } catch (e){}
    try { const r = await fetch(MICROSERVICES.cafeteria); if (r.ok) statusReport.cafeteria = true; } catch (e){}
    try { const r = await fetch(MICROSERVICES.events); if (r.ok) statusReport.events = true; } catch (e){}
    res.json(statusReport);
});

// 📥 READ Route (Natural Language Query Parsing)
app.post('/api/chat', async (req, res) => {
    const msg = (req.body.message || "").toLowerCase();
    let target = null;
    let nodeName = "";

    if (msg.includes("eat") || msg.includes("food") || msg.includes("cafeteria") || msg.includes("lunch") || msg.includes("veg")) {
        target = MICROSERVICES.cafeteria; nodeName = "Cafeteria Subsystem";
    } else if (msg.includes("book") || msg.includes("library") || msg.includes("read") || msg.includes("algorithms")) {
        target = MICROSERVICES.library; nodeName = "Library Subsystem";
    } else if (msg.includes("event") || msg.includes("workshop") || msg.includes("fest") || msg.includes("schedule")) {
        target = MICROSERVICES.events; nodeName = "Events Subsystem";
    }

    if (!target) {
        return res.json({ assistantReply: "🤖 Try asking: 'What is on the cafeteria menu?', 'Find algorithms books', or 'Show campus workshops'.", liveDataFetched: null });
    }

    try {
        const response = await fetch(target);
        const data = await response.json();
        let reply = `🤖 Fetched fresh data from ${nodeName}: `;
        if (target === MICROSERVICES.cafeteria) reply += `Today's menu highlights: ${data.vegOptions.join(", ")}.`;
        if (target === MICROSERVICES.library) reply += `We found "${data.booksAvailable[0]?.title}" hosted on ${data.booksAvailable[0]?.floor}.`;
        if (target === MICROSERVICES.events) reply += `Upcoming item logged: "${data.upcomingEvents[0]?.name}" scheduled at ${data.upcomingEvents[0]?.time}.`;
        
        res.json({ assistantReply: reply, liveDataFetched: data });
    } catch (err) {
        res.json({ assistantReply: `⚠️ Error pulling data from ${nodeName}. Node might be offline.`, liveDataFetched: null });
    }
});

// 📤 WRITE Route (Data Management Injection Proxy)
app.post('/api/update-grid', async (req, res) => {
    const { targetService, payload } = req.body;
    const url = MICROSERVICES[targetService];

    if (!url) return res.status(400).json({ error: "Invalid target microservice node identifier" });

    try {
        console.log(`📤 Gateway Proxy routing dynamic write parameters to -> ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const updatedData = await response.json();
        res.json({ success: true, targetService, updatedData });
    } catch (err) {
        res.status(500).json({ error: `Failed to post data to isolated microservice cluster at port ${url}` });
    }
});

app.listen(PORT, () => console.log(`🚀 Bidirectional Gateway running live at http://localhost:${PORT}`));