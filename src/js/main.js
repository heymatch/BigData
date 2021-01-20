function init(){
    Globe.init();
    BigQuery.init();
}

async function initUI(){
    $("#select").attr("disabled");
    let country_request = await BigQuery.request("SELECT country_name FROM bigquery-public-data.covid19_open_data.covid19_open_data GROUP BY country_name ORDER BY country_name");
    initOption(".country", country_request.result);
    $("#select").removeAttr("disabled");
}

function initOption(tag, json){
    let html = "<option value='0'>Please Select</option>";
    for(var i in json.rows){
        html += "<option>" + json.rows[i].f[0].v + "</option>";
    }
    $(tag).html(html);
}

function test(){
    
}

