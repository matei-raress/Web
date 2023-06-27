
class Storage {
    constructor() {
        this.tip = undefined;
        this.worker = new Worker('js/worker.js');
        this.produs=undefined;
        list = "<tr><th>Nr</th><th>Produs</th><th>Cantitate</th></tr>\n";
    }
    sendToWorker() {
        this.worker.postMessage([this.produs.nume, this.produs.cantitate, this.tip])
        console.log('main: trimit mesaj');
        this.worker.onmessage = function (e) {
            console.log('main: am primit ' + e.data);
            alert("worker: produs adaugat")
        }
    }
}

class Produs {
    constructor(nume, cantitate) {
        this.nume = document.getElementById("numeShop").value;
        this.cantitate = document.getElementById("cantitateShop").value;
    }
}

class Local extends Storage {
    constructor() {
        super();
        this.tip = 'localStorage';
        this.produs=new Produs();
    }
    adaugaProdus() {
        localStorage.setItem(this.produs.nume, this.produs.cantitate, JSON.stringify(this.produs));
    }
    afiseazaProdus(){
        var i = 0;
        for (i = 0; i <= localStorage.length - 1; i++) {
            index = localStorage.key(i)
            list += "<tr><td>" + (i + 1) + "</td>\n<td>" + index + "</td>\n<td>" + localStorage.getItem(index) + "</td></tr>\n";
        }
        document.getElementById('tabel').innerHTML = list;
        list="";
    }
}

class IDBStorage extends Storage {
    constructor() {
        super();
        list = "<tr><th>Nr</th><th>Produs</th><th>Cantitate</th></tr>\n";
        this.tip = 'database'
        this.produs=new Produs();
    }

    adaugaProdus() {
        let req;
        let request = window.indexedDB.open("database", 1);
        let store;
        let p = new Produs();
        // open
        request.onerror = function (e) {
            console.log("error: " + request.error);
        };

        request.onsuccess = function (e) {
            req = request.result;
            let store = req.transaction("shop", "readwrite").objectStore("shop");

            //add
            
            request = store.add(p);
            request.oncomplete = function (e) {
                console.log("bun");
            };
            request.onerror = function (e) {
                console.log("eroare  la inserare");
            };
            req.close();
        };

        // update   
        request.onupgradeneeded = function (e) {
            req = request.result;
            store = req.createObjectStore("shop", { keyPath: "nume" });
            store.createIndex("nume", "nume", { unique: true });
            store.createIndex("cantitate", "cantitate", { unique: true });
        };

    }

    afiseazaProdus() {
        let request = indexedDB.open('database', 1);

        request.onsuccess = (event) => {
            let req = event.target.result;

            let store = req.transaction('shop', 'readwrite').objectStore('shop');
          
            let countRequest = store.count();
            let entries = 0;

            countRequest.onsuccess = (event) => {
                entries = event.target.result;
            };

            countRequest.onerror = (event) => {
                console.error('Error counting entries:', event.target.error);
            };
            let cursorRequest = store.openCursor();
            cursorRequest.onsuccess = (event) => {
                let cursor = event.target.result;
                if (cursor) {
                    let json = cursor.value;
                    if(this.produs.cantitate != json["cantitate"] && this.produs.nume== json["nume"]){
                        let deleteReq = store.delete( json["nume"]);
                        deleteReq.onsuccess = (event) => {
                          console.log('Entry modified successfully');
                        };
                        deleteReq.onerror = (event) => {
                          console.error('Error modifying entry:', event.target.error);
                        };

                        let putRequest = store.put(this.produs);
                        putRequest.onsuccess = (event) => {
                          console.log('Entry modified successfully');
                        };
                        putRequest.onerror = (event) => {
                          console.error('Error modifying entry:', event.target.error);
                        };
                        json["cantitate"]=this.produs.cantitate;
                    }
                    list += "<tr><td>" + (index + 1) + "</td>\n<td>" + json["nume"] + "</td>\n<td>" + json["cantitate"] + "</td></tr>\n";
                    index += 1;
                    cursor.continue();
                }
                if (index == entries) {
                    document.getElementById('tabel').innerHTML = list;
                    index = 0;
                    list = "";
                }
            };
            cursorRequest.onerror = (event) => {
                console.error('Error opening cursor:', event.target.error);
            };
        };
        request.onerror = (event) => {
            console.error('Error opening database:', event.target.error);
        };
    }
}
var list = "";
var index = 0;


function insertData() {
    var storage;
    let storageType = document.getElementById("storageType").value;
    let numar = document.getElementById("cantitateShop").value;

    if (storageType == "local" && numar>0) {
        storage=new Local();
        storage.adaugaProdus();
        storage.sendToWorker();
        storage.afiseazaProdus();
    }
    else if (storageType == "database" && numar>0) {
        storage = new IDBStorage();
        storage.adaugaProdus();
        storage.sendToWorker();
        storage.afiseazaProdus();
    }
}