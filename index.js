require("dotenv").config();
const { format } = require("date-fns");
const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3000;
const _ = require("lodash");
var bodyParser = require("body-parser");
const INDEX = "/index.html";
const twilioSend = require("twilio")(
  process.env.TWILIO_ACCOUNTSID,
  process.env.TWILIO_AUTHTOKEN
);

const { addAuthor } = require("./addAuthor.js");
const { createPR } = require("./createPR.js");
const { createBranch } = require("./createBranch.js");
const { addPost } = require("./addPost.js");

const numbers = [process.env.YP_PHONE, process.env.SLD_PHONE];

const oAuthToken = process.env.GITHUB_BOT_AUTH;
const owner = "DesignRant";
const repo = "designrant-app";
const headers = {
  "Content-Type": "application/json",
  Authorization: `token ${oAuthToken}`,
};

var cors = require("cors");
var allowedList = ["https://designrant.app/", "http://localhost:8000/", "*"];
var corsOptions = {
  origin: function (origin, callback) {
    if (allowedList.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
app.use(cors(corsOptions));

app.use(bodyParser.json());

app.post("/posts-statuses", async (req, res) => {
  const { ids } = req.body;
  Promise.all(
    ids.map((id) => {
      return new Promise((resolve, rej) => {
        fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${id}`, {
          method: "get",
          headers,
        })
          .then((data) => data.json())
          .then((cleanData) => {
            const { state, number, merged } = cleanData;
            resolve({ state, number, merged });
          })
          .catch(function (error) {
            // Error handling here!
            console.log(error);
          });
      });
    })
  ).then((values) => {
    res.send(values);
  });
});

app.post("/submit-rant", async (req, res) => {
  const { author, title, isNewAuthor } = req.body;
  const currentDate = format(new Date(), "yyyy-MM-dd");

  const folderName = `${currentDate}-${_.kebabCase(title)}`;
  const branch = `content/${folderName}`;
  await createBranch(req, headers, owner, repo, folderName);

  if (isNewAuthor) {
    await addAuthor(req, headers, branch, owner, repo);
  }

  await addPost(req, headers, branch, owner, repo, currentDate, folderName);

  const { html_url, number, state } = await createPR(
    req,
    headers,
    branch,
    owner,
    repo
  );
  if (process.env.TEXT_NOTIFICATIONS) {
    numbers.forEach((phone) => {
      twilioSend.messages.create({
        body: `New post added to DesignRant: ${html_url}`,
        from: process.env.TWILIO_NUMBER,
        to: phone,
      });
    });
  }
  res.send({ post_id: number, state });
});

app.use((req, res) => res.sendFile(INDEX, { root: __dirname }));
app.listen(port, () =>
  console.log(`DesignRant API listening at http://localhost:${port}`)
);
