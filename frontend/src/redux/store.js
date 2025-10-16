import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice"


export const store=configStore({
    reducer:{
        user:userSlice
        

    }

     
})