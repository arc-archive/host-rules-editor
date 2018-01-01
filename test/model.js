var lastId = 1;
var HostModel = {
  fire: function(type, detail) {
    var ev = new CustomEvent(type, {
      detail: detail,
      cancelable: false,
      bubbles: true
    });
    document.body.dispatchEvent(ev);
  },

  register: function() {
    HostModel.registerDelete();
    HostModel.registerList();
    HostModel.registerUpdate();
  },

  registerDelete: function() {
    window.addEventListener('host-rules-deleted', function(e) {
      if (!e.cancelable || e.defaultPrevented) {
        return;
      }
      e.preventDefault();
      e.detail.result = Promise.resolve();
      var opts = {
        rule: e.detail.rule
      };
      setTimeout(function() {
        HostModel.fire('host-rules-deleted', opts);
      }, 5);
    });
  },

  registerUpdate: function() {
    window.addEventListener('host-rules-changed', function(e) {
      if (!e.cancelable || e.defaultPrevented) {
        return;
      }
      e.preventDefault();
      var opts = {
        rule: e.detail.rule
      };
      if (!opts.rule._id) {
        opts.rule._id = lastId++;
      }
      e.detail.result = Promise.resolve(opts.rule);
      setTimeout(() => HostModel.fire('host-rules-updated', opts), 5);
    });
  },

  registerList: function() {
    window.addEventListener('host-rules-list', function(e) {
      e.preventDefault();
      e.stopPropagation();
      var rules = window.HOST_RULES || [];
      e.detail.result = Promise.resolve(rules);
    });
  }
};
HostModel.register();
