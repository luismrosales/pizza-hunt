// create a variable to hold db connection
let db;
// estsablish a connection to indexdDB database called "pizza_hunt" and set it to version 1
const request = indexedDB.open("pizza_hunt", 1);

// this event listener will emit the database version changes (nonexistant to version 1, v1 to v2, etc.)\
request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object store (table) called `new_pizza`, set it to have a auto incrementing primary key of sorts
  db.createObjectStore("new_pizza", { autoIncrement: true });
};

// upon sucess
request.onsuccess = function (event) {
  db = event.target.result;
  // check if app is online, if yes run uploadPizza()
  if (navigator.online) {
    uploadPizza();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

// this function will be executed if we attempt to submit a new pizza
function saveRecord(record) {
  // open a new transaction with the database with reas and write permissions
  const transaction = db.transaction(["new_pizza"], "readwrite");
  // access the object store for new pizza
  const pizzaObjectStore = transaction.objectStore("new_pizza");
  // add a record to your store with the add method
  pizzaObjectStore.add(record);
}

function uploadPizza() {
  // open a transaction on your db
  const transaction = db.transaction(["new_pizza"], "readwrite");
  // access your object store
  const pizzaObjectStore = transaction.objectStore("new_pizza");
  // get all records from store and set to a variable
  const getAll = pizzaObjectStore.getAll();

  //   upon success run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDB, send it to the api server
    if (getAll.results.length > 0) {
      fetch("/api/pizzas", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open one more transaction
          const transaction = db.transaction(["new_pizza"], "readwrite");
          // access the newpizza object store
          const pizzaObjectStore = transaction.objectStore("new_pizza");
          // clear all items in your store
          pizzaObjectStore.clear();
          alert("All saved pizza has been submited!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", uploadPizza);
