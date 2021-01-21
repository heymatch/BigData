var select_type = "cumulative_confirmed";

google.charts.load('current', {'packages':['corechart']});

async function displayChart(select){
    $("#select").attr("disabled");
    switch(select){
        case "cumulative_confirmed":
            var country = document.getElementById("country").value;
        
            var dataTable = new google.visualization.DataTable();
            
            dataTable.addColumn("date", "Date");
            dataTable.addColumn("number", "Cumulative Confirmed");
            
            var request = await BigQuery.request("SELECT date, cumulative_confirmed FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 and country_name = '" + country + "' and cumulative_confirmed != 0");

            var arr = [];
            for(var i in request.result.rows){
                arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v)]);
            }
            dataTable.addRows(arr);
        
            var options = {
                title: '累積確診人數',
                legend: { position: 'bottom' },
                animation: {  //載入動畫
                    startup: true,
                    duration: 1000,
                    easing: 'out',
                },
            };
    
            var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
            chart.draw(dataTable, options);

        break;
        case "predicated_confirmed":
            var country = document.getElementById("country").value;
        
            var dataTable = new google.visualization.DataTable();
            
            dataTable.addColumn("date", "Date");
            dataTable.addColumn("number", "Cumulative Confirmed");
            
            var request = await BigQuery.request("SELECT date, (cumulative_confirmed - cumulative_recovered) FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 and country_name = '" + country + "' and cumulative_confirmed != 0");
            //var simr = await SIR_simulation("constant", country);
            var simr = await BigQuery.request("SELECT date, pos FROM `bigdata-301014.beta_gamma.result` WHERE country_name = '" + country + "'");
            
            var arr = [];
            if(simr.result.totalRows != "0"){
                dataTable.addColumn("number", "Predition Cumulative Confirmed");
                var r = 0;
                for(var i in request.result.rows){
                    ++r;
                    arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v), parseInt(simr.result.rows[i].f[1].v)]);
                }
                var today = new Date('2021-1-20');
                while(r != 400){
                    today.setDate(today.getDate() + 1);
                    arr.push([new Date(today), 0, parseInt(simr.result.rows[r].f[1].v)]);
                    ++r;
                }
            }
            else{
                addAlert("沒有預測的資料！")
                for(var i in request.result.rows){
                    arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v)]);
                }
            }
            
            dataTable.addRows(arr);
        
            var options = {
                title: '確診中人數預測',
                legend: { position: 'bottom' },
                animation: {  //載入動畫
                    startup: true,
                    duration: 1000,
                    easing: 'out',
                },
            };
    
            var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
            chart.draw(dataTable, options);

        break;
        case "cumulative_deceased":
            var country = document.getElementById("country").value;

            var dataTable = new google.visualization.DataTable();
            
            dataTable.addColumn("date", "Date");
            dataTable.addColumn("number", "Cumulative Deceased");
            
            var request = await BigQuery.request("SELECT date, cumulative_deceased FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 and country_name = '" + country +"';");
            var arr = [];
            for(var i in request.result.rows){
                arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v)]);
            }
            dataTable.addRows(arr);
        
            var options = {
                title: '累積死亡人數',
                legend: { position: 'bottom' },
                animation: {  //載入動畫
                    startup: true,
                    duration: 1000,
                    easing: 'out',
                },
            };
    
            var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
            chart.draw(dataTable, options);

        break;
        case "new_confirmed":
            var country = document.getElementById("country").value;

            var dataTable = new google.visualization.DataTable();
            
            dataTable.addColumn("date", "Date");
            dataTable.addColumn("number", "New Confirmed");
            
            var request = await BigQuery.request("SELECT date, new_confirmed FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 and country_name = '" + country +"' and date >= Date(2021, 1, 1);");
            var arr = [];
            for(var i in request.result.rows){
                arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v)]);
            }
            dataTable.addRows(arr);
        
            var options = {
                title: '新增確診人數',
                legend: { position: 'bottom' },
                animation: {  //載入動畫
                    startup: true,
                    duration: 1000,
                    easing: 'out',
                },
            };
    
            var chart = new google.visualization.LineChart(document.getElementById('chart'));
            chart.draw(dataTable, options);

        break;
        case "ranking_confirmed":
            var country = document.getElementById("country").value;

            var dataTable = new google.visualization.DataTable();
            
            dataTable.addColumn("string", "Country");
            dataTable.addColumn("number", "Cumulative Confirmed");
            dataTable.addColumn({type: "string", role: "style"});
            
            var request = await BigQuery.request("SELECT country_name, cumulative_confirmed FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 AND date = DATE_ADD(CURRENT_DATE(), INTERVAL -3 DAY) ORDER BY cumulative_confirmed desc LIMIT 30");
            var arr = [];
            var danger = false;
            for(var i in request.result.rows){
                if(request.result.rows[i].f[0].v == country){
                    arr.push([request.result.rows[i].f[0].v, parseInt(request.result.rows[i].f[1].v), "red"]);
                    danger = true;
                }
                else{
                    arr.push([request.result.rows[i].f[0].v, parseInt(request.result.rows[i].f[1].v), "blue"]);
                }
            }
            dataTable.addRows(arr);
            
            if(danger){
                addAlert("你要去的區域的累積確診人數在確診人數在30名以內！")
                addAlert("<strong class='danger'>很危險<strong>")
            }
            else{
                addAlert("你要去的區域的累積確診人數在確診人數在30名以外！")
                addAlert("<strong class='safe'>比較安全<strong>")
            }

            var options = {
                title: '確診人數排名',
                legend: { position: 'bottom' },
                animation: {  //載入動畫
                    startup: true,
                    duration: 1000,
                    easing: 'out',
                },
            };
    
            var chart = new google.visualization.ColumnChart(document.getElementById('chart'));
            chart.draw(dataTable, options);

        break;
        case "test_SIR":
            var country = document.getElementById("country").value;
            var simr = await SIR_simulation("constant", country);

            var dataTable = new google.visualization.DataTable();
                
            dataTable.addColumn("number", "Step");
            dataTable.addColumn("number", "S");
            dataTable.addColumn("number", "I");
            dataTable.addColumn("number", "R");

            var arr = [];
            for(var i in simr){
                arr.push([parseInt(i), simr[i].S, simr[i].I, simr[i].R]);
            }
            dataTable.addRows(arr);

            var options = {
                title: 'SIR Model',
                curveType: 'function',
                legend: { position: 'bottom' },
                animation: {  //載入動畫
                    startup: true,
                    duration: 1000,
                    easing: 'out',
                },
            };

            var chart = new google.visualization.LineChart(document.getElementById('chart'));
            chart.draw(dataTable, options);

        break;
    }
    $("#select").removeAttr("disabled");
    pushAlert();
}