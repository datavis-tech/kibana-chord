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
    }

  });
};
