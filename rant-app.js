const { format } = require("date-fns");

const SuggestionStars = async function (req, firebase) {
  const { id, vote } = req.body;
  await firebase
    .firestore()
    .collection("suggestions")
    .doc(id)
    .set(
      {
        stars: firebase.firestore.FieldValue.increment(vote),
      },
      { merge: true }
    );
};

const SuggestionSubmission = async function (req, firebase) {
  const { formVal } = req.body;
  await firebase.firestore().collection("suggestions").add({
    suggestion: formVal,
    date: new Date(),
  });
};

const WorthySubmission = async function (req, firebase) {
  const { type, contentID } = req.body;
  await firebase
    .firestore()
    .collection("reacts")
    .doc(contentID)
    .set(
      {
        [type]: firebase.firestore.FieldValue.increment(1),
        byDay: {
          [format(new Date(), "yyyy-MM-dd")]: {
            [type]: firebase.firestore.FieldValue.increment(1),
          },
        },
      },
      { merge: true }
    );
};

module.exports = {
  WorthySubmission,
  SuggestionStars,
  SuggestionSubmission,
};
