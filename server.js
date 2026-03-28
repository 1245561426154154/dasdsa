const express = require("express")
const crypto = require("crypto")
const path = require("path")
const app = express()

app.use(express.json())
app.use(express.static("public"))

const PORT = process.env.PORT || 3000

// Shared secret (known only to client + server)
const SHARED_SECRET = "dxfc_secret"
const ADMIN = "dxfc_admin"

// Default real code (change anytime via website)
let REAL_CODE = "print('default real code')"

// XOR helper
function xor(data, key) {
    let out = ""
    for (let i = 0; i < data.length; i++) {
        out += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length))
    }
    return out
}

// Endpoint to set real code (from website)
app.post("/set", (req, res) => {
    if (req.headers["x-admin"] !== ADMIN) return res.send("no")
    REAL_CODE = req.body.code || "print('empty')"
    res.send("ok")
})

// Main script endpoint
app.get("/script", (req, res) => {
    // Only real Roblox user-agent can get the real code
    if (!req.headers["user-agent"]?.includes("Roblox")) {
        return res.send("print'fake'")
    }

    // generate random key per request
    const randKey = crypto.randomBytes(16).toString("hex")

    // encrypt the real code
    const encrypted = Buffer.from(xor(REAL_CODE, randKey)).toString("hex")

    // encode the key using shared secret
    let encodedKey = ""
    for (let i = 0; i < randKey.length; i++) {
        encodedKey += String.fromCharCode(randKey.charCodeAt(i) ^ SHARED_SECRET.charCodeAt(i % SHARED_SECRET.length))
    }

    res.json({
        code: encrypted,
        key: Buffer.from(encodedKey).toString("hex")
    })
})

// Serve website UI
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
})

app.listen(PORT, () => console.log("Server running on port " + PORT))
