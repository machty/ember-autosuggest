var precompileTemplate = Ember.Handlebars.compile,
    get = Ember.get,
    set = Ember.set,
    addObserver = Ember.addObserver,
    removeObserver = Ember.removeObserver;

EmberAutosuggest.AutoSuggestView = Ember.View.extend({
  classNameBindings: [':autosuggest'],
  minChars: 1,
  searchPath: 'name',
  query: Ember.computed.alias('controller.query'),

  hasQuery: Ember.computed(function(){
    var query = get(this, 'query');

    if( query && query.length > get(this, 'minChars')){
      this.positionResults();
      return true;
    }

    return false;
  }).property('query'),

  defaultTemplate: precompileTemplate(
    "<ul class='selections'>" +
    "{{#each autosuggestSelections}}" +
    "  <li class=\"selection\">{{display}}<\/li>" +
    "{{/each}}" +
    "<li>{{view view.autosuggest}}<\/li>" +
    "<\/ul>"+
    "<div {{bindAttr class=':results view.hasQuery::hdn'}}>" +
       "<ul class='suggestions'>" +
       "{{#each searchResults}}" +
       "  <li {{action addSelection this}} class=\"result\">{{display}}<\/li>" +
       "{{else}}" +
       " <li class='no-results'>No Results.<\/li>" +
       "{{/each}}" +
       "<\/ul>" +
    "<\/div>"
  ),

  positionResults: function(){
    var input = this.$('input.autosuggest');
    var results = this.$('ul.suggestions');
    var position = input.position();
    results.css('position', 'absolute');
    results.css('left', position.left);
    results.css('top', position.top + input.height() + 7);
  },

  autosuggest: Ember.TextField.extend({
    classNameBindings: [':autosuggest'],
    searchPathBinding: 'parentView.searchPath',
    sourceBinding: 'parentView.source',
    valueBinding: 'controller.query',

    didInsertElement: function(){
      addObserver(this, 'value', this.valueDidChange);
    },
    willDestroyElement: function(){
      this._super.apply(this, arguments);
      removeObserver(this, 'value', this.valueDidChange);
    },
    valueDidChange: function(){
      var source = get(this, 'source'),
          value = get(this, 'value'),
          self = this,
          searchResults = get(this, 'controller.searchResults');

      searchResults.clear();

      if(!source){
        return;
      }

      if(value.length <= get(this, 'parentView.minChars')){
        return;
      }

      get(this, 'parentView').positionResults();

      //TODO: filter out selected results
      var results = source.filter(function(item){
        return item.get(get(self, 'searchPath')).toLowerCase().search(value.toLowerCase()) !== -1;
      });

      if(get(results, 'length') === 0){
        return;
      }

      searchResults.pushObjects(results.map(function(item){
        return Ember.Object.create({display: get(item, get(self, 'searchPath')), data: item});
      }));
    }
  }),
});
