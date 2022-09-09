require("dotenv").config();
import client from "./auth";
import http from "http";
import path from "path";
import express, { Request, Response } from "express";
import { tweetType } from "./types/tweet.type";
import { checkMember } from "./checkMember";
import axios from "axios";
import fs from "fs";

const PORT = 3000;

const app = express();
const server = http.createServer(app);

app.get("/", (req: Request, res: Response) => {
  res.send("Application is running....");
});

app.get("/logs", (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, "./", "logs.txt"));
});

const stream = client.stream("statuses/filter", { follow: process.env.ID_TWITTER });

const sendBroadcast = async (tweet: tweetType) => {
  const { id_str, text, user, in_reply_to_screen_name, entities, retweeted_status } = tweet;

  const currentdate = new Date();
  const datetime: string = `${currentdate.getDate()}/${currentdate.getMonth() + 1}/${currentdate.getFullYear()} ${currentdate.getHours() < 10 ? "0" + currentdate.getHours() : currentdate.getHours()}:${
    currentdate.getMinutes() < 10 ? "0" + currentdate.getMinutes() : currentdate.getMinutes()
  }:${currentdate.getSeconds() < 10 ? "0" + currentdate.getSeconds() : currentdate.getSeconds()}`;

  const { TOKEN_ACCESS_API, CHAT_ID } = process.env;

  var broadcastMsg: string = "";

  //checking type tweet
  broadcastMsg += `📢 Notifikasi untuk <b>${user.name}</b>\n\n`;
  if (in_reply_to_screen_name) {
    broadcastMsg += `<b>${user.screen_name}</b> mereply tweetnya <b>${in_reply_to_screen_name === user.screen_name ? "sendiri" : in_reply_to_screen_name} 📳</b>`;
  } else if (retweeted_status) {
    broadcastMsg += `🔁 <b>${user.screen_name}</b> meretweet tweetnya <b>${retweeted_status.user.screen_name === user.screen_name ? "sendiri" : retweeted_status.user.screen_name}</b>`;
  } else if (entities.media) {
    broadcastMsg += `📸 <b>${user.screen_name}</b> membagikan ${entities.media[0].type}`;
  } else if (!in_reply_to_screen_name && !retweeted_status && !entities.media) {
    broadcastMsg += `📝 <b>${user.screen_name}</b> membagikan tweet barunya`;
  }
  broadcastMsg += `\nhttps://twitter.com/${user.screen_name}/status/${id_str}`;
  broadcastMsg += `\n\n<i>Klik link di atas untuk melihat tweet selengkapnya, jika link tidak bisa diakses kemungkinan member menghapus tweetnya</i>`;

  await axios
    .post(`https://api.telegram.org/bot${TOKEN_ACCESS_API}/sendMessage`, {
      text: broadcastMsg,
      parse_mode: "HTML",
      disable_web_page_preview: false,
      disable_notification: false,
      reply_to_message_id: null,
      chat_id: CHAT_ID,
    })
    .then(() => {
      const logs: string = `${datetime} sending notification from ${user.name} success`;
      try {
        fs.appendFileSync("./logs.txt", `${logs}\n`);
        // file written successfully
      } catch (err) {
        console.error(err);
      }
      console.log(logs);
    })
    .catch((e: any) => {
      console.log(e);
    });
};

const countActivity = async (name: string) => {
  const member = JSON.parse(fs.readFileSync("countActivity.json", "utf-8"));

  member[name] += 1;

  fs.writeFileSync("countActivity.json", JSON.stringify(member));
};

stream.on("tweet", async (tweet: tweetType) => {
  try {
    const { user } = tweet;
    const isMember = await checkMember(user.id_str);
    if (isMember) {
      await sendBroadcast(tweet);
      await countActivity(user.screen_name);
    }
  } catch (error: any) {
    try {
      fs.appendFileSync("./logs.txt", `something error\n`);
      // file written successfully
    } catch (err) {
      console.error(err);
    }
    console.log(error);
  }
});

server.listen(PORT, () => {
  console.log(`Server ready to serve and running on port ${PORT}`);
});
