import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors"
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import contactRouter from "./routes/contact.routes.js";
import  http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";


const app = express();
const server=http.createServer(app)

const io=new Server(server,{
  cors:{
  origin: "https://tamera-axenic-matteo.ngrok-free.dev",
  // [
  //   "http://localhost:5173",
  //   "http://localhost:5174"
  // ],
  credentials: true,
  methods:['POST','GET']
}

})

app.set("io",io)






const port = process.env.PORT || 5000
app.use(cors({
  origin:true,
  // [
  //   "http://localhost:5173",
  //   "http://localhost:5174"
  // ],
  credentials: true
}));
app.use((req, res, next) => {
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups'); // Or 'same-origin-allow-popups'
        next();
    });

app.use(express.json())
app.use(cookieParser())
app.use("/api/auth",authRouter)
app.use ("/api/user",userRouter)
app.use ("/api/shop",shopRouter)
app.use ("/api/item",itemRouter)
app.use ("/api/order",orderRouter)
app.use ("/api/contact",contactRouter)
socketHandler(io)
server.listen(port, () => {
    connectDb()
  console.log(`Server is running on port ${port}`);
});