const express = require("express")
const crypto = require("crypto")
const app = express()
app.use(express.json())

const PORT = process.env.PORT || 3000

// Shared secret (known only to client + server)
const SHARED_SECRET = "dxfc_secret"

// Initial real Lua code (can be updated anytime)
let REAL_CODE = "print('REAL EXECUTED')"

// XOR helper
function xor(data, key) {
    let out = ""
    for (let i = 0; i < data.length; i++) {
        out += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return out
}

// Optional endpoint to change REAL_CODE anytime
app.post("/set", (req, res) => {
    const adminKey = req.headers["x-admin"]
    if (adminKey !== "dxfc_admin") return res.send("no")
    REAL_CODE = req.body.code || "print('empty')"
    res.send("updated")
})

// Main script endpoint
app.get("/script", (req, res) => {
    // Only allow real Roblox user-agent
    if (!req.headers["user-agent"]?.includes("Roblox")) return res.send("print'fake'")

    // generate per-request random key
    const randKey = crypto.randomBytes(16).toString("hex")

    // encrypt script
    const encrypted = Buffer.from(xor(REAL_CODE, randKey)).toString("hex")

    // encode key using shared secret
    let encodedKey = ""
    for (let i = 0; i < randKey.length; i++) {
        encodedKey += String.fromCharCode(randKey.charCodeAt(i) ^ SHARED_SECRET.charCodeAt(i % SHARED_SECRET.length))
    }

    res.json({ code: encrypted, key: Buffer.from(encodedKey).toString("hex") })
})

app.listen(PORT, () => console.log("Server running"))
