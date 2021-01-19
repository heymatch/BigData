function init(){
    Globe.init();
    BigQuery.init();
}

async function initUI(){
    let country_request = await BigQuery.request("SELECT country_name FROM bigquery-public-data.covid19_open_data.covid19_open_data GROUP BY country_name ORDER BY country_name");
    initOption(".country", country_request.result);
}

function initOption(tag, json){
    let html = "";
    for(var i in json.rows){
        html += "<option>" + json.rows[i].f[0].v + "</option>";
    }
    $(tag).html(html);
}

function main(){

}

