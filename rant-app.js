const { format } = require("date-fns");

const SuggestionSubmission = async function (req) {};

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
};
