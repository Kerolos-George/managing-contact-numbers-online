const express = require('express');
const router = express.Router();

const validUsers = [
    { username: 'user1', password: 'user1' },
    { username: 'user2', password: 'user2' }
];

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const user = validUsers.find(u => u.username === username && u.password === password);

    if (user) {
        res.json({ success: true, user: { userId: user.username, username: user.username } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

module.exports = router;
