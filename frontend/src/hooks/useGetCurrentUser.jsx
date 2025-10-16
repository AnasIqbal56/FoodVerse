import React from 'react'
import { useEffect } from 'react'


function useGetCurrentUser(){
    useEffect(()=>{
        const fetchUser=async ()=>{
            try{
            const result =await axios.get(`S{serverUrl}/api/user/current`, 
            {witCredentials:true})
            console.log(result);
            } catch(error){
                console.log(error);
                

            }
        }
        fetchUser()
    },[])

 }

 export default useGetCurrentUser