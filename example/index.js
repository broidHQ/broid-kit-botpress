const path = require("path");
const express = require("express");
const Bot = require("@broid/kit");
const BroidSLack = require("@broid/slack");
const BroidKitBotpress = require("@broid/kit-botpress");
const bodyParser= require("body-parser");

const app = express();
const bot = new Bot({ logLevel: "info" });
const slack  = new BroidSLack({ token: "<token>" });

bot.use(slack);
bot.use(new BroidKitBotpress({ botpressPath: path.join(__dirname, 'botpress') }));

app.use("/", bot.getRouter());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(8080);

let sent = false;
bot.hear('.*', 'Person')
  .subscribe((data) => {
    console.log("hear message", data.message);
    if (!sent) {
      sent = true;
      bot.sendText("Hi, How are you?", data.message);
    }
  });
