exports.definition = {
  config: {
    "columns": {
        "content": "text",
        "date": "text",
        "side": "text"
    }
  },
  extendModel: function(Model) {
    _.extend(Model.prototype, {
      transform: function transform() {
        Ti.API.debug("TRANSFORM CALLED");
        var message = this.toJSON();
        return message;
      }
    });
    return Model;
  }
};
