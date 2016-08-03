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
        path: "/api/kibana-chord",
        method: "POST",
        handler: function(req, reply) {

          // Unpack the query parameters from the client.
          var index = req.payload.index;
          var time = req.payload.time;

          // TODO include souce, dest
          // TODO include sourceField, destField from client Schema config

          console.log(index, time);

          var options = {
            index: index,
            body: {
              query: {
                bool: {
                  must: [
                    {
                      "term": {

                        // TODO make this dynamic.
                        "nuage_metadata.sourcepolicygroups": "PG5"
                      }
                    }, 
                    {
                      "term": {

                        // TODO make this dynamic.
                        "nuage_metadata.destinationpolicygroups": "PG3"
                      }
                    }, 
                    {
                      "range": {

                        // TODO make this dynamic.
                        "timestamp": {
                          "gte": "now-1y/y",
                          "lte": "now/y",
                          "format": "epoch_millis"
                        }
                      }
                    }
                  ]
                }
              }
            }
          };

          server.plugins.elasticsearch
            .callWithRequest(req, "search", options)
            .then(function (response) {
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
