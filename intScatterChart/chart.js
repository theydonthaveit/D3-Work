var w = 800;
var h = 450;
var margin = {
	top: 60,
	bottom: 80,
	left: 80,
	right: 80
};

var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
	.attr("id", "chart")
	.attr("width", w)
	.attr("height", h);

var chart = svg.append("g")
		.classed("display", true)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//create scales
var colorScale = d3.scale.category10();
var x = d3.scale.linear()
            .domain(d3.extent(data, function(d) {
              return d.age;
            }))
            .range([0, width]);
var y = d3.scale.linear()
          .domain([1, 5])
          .range([height, 0]);
var responseScale = d3.scale.linear()
		.domain(d3.extent(data, function(d) {
			return d.responses;
		}))
		.range([2, 12]);

//tickvalues
var tickValues = [18, 25, 32, 39, 46, 53, 60, 67, 74];

//declare Axis
var xAxis = d3.svg.axis()
		.scale(x)
		.tickValues(tickValues)
		.orient("bottom");
		
var yAxis = d3.svg.axis()
		.scale(y)
		.ticks(5)
		.tickSize(20)
		.tickFormat(function(d) {
			return d.toFixed(1);
		})
		.orient("left");

//declare GridLines
var xGridLines = d3.svg.axis()
		.scale(x)
		.tickValues(tickValues)
		.tickSize(-height, -height)
		.tickFormat("")
		.orient("bottom");
		
var yGridLines = d3.svg.axis()
		.scale(y)
		.tickSize(-width, 0, 0)
		.tickFormat("")
		.orient("left");

//function to draw Axis
function drawAxis(params) {
	if(params.initialize) {
		//gridlines
		this.append("g")
			.classed("gridline x", true)
			.attr("transform", "translate(0, " + height + ")")
			.call(params.axis.gridlines.x);
		this.append("g")
			.classed("gridline y", true)
			.attr("transform", "translate(0, 0)")
			.call(params.axis.gridlines.y);
	
		//Axis
		this.append("g")
			.classed("axis x", true)
			.attr("transform", "translate(0, " + height + ")")
			.call(params.axis.x);
		this.append("g")
			.classed("axis y", true)
			.attr("transform", "translate(0, 0)")
			.call(params.axis.y);
	
		this.select(".y.axis")
			.append("text")
			.classed("y axis-label", true)
			.attr("transform", "translate(" + -56 + ", " + height/2 + ") rotate(-90)")
			.text("Rating (1 = Low, 5 = High)");
	
		this.select(".x.axis")
			.append("text")
			.classed("x axis-label", true)
			.attr("transform", "translate(" + width/2 + ", " + 48 + ")")
			.text("Customer Age");
	
		this.append("g")
			.append("text")
			.classed("chart-header", true)
			.attr("transform", "translate(0, -24)")
			.text("");
	}
}

//the plot function which details how the chart will be plotted on the web
function plot(params) {
	drawAxis.call(this, params);

	var self = this;

	var donuts = d3.keys(params.data[0]).filter(function(d) {
		return d !== "age" && d !== "responses";
	});

//setting a group for donuts
	//enter the groups
	this.selectAll(".donut")
		.data(donuts)
		.enter()
			.append("g")
			.attr("class", function(d) {
				return d;
			})
			.classed("donut", true);

		//updating the groups
		this.selectAll(".donut")
				.style("fill", function(d, i) {
					return colorScale(i);
				})
				.on("mouseover", function(d, i) {
					d3.select(this)
						.transition()
						.style("opacity", 1)
				})
				.on("mouseout", function(d, i) {
					d3.select(this)
						.transition()
						.style("opacity", 0.2)
				});

	//data plotting
	donuts.forEach(function(donut) {
		var g = self.selectAll("g."+donut);
		var arr = params.data.map(function(d) {
			return {
				key: donut,
				value: d[donut],
				age: d.age,
				responses: d.responses
			};
		});

		//enter()
		g.selectAll(".response")
			.data(arr)
			.enter()
				.append("circle")
				.classed("response", true);

		//update()
		g.selectAll(".response")
			.attr("r", function(d) {
				return responseScale(d.responses);
			})
			.attr("cx", function(d) {
				return x(d.age);
			})
			.attr("cy", function(d) {
				return y(d.value);
			})
			.on("mouseover", function(d, i) {
				var str = d.key + " Dount: ";
				str += "Age: " + d.age + " ";
				str += "Reponses: " + d.responses + " ";
				str += "Average Rating: " + d.value;
				d3.select(".chart-header").text(str);
			})
			.on("mouseout", function(d, i) {
				d3.select(".chart-header").text("");
			})

		//exit()
		g.selectAll(".response")
			.data(arr)
			.exit()
			.remove();
	});
}

plot.call(chart, {
  data: data,
	axis: {
		x: xAxis,
		y: yAxis,
			gridlines: {
				x: xGridLines,
				y: yGridLines
			}
		},
	initialize: true
})
