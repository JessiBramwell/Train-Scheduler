// Initialize Firebase
var config = {
  apiKey: "AIzaSyCTUwzHUKcSTd3VJ5jfmoTBmuwZq9Os_H4",
  authDomain: "train-scheduler-4b6e4.firebaseapp.com",
  databaseURL: "https://train-scheduler-4b6e4.firebaseio.com",
  projectId: "train-scheduler-4b6e4",
  storageBucket: "train-scheduler-4b6e4.appspot.com",
  messagingSenderId: "602003273998"
};

firebase.initializeApp(config);

var database = firebase.database();
var trainRef = database.ref("/train-data");

trainRef.on("child_added", function (snapshot) {

  var name = snapshot.val().name;
  var dest = snapshot.val().destination;
  var first = snapshot.val().firstTrain;
  var freq = snapshot.val().frequency;

  var newRow = $("<tr>").append(
    $("<td>").text(name),
    $("<td>").text(dest),
    $("<td>").text(first),
    $("<td>").text(freq)
  );

  $("#train-table").append(newRow);

}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});


// Add Train Data on click
$("#add-train").on("click", function (event) {
  event.preventDefault();

  var name = $("#name").val().trim();
  var dest = $("#destination").val().trim();
  var first = moment($("#first-train").val().trim(), "MM/DD/YYYY").format("X");
  var freq = $("#frequency").val().trim();

  var newTrain = {
    name: name,
    destination: dest,
    firstTrain: first,
    frequency: freq
  };

  trainRef.push(newTrain);

  $("#name, #destination, #first-train, #frequency").val("");
});

