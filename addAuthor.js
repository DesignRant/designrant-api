const fetch = require('node-fetch');
const _ = require('lodash');
const fs = require('fs');
const yaml = require('js-yaml');
var base64 = require('base-64');
var utf8 = require('utf8');

const addAuthor = async function(req, headers, branch, owner, repo){
    const { author_name, author_from, author_avatar, author_website, author_shortBio, author_bio, author_twitter, author_buymeacoffee } = req.body;
    const extension = author_avatar.substring(
        author_avatar.indexOf("/") + 1,
        author_avatar.lastIndexOf(";")
    );

    const avatarFilePath = `avatars/avatar-${_.kebabCase(author_name)}.${extension}`;
    
    const authorAvatarData = author_avatar.split(",")[1]
    // 1. grab the content from response(base64 encoded)
    const getAuthors = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content/author.yaml`, {
        method: 'get',
        headers,    
    })
    const authorsJSON = await getAuthors.json()
    // console.log(authorsJSON)
    const authorsSHA = authorsJSON.sha
    // 2. decode this result as a string
    var encoded = authorsJSON.content;
    
    var bytes = base64.decode(encoded);
    var yamlText = utf8.decode(bytes);
 
    // 3. add to string the new author
    // avatar: ${author_avatar}\n
    const newAuthor = `id: ${author_name}\n  from: ${author_from}\n  avatar: ${avatarFilePath}\n  website: ${author_website}\n  shortBio: ${author_shortBio}\n  bio: ${author_bio}\n  twitter: ${author_twitter}\n  buymeacoffee: ${author_buymeacoffee}\n`
    
    yamlText = `${yamlText}\n- ${newAuthor}`;
    fs.writeFileSync('updated-Authors.yaml', yamlText, 'utf8');

    yamlText = base64.encode(utf8.encode(yamlText));

    // 4. use same method as below to then update author.yaml -> have to include branch in the body when you do this
    const yamlBody = {
        committer: {
            name: "DesignRantBot",
            email: "hello@designrant.app"
        },
        sha:authorsSHA,
        branch, // if you leave this blank it defaults to master - DO NOT
        message: `authors.yaml+${author_name}`,
        content: yamlText
    }
    const addYamlFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content/author.yaml`, {
        method: 'put',
        headers,
        body: JSON.stringify(yamlBody)
    })

    const avatarBody = {
        committer: {
            name: "DesignRantBot",
            email: "hello@designrant.app"
        },
        branch, // if you leave this blank it defaults to master - DO NOT
        message: `+${avatarFilePath}`,
        content: authorAvatarData
    }

    const addMDFile = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/content/${avatarFilePath}`, {
        method: 'put',
        headers,
        body: JSON.stringify(avatarBody)    
    }).catch(function(error) {
        // Error handling here!
        console.log(error);   
    });

    return true
}

module.exports = {
    addAuthor
}