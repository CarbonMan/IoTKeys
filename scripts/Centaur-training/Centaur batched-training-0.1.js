window.addEventListener("IOTKEY:loaded", (event)=>{
  document.getElementById("launchCentaurBtn").addEventListener("click",(e)=>{
    T$.messageUrlMap("Centaur");
  });
});
