class Globe{
    constructor() {
        var projection = d3.geoOrthographic()
                        .translate([280, 300]);
        var path = d3.geoPath().projection(projection);
        var svg = d3.select("svg");
        var g = svg.append("g");
        d3.json("https://gist.githubusercontent.com/mbostock/4090846/raw/07e73f3c2d21558489604a0bc434b3a5cf41a867/world-110m.json").then(function(topology) {
            g.selectAll("path")
            .data(topojson.feature(topology, topology.objects.countries).features)
            .enter().append("path")
            .attr("d", path);
        });
        svg
        .call(d3.drag().on('drag', function(event, d){
          const rotate = projection.rotate();
          const k = 58 / projection.scale();
          projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k,
            rotate[2]
          ]);
          svg.selectAll("path").attr("d", path);
        }));
    }
}