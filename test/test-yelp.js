var yelper = require("../app/yelp/search");


yelper.search("food", "cardiology", "Sunnyvale", 2, function(error, data) {
  console.log(error);
  console.log(data);
});

/*
yelp.business("yelp-san-francisco", function(error, data) {
  console.log(error);
  console.log(data);
});
*/
