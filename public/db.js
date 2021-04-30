let db;
let budgetStore;
let BUDGETVersion = 1
const request = indexedDB.open('TransactionsDB', BUDGETVersion || 21);

request.onupgradeneeded = (event) => {
    db = event.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore("TransactionStore", { autoIncrement: true })
    }
}

request.onerror = (e) => {
    console.log(`Oh no! ${e.target.errorCode}`)
}

function checkDataBase() {
    let getAll = db.transaction(["TransactionStore"], "readwrite").objectStore("TransactionStore").getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => response.json())
            .then((res) => {
                if(res.length !== 0) {
                    let currentStore = db.transaction(['TransactionStore'], 'readwrite').objectStore('TransactionStore');
                    currentStore.clear();
                    console.log('Clearing store ... ');
                }
            })
        }
    }
}

request.onsuccess = (e) => {
    db = e.target.result;

    if(navigator.onLine){
        checkDataBase()
    }
}

function saveRecord(record) {
    const store = db.transaction(['TransactionStore'], 'readwrite').objectStore('TransactionStore');

    store.add(record)
}

window.addEventListener('online', checkDataBase);




