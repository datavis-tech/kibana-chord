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
      server.route({
        path: "/api/kibana-chord/{source}/{destination}",
        method: "GET",
        handler: function(req, reply) {

          server.plugins.elasticsearch.callWithRequest(req, "search", {
            index: "flowindex",
            body: {
              query: {  
                bool: {   
                  must: [   
                    { "term": {"nuage_metadata.sourcepolicygroups": "PG5"} }, 
                    { "term": {"nuage_metadata.destinationpolicygroups": "PG3"} }, 
                    { "range": { "timestamp": {"gte": "now-1y/y", "lte": "now/y", "format": "epoch_millis"}}}
                  ]
                }
              }
            }
          }).then(function (response) {
            reply(JSON.stringify(response, null, 2));
          });

          //reply([
          //  "Source: " + req.params.source,
          //  "Destination: " + req.params.destination
          //].join("<br>"));
        }
      });
    }

  });
};
