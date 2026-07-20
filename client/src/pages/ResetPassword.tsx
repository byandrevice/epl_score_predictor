import React,{useState} from "react";
import {useNavigate} from "react-router";


export default function ResetPassword(){

const navigate = useNavigate();


const [code,setCode]=useState("");
const [password,setPassword]=useState("");
const [message,setMessage]=useState("");


const email =
localStorage.getItem("reset_email");


const handleSubmit = async(
e:React.FormEvent
)=>{

e.preventDefault();


try{

const response = await fetch(
`${(import.meta as any).env?.VITE_API_URL || "http://localhost:5001/api"}/auth/reset-password`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({

email,
code,
newPassword:password

})
}
);


const data =
await response.json();


if(!response.ok){
throw new Error(data.message);
}


setMessage(
"Password updated successfully."
);


setTimeout(()=>{
navigate("/");
},1500);



}catch(err:any){

setMessage(
err.message
);

}

};



return (

<div className="min-h-screen flex items-center justify-center">


<div className="w-full max-w-sm">


<h1 className="text-3xl font-bold mb-6">
Reset Password
</h1>


<form
onSubmit={handleSubmit}
className="flex flex-col gap-4"
>


<input
placeholder="Reset code"
value={code}
onChange={(e)=>setCode(e.target.value)}
className="border p-3"
/>


<input
type="password"
placeholder="New password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border p-3"
/>


{
message &&
<p>
{message}
</p>
}


<button
className="bg-primary p-3"
>
Update Password
</button>


</form>


</div>

</div>


)

}