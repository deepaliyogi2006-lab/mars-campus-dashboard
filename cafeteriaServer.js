const express = require('express');
const app = express();
const PORT = 4002;

app.use(express.json());

// Completely isolated Cafeteria Database
const cafeteriaDb = {
    todaysSpecial: "Spicy Paneer Wrap & Crispy Fries", 
    vegOptions: ["Veg Cheese Burger", "Corn & Pepper Salad", "Fresh Fruit Bowl"],
    hours: "08:00 AM - 09:00 PM"
};

// Independent Endpoint
app.get('/api/cafeteria', (req, res) => {
    console.log("🍳 Cafeteria Server: Live request received!");
    res.json(cafeteriaDb);
});

app.listen(PORT, () => console.log(`🍳 Isolated Cafeteria Server running live at http://localhost:${PORT}`));