let db;
const request = window.indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;

    db.createObjectStore('Budget', {
        keyPath: 'budgetId', autoIncrement: true,
    });
};

request.onsuccess = function (event) {
    console.log("open BudgetDB success 🔌");
    db = event.target.result;

    if (navigator.onLine) {
        console.log("Online! 🌐");
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(`⛔ ${e.target.errorCode}`);
};


function checkDatabase() {
    // open a transaction on your pending db
    const transaction = db.transaction(['Budget']);
    // access your BudgetStore object
    const budgetStore = transaction.objectStore('Budget');
    // get all entries in the budgetStore
    const getAll = budgetStore.getAll()

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => response.json())
                .then((res) => {
                    if (res.length > 0) {
                        // create a new readwrite transaction with the BudgetStore
                        const transaction = db.transaction(['Budget'], 'readwrite');
                        // access the BudgetStore object store
                        const budgetStore = transaction.objectStore('Budget');
                        // clear all items in BudgetStore
                        budgetStore.clear();
                    }
                });
        }
    };
}

// object store
function saveRecord(record) {
    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction(['Budget'], 'readwrite');
    // access your pending object store
    const pendingStore = transaction.objectStore('Budget');
    // add record to your store with add method.+
    pendingStore.add(record);

}

// listen for app coming back online
window.addEventListener("online", checkDatabase);
