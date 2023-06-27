function incarcaPersoane() {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var a = this.responseXML.getElementsByTagName("persoana");
            let i=0;
            var tabela = "<table><tr><th>Nume</th><th>Prenume</th><th>Email</th><th>Adresa</th><th>Varsta</th><th>Liceu</th></tr>";
            let rows=""
            for (i = 0; i < a.length; i++) {
                rows += "<tr><td>" + a[i].getElementsByTagName("nume")[0].childNodes[0].nodeValue +
                "</td><td>" + a[i].getElementsByTagName("prenume")[0].childNodes[0].nodeValue +
                "</td><td>" + a[i].getElementsByTagName("email")[0].childNodes[0].nodeValue +
                "</td><td>" +
                a[i].getElementsByTagName("tara")[0].childNodes[0].nodeValue +
                ", jud. " + a[i].getElementsByTagName("judet")[0].childNodes[0].nodeValue +
                ", loc. " + a[i].getElementsByTagName("localitate")[0].childNodes[0].nodeValue +
                ", str. " + a[i].getElementsByTagName("strada")[0].childNodes[0].nodeValue +
                ", nr. " + a[i].getElementsByTagName("numar")[0].childNodes[0].nodeValue +
                "</td><td>"+ a[i].getElementsByTagName("varsta")[0].childNodes[0].nodeValue +
                "</td><td>"+ a[i].getElementsByTagName("liceu")[0].childNodes[0].nodeValue +
                "</td></tr>";
            }
            tabela = tabela + rows+ "</table>"
            document.getElementById("xml").innerHTML = tabela;
        }
    };
    xmlhttp.open("GET", "resurse/persoane.xml", true);
    xmlhttp.send();
}

