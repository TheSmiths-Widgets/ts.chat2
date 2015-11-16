exports.definition = {
  extendModel: function(Model) {
    _.extend(Model.prototype, {
      transform: function transform() {
        var message = this.toJSON();
        return message;
      }
    });
    return Model;
  }
};