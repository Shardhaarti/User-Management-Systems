const bcrypt = require('bcrypt');
const adminpool = require('./models/adminDB'); // your DB connection

const username = 'admin';            // your admin username
const plainPassword = 'admin';    // your admin password

bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
        console.error("❌ Hashing failed:", err);
        return;
    }

    const query = 'INSERT INTO admin (username, password) VALUES (?, ?)';
    adminpool.query(query, [username, hash], (err, result) => {
        if (err) {
            console.error("❌ Insert error:", err);
        } else {
            console.log("✅ Admin inserted with hashed password!");
        }
        process.exit(); // stop the script after running
    });
});
