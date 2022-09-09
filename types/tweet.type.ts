export type tweetType = {
  id_str: string;
  text: string;
  user: {
    id_str: string;
    name: string;
    screen_name: string;
  };
  in_reply_to_screen_name: string;
  entities: {
    media: {
      type: string;
    }[];
  };
  retweeted_status: {
    user: {
      screen_name: string;
    };
  };
};
