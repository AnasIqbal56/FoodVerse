import { createSlice } from "@reduxjs/toolkit";
import MyOrders from "../pages/MyOrders";

const userSlice = createSlice({
    name:'user',
    initialState:{
        userData:null,
        city:null,
        state:null,
        currentState:null,
        currentAddress:null,
        //
        shopInMyCity:null,
        itemsInMyCity:null,
        totalAmount:0,
        cartItems:[],
        MyOrders:null
    },
    reducers:{
        setUserData:(state,action)=>{
            state.userData=action.payload

        },
        setCurrentCity:(state,action)=>{
            state.currentCity=action.payload

        },
        setCurrentState:(state,action)=>{
            state.currentState=action.payload

        },
        setCurrentAddress:(state,action)=>{
            state.currentAddress=action.payload
        },
        setShopsInMyCity:(state,action)=>{
            state.shopInMyCity=action.payload
        },
         setItemsInMyCity:(state,action)=>{
            state.itemsInMyCity=action.payload
        },
        addToCart:(state,action)=>{


            const cartItem = { ...action.payload };

            // Normalize case where shop object was passed (unlikely now), but safe
            if (!cartItem.shopId && cartItem.shop && cartItem.shop._id) {
                cartItem.shopId = cartItem.shop._id;
            }

            // final guard: if still missing shopId, do not add
            if (!cartItem.shopId) {
                console.error("Tried to add cart item without shopId:", cartItem);
                return;
            }

            const existingItem = state.cartItems.find(i => i.id === cartItem.id);

            if (existingItem) {
                existingItem.quantity += cartItem.quantity;
            } else {
                // store a flat object, do not keep nested shop objects
                state.cartItems.push({
                id: cartItem.id,
                name: cartItem.name,
                price: cartItem.price,
                image: cartItem.image,
                quantity: cartItem.quantity,
                foodType: cartItem.foodType,
                shopId: cartItem.shopId
                });
            }

            state.totalAmount = state.cartItems.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0);
            // helpful debug output
            console.log("cartItems updated:", state.cartItems);


            // const cartItem = action.payload

            // const existingItem = state.cartItems.find(i=>i.id==cartItem.id)
            // if(existingItem){
            //     existingItem.quantity+=cartItem.quantity
            // }
            // else{
            //       state.cartItems.push({
            //         ...cartItem,
            //         shopId: cartItem.shopId
            //         });
            //     //state.cartItems.push(cartItem)
            // }
            // state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)
            // console.log(state.cartItems)
        },
        updateQuantity:(state,action)=>{
            const {id,quantity}= action.payload
            const item=state.cartItems.find(i=>i.id==id)
            if (item) {
                item.quantity=quantity  
            }
            state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)
        },
        removeCartItem: (state, action) => {
            state.cartItems = state.cartItems.filter(i => i.id !== action.payload);
            state.totalAmount=state.cartItems.reduce((sum,i)=>sum+i.price*i.quantity,0)
        },

        setMyOrders:(state,action)=>{
            state.MyOrders=action.payload
        },

        addMyOrder: (state,action)=>{
            state.myOrders=[action.payload,...state.myOrders]
        },

        updateOrderStatus: (state,action)=>{
            
            const {orderId,shopId,status}= action.payload
            const order=state.myOrders.find(o=>o._id==order.id)
            if (order) {
                if (order.shopOrders && order.shopOrders.shop._id==shopId) {
                    order.shopOrders.status=status
                }
            }
        },


    }
})

export const {setUserData,setCurrentCity,setCurrentState,setCurrentAddress,
        addMyOrder,
setShopsInMyCity,setItemsInMyCity,addToCart,updateQuantity,removeCartItem,setMyOrders,updateOrderStatus}=userSlice.actions
export default userSlice.reducer
