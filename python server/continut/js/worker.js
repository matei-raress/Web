onmessage = function(e) {
    console.log('worker: am primit' + e.data);
    var result = 'Produs: ' + e.data[0] + '| Cantitate: ' +  e.data[1] +'| Stocat pe '+ e.data[2];
    console.log('worker: trimit mesaj');
    postMessage(result);
  }
  