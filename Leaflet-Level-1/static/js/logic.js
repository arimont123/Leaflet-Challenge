// Creating map object
var myMap = L.map("map", {
    center: [39.93, -98.54],
    zoom: 4
});

// Adding tile layer
L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
}).addTo(myMap);

//Create function that makes the marker size proportional to magnitude of earthquake 
function markerSize(mag){
    return mag * 40000;
};

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url, function(data){
    //Store all of the magnitudes in an empty list
    var mags = []
    for(var i = 0; i < data.metadata.count; i++){
        mags.push(data.features[i].properties.mag)
    };
    
    //Find min and max magnitude from data
    min_mag = mags.reduce((a,b) => Math.min(a,b));
    //Get rid of magnitudes that are less than zero 
    if(min_mag < 0){
        min_mag = 0;
    }
    max_mag = mags.reduce((a,b) => Math.max(a,b));
    
    //Create width of each color on legend
    colors = (max_mag-min_mag)/6
    
    col1 = min_mag+colors*1;
    col2 = min_mag+colors*2;
    col3 = min_mag+colors*3;
    col4 = min_mag+colors*4;
    col5 = min_mag+colors*5;
    col6 = min_mag+colors*6;
});

d3.json(url, function(data){
    //Find the time the data was updated
    var last_updated = data.metadata.generated
    date_time = new Date(last_updated)
    update_date = date_time.toLocaleDateString('en-US')
    update_time = date_time.toLocaleTimeString('en-US')
    
    //Loop through data to find necessary items
    for(var i = 0; i < data.metadata.count; i++){
        //Find magnitude of each item in dataset
        var mag = data.features[i].properties.mag
        
        //Assign color based on magnitude
        var color = "";
        if(mag < col1){
            var color = "#228B22";
        }else if (mag < col2){
            var color = "#8FBC8F";
        }else if (mag < col3){
            var color = "#FFD700";
        }else if (mag < col4){
            var color = "#FFA500";
        }else if (mag < col5){
            var color = "#FF8C00";
        }else{
            var color = "#FF0000";
        }
        
        //Find location of each item
        var lat = data.features[i].geometry.coordinates[1]
        var long = data.features[i].geometry.coordinates[0]
        var loc = [lat,long]
        var place = data.features[i].properties.place
        
        //Time each earthquake took place
        var time = data.features[i].properties.time
        var date = new Date(time)
        //split up date into date and time 
        var only_date = date.toLocaleDateString('en-US')
        var only_time = date.toLocaleTimeString('en-US')
        
        //Create circle data points with a fill color and radius proportional to the magnitude of earthquake
        L.circle(loc, {
            stroke:true,
            color: "gray",
            width:0.1,
            fillColor:color,
            fillOpacity: 0.80,
            radius: markerSize(mag)
        }).bindPopup("<h2>Magnitude: </h2>" + mag+ "<hr><b>Place: </b>" + place + "<br><b>Date: </b>"+only_date + "<br><b>Time: </b>" + only_time).addTo(myMap);
   
       //Update legend based on new time refreshed
       legendUpdate(date_time);
    }
});
//Position legend in bottom right       
var legend = L.control({
    position: "bottomright"
});

//When the control is added insert a new div with a class name of legend
legend.onAdd = function(){
    var div = L.DomUtil.create("div","legend");
    return div;
};

//Add the legend to my map 
legend.addTo(myMap);

//Displays data on legend
function legendUpdate(time) {
    document.querySelector(".legend").innerHTML = [
        "<p><b>Plot Updated: </b> <br>" + update_date +"<br>"+ update_time + "</p><hr>",
        "<p class='one'>" + "&#9632;" +"</p><p id='in-line'>" + "0-" + Math.round(col1) + "</p><br>",
        "<p class='two'>" + "&#9632;" +"</p><p id='in-line'>" + Math.round(col1) + "-" + Math.round(col2) + "</p><br>",
        "<p class='three'>"+"&#9632;" + "</p><p id='in-line'>" + Math.round(col2) + "-" + Math.round(col3) + "</p><br>",
        "<p class='four'>" + "&#9632;" +"</p><p id='in-line'>" + Math.round(col3) + "-" + Math.round(col4) + "</p><br>",
        "<p class='five'>" + "&#9632;" +"</p><p id='in-line'>" + Math.round(col4) + "-" + Math.round(col5) + "</p><br>",
        "<p class='six'>" + "&#9632;" +"</p><p id='in-line'>" + "> " + Math.round(col5) + "</p>"
    ].join("");
}  
