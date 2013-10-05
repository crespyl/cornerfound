var api = {
    opts: {
	apiURL: '/api'
    },
    get_json: function(action, params, callback) {
	action = api.opts.apiURL +'/'+ action;
	$.getJSON(action, params, callback);
    }
};
