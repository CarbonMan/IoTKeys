  document.getElementById("launchCentaurBtn").addEventListener("click",(e)=>{
	  var msg = {
		  type: "training",
		  value: {
			  id: "costcntr",
			  action: "highlight"
		  }
	  };
    T$.messageUrlMap("Centaur", "Standard parcel", JSON.stringify(msg));
  });
