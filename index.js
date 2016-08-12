module.exports = function(kibana) {
  return new kibana.Plugin({

    // Export the front-end visualization definition.
    uiExports: {
      visTypes: [
        "plugins/kibana-chord/chord"
      ]
    },

    // Define our custom server-side middleware for
    // custom ElasticSearch queries.
    init: function (server, options) {

      // This route is for the initial search query.
      server.route({
        path: "/api/kibana-chord",
        method: "POST",
        handler: function(req, reply) {

          // The payload can be expected to have the following properties:
          //
          // * d.index - Name of the ES index to query.
          // * d.time - Parameters from the global Kibana time selector.
          // * d.source - Value for the source of the clicked ribbon.
          // * d.destination - Value for the destination of the clicked ribbon.
          var d = req.payload;

          // Unpack the query parameters from the client.
          var index = req.payload.index;
          var time = req.payload.time;

          // TODO include sourceField, destField from client Schema config
          var options = {
            index: index,
            scroll: "30s",
            body: {
              sort: [
                { "timestamp": { "order": "desc" } }
              ],
              query: {
                bool: {
                  should: [
        	  {
           	    "bool": {
             	      "must": [
                        {"term": {"nuage_metadata.sourcepolicygroups": d.source} },
                        { "term": {"nuage_metadata.destinationpolicygroups": d.destination} },
                        {"range": { "timestamp": time }}
                      ]
                    }
                  },
                  {
                    "bool": {
                      "must": [
                        { "term": {"nuage_metadata.sourcepolicygroups": d.destination} },
                        { "term": {"nuage_metadata.destinationpolicygroups": d.source} },
                        {"range": { "timestamp": time }}
                      ] 
                    }
                  }
                 ]
                }
              }
            }
          };
          // Execute the query and pass it to the client as JSON.
          server.plugins.elasticsearch
            .callWithRequest(req, "search", options)
            .then(function (response) {
              reply(JSON.stringify(response, null, 2));
            });
        }
      });

      // This route is for scrolling through results.
      server.route({
        path: "/api/kibana-chord-scroll",
        method: "POST",
        handler: function(req, reply) {
          console.log("Inside Scroll Handler");
        }
      });
    }

  });
};
