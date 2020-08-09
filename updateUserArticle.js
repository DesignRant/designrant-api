var firebase = require("firebase-admin");

const updateUserArticle = async function (
    firebaseWriter,
    uid,
    articleTitle,
    prNumber
) {    
    await firebaseWriter
        .firestore()
        .collection("users")
        .doc(uid)
        .set(
        {
            articles: firebase.firestore.FieldValue.arrayUnion({ articleTitle, prNumber}),
        },
        { merge: true }
    );
}

module.exports = {
    updateUserArticle,
};
  