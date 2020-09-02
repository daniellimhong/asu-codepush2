// DEBUG
// HELPER FUNCTIONS

function getSampleData() {
  // console.log('Generating sample data');
  const SAMPLE_COUNT = 25;

  const WORDS = [
    "vestibulum",
    "ante",
    "ipsum",
    "primis",
    "faucibus",
    "ultrices",
    "ullamcorper",
    "suscipit",
    "volutpat",
    "felis",
    "luctus",
    "ligula"
  ];

  const TASK_DATA_MODEL = {
    id: "String",
    title: "String",
    body: "String",
    completed: false,
    tags: ["tag1", "tag2", "tag3"],
    date: {
      start: null,
      end: null
    }
  };

  var sampleData = [];

  for (var i = 0; i < SAMPLE_COUNT; i++) {
    var newData = Object.assign({}, TASK_DATA_MODEL);
    newData.date = {
      start: null,
      end: null
    };
    var date = new Date();

    newData.id = i + "";

    newData.date.start =
      parseInt(date.getTime()) +
      getRandomInt(i * 3600 * 3600, i * 3600 * 3600 * 5);
    newData.date.end =
      parseInt(date.getTime()) +
      getRandomInt(i * 3600 * 3600, i * 3600 * 3600 * 5);

    newData.completed = getRandomInt(0, 1);

    newData.title =
      WORDS[getRandomInt(0, WORDS.length - 1)] +
      " " +
      WORDS[getRandomInt(0, WORDS.length - 1)] +
      " " +
      WORDS[getRandomInt(0, WORDS.length - 1)];

    sampleData.push(newData);
  }

  return sampleData;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { getSampleData };
