import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'

document.addEventListener("DOMContentLoaded", setup)

function setup(){
    const spaceX = new SpaceX();
    spaceX.launches().then(data=>{
        const listContainer = document.getElementById("listContainer")
        renderLaunches(data, listContainer);

    }) 
    
    spaceX.launchpads().then(padData => {
        drawMap(padData);
        attachHoverEvents(padData);  
    });
}

function renderLaunches(launches, container){
    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = document.createElement("li");
        item.innerHTML = launch.name;

        item.setAttribute('data-launchpad-id', launch.launchpad);

        item.addEventListener('mouseover', () => highlightLaunchpad(launch.launchpad));
        item.addEventListener('mouseout', () => removeHighlight());

        list.appendChild(item);
    })
    container.replaceChildren(list);
}


let colorScale = d3.scaleSequential()
    .interpolator(d3.interpolateViridis) 
    .domain([0, 100]);

function drawMap(padData){
    const width = 640;
    const height = 580;
    const margin = {top: 20, right: 10, bottom: 40, left: 100};
    const svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    const projection = d3.geoMercator()
        .scale(100)
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2]);
    
    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("fill", function (d) {
            return colorScale(25);
        })
        .style("opacity", .7)
    
    svg.append("g")
        .selectAll(".launch-point") 
        .data(padData) 
        .enter()
        .append("circle") 
        .attr("class", "launch-point")
        .attr("cx", d => projection([d.longitude, d.latitude])[0]) 
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", 5) 
        .attr("id", (d, i) => `launch-point-${i}`)
        .attr("fill", "red") 
        .style("opacity",.7)
        
}



function highlightLaunchpad(launchpadId) {
    d3.selectAll('.launch-point')
        .attr('fill', function (d) {
            return d.id === launchpadId ? 'green' : 'red'; 
        });
}

function removeHighlight() {
    d3.selectAll('.launch-point')
        .attr("fill", "red") 
}

function attachHoverEvents(padData) {
    const listItems = document.querySelectorAll('li');

    listItems.forEach(item => {
        item.addEventListener('mouseover', () => {
            const launchpadId = item.getAttribute('id');
            highlightLaunchpad(launchpadId);
        });

        item.addEventListener('mouseout', removeHighlight);
    });
}









