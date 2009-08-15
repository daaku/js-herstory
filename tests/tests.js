var TestData = [
  {
    url: '',
    expect: '',
    message: 'Page loaded.'
  },
  {
    url: '#one',
    expect: 'one',
    message: 'Click here and expect "one".'
  },
  {
    url: '#two',
    expect: 'two',
    message: 'Click here and expect "two".'
  },
  {
    expect: 'one',
    message: 'Click the back button and expect "one".'
  },
  {
    url: 'index.html#three',
    expect: 'three',
    message: 'Click here and expect "three".'
  },
  {
    load: 'xyz',
    expect: 'xyz'
  },
  {
    expect: 'three',
    message: 'Click the back button and expect "three".'
  },
  {
    expect: 'xyz',
    message: 'Click the forward button and expect "xyz".'
  },
  {
    url: '#',
    expect: '',
    message: 'Click here and expect "".'
  }
];

test(
  'human',

  function() {

    expect(TestData.length);

    var guide = document.getElementById('guide');
    var stepIndex = 0;

    function doStep() {
      var step = TestData[stepIndex];

      if (step.load) {
        Herstory.load(step.load);
        return;
      }
      var html;
      if (step.url) {
        html = '<a id="action" href="' + step.url + '">' + step.message + '</a>';
      } else {
        html = step.message;
      }
      guide.innerHTML = html;
    }

    function hashChange(hash) {
      var step = TestData[stepIndex];
      equals(step.expect,
             hash,
             "expecting '" + step.expect + "', " +
             "got '" + hash + "', " +
             "for step: " + stepIndex);
      stepIndex++;

      // either we're done, or we doStep the next step
      if (stepIndex == TestData.length) {
        start();
        guide.innerHTML = '';
      } else {
        doStep();
      }
    }
    Herstory.init(hashChange, "herstory_iframe.html");

    stop();
  }
);
