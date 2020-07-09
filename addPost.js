const fetch = require("node-fetch");
const _ = require("lodash");
var base64 = require("base-64");
var utf8 = require("utf8");

const addPost = async function (
  req,
  headers,
  branch,
  owner,
  repo,
  currentDate,
  folderName
) {
  const { author, title, description, tags, markdown, hero } = req.body;
  // update the markdown body with frontmatter
  var decodedMarkdown = base64.decode(utf8.decode(markdown));

  const extension = hero
    .substring(hero.indexOf("/") + 1, hero.lastIndexOf(";"))
    .split(";")[0];

  const newFrontMatter = {
    title,
    author,
    type: "Post",
    date: currentDate,
    hero: `./hero.${extension}`,
    description,
    tags,
  };

  decodedMarkdown = `---\n${Object.keys(newFrontMatter)
    .map((key) => `${key}: ${newFrontMatter[key]}\n`)
    .join("")}---\n${decodedMarkdown}`;
  encodedMarkdown = base64.encode(utf8.encode(decodedMarkdown));
  //3. We add our new markdown file to that new branch
  const MDBody = {
    committer: {
      name: "DesignRantBot",
      email: "hello@designrant.app",
    },
    branch,
    message: `+content/${folderName}`,
    content: encodedMarkdown,
  };

  const addMDFile = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/content/blog/${folderName}/index.md`,
    {
      method: "put",
      headers,
      body: JSON.stringify(MDBody),
    }
  );
  const heroData = hero.split(",")[1];
  const heroBody = {
    committer: {
      name: "DesignRantBot",
      email: "hello@designrant.app",
    },
    branch,
    message: `+content/${folderName}/hero.${extension}`,
    content: heroData,
  };

  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/content/blog/${folderName}/hero.${extension}`,
    {
      method: "put",
      headers,
      body: JSON.stringify(heroBody),
    }
  );

  console.log("YAY");
};
module.exports = {
  addPost,
};
