import tweepy
import json
import sys

from config.config import load_cfg

class TweetStreamListener(tweepy.StreamListener):
    def __init__(self, elasticsearch):
        tweepy.StreamListener.__init__(self)
        self.es = elasticsearch
        self.id=1

    def on_status(self, status):
        try:
            location = status.coordinates["coordinates"]
            if location is not None:
                tweet = {
                    'name': status.author.screen_name,
                    'location':{
                        'lat': location[1],
                        'lon': location[0]
                    },
                    'text': status.text,
                }
                data = json.dumps(tweet)
                ret = self.es.upload(data)
                print("upload tweet ret=%s, num: %d" % (ret, self.id))
                self.id += 1
                return True

        except TypeError:
            pass
        except:
            print("Unexpected error:", sys.exc_info()[0])
            raise

class myTweeterStream:
    def __init__(self, elasticsearch):
        self.stream = None
        self.es = elasticsearch
        self.cfg = load_cfg()

    def start(self):
        auth = tweepy.auth.OAuthHandler(self.cfg["tweepy"]["consumer_key"], self.cfg["tweepy"]["consumer_secret"])
        auth.set_access_token(self.cfg["tweepy"]["access_token"], self.cfg["tweepy"]["access_token_secret"])

        self.stream = tweepy.Stream(auth, TweetStreamListener(self.es), timeout=None)
        self.stream.filter(locations=[-180, -90, 180, 90])


