// The following were helpful resources used to write this code.
// https://www.elated.com/creating-a-javascript-clock/
// https://medium.com/hackernoon/a-simple-pie-chart-in-svg-dbdd653b6936
// https://css-tricks.com/building-progress-ring-quickly/
// https://jasonwatmore.com/post/2021/10/02/vanilla-js-create-an-array-with-a-range-of-numbers-in-a-javascript
//
var date, hours, minutes, seconds, timeOfDay;
var mi, mihour, miminute;

function getStandardTime() {
    var hours, minutes, seconds, timeOfDay;
    date = new Date();
    hours = date.getHours();
    minutes = date.getMinutes();
    seconds = date.getSeconds();
    timeOfDay = (hours < 12) ? "am" : "pm";
    return [hours, minutes, seconds, timeOfDay];
}

function displayStandardTime(timeid, hours, minutes, seconds, timeOfDay) {
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
    // Compose the string for display
    var currentTimeString = mi+ "." + mihour + "." + miminute + " sm";

    // Update the time display
    document.querySelector(mitimeid).innerHTML = currentTimeString;
}

function getCoordinatesForPercent(percent) {
    var x = Math.cos(2 * Math.PI * percent);
    var y = Math.sin(2 * Math.PI * percent);
    return [x, y];
}

function removeElements(container, selector) {
    var elements = container.querySelectorAll(selector);
    for (var i = 0; i < elements .length; i++) {
        elements[i].remove();
    }
}

function setMeter(containerid, steps, linehalflen, lineClass) {
    var container = document.querySelector(containerid);

    removeElements(container, 'line.' + lineClass);

    var circle = container.getElementsByTagName('circle')[0];
    var radius = circle.r.baseVal.value;

    var steppct = 1/steps;
    // add new lines
    for (var i = 0; i < steps; i++) {
        var percent = steppct * (i + 1);
        var [endX, endY] = getCoordinatesForPercent(percent);
        var x1, y1, x2, y2 = 0;
        [x1, y1] = [endX * (radius - linehalflen), endY * (radius - linehalflen)];
        [x2, y2] = [endX * (radius + linehalflen), endY * (radius + linehalflen)];
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', lineClass);
        container.appendChild(line);
    }
}

function drawArc(containerid, percent, pathclass) {
    var container = document.querySelector(containerid);

    removeElements(container, 'path.' + pathclass);

    var circle = container.getElementsByTagName('circle')[0];
    var radius = circle.r.baseVal.value;

    // if the slice is more than 50%, take the large arc (the long way around)
    var largeArcFlag = percent > 0.5 ? 1 : 0;

    // largest circle radius is 1, so radius is used to directly scale x, y coordinates below.
    var [endX, endY] = getCoordinatesForPercent(percent);
    var arcdata = [
        `M ${radius} 0`, // Move
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX*radius} ${endY*radius}`, // Arc
        `L 0 0`, // Line
    ].join(' ');

    var arc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
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

function displayMiclock(miclocksvgid, mi, micount, misize, miminutecount, mistart, hours, minutes) {
    var container = document.querySelector(miclocksvgid);
    var zeroclass = 'up';
    if (mi == 0 ) {
        zeroclass = 'down';
        removeElements(container, 'path');
        removeElements(container, 'line');
    } else {
        var elapsedhours = hours - mistart;
        elapsedhours = Math.max(0, elapsedhours)

        // MIHOUR FACE
        var currenthours = elapsedhours + 1;

        var midayhours = micount * misize;
        var mihourpercent = currenthours / midayhours;
        drawArc(miclocksvgid + ' .mihourface', mihourpercent, 'current');

        var mihourpctelapsed = elapsedhours / midayhours;
        drawArc(miclocksvgid + ' .mihourface', mihourpctelapsed, 'elapsed');
    
        var minnormal = minutes + 1;
        var minutechunk = 60 / miminutecount;
        var currmiminute;
        if (minnormal < minutechunk) {
            currmiminute = 1;
        } else {
            currmiminute = Math.ceil(minnormal / minutechunk);
        }

        // MIMINUTE FACE
        var miminutepercent = currmiminute / miminutecount;
        drawArc(miclocksvgid + ' .miminuteface', miminutepercent, 'current');

        var miminutepctelapsed = (currmiminute - 1) / miminutecount;
        drawArc(miclocksvgid + ' .miminuteface', miminutepctelapsed, 'elapsed');

        // SET METERS
        setMeter(miclocksvgid + ' .mihourmeter', micount, 0.04, 'mitick');
        setMeter(miclocksvgid + ' .mihourmeter', midayhours, 0.03, 'mihourtick');
    }
    var allcircles = container.getElementsByTagName('circle');
    for (var i = 0; i < allcircles.length; i++) {
        allcircles[i].setAttribute('class', zeroclass);
    }
}

function getDisplayMitime(mitimeid, timeid, micount, misize, miminutecount, mistart) {
    [hours, minutes, seconds, timeOfDay] = getStandardTime();
    //[hours, minutes, seconds] = [6, 0, 0];
    displayStandardTime(timeid, hours, minutes, seconds, timeOfDay);

    //[miclockid, micount, misize, miminutecount, mistart] = ['miclock', 4, 4, 4, 6];
    [mi, mihour, miminute] = getMitime(hours, minutes, micount, misize, miminutecount, mistart);

    // [mi, mihour, miminute] = [0, 1, 1];
    toggleZeroStyles(mi);
    displayMitime(mitimeid, mi, mihour, miminute);
}

function miclock(miclocksvgid, mitimeid, timeid, micount, misize, miminutecount, mistart) {
    [hours, minutes, seconds, timeOfDay] = getStandardTime();
    //[hours, minutes, seconds] = [6, 0 ,0];
    displayStandardTime(timeid, hours, minutes, seconds, timeOfDay);

    //[miclockid, micount, misize, miminutecount, mistart] = ['miclock', 4, 4, 4, 6];
    // add 1 to minutes to account for the fact that standard minutes
    // are 0 indexed and minutes are 1 indexed
    [mi, mihour, miminute] = getMitime(hours, minutes, micount, misize, miminutecount, mistart);

    // [mi, mihour, miminute] = [0, 1, 1];
    toggleZeroStyles(mi);
    displayMitime(mitimeid, mi, mihour, miminute);
    displayMiclock(miclocksvgid, mi, micount, misize, miminutecount, mistart, hours, minutes);
    //document.querySelector('#debug').firstChild.nodeValue = debug;
}
