// The following were helpful resources used to write this code.
// https://www.elated.com/creating-a-javascript-clock/
// https://medium.com/hackernoon/a-simple-pie-chart-in-svg-dbdd653b6936
// https://css-tricks.com/building-progress-ring-quickly/
// https://jasonwatmore.com/post/2021/10/02/vanilla-js-create-an-array-with-a-range-of-numbers-in-a-javascript
//
var date, hours, minutes, seconds, timeOfDay;
var mi, mihour, miminute;
const svgns = "http://www.w3.org/2000/svg";

function removeElements(container, selector) {
    var elements = container.querySelectorAll(selector);
    for (var i = 0; i < elements .length; i++) {
        elements[i].remove();
    }
}

function getStandardTime(forcehours, forceminutes) {
    var hours, minutes, seconds, timeOfDay;
    if (forcehours > -1 || forceminutes > -1) { 
        if (forcehours > -1) { hours = forcehours; } 
        if (forceminutes > -1 ) { minutes = forceminutes; } 
        seconds = 0; 
    } else {  
        date = new Date();
        hours = date.getHours();
        minutes = date.getMinutes();
        seconds = date.getSeconds();
    }
    timeOfDay = (hours < 12) ? "am" : "pm";
    return [hours, minutes, seconds, timeOfDay];
}

function displayStandardTime(timeid, hours, minutes, seconds, timeOfDay) {
    timeid = "#" + timeid;
    // Convert the hours component to 12-hour format if needed
    var displayHours = (hours > 12) ? hours - 12 : hours;

    // Convert an hours component of "0" to "12"
    displayHours = (displayHours == 0) ? 12 : displayHours;

    // pad with leading zeros
    var displayMinutes = (minutes < 10 ? "0" : "") + minutes;
    var displaySeconds = (seconds < 10 ? "0" : "") + seconds;

    // Compose the string for display
    var currentTimeString = displayHours + ":" + displayMinutes + ":" + displaySeconds + " " + timeOfDay;

    // Update the time display
    document.querySelector(timeid).innerHTML = currentTimeString;
}

function getMitime(hours, minutes, micount, misize, miminutecount, mistart) {
    var mi, mihour, miminute; 
    var midayhours = micount * misize;
    var elapsedhours = hours - mistart;
    if (elapsedhours < 0 || hours >= (mistart + (micount * misize))) {
        // in zero mitime
        [mi, mihour, miminute] = [0, 0, 0];
    } else {
        var futurehours = midayhours - elapsedhours;
        mi = Math.ceil(futurehours / misize);

        if (futurehours < misize) {
            mihour = futurehours;
        } else if (futurehours % misize) {
            mihour = futurehours % misize;
        } else {
            mihour = misize;
        }

        var futureminutes = 60 - minutes;
        var minutechunk = 60 / miminutecount;
        miminute = Math.ceil(futureminutes / minutechunk);
    }
    return [mi, mihour, miminute];
}

function displayMitime(mitimeid, mi, mihour, miminute) {
	mitimeid = "#" + mitimeid;
    // Compose the string for display
    var currentTimeString = mi+ "." + mihour + "." + miminute + " sm";

    // Update the time display
    document.querySelector(mitimeid).innerHTML = currentTimeString;
}

function setMeter(withinElem, steps, linehalflen, lineClass) {
    var container = document.querySelector(withinElem);

    removeElements(container, 'line.' + lineClass);

    var circle = container.getElementsByTagName('circle')[0];
    var radius = circle.r.baseVal.value;

    var steppct = 1/steps;
    // add new lines
    for (var i = 0; i < steps; i++) {
        var percent = steppct * (i + 1);
        var endX = Math.cos(2 * Math.PI * percent);
        var endY = Math.sin(2 * Math.PI * percent);
        var x1 = endX * (radius - linehalflen);
        var y1 = endY * (radius - linehalflen);
        var x2 = endX * (radius + linehalflen); 
        var y2 = endY * (radius + linehalflen);
        var line = document.createElementNS(svgns, 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', lineClass);
        container.appendChild(line);
    }
}

function addTextLabels(withinElem, count, maxvalue, sweep, scalefactor, showlabels) {
   var container = document.querySelector(withinElem);
   
   var circle = container.getElementsByTagName('circle')[0];
   var radius = circle.r.baseVal.value;
   var textRadius = radius * scalefactor;
   var steppct = (1 / count); 
    
   for (var i = 0; i < count; i++) {
      var offsetvalue = i + 1; 
       var percent = steppct * offsetvalue;
       percent = percent - (steppct / 2); // put in center of space, not at tick	  
       
       var x = Math.cos(2 * Math.PI * percent); 
       var y = Math.sin(2 * Math.PI * percent);  
       
       x = x * textRadius;
       y = y * textRadius;
       
       var text = document.createElementNS(svgns, 'text');
       // default show/hide behavior
       if (!showlabels) { text.setAttribute('class', 'hide'); }
       text.setAttribute('x', x);
       text.setAttribute('y', y);
       text.setAttribute('text-anchor', "middle");
       text.setAttribute('dominant-baseline', "central");
       text.setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(90, ' + x + ',' + y + ')');
      
       // translate count to display label
       var textlabel;
       // account for changes in sweep
       if (sweep) {
      		textlabel = maxvalue - i % maxvalue;
    	} else {
            textlabel = i % maxvalue + 1;
		}

       text.innerHTML = textlabel;
       container.appendChild(text);		
   }
}

function drawArc(withinElem, percent, pathclass, sweep) {
    var container = document.querySelector(withinElem);

    removeElements(container, 'path.' + pathclass);

    var circle = container.getElementsByTagName('circle')[0];
    var radius = circle.r.baseVal.value;

    // if the slice is more than 50%, take the large arc (the long way around)
    var largeArcFlag = percent > 0.5 ? 1 : 0;
    
    // largest circle radius is 1, so radius is used to directly scale x, y coordinates below.
    if (!sweep) { percent = Math.abs(percent - 0.99999); }
    var endX = Math.cos(2 * Math.PI * percent);
    var endY = Math.sin(2 * Math.PI * percent);

    // 	rx,ry, x-axis-rotation,large-arc-flag,sweepflag, x,y
    var arcdata = [
        `M ${radius} 0`, // Move
        `A ${radius} ${radius} 0 ${largeArcFlag} ${sweep} ${endX*radius} ${endY*radius}`, // Arc
        `L 0 0`, // Line
    ].join(' ');

    var arc = document.createElementNS(svgns, 'path');
    arc.setAttribute('d', arcdata);
    arc.setAttribute('class', pathclass);
    container.appendChild(arc);
}

function toggleZeroStyles(mi) {
    var zeroclass = 'up';
    if (mi == 0 ) {
        zeroclass = 'down';
    }
    var body = document.getElementsByTagName("body")[0];
    if (body) {
        body.setAttribute('class', zeroclass);
    }  
}

function displayMitimer(misvgid, mi, micount, misize, miminutecount, mistart, hours, minutes, sweep, showlabels, visiblelabels) {
    misvgid = "#" + misvgid;
    var container = document.querySelector(misvgid);
   
    var zeroclass = 'up';
    if (mi == 0 ) {
        zeroclass = 'down';
        removeElements(container, 'path');
        removeElements(container, 'line');
    } else {
        var midayhours = 0;
        
        if (micount && !!misize) {
        	var mipercent = mi / micount;
            drawArc(misvgid + ' .miface', mipercent, 'current', sweep);
            var mielapsed = mi - 1;
            if (mielapsed) {
              	var mielapsedpercent = mielapsed / micount;
            	drawArc(misvgid + ' .miface', mielapsedpercent, 'elapsed', sweep);
            }
            if (visiblelabels.indexOf('m') > -1) {
                addTextLabels (misvgid + ' .miface', micount, micount, sweep, 0.60, showlabels)
            }
        }
        
        if (misize) {
            // MIHOUR FACE
            var elapsedhours = hours - mistart;
            elapsedhours = Math.max(0, elapsedhours)
            var currenthours = elapsedhours + 1;
            midayhours = micount * misize;
            var mihourpercent = currenthours / midayhours;
            drawArc(misvgid + ' .mihourface', mihourpercent, 'current', sweep);
            var mihourpctelapsed = elapsedhours / midayhours;
            drawArc(misvgid + ' .mihourface', mihourpctelapsed, 'elapsed', sweep);
            if (visiblelabels.indexOf('h') > -1) {
                addTextLabels (misvgid + ' .mihourface', midayhours, misize, sweep, 0.32, showlabels);
            }
        }
    
        if (miminutecount) {
            // MIMINUTE FACE
            // add 1 to minutes to account for the fact that 
            // standard minutes are 0 indexed and minutes are 1 indexed
            var minnormal = minutes + 1;
            var minutechunk = 60 / miminutecount;
            var currmiminute = Math.ceil(minnormal / minutechunk);
            var miminutepercent = currmiminute / miminutecount;
            if (sweep) {
                if (minnormal < minutechunk) {
                    currmiminute = 1;
                }
            }
            drawArc(misvgid + ' .miminuteface', miminutepercent, 'current', sweep);
            var miminutepctelapsed = (currmiminute - 1) / miminutecount;
            drawArc(misvgid + ' .miminuteface', miminutepctelapsed, 'elapsed', sweep);
            if (visiblelabels.indexOf('n') > -1) {
                addTextLabels (misvgid + ' .miminuteface', miminutecount, miminutecount, sweep, 0.15, showlabels)
            }
		}

        // SET METERS
        if (micount || miminutecount) { setMeter(misvgid + ' .mihourmeter', micount, 0.04, 'mitick'); }
        if (misize) { setMeter(misvgid + ' .mihourmeter', midayhours, 0.03, 'mihourtick'); }
    }
    
    var allcircles = container.getElementsByTagName('circle');
    for (var i = 0; i < allcircles.length; i++) {
        allcircles[i].setAttribute('class', zeroclass);
    }
}


function addMitimerDials(withinElem) {
    withinElem = "#" + withinElem;
	var container = document.querySelector(withinElem);
  	container.innerHTML = `
        <g class="miface">
        	<circle r="1" />
        </g>
        <g class="mihourface">
        	<circle r="1" />
        </g>
        <g class="mihourmeter">
        	<circle r=".5" />
        </g>
        <g class="miminuteface">
        <circle r=".4" />
        </g>`;
}

function addMitimeTemplate(withinElem, misvgid, mitimeid, timeid) {
    withinElem = "#" + withinElem;
    var container = document.querySelector(withinElem);
  	container.innerHTML = `
    	<style>
        ${withinElem} { background: white; padding: 1rem; }
        ${withinElem} svg { display: block; width: 100%; height: auto; fill: white; }
        ${withinElem} svg line { stroke: #295780; stroke-width: 0.01; stroke-linecap: round; }
        ${withinElem} svg line.mitick { stroke-width: 0.024; }
        ${withinElem} svg circle { fill: #058aff; }
        ${withinElem} svg circle.up { fill: #ffad2b; }
        ${withinElem} svg g.mihourmeter circle.up { fill: white; }
        ${withinElem} svg circle.down { fill: #058aff; }
        ${withinElem} svg path { fill: #058aff; }
        ${withinElem} svg path.current { fill: #ff6a1f; } 
        ${withinElem} svg text {fill: black; font-family: Arial, Helvetica, sans-serif; }
        ${withinElem} svg g.miface text { font-size: .012rem; }
        ${withinElem} svg g.mihourface text { font-size: .010rem; }
        ${withinElem} svg g.miminuteface text { font-size: .008rem; }
        ${withinElem} svg text.hide { display: none; }
        ${withinElem} svg:hover text.hide { display: block; }
        </style>
        <svg id="${misvgid}" viewBox="-1 -1 2 2" style="transform: rotate(-90deg)" class="midial"></svg>`;
}

// TODO: the logic of this, mixing the mitimer and standard time functions needs to be fixed!
function mitimer(withinElem, misvgid, mitimeid, timeid, micount, misize, miminutecount, mistart, sweep, showlabels, visiblelabels_tmp, forcehours, forceminutes) {
    [hours, minutes, seconds, timeOfDay] = getStandardTime(forcehours, forceminutes);

    // ugly, but allows for default behavior
    var visiblelabels = "mhn";
    if (visiblelabels_tmp) { visiblelabels = visiblelabels_tmp;  }

    [mi, mihour, miminute] = getMitime(hours, minutes, micount, misize, miminutecount, mistart);
    
    if (misvgid) { addMitimeTemplate(withinElem, misvgid, mitimeid, timeid); }
    if (timeid) { displayStandardTime(timeid, hours, minutes, seconds, timeOfDay); }
    if (mitimeid) { displayMitime(mitimeid, mi, mihour, miminute); }
    if (misvgid) { 
      addMitimerDials(misvgid);
      toggleZeroStyles(mi);
      displayMitimer(misvgid, mi, micount, misize, miminutecount, mistart, hours, minutes, sweep, showlabels, visiblelabels); 
    }
}

function getDisplayMitime(mitimeid, timeid, micount, misize, miminutecount, mistart, forcehours, forceminutes) {
    [hours, minutes, seconds, timeOfDay] = getStandardTime(forcehours, forceminutes);
    displayStandardTime(timeid, hours, minutes, seconds, timeOfDay);

    [mi, mihour, miminute] = getMitime(hours, minutes, micount, misize, miminutecount, mistart);

    toggleZeroStyles(mi);
    displayMitime(mitimeid, mi, mihour, miminute);
}

//setInterval('standardMitimer("console", "midial", "mitime", "standardtime", 4, 4, 4, 6, 0, 0, -1, -1)', 5000 );


