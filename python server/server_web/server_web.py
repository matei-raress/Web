import socket
import os
import json
#C:\Users\matei\AppData\Local\Programs\Python\Python311\python.exe
#python ./server_web/server_web.py
# creeaza un server socket
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# specifica ca serverul va rula pe portul 5678, accesibil de pe orice ip al serverului
serversocket.bind(('', 5678))
# serverul poate accepta conexiuni; specifica cati clienti pot astepta la coada
serversocket.listen(5)
cale=''

numeResursaCeruta=""

while True:
    print('#########################################################################')
    print ('Serverul asculta potentiali clienti.')
    # asteapta conectarea unui client la server
    # metoda `accept` este blocanta => clientsocket, care reprezinta socket-ul corespunzator clientului conectat
    (clientsocket, address) = serversocket.accept()
    print ('S-a conectat un client.')
    # se proceseaza cererea si se citeste prima linie de text
    cerere = ''
    linieDeStart = ''
    while True:
        mesaj = clientsocket.recv(2048)
        if len(mesaj) < 1:
            break

        cerere = cerere + mesaj.decode()
        print( 'S-a citit mesajul: \n---------------------------\n' + cerere + '\n---------------------------')
       
        pozitieCorpCerere = cerere.find('\r\n\r\n')
        if (pozitieCorpCerere > -1):
            corp = cerere[pozitieCorpCerere+4:]
       
       
        pozitie = cerere.find('\r\n')
        if (pozitie > -1 and linieDeStart == ''):
            linieDeStart = cerere[0:pozitie]
            print ('S-a citit linia de start din cerere: ##### ' + linieDeStart ) # GET /continut/index.html HTTP/1.1
            break

    print('S-a terminat cititrea.')
    if linieDeStart == '':
        clientsocket.close()
        print("S-a terminat comunicarea cu clientul - nu s-a primit niciun mesaj.")
        continue
    elementeLineDeStart = linieDeStart.split()
    numeResursaCeruta = elementeLineDeStart[1]
    if numeResursaCeruta == '/':
        numeResursaCeruta = '/index.html'
    
    if(numeResursaCeruta == '/api/utilizatori' and elementeLineDeStart[0]=='POST' ):
      
        formData = corp.split('&')
        txt = ''
        keys = []
        vals = []
        print(formData)
        for i in range(len(formData)):
            formData[i] = formData[i].split('=')
            keys.append(formData[i][0])
            vals.append(formData[i][1])
        dictonary = dict(zip(keys,vals))
        print(dictonary)

        with open(str(os.getcwd() + '/continut/resurse/' + 'utilizatori.json'),'r+') as f:
            text = f.read()
            if (text != ''):
                test = json.loads(text)
            else:
                test = []
            test.append(dictonary)
            jsonText = json.dumps(test,indent=1)
            f.seek(0)
            f.write(jsonText)
            print('am terminat de citit')
        

    numeFisier = os.getcwd() + '/continut' + numeResursaCeruta

    fisier = None
    try:
        # deschide fisierul pentru citire in mod binar
       
        fisier = open(numeFisier,'rb')

        # tip media
        numeExtensie = numeFisier[numeFisier.rfind('.')+1:]
        tipuriMedia = {
            'html': 'text/html; charset=utf-8',
            'css': 'text/css; charset=utf-',
            'js': 'text/javascript; charset=utf-8',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'ico': 'image/x-icon',
            'xml': 'application/xml; charset=utf-8',
            'json': 'application/json; charset=utf-8'
        }
        tipMedia = tipuriMedia.get(numeExtensie,'text/plain; charset=utf-8')

        # se trimite raspunsul
        clientsocket.sendall(str.encode('HTTP/1.1 200 OK\r\n'))
        clientsocket.sendall(str.encode('Content-Length: ' + str(os.stat(numeFisier).st_size) + '\r\n'))
        clientsocket.sendall(str.encode('Content-Type: ' + tipMedia +'\r\n'))
        clientsocket.sendall(str.encode('Server: Casti\r\n'))
        clientsocket.sendall(str.encode('\r\n'))
        
        # citeste din fisier si trimite la server
        buf = fisier.read(1024)
        while (buf):
            clientsocket.send(buf)
            buf = fisier.read(1024)
    except IOError:
        # daca fisierul nu exista trebuie trimis un mesaj de 404 Not Found
        msg = 'Eroare! Resursa ceruta ' + numeResursaCeruta + ' nu a putut fi gasita!'
        print(msg)
        clientsocket.sendall(str.encode('HTTP/1.1 404 Not Found\r\n'))
        clientsocket.sendall(str.encode('Content-Length: ' + str(len(msg.encode('utf-8'))) + '\r\n'))
        clientsocket.sendall(str.encode('Content-Type: text/plain; charset=utf-8\r\n'))
        clientsocket.sendall(str.encode('Server: Casti\r\n'))
        clientsocket.sendall(str.encode('\r\n'))
        clientsocket.sendall(str.encode(msg))

    finally:
        if fisier is not None:
            fisier.close()
    
    clientsocket.close()
    print ('S-a terminat comunicarea cu clientul.')
