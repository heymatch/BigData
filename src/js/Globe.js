var Globe = {
    init(){
        var projection = d3.geoOrthographic()
                            .translate([280, 300]);
        var path = d3.geoPath().projection(projection);

        var svg = d3.select("#globe");

        var ground = svg.append("g");
        d3.json("https://heymatch.github.io/BigData/data/world-110m.json").then(function(topology) {
            ground.selectAll("path")
            .data(topojson.feature(topology, topology.objects.countries).features)
            .enter()
            .append("path")
            .attr("class", "land")
            .attr("value", topology.objects.countries)
            .attr("d", path);
        });
        ground.append("path")
        .datum({type: "Sphere"})
        .attr("class", "water")
        .attr("d", path);
        
        svg
        .call(d3.drag().on('drag', function(event, d){
            const rotate = projection.rotate();
            const k = 58 / projection.scale();
            projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k,
            rotate[2]
            ]);
            svg.selectAll("path.land").attr("d", path);
        }));
    }
}
