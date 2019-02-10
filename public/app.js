// saving an article
$(".save").on("click", function() {

  var thisId = $(this).attr("data-id");
  console.log(thisId);

  $.ajax({
    method: "POST",
    url: "/saveArticle/" + thisId
  })
    .then(function(data) {
      console.log("POST and save article!");
      console.log(data);
      alert("Article Saved!");
      location.reload();
    });
});

// unsaving an article
$(".delete").on("click", function() {

  var thisId = $(this).attr("data-id");
  console.log(thisId);

  $.ajax({
    method: "POST",
    url: "/deleteArticle/" + thisId
  })
    .then(function(data) {
      console.log("Removed saved article!");
      console.log(data);
      alert("Article Removed!");
      location.reload();
    });
});

// displaying notes for selected Article
$("#note-display").on("click", function() {

    var thisId = $("#unsave").attr("data-id");
    console.log(thisId);

    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      .then(function(data) {
        console.log(data);
        $(".modal-title").text("Article: " + data._id);
        $("#ModalCenter").modal('show');
      })
 
 
})


// saving note for a specific article
$("#save-note").on("click", function() {
  
  var thisId = $("#unsave").attr("data-id");
  console.log(thisId);

  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
        body: $("#note-text").val()
    }
  })
   .then(function(data) {
     console.log(data);

   });
});
