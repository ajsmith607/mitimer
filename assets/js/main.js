
   // The following were helpful resources used to write this code.
   // https://www.elated.com/creating-a-javascript-clock/
   // https://medium.com/hackernoon/a-simple-pie-chart-in-svg-dbdd653b6936
   // https://css-tricks.com/building-progress-ring-quickly/

   (function() { // Begin scoping function

     var timeid = "standardtime";
     var mitimeid = "mitime";
     var miclockid = "miclock";
     var micount = 4;
     var misize = 4;
     var miminutecount = 4;
     var mistart = 6;
     var debug = '';

     var date, hours, minutes, seconds, timeOfDay;
     var mi, mihour, miminute;

     function getStandardTime() {
       date = new Date();
       hours = date.getHours();
       minutes = date.getMinutes();
       seconds = date.getSeconds();
       timeOfDay = (hours < 12) ? "AM" : "PM";
     }

     function displayStandardTime(id) {
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
       document.getElementById(id).firstChild.nodeValue = currentTimeString;
     }

     function getMitime(micount, misize, miminutecount, mistart) {
       var mihouroffset = hours - mistart
       if (mihouroffset < 0 || hours >= (mistart + (micount * misize))) {
         // in zero mitime
         [mi, mihour, miminute] = [0, 0, 0];
       } else {
         mihouroffset += 1;
         mi = Math.ceil(mihouroffset / misize)

         if (mihouroffset < misize) {
           mihour = mihouroffset;
         } else if (mihouroffset % misize) {
           mihour = mihouroffset % misize
         } else {
           mihour = misize
         }
         
         minutes = Math.max(1, minutes);
         var miminutesize = 60 / miminutecount;
         if (minutes < miminutesize) {
           miminute = 1
         } else {
           miminute = Math.ceil(minutes / miminutesize);
         }
         if ((minutes % miminutesize) == 0) {
           miminute = miminute + 1;
         }
       }
     }

     function displayMitime(id) {
       // Compose the string for display
       var currentTimeString = mi + "." + mihour + "." + miminute + " SM";

       // Update the time display
       document.getElementById(id).firstChild.nodeValue = currentTimeString;
     }

     function getCoordinatesForPercent(percent) {
       var x = Math.cos(2 * Math.PI * percent);
       var y = Math.sin(2 * Math.PI * percent);
       return [x, y];
     }

     function setMeter(containerid, steps, steppct, linehalflen, lineClass) {

       var container = document.querySelector(containerid);

       // remove any previous lines 
       var lines = container.querySelectorAll('line.' + lineClass);
       for (var i = 0; i < lines.length; i++) {
         lines[i].remove();
       }

       var circle = container.getElementsByTagName('circle')[0];
       var radius = circle.r.baseVal.value;

       // add new lines
       for (var i = 0; i < steps; i++) {
         var percent = steppct * (i + 1);
         var [endX, endY] = getCoordinatesForPercent(percent);
         var [x1, y1] = [endX * (radius - linehalflen), endY * (radius - linehalflen)];
         var [x2, y2] = [endX * (radius + linehalflen), endY * (radius + linehalflen)];
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

       // remove any previous paths and add a new one
       var paths = container.getElementsByTagName("path." + pathclass);
       for (var i = 0; i < paths.length; i++) {
         paths[i].remove();
       }

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

     function toggleZero() {
       var zeroclass = '';
       if (mi == 0) {
         zeroclass = 'zerotime';
       }

       var container = document.querySelector("#" + miclockid);
       var allcircles = container.getElementsByTagName('circle');
       for (var i = 0; i < allcircles.length; i++) {
         allcircles[i].setAttribute('class', zeroclass);
       }
     }

     function displayMiclock() {      
       if (mi != 0) {

         // MIHOUR FACE
         var allmihours = (mi - 1) * misize + mihour;
         // if in zero time, results in negative hours, force to zero
         allmihours = Math.max(0, allmihours);
         var midaylength = micount * misize;
         var mihourpercent = (allmihours / midaylength);
         drawArc('.mihourface', mihourpercent, 'current');

         var mihourpctelapsed = (allmihours - 1) / midaylength;
         drawArc('.mihourface', mihourpctelapsed, 'elapsed');

         // MIMINUTE FACE
         var miminutepercent = miminute / miminutecount;
         drawArc('.miminuteface', miminutepercent, 'current');

         var miminutepctelapsed = (miminute - 1) / miminutecount;
         drawArc('.miminuteface', miminutepctelapsed, 'elapsed');

         // SET METERS
         setMeter('.mihourmeter', micount, 1 / micount, 0.04, 'mitick');
         setMeter('.mihourmeter', midaylength, 1 / midaylength, 0.03, 'mihourtick');

       } else {
         // zero time
         toggleZero();
       }
     }

     getStandardTime();
     //[hours, minutes, seconds] = [7, 0, 0];
     displayStandardTime(timeid);
     
     //[miclockid, micount, misize, miminutecount, mistart] = ['miclock', 4, 4, 4, 6];
     getMitime(micount, misize, miminutecount, mistart);
     
     //[mi, mihour, miminute] = [1, 1, 1];
     displayMitime(mitimeid);
     displayMiclock(miclockid)

     document.getElementById('debug').firstChild.nodeValue = debug;

   })(); // End scoping function
