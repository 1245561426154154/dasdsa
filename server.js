const express=require("express"),crypto=require("crypto"),path=require("path"),app=express()
app.use(express.json()),app.use(express.static("public"))
const PORT=process.env.PORT||3000,ADMIN="dxfc_admin",SHARED_SECRET="dxfc_secret"
let scripts={}
function encrypt(t,k){const iv=crypto.randomBytes(16),c=crypto.createCipheriv("aes-256-cbc",k,iv);let e=c.update(t,"utf8","hex");e+=c.final("hex");return{data:e,iv:iv.toString("hex")}}
app.post("/create",(r,s)=>{if(r.headers["x-admin"]!==ADMIN)return s.send("no");const c=r.body.code||"print('empty')",id=crypto.randomBytes(6).toString("hex");scripts[id]=c,s.json({link:`/script/${id}`})})
app.get("/script/:id",(r,s)=>{const c=scripts[r.params.id];if(!c)return s.send("print'fake'");if(!r.headers["user-agent"]?.includes("Roblox"))return s.send("print'fake'");const k=crypto.randomBytes(32),e=encrypt(c,k);let ek="",kh=k.toString("hex");for(let i=0;i<kh.length;i++)ek+=String.fromCharCode(kh.charCodeAt(i)^SHARED_SECRET.charCodeAt(i%SHARED_SECRET.length));s.json({data:e.data,iv:e.iv,key:Buffer.from(ek).toString("hex")})})
app.get("/",(r,s)=>s.sendFile(path.join(__dirname,"public","index.html")))
app.listen(PORT,()=>console.log("running"))
