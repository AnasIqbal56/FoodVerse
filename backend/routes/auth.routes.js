import express from "express"
import { signIn, signOut, signUp } from "../controllers/auth.controllers.js"

const authRouter=express.Router()


authRouter.post("/SignUp",signUp)

authRouter.post("/SignIn",signIn)
authRouter.post("/SignOut",signOut)

export default authRouter