const express = require("express")
const crypto = require("crypto")
const path = require("path")

const app = express()
app.use(express.json())
app.use(express.static("public"))

const PORT = process.env.PORT || 3000

const SHARED_SECRET = "dxfc_secret"
const ADMIN = "dxfc_admin"

let REAL_CODE = "print('default')"

// XOR
function xor(data, key) {
    let out = ""
    for (let i = 0; i < data.length; i++) {
        out += String.fromCharCode(
            data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        )
    }
    return out
}

// set code from website
app.post("/set", (req, res) => {
    if (req.headers["x-admin"] !== ADMIN) return res.send("no")

    REAL_CODE = req.body.code || "print('empty')"
    res.send("ok")
})

// main script endpoint
app.get("/script", (req, res) => {
    if (!req.headers["user-agent"]?.includes("Roblox")) {
        return res.send("print'fake'")
    }

    const randKey = crypto.randomBytes(16).toString("hex")

    const encrypted = Buffer.from(xor(REAL_CODE, randKey)).toString("hex")

    let encodedKey = ""
    for (let i = 0; i < randKey.length; i++) {
        encodedKey += String.fromCharCode(
            randKey.charCodeAt(i) ^ SHARED_SECRET.charCodeAt(i % SHARED_SECRET.length)
        )
    }

    res.json({
        code: encrypted,
        key: Buffer.from(encodedKey).toString("hex")
    })
})

app.listen(PORT, () => console.log("running"))
