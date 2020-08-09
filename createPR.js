const fetch = require("node-fetch");

const createPR = async function (req, headers, branch, owner, repo) {
  const { author, title } = req.body;

  const prBody = {
    title: `New Post: ${title} by ${author}`,
    body: `New content submission by ${author} - "${title}".`,
    head: branch,
    base: "master",
  };

  const makePR = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      method: "post",
      headers,
      body: JSON.stringify(prBody),
    }
  ).catch(function (error) {
    // Error handling here!
    console.log(error);
  });

  const PRResponse = await makePR.json();
  console.log(PRResponse);
  return PRResponse;
};

module.exports = {
  createPR,
};
