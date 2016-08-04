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

          console.log(JSON.stringify(time, null, 2);

          // TODO include sourceField, destField from client Schema config

          var options = {
            index: index,
            body: {
              query: {
                bool: {
                  must: [
                    {
                      "term": {
                        "nuage_metadata.sourcepolicygroups": d.source
                      }
                    }, 
                    {
                      "term": {
                        "nuage_metadata.destinationpolicygroups": d.destination
                      }
                    }, 
                    {
                      "range": {

                        // TODO make this dynamic.
                        "timestamp": time
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
    }

  });
};
