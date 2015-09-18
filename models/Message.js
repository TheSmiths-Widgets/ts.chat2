exports.definition = {
  extendModel: function(Model) {
    _.extend(Model.prototype, {
      transform: function transform() {
        Ti.API.debug("TRANSFORM CALLED"); // TODO delete
        var message = this.toJSON();
        return message;
      }
    });
    return Model;
  }
};