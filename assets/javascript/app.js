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

  function updateDOM(doc) {

    var name = doc.data().name;
    var dest = doc.data().destination;
    var first = doc.data().firstTrain;
    var freq = parseInt(doc.data().frequency);

    var remaining = moment().diff(moment.unix(first), "minutes") % freq;
    var nextTrain = freq - remaining;

    var arrival = moment().add(nextTrain, "minutes").format("hh:mm A");

    var newRow = $("<tr>").addClass("train-info").attr("data-id", doc.id);

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

  // deleting data
  $("#train-table").on("click", ".close", function (event) {
    event.stopPropagation();

    let row = event.target.closest(".train-info")
    let id = row.getAttribute("data-id")

    database.collection("train-data").doc(id).delete();
    row.remove();
  });

  database.collection("train-data").onSnapshot(function (snapshot) {
    var changes = snapshot.docChanges();
    changes.forEach(function (change) {
      if (change.type === "added") {
        updateDOM(change.doc)
      }
    });
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

    database.collection("train-data").add(newTrain)

    $("#name, #destination, #first-train, #frequency").val("");
  });

  // edit data
  $("#train-table").on("dblclick", ".train-info", function (event) {
    event.stopPropagation();
    let row = event.target.closest(".train-info")
    let id = row.getAttribute("data-id")

    alert("clicked");
  


    // $("#name").val()

    // var dest = $("#destination")
    // var first = $("#first-train")
    // var freq = $("#frequency")


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