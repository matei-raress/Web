var checkFile="";
var intervalID;
localStorage.clear();

function data() {
    document.getElementById("data").innerHTML = new Date();
}
function startClock(){
    intervalID = setInterval(data, 1000);
}
function stopClock(){
    clearInterval(intervalID);
}

function url() {
    var url = window.location.href;
    document.getElementById("url").innerHTML = url;
}


function locationMe() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}
function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    document.getElementById("locatie").innerHTML = "Latitude: " + latitude +
        "<br>&emsp;&emsp;&emsp;&emsp;Longitude: " + longitude;
}

function versiune() {
    let final=navigator.appVersion;
    document.getElementById("versiune").innerHTML =final;
}

function versiuneOS() {
    let os = navigator.userAgent;
    let final = ""
    if (os.search('Windows') !== -1) final = "Windows";
    if (os.search('Mac') !== -1) final = "MacOS";
    if (os.search('Linux') !== -1) final = "Linux";
    document.getElementById("os").innerHTML = final;
}


//Sectiunea 2
var firstClick = true;
var firstPoint = { x: 0, y: 0 };

function painting(event){

    var point = { x: 0, y: 0 }; 
    point.x = event.offsetX;
    point.y = event.offsetY;
    var secPoint = point;

    if (firstClick == true) {
        firstClick = false;
        firstPoint = point;
    }
    else {
        var context = document.getElementById("canvass").getContext("2d");
        context.beginPath();
        context.lineWidth = 10;
        context.rect(firstPoint.x, firstPoint.y, Math.abs(secPoint.x - firstPoint.x), Math.abs(secPoint.y - firstPoint.y));

        context.strokeStyle = document.getElementById("contur").value;
        context.stroke();
        context.fillStyle = document.getElementById("umplere").value;
        context.fill();
        firstClick = true;
    }
}

//Sectiunea3

function addRand() {
    var poz = document.getElementById("pozitie").value;
    var tabel = document.getElementById("tabel");
    
    var row = tabel.insertRow(poz);
    for (i = 0; i < tabel.rows[0].cells.length; i++) {
        var td = document.createElement('td');
        row.insertCell(i).appendChild(td);
    }
}

function addColoana() {
    var poz = document.getElementById("pozitie").value;
    var tabel = document.getElementById("tabel");
    var i;
    for (i = 0; i < tabel.rows.length; i++) {
        var td = document.createElement('td');
        tabel.rows[i].insertCell(poz).appendChild(td);
    }
}


function schimbaCuloare() {
    var poz = document.getElementById("pozitie").value;
    var y = document.getElementById("tabel").getElementsByTagName("tr");
    y[poz].style.backgroundColor = document.getElementById("culoare").value;
    let i=0;
    for(i=0;i<y.length;i++){
        y[i].cells[poz].style.backgroundColor = document.getElementById("culoare").value;
    }

}



function schimbaContinut(resursaFisier,jsFisier, jsFunctie) {
    var xhttp= new XMLHttpRequest();
    if(window.XMLHttpRequest){
       // xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
        if (xhttp.readyState == 4 && xhttp.status == 200) {
        
            document.getElementById("continut").innerHTML =
                xhttp.responseText;
                if(resursaFisier!="invat"){
                    checkFile="altceva";
                    stopClock();
                    console.log(checkFile);
                }
                else{
                    checkFile="invat";
                    url();
                    versiune();
                    versiuneOS();
                    startClock();
                }
            if (jsFisier) {

                var elementScript = document.createElement('script');
                elementScript.src = jsFisier;
                elementScript.onload = function() {
                    if (jsFunctie) {
                        window[jsFunctie]();
                    }
                };
                
                document.head.appendChild(elementScript);
            } else {
                if (jsFunctie) {
                    window[jsFunctie]();
                }
            }
        }
    };
    xhttp.open("GET", resursaFisier + ".html", true);
    xhttp.send();
}}


function validare() {
    
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var json = JSON.parse(this.responseText);
            var nume=document.getElementById("username").value;
            var parola=document.getElementById("parola").value;
            var existaUtil=false;
            var existaParola=false;
            for(var nr in json){
                if(json[nr].utilizator == nume){
                    if(json[nr].parola== parola){
                        existaParola=true;
                    }
                   existaUtil=true;
                }
            }

            if(existaUtil){
                document.getElementById("validareNume").innerHTML = "Nume corect";
            }
            else{
                document.getElementById("validareNume").innerHTML = "Nu exista utilizator";
                document.getElementById("validareParola").innerHTML=""
            }
            if(existaParola) {
                document.getElementById("validareParola").innerHTML="Parola corecta"
                
            }
            else{
                document.getElementById("validareParola").innerHTML="Parola gresita"
            }
        }
    };
    xhttp.open("GET", "../../resurse/utilizatori.json", true);
    xhttp.send();
}


