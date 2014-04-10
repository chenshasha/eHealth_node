var yelper = require("../app/yelp/yelpApi");


yelper.search("food", "cardiology", "Sunnyvale", 2, function(error, data) {
  console.log(error);
  console.log(data);
});

yelper.get("yelp-san-francisco", function(error, data) {
  console.log(error);
  console.log(data);
});
