var NodeHelper = require("node_helper");
var request = require('request');
var d3 = require('d3');
var jsdom;
try {
    jsdom = require("jsdom/lib/old-api.js");
} catch (e) {
    jsdom = require("jsdom");
}
module.exports = NodeHelper.create({

    start: function () {
        console.log("Starting module(nh):" + this.name);
    },

    socketNotificationReceived: function (type, url) {
        if (type === "WEATHER") {
            this.getWeatherInformation(url, null);
        }
    },
    getWeatherInformation: function (api_url, callback) {
        var currentTime = Math.floor((new Date()).getTime() / 1000);
        api_url = api_url + "," + currentTime;
        console.log(api_url);
        var self = this;
        request(
            {
                method: 'GET'
                , uri: api_url
            }
            , function (error, response, body) {
                var parsed = JSON.parse(body);
                var hourly = parsed['hourly'];
                var summary = hourly['summary'];

                var temp = Math.round(parsed['currently']['temperature']);
                var precipitation = Math.round(parsed['currently']['precipIntensity']);
                var dewPt = Math.round(parsed['currently']['dewPoint']);
                var wind = Math.round(parsed['currently']['windSpeed']);
                var windDirection = Math.round(parsed['currently']['windBearing']);
                var pressure = Math.round(parsed['currently']['pressure']);
                var humidity = Math.round(100 * parsed['currently']['humidity']);
                var ozone = Math.round(parsed['currently']['ozone']);
                var visibility = Math.round(parsed['currently']['visibility']);

                var hourlyTemperature = [];
                var hourlySummaries = [];
                var hour = 0;
                var maxTemp = -1000;
                var maxTempHr = "";
                var minTemp = 1000;
                var minTempHr = "";
                hourly['data'].forEach(function (d) {

                    var tmp = {"hour": hour, "temperature": Math.round(d.temperature)};
                    if (d.temperature > maxTemp) {
                        maxTemp = Math.round(d.temperature);
                        maxTempHr = hour;
                    }
                    if (d.temperature < minTemp) {
                        minTemp = Math.round(d.temperature);
                        minTempHr = hour;
                    }
                    hourlyTemperature.push(tmp);
                    var tmp = {"hour": hour, "summary": d.summary};
                    hourlySummaries.push(tmp);
                    hour++;
                });
                var startDay = parsed["hourly"]["data"][0]["time"];
                var sunriseTime = parsed["daily"]["data"][0]["sunriseTime"] - startDay;
                var sunsetTime = parsed["daily"]["data"][0]["sunsetTime"] - startDay;

                sunriseTime = Math.round(sunriseTime / 36);
                sunsetTime = Math.round(sunsetTime / 36);

                sunriseHr = Math.floor(sunriseTime / 100);
                sunriseMt = Math.round((sunriseTime % 100) * 60 / 100);
                if (sunriseMt < 10) {
                    sunriseMt = "0" + sunriseMt;
                }

                sunsetHr = Math.floor(sunsetTime / 100) - 12;
                sunsetMt = Math.round((sunsetTime % 100) * 60 / 100);
                if (sunsetMt < 10) {
                    sunsetMt = "0" + sunsetMt;
                }

                sunriseTime = sunriseHr + ":" + sunriseMt + "am";
                sunsetTime = sunsetHr + ":" + sunsetMt + "pm";

                console.log(summary);
                console.log(hourlyTemperature);
                console.log(hourlySummaries);
                console.log(maxTemp + " " + maxTempHr);
                console.log(minTemp + " " + minTempHr);
                console.log(sunriseTime);
                console.log(sunsetTime);
                var info = {
                    "Temp:": temp + "°",
                    "Wind:": wind + " mph",
                    "Humidity:": humidity + "%",
                    "Ozone:": ozone,
                    "Precip:": precipitation + "%",
                    "Pressure:": pressure + " mb",
                    "DewPt:": dewPt + "°",
                    "Visibility:": visibility + " mi"
                };

                function process24hour(input) {
                    var tmp = input / 12;
                    var am = "am";
                    if (tmp >= 1) {
                        am = "pm";
                    }
                    var tmp = input % 12;
                    var time = tmp;
                    if (tmp == 0) {
                        time = 12;
                    }
                    return time + am;
                }

                var info2 = {
                    "max": maxTemp + "°",
                    "maxHr": process24hour(maxTempHr),
                    "min": minTemp + "°",
                    "minHr": process24hour(minTempHr),
                    "sunrise": sunriseTime,
                    "sunset": sunsetTime
                };
                self.getWeatherGraph(hourlyTemperature, info, summary, info2, hourlySummaries);

            }
        );
    },

    getWeatherGraph: function (hourlyTemps, info, summary, info2, hourlySummaries) {
        var self = this;
        jsdom.env({
            html: '',
            features: {QuerySelector: true},
            done: function (errors, window) {

                window.d3 = d3.select(window.document);
                var svg_html = self.generateWeatherGraph(window, hourlyTemps);

                window.d3.select('body').html('');
                var summary_bar = self.generateSummaryBar(window, hourlySummaries);

                var info_html = "<div id='information'>";
                for (var k in info) {
                    if (info.hasOwnProperty(k)) {
                        console.log(k + "\t" + info[k]);
                        info_html += "<div class='info'>" + k + " " + info[k] + "</div>";
                    }
                }
                info_html += "</div>";


                var arrow_icon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 31.49 31.49" style="enable-background:new 0 0 31.49 31.49;" xml:space="preserve" width="35px" height="20px"><path d="M21.205,5.007c-0.429-0.444-1.143-0.444-1.587,0c-0.429,0.429-0.429,1.143,0,1.571l8.047,8.047H1.111  C0.492,14.626,0,15.118,0,15.737c0,0.619,0.492,1.127,1.111,1.127h26.554l-8.047,8.032c-0.429,0.444-0.429,1.159,0,1.587  c0.444,0.444,1.159,0.444,1.587,0l9.952-9.952c0.444-0.429,0.444-1.143,0-1.571L21.205,5.007z" fill="#FFFFFF"/></svg>';
                var info_html2 = "<div id='information2'>";
                info_html2 += "<div class='info_big'>" + info2["min"] + "<span class='small bright'>" + info2["minHr"] + "</span>" + arrow_icon
                    + info2["max"] + "<span class='small bright'> " + info2["maxHr"] + "</span>" + "</div>";
                info_html2 += "<div class='info'>" +
                    "<span class='wi weathericon wi-sunrise'></span> "
                    + info2["sunrise"] + "</div>";
                info_html2 += "<div class='info'>" +
                    "<span class='wi weathericon wi-sunset'></span> "
                    + info2["sunset"] + "</div>";
                info_html2 += "</div>";


                self.sendSocketNotification("WEATHER",
                    [{"html": summary, class_name: "thin large bright"}
                        , {"html": info_html2, class_name: "thin medium bright"}
                        , {"html": summary_bar, class_name: "thin large bright"}
                        , {"html": info_html, class_name: "small bright"}
                        , {"html": "<br><br><br><br>", class_name: "small bright"}
                        , {"html": "Temperature", class_name: "temp_graph_heading"}
                        , {"html": svg_html, class_name: "thin large bright"}]
                );

            }
        });
    },

    generateSummaryBar: function (window, hourlySummaries) {
        var margin = {top: 10, right: 10, bottom: 30, left: 25},
            width = 900 - margin.left - margin.right,
            height = 100 - margin.top - margin.bottom;

        var svg = window.d3.select("body").append("svg")
            .attr("class", "temp_graph")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        var xScale = d3.scaleLinear()
            .domain([0, 23])
            .range([0, width]);
        var xAxis = d3.axisBottom(xScale).ticks(24).tickFormat(function (d, i) {
            if (d % 2 == 1) {
                return "";
            }
            var tmp = d / 12;
            if (d == 0) {
                d = 12;
            }
            if (tmp < 1) {
                return d + "am";
            } else if (tmp === 1) {
                return "12pm";
            } else {
                return (d % 12) + "pm";
            }
        });
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        hourlySummaries.forEach(function (d) {
            if (d.hour < 23) {

                var x1 = xScale(d.hour);
                var x2 = xScale(d.hour + 1);
                var rect = svg.append("rect").attr("x", x1).attr("y", 15).attr("width", x2 - x1).attr("height", 40);
                if(d.summary === "Mostly Cloudy" || d.summary==="Overcast") {
                    rect.attr("fill", "#b6bfcb");
                }else if(d.summary ==="Partly Cloudy"){
                    rect.attr("fill", "#d5dae2");
                }else if(d.summary === "Clear"){
                    rect.attr("fill", "#EEEEF5");
                }else if(d.summary === "Light Rain" || d.summary==="Drizzle"){
                    rect.attr("fill", "#80a5d6");
                }else if(d.summary === "Rain"){
                    rect.attr("fill", "#4a80c7");
                }else if(d.summary === "Heavy Rain"){
                    rect.attr("fill", "#3267ad")
                }
            }
        });

        return window.d3.select('body').html();

    },
    generateWeatherGraph: function (window, hourlyTemps) {
        var margin = {top: 10, right: 10, bottom: 30, left: 25},
            width = 900 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        var svg = window.d3.select("body").append("svg")
            .attr("class", "temp_graph")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // X and Y Axis

        var minTemp = d3.min(hourlyTemps, function (d) {
            return d.temperature;
        });
        var maxTemp = d3.max(hourlyTemps, function (d) {
            return d.temperature;
        });
        _minTemp = (Math.floor(minTemp / 10)) * 10;
        _maxTemp = (Math.ceil(maxTemp / 10)) * 10;
        minTemp = (minTemp === _minTemp ? _minTemp - 10 : _minTemp);
        maxTemp = (maxTemp === _maxTemp ? _maxTemp + 10 : _maxTemp);
        var xScale = d3.scaleLinear()
            .domain([0, 23])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([minTemp, maxTemp])
            .range([height, 0]);


        var xAxis = d3.axisBottom(xScale).ticks(24).tickFormat(function (d, i) {
            if (d % 2 == 1) {
                return "";
            }
            var tmp = d / 12;
            if (d == 0) {
                d = 12;
            }
            if (tmp < 1) {
                return d + "am";
            } else if (tmp === 1) {
                return "12pm";
            } else {
                return (d % 12) + "pm";
            }
        });
        var yAxis = d3.axisLeft(yScale).ticks(4).tickSize(-width).tickFormat(function (d, i) {
            return d + "°";
        });

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .call(yAxis);


        // Line Graph

        svg.selectAll("circle")
            .data(hourlyTemps)
            .enter()
            .append("circle")
            .attr("class", "temp_point")
            .attr("cx", function (d) {
                return xScale(d.hour);
            })
            .attr("cy", function (d) {
                return yScale(d.temperature);
            })
            .attr("r", 5);

        var valueline = d3.line()
            .x(function (d) {
                return xScale(d.hour);
            })
            .y(function (d) {
                return yScale(d.temperature);
            });


        svg.append("path")
            .data([hourlyTemps])
            .attr("class", "temp_line")
            .attr("d", valueline);

        return window.d3.select('body').html();
    }


});

