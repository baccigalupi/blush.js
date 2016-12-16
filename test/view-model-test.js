describe('Blush.ViewModel', function() {
  var app, ViewModel, viewModel;

  beforeEach(function() {
    app = {
      data: function() {
        return {
          current_user: {name: 'Kane', id: 42}
        };
      }
    };
  });

  it('makes empty json when not setup with stuff', function() {
    ViewModel = Blush.ViewModel.extend();
    viewModel = new ViewModel({app: app});
    expect(viewModel.json()).toEqual({});
  });

  it('puts empty values in keys when attributes specified but no attributes of function given', function() {
    ViewModel = Blush.ViewModel.extend({
      attributes: ['not_here', 'or_here']
    });

    viewModel = new ViewModel({app: app});
    expect(viewModel.json()).toEqual({
      not_here: undefined,
      or_here: undefined
    });
  });

  it('finds data in app data and uses it for attributes', function() {
    ViewModel = Blush.ViewModel.extend({
      attributes: ['current_user']
    });

    viewModel = new ViewModel({app: app});
    expect(viewModel.json()).toEqual({
      current_user: {name: 'Kane', id: 42},
    });
  });

  it('finds local attributes', function() {
    ViewModel = Blush.ViewModel.extend({
      attributes: ['answer_to_life'],
      answer_to_life: 42
    });

    viewModel = new ViewModel({app: app});
    expect(viewModel.json()).toEqual({
      answer_to_life: 42,
    });
  });

  it('calls local methods to create attributes', function() {
    ViewModel = Blush.ViewModel.extend({
      attributes: ['answer_to_life'],
      answer_to_life: function() {
        return 42;
      }
    });

    viewModel = new ViewModel({app: app});
    expect(viewModel.json()).toEqual({
      answer_to_life: 42,
    });
  });

  it('looks for camelcase versions of the method', function() {
    ViewModel = Blush.ViewModel.extend({
      attributes: ['answer_to_life'],
      answerToLife: 42
    });

    viewModel = new ViewModel({app: app});
    expect(viewModel.json()).toEqual({
      answer_to_life: 42,
    });
  });

  it('escapes html escapes all the keys', function() {
    ViewModel = Blush.ViewModel.extend({
      attributes: ['user_input'],
      userInput: '<script>doMeWrong(window);</script>'
    });

    viewModel = new ViewModel({app: app});

    expect(viewModel.json()).toEqual({
      user_input: '&lt;script&gt;doMeWrong(window);&lt;&#x2F;script&gt;',
    });
  });
});
