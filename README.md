# TwitterMap
http://twittmap.7bpfzbdmy8.us-west-2.elasticbeanstalk.com/

Used technologies:
 - AWS Elastic Beanstalk: manage web service
 - AWS Elastic Search: Tweets info storage and search (text and geo search)
 - Flask: Python web service framework
 - Twitter API: get stream real-time Twitter data
 - Google Map API: render google map and show Twitter location on Map

![demo_geo_search.png](doc/demo_geo_search.png?raw=true "GeoMapDemo")

# Dev Guide (Local Mac)
1. Get TweePy access, please follow doc [here](http://docs.tweepy.org/en/latest/auth_tutorial.html). And then fill the `config/base.yaml` fields:
```yaml
tweepy:
  consumer_key: <PLEASE_FILL_HERE>
  consumer_secret: <PLEASE_FILL_HERE>
  access_token: <PLEASE_FILL_HERE>
  access_token_secret: <PLEASE_FILL_HERE>
```
2. Install ES on Mac
```bash
brew tap elastic/tap
brew install elastic/tap/elasticsearch-full
```
3. Install python env
```bash
make install
source env/bin/activate
```
4. Start local service
```bash
make local-start
```

# Dev Guide (AWS)
1. Install AWS CLI (for mac follow instructions [here](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2-mac.html))

