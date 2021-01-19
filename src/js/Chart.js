var select_type = "cumulative_confirmed";

google.charts.load('current', {'packages':['corechart']});

async function displayChart(select){
    switch(select){
        case "cumulative_confirmed":
            var country = document.getElementById("country").value;

            var dataTable = new google.visualization.DataTable();
            
            dataTable.addColumn("date", "Date");
            dataTable.addColumn("number", "Cumulative Confirmed");
            
            var request = await BigQuery.request("SELECT date, cumulative_confirmed FROM bigquery-public-data.covid19_open_data.covid19_open_data WHERE LENGTH(location_key) = 2 and country_name = '" + country +"';");
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
                hAxis: {
                    gridlines:{
                        interval: [7]
                    }
                },
            };
    
            var chart = new google.visualization.LineChart(document.getElementById('chart'));
    
            chart.draw(dataTable, options);
            break;
            case "growth_rate_confirmed":
                var country = document.getElementById("country").value;
    
                var dataTable = new google.visualization.DataTable();
                
                dataTable.addColumn("date", "Date");
                dataTable.addColumn("number", "Growth Rate Confirmed");
                
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
                    hAxis: {
                        gridlines:{
                            interval: [7]
                        }
                    },
                };
        
                var chart = new google.visualization.LineChart(document.getElementById('chart'));
        
                chart.draw(dataTable, options);
                break;
    }
}