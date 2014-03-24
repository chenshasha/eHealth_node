var yelp_creds = require("../../config/yelp-config");
var yelp = require("../../lib/yelp").createClient(yelp_creds);

function search(term, category, location, limit, callback){
	var params = {};
	if(term){
		params.term=term;
	}
	if(category){
		params.category_filter=category;
	}
	if(location){
		params.location = location;
	}
	if(limit > 0){
		params.limit = limit<=50?limit:50;
	}
	yelp.search( params, callback);
}

exports.search=search;