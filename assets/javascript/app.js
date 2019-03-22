$(document).ready(function () {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCTUwzHUKcSTd3VJ5jfmoTBmuwZq9Os_H4",
    authDomain: "train-scheduler-4b6e4.firebaseapp.com",
    databaseURL: "https://train-scheduler-4b6e4.firebaseio.com",
    projectId: "train-scheduler-4b6e4",
    storageBucket: "train-scheduler-4b6e4.appspot.com",

  };

  firebase.initializeApp(config);
  const database = firebase.firestore();
  const auth = firebase.auth();

  // listen for auth status changes
  auth.onAuthStateChanged(function (user) {
    console.log(user);
    if (user) {
      $(".logged-out").hide();
      $(".logged-in").show();
      $("#train-table").addClass("active");
      $(".lead").hide();
    } else {
      console.log("not logged in")
      $(".logged-out").show();
      $(".logged-in").hide();
      $("#train-table").removeClass("active");
      $(".lead").show().text("Create an account or sign in to make changes to the schedule");
    }
  });

  // admin signup 
  $("#signup-form").on("submit", function (e) {
    e.preventDefault();
    console.log("signup worked")

    // user info
    const email = $("#signup-email").val().trim();
    const password = $("#signup-password").val().trim();

    // user signup
    auth.createUserWithEmailAndPassword(email, password).then(function (credentials) {
      console.log(credentials)
      $("#modal-signup").modal("hide");
      $("#signup-email, #signup-password").val("");
    });
  });

  // admin login 
  $("#login-form").on("submit", function (e) {
    e.preventDefault();
    console.log("login worked")

    // user info
    const email = $("#login-email").val().trim();
    const password = $("#login-password").val().trim();

    // user login
    auth.signInWithEmailAndPassword(email, password).then(function (credentials) {
      console.log(credentials)
      $("#modal-login").modal("hide");
      $("#login-email, #login-password").val("");
    }).catch(function (error) {
      console.log(error)
    });
  });

  // admin logout
  $("#logout").on("click", function (e) {
    e.preventDefault();
    auth.signOut().then(function () {
      console.log("logout worked");
    }).catch(function (error) {
      console.log(error);
    })
  });

  // update dom elements using database data
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
        $("<button type='button' class='close' style='display:none' aria-label='Close'>").html($("<span aria-hidden='true'>&times;</span>")))
    );

    $("#train-table").append(newRow);
  }

  // track database changes
  database.collection("train-data").onSnapshot(function (snapshot) {
    var changes = snapshot.docChanges();
    changes.forEach(function (change) {
      if (change.type === "added" || change.type === "modified") {
        updateDOM(change.doc);
      }
    });
    console.log(changes)
  });

  // Add Data on click
  $("#new-train").on("click", function (event) {
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

    var formID = $("#form").data().id;

    if (formID === undefined) {
      database.collection("train-data").add(newTrain);
    } else {
      database.collection("train-data").doc(formID).update(newTrain);
    }

    $("#form").removeData("id");
    $("#name, #destination, #first-train, #frequency").val("");
    $("#add-train").modal("hide");
  });

  // edit data
  $("#train-table").on("dblclick", ".train-info", function (event) {
    event.stopPropagation();
    if (auth.currentUser) {
      $("#add-train").modal("show");

      let row = event.target.closest(".train-info");
      let id = row.getAttribute("data-id");
      $("#form").attr("data-id", id)

      database.collection("train-data").doc(id).get().then(function (querySnapshot) {
        console.log(querySnapshot.data());
        let value = querySnapshot.data();

        $("#name").val(value.name);
        $("#destination").val(value.destination);
        $("#first-train").val(moment(value.firstTrain, "X").format("HH:mm"));
        $("#frequency").val(value.frequency);
      });
      row.remove();
    }
  });

  // deleting data
  $("#del-train").on("click", function (event) {
    event.stopPropagation();
    let id = $("#form").data().id;
    let row = $(".train-info").find(`[data-id='${id}']`)
    $("#add-train").modal("hide");

    database.collection("train-data").doc(id).delete();
    row.remove();
  });


  $(document).on({
    mouseenter: function () {
      $(this).toggleClass("hover")
    },
    mouseleave: function () {
      $(this).toggleClass("hover")
      $(".close").hide();
    }
  }, ".active .train-info");

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

