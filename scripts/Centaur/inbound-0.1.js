var addressBook;
$(function () {
	//https://github.com/evanplaice/jquery-csv
	if (parameters.addressBook){
		$.getScript("../js/jquery.csv.min.js", function () {
				var csv = host.getInputFileContents(parameters.addressBook);
				if (csv)
					addressBook = $.csv.toObjects(csv);
		});
	}
});

/**
* Override the employee matching within the pageX
*/
setTimeout(function(){
	window["matchEmployee"] = function(term, cb){
		term = term.toLowerCase();
		var resp = "<x>";
		for (var i in addressBook){
			found = addressBook[i].name.toLowerCase().indexOf(term) > -1;
			if (found){
				resp += "<TUPLE><REFNO>" + i + "</REFNO><CODE>" + i + 
					"</CODE><NAME>" + addressBook[i].name + "</NAME></TUPLE>";
			}
		}
		resp += "</x>";
		cb( resp );
	}
	
	window["getEmployee"] = function (cValue) {
		if (cValue == "")
			return;
		debugger;
		for (var i in addressBook){
			if (i==cValue){
				var emp = addressBook[i];
				connote.PAYEE = i;
				connote.R_NAME = emp.name;
				connote.R_STREET = emp.street;
				connote.R_STREET2 = emp.street2;
				connote.R_ZONE = emp.postalcode;
				connote.R_SUBURB = emp.city;
				connote.R_E_MAIL = emp.email;
				connote.R_PHONE = emp.phone;
				connote.COSTCNTR = "";
				connote.EMPNUMBER = i;
				$('.contactDetails').show();
				break;
			}
		}
	}


}, 1000);
