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

function get(id, callback){
	yelp.business(id, callback);
}

exports.search=search;
exports.get = get;