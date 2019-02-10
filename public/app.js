
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
    });
});


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
})

/* $.ajax({
  method: "GET",
  url: "/articles/" + thisId
})
  .then(function(data) {
    console.log("GET one article!")
    console.log(data);

  }); */