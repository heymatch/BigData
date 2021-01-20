var alertMsg = [];

function addAlert(msg){
    alertMsg.push(msg);
}

function pushAlert(){
    $("#alert").html(alertMsg.join("<br>"));
    alertMsg = [];
}