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
            dataTable.addColumn("number", "Growth Rate Confirmed");
            
            var request = await BigQuery.request("SELECT date, cumulative_confirmed, new_confirmed FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 and country_name = '" + country + "' and cumulative_confirmed != 0");

            var arr = [];
            var n = 0, total = 0, latest = 0;
            for(var i in request.result.rows){
                arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v), parseInt(request.result.rows[i].f[2].v)]);
                ++n;
                total += parseInt(request.result.rows[i].f[2].v);
                if(i >= request.result.totalRows-7){
                    latest += parseFloat(request.result.rows[i].f[2].v);
                    console.log(i)
                }
            }
            dataTable.addRows(arr);

            var avg = (Math.round((total/n)*100)/100);
            latest = (Math.round((latest/7)*100)/100);
            var compare = (Math.round((latest/avg)*100)/100);
            addAlert("確診人數成長平均為： " + avg);
            addAlert("最近確診人數平均為： " + latest);
            addAlert("確診人數成長平均與最近確診人數比例為： " + compare);
            if(compare > 1){
                addAlert("<strong class='danger'>最近比較危險</strong>");
            }
            else{
                addAlert("<strong class='safe'>最近比較安全</strong>");
            }
        
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
            addAlert("<strong class='predTitle'>使用SIR Model預測</strong>");
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
                var latest = 0;
                for(var i in request.result.rows){
                    ++r;
                    arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v), parseInt(simr.result.rows[i].f[1].v)]);
                    if(i == request.result.totalRows-1){
                        latest = parseInt(request.result.rows[i].f[1].v);
                    }
                }
                var today = new Date('2021-1-20');
                var predict = 0, counter = 0;
                while(r != 400){
                    if(counter < 14){
                        predict += parseInt(simr.result.rows[r].f[1].v);
                    }
                    today.setDate(today.getDate() + 1);
                    arr.push([new Date(today), 0, parseInt(simr.result.rows[r].f[1].v)]);
                    ++r;
                }
                predict = Math.round(predict / 14 * 100) / 100;
                var compare = Math.round((predict/latest) * 100) / 100;
                
                addAlert("最近預測的確診人數平均： " + predict);
                addAlert("最近預測的確診人數與近日比例： " + compare);
                if(compare > 10){
                    addAlert("<strong class='danger'>未來可能確診人數超過10%</strong>");
                    addAlert("<strong class='danger'>預測最近比較危險</strong>");
                }
                else{
                    addAlert("<strong class='safe'>未來可能確診人數未達10%</strong>");
                    addAlert("<strong class='safe'>預測最近比較安全</strong>");
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
    
            var chart = new google.visualization.LineChart(document.getElementById('chart'));
            chart.draw(dataTable, options);

        break;
        case "new_deceased":
            var country = document.getElementById("country").value;

            var dataTable = new google.visualization.DataTable();
            
            dataTable.addColumn("date", "Date");
            dataTable.addColumn("number", "New Deceased");
            
            var request = await BigQuery.request("SELECT date, new_deceased FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 and country_name = '" + country +"' and date >= Date(2021, 1, 1);");
            var arr = [];
            var total = 0;
            var data = [];
            for(var i in request.result.rows){
                arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v)]);
                if(request.result.rows[i].f[1].v != null){
                    total += parseInt(request.result.rows[i].f[1].v);
                    data.push(parseInt(request.result.rows[i].f[1].v));
                }
            }
            data.sort();
            var mid = data[parseInt(data.length/2)];
            var avg = Math.round(total/request.result.totalRows*100)/100;

            addAlert("最近新增死亡人數平均： " + avg);
            addAlert("最近新增死亡人數中位數： " + mid);
            if(mid <= avg){
                addAlert("<strong class='safe'>比較安全</strong>");
            }
            else{
                addAlert("<strong class='danger'>比較危險</strong>");
            }

            dataTable.addRows(arr);
        
            var options = {
                title: '新增死亡人數',
                legend: { position: 'bottom' },
                animation: {  //載入動畫
                    startup: true,
                    duration: 1000,
                    easing: 'out',
                },
                series: {
                    0: { color: 'red' },
                }
            };
    
            var chart = new google.visualization.LineChart(document.getElementById('chart'));
            chart.draw(dataTable, options);

        break;
        case "new_confirmed":
            var country = document.getElementById("country").value;

            var dataTable = new google.visualization.DataTable();
            
            dataTable.addColumn("date", "Date");
            dataTable.addColumn("number", "New Confirmed");
            
            var request = await BigQuery.request("SELECT date, new_confirmed FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 and country_name = '" + country +"' and date >= Date(2021, 1, 1);");
            var arr = [];
            var total = 0;
            var data = [];
            for(var i in request.result.rows){
                arr.push([new Date(request.result.rows[i].f[0].v), parseInt(request.result.rows[i].f[1].v)]);
                if(request.result.rows[i].f[1].v != null){
                    total += parseInt(request.result.rows[i].f[1].v);
                    data.push(parseInt(request.result.rows[i].f[1].v));
                }
            }
            data.sort();
            var mid = data[parseInt(data.length/2)];
            var avg = Math.round(total/request.result.totalRows*100)/100;

            addAlert("最近新增確診人數平均： " + avg);
            addAlert("最近新增確診人數中位數： " + mid);
            if(mid <= avg){
                addAlert("<strong class='safe'>比較安全</strong>");
            }
            else{
                addAlert("<strong class='danger'>比較危險</strong>");
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
                addAlert("<strong class='danger'>很危險</strong>")
            }
            else{
                addAlert("你要去的區域的累積確診人數在確診人數在30名以外！")
                addAlert("<strong class='safe'>比較安全</strong>")
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