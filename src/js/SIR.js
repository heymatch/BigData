// https://github.com/petrosDemetrakopoulos/SIR.js/blob/master/index.js

var solution = [];
var beta = 0.35;
var gamma = 0.1;
var n = 1;
var i = 0;
var pre_request;

async function precraw(){
    $("#select").attr("disabled");
    var country = document.getElementById("country").value;
    pre_request = await BigQuery.request(
        "SELECT \
        population, \
        AVG((population - cumulative_confirmed - cumulative_recovered - cumulative_deceased)) as S, \
        AVG(cumulative_confirmed) as I, \
        AVG(cumulative_recovered) as R  \
        FROM `bigdata-301014.Domographics.population` INNER JOIN `bigquery-public-data.covid19_open_data.covid19_open_data` \
        ON location_key = key \
        WHERE LENGTH(location_key) = 2 and country_name = '" + country + "' \
        GROUP BY population \
        LIMIT 10");
    $("#select").removeAttr("disabled");
}

async function SIR_simulation(select, country){
    var SIRsimr;
    var config;

    switch(select){
        case "constant":
            config = {
                S0: parseFloat(pre_request.result.rows[0].f[0].v),
                I0: 1,
                R0: 0,
                t: 0.15,
                N: 100,
                beta: 0.8,
                gamma: 0.25
            };
        break;
        default:
            console.error("simulation error");
    }
    SIRsimr = SIR(config);
    return SIRsimr;
}

function SIR(options){
    solution = [];
    var dt = options.t, t0 = 0;
    n = options.S0 + options.I0 + options.R0;
    beta = options.beta;
    gamma = options.gamma;

    var y0 = [options.S0, options.I0, options.R0];

    var integrator = new RungeKutta4(SIRmodel, t0, y0, dt);
    integrator.steps(options.N);

    return solution;
}

var SIRmodel = function (t, y) {
    //the differential equation
    var dydt = [];
    var S = y[0], I = y[1], R = y[2];

    var dS_dt = -(beta * S * I) / n;
    var dI_dt = (beta * S * I) / n - (gamma * I);
    var dR_dt = gamma * I;

    solution.push({S: S, I: I, R: R});
    dydt[0] = dS_dt;
    dydt[1] = dI_dt;
    dydt[2] = dR_dt;
    i++;
    return dydt;
};