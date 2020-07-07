const fetch = require("node-fetch");

const createBranch = async function (req, headers, owner, repo, folderName) {
  const master = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/master`,
    {
      method: "get",
      headers,
    }
  );
  const masterJSON = await master.json();
  const { sha } = masterJSON.object;

  const ref = `refs/heads/content/${folderName}`;
  const newBranchBody = {
    sha,
    ref,
  };
  await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
    method: "post",
    headers,
    body: JSON.stringify(newBranchBody),
  }).catch(function (error) {
    // Error handling here!
    console.log(error);
  });
};

module.exports = {
  createBranch,
};
