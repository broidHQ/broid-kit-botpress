[npm]:https://img.shields.io/badge/npm-broid-green.svg?style=flat
[npm-url]:https://www.npmjs.com/org/broid

[node]:https://img.shields.io/node/v/@broid/broid-kit-botpress.svg
[node-url]:https://nodejs.org

[tests]:https://img.shields.io/travis/broidHQ/broid-kit-botpress/master.svg
[tests-url]:https://travis-ci.org/broidHQ/broid-kit-botpress

[bithound]:https://img.shields.io/bithound/code/github/broidHQ/broid-kit-botpress.svg
[bithound-url]:https://www.bithound.io/github/broidHQ/broid-kit-botpress

[bithoundscore]:https://www.bithound.io/github/broidHQ/broid-kit-botpress/badges/score.svg
[bithoundscore-url]:https://www.bithound.io/github/broidHQ/broid-kit-botpress

[nsp-checked]:https://img.shields.io/badge/nsp-checked-green.svg?style=flat
[nsp-checked-url]:https://nodesecurity.io

[gitter]:https://badges.gitter.im/broidHQ/broid.svg
[gitter-url]:https://t.broid.ai/c/Blwjlw?utm_source=github-botpress&utm_medium=readme&utm_campaign=top&link=gitter

[join-slack]:https://img.shields.io/badge/chat-on_slack-lightgrey.svg?style=flat
[join-slack-url]:http://slackin.broid.ai/

[![npm][npm]][npm-url]
[![node][node]][node-url]
[![bithound][bithound]][bithound-url]
[![bithoundscore][bithoundscore]][bithoundscore-url]
[![nsp-checked][nsp-checked]][nsp-checked-url]

# Broid Kit Botpress

**Broid Kit Botpress** is one of the [broid-kit](https://github.com/broidHQ/broid-kit) middlewares to integrate [botpress](https://github.com/botpress/botpress) with [Broid Integrations](https://github.com/broidHQ/integrations/) which allows you to leverage the largest collection of messaging channels integrated in a given framework.

This middleware support `Incoming` and `Outcoming` messages.

> Connect your application to multiple messaging channels using W3C Open standards.

[![gitter][gitter]][gitter-url] [![join-slack][join-slack]][join-slack-url]

# Quick Example

```javascript

const path = require("path");
const Bot = require("@broid/kit");
const BroidDiscord = require("@broid/kit-botpress");
const BroidMessenger = require("@broid/messenger");
const BroidSlack = require("@broid/slack");

const bot = new Bot({
  logLevel: "info",
  http: {
    host: "0.0.0.0",
    port: 8080,
  }
});

bot.use(new BroidSlack(<...options>));
bot.use(new BroidDiscord(<...options>));
bot.use(new BroidMessenger(<...options>));
bot.use(new BroidKitBotpress({
  botpressPath: path.join(__dirname, 'botpress')
}));

// Listening for public starting by `hello`
  bot.hear("hello.*", "Group")
    .subscribe((data) => {
      console.log("Data:", JSON.stringify(data, null, 2));

      // Reply to the message
      bot.sendText("Hi, How are you?", data.raw);
    });
  ```

# Documentation

## Quick Start

1. Create a new node projects

```bash
$ npm init
```

2. Install and initialize a new botpress project

```bash
$ npm -g i botpress
$ mkdir botpress && cd botpress && botpress init
```
take a coffee ;)

3. Install **broid-kit**

```bash
$ cd .. && npm i --save @broid/kit
```

4. Install all the broid integrations you need. You can see the full list [here](https://github.com/broidHQ/integrations/)

```bash
$ npm i --save @broid/skype @broid/slack @broid/messenger @broid/discord
```

5. Install `broid-kit-botpress`

```bash
$ npm i --save @broid/kit-botpress
```

6. Copy past the basic code and play with it!

```javascript

const path = require("path");
const Bot = require("@broid/kit");
const BroidSLack = require("@broid/slack");
const BroidDiscord = require("@broid/kit-botpress");
const BroidMessenger = require("@broid/messenger");
const BroidKitBotpress = require("@broid/kit-botpress");

const bot = new Bot({
  logLevel: "info",
  http: {
    host: "0.0.0.0",
    port: 8080,
  }
});

bot.use(new BroidSlack(<...options>));
bot.use(new BroidDiscord(<...options>));
bot.use(new BroidMessenger(<...options>));

bot.use(new BroidKitBotpress({
  botpressPath: path.join(__dirname, 'botpress')
}));

bot.hear('.*', 'Person')
  .subscribe((data) => {
    console.log("hear data", data);
  });
```
