exports.definition = {
    config: {
        columns: {
            "objectId":         "TEXT PRIMARY KEY",
            "content":          "TEXT",
            "emitter":          "TEXT",
            "recipient":        "TEXT",
            "created_at":       "TEXT" // YYYY-MM-DD HH:MM:SS
        }
    },
	extendCollection: function(Collection) {
		_.extend(Collection.prototype, {
            // Keep this collection sorted by
            // http://stackoverflow.com/questions/5013819/reverse-sort-order-with-backbone-js
			initialize: function () {
                this.sortField = "created_at"; // Default sort field
                this.sortDirection = "ASC"; // Default sort direction
            },

            comparator: function(a, b) {
                left = a.get(this.sortField);
                right = b.get(this.sortField);
                if (left < right)
                    ret = -1;
                else if (left > right)
                    ret = 1;
                else
                    ret = 0;

                if (this.sortDirection === "DESC")
                    ret = -ret;

                return ret;
            }
        });
        return Collection;
	}
};
