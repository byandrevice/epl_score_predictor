import React, { useState } from "react";
import { useNavigate } from "react-router";

export default function ForgotPassword(){

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);


  const handleSubmit = async(e:React.FormEvent)=>{
    e.preventDefault();

    try{

      setLoading(true);

      const response = await fetch(
        "http://localhost:5001/api/auth/forgot-password",
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            email
          })
        }
      );


      const data = await response.json();


      if(!response.ok){
        throw new Error(data.message);
      }


      localStorage.setItem(
        "reset_email",
        email
      );


      setMessage(
        "Reset code sent to your email."
      );


      setTimeout(()=>{
        navigate("/reset-password");
      },1000);


    }catch(err:any){

      setMessage(
        err.message || "Something went wrong"
      );

    }finally{
      setLoading(false);
    }
  };


return (

<div className="min-h-screen flex items-center justify-center bg-background">

<div className="w-full max-w-sm">

<h1 className="text-3xl font-bold mb-6">
Forgot Password
</h1>


<form
onSubmit={handleSubmit}
className="flex flex-col gap-4"
>


<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
className="border p-3"
/>


{
message &&
<p className="text-sm text-primary">
{message}
</p>
}


<button
disabled={loading}
className="bg-primary p-3"
>

{
loading
?
"Sending..."
:
"Send Reset Code"
}

</button>


</form>


</div>

</div>

)

}