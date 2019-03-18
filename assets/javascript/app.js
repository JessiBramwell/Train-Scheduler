$(document).ready(function () {
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

  var database = firebase.firestore();
  // var trainRef = database.ref("/train-data");

  function updateDOM(snapshot) {
    alert("updateDOM");
    
    var name = snapshot.val().name;
    var dest = snapshot.val().destination;
    var first = snapshot.val().firstTrain;
    var freq = parseInt(snapshot.val().frequency);

    var remaining = moment().diff(moment.unix(first), "minutes") % freq;
    var nextTrain = freq - remaining;

    var arrival = moment().add(nextTrain, "minutes").format("hh:mm A");

    var newRow = $("<tr>").addClass("train-info").attr("data-id", snapshot.key);

    newRow.append(
      $("<td>").text(name),
      $("<td>").text(dest),
      $("<td>").text(freq + " min"),
      $("<td>").text(arrival),
      $("<td>").text(nextTrain).append(
        $("<button type='button' class='close' aria-label='Close'>").html($("<span aria-hidden='true'>&times;</span>")))
    );

    $("#train-table").append(newRow);
  }

  // trainRef.on("child_added", function (snapshot) {
  //   updateDOM(snapshot);

  // }, function (errorObject) {
  //   console.log("The read failed: " + errorObject.code);
  // });


  database.collection("train-data").onSnapshot(function (snapshot) {
    var changes = snapshot.docChanges();
    console.log(changes)
    changes.forEach(function (change) {
      if (change.type === "added") {
        updateDOM(change.doc)
      } else if (change.type === "removed") {
        alert("removed")
      }
    })
  });

  // Add Train Data on click
  $("#add-train").on("click", function (event) {
    event.preventDefault();

    var name = $("#name").val().trim();
    var dest = $("#destination").val().trim();
    var first = moment($("#first-train").val().trim(), "HH:mm").subtract(1, "years").format("X");
    var freq = $("#frequency").val().trim();

    var newTrain = {
      name: name,
      destination: dest,
      firstTrain: first,
      frequency: freq,
    };

    // trainRef.push(newTrain);
    database.collection("train-data").add(newTrain)

    $("#name, #destination, #first-train, #frequency").val("");
  });

  // Remove Table Row 
  $("#train-table").on("click", ".close", function (event) {
    event.stopPropagation();
    let row = event.target.closest(".train-info")
    let id = row.getAttribute("data-id")

    console.log(id)

    trainRef.child(id).remove();
    // *** this isn't working - come back to it
    // trainRef.on("child_removed", function (snapshot) {
    //   updateDOM(snapshot);
    // }, function (errorObject) {
    //   console.log("The read failed: " + errorObject.code);
    // });

  });

  var cities = [
    "Salt Lake City",
    "West Valley City",
    "Provo",
    "West Jordan",
    "Orem",
    "Sandy",
    "Ogden",
    "St. George",
    "Layton",
    "Taylorsville",
    "South Jordan",
    "Lehi",
    "Logan",
    "Murray",
    "Draper",
    "Bountiful",
    "Riverton",
    "Roy"
  ];
  $("#destination").autocomplete({ source: cities });

});