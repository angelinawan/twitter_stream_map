from flask import Flask, render_template, request, json

from myElasticSearch import myElasticSearch
from myTweeterStream import myTweeterStream
from threading import Thread
from config.config import load_cfg

cfg = load_cfg()
service_port = cfg["service"]["port"]
is_debug = cfg["service"]["debug"] == 'True'

es = myElasticSearch()
es.create_index()

application = Flask(__name__)

search_url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
photos_url = "https://maps.googleapis.com/maps/api/place/photo"


def start_streaming():
    print("start streaming")
    streamer = myTweeterStream(es)
    streamer.start()


print("thread starting...")
thread = Thread(target=start_streaming)
thread.start()
print("thread started")


@application.route("/", methods=["GET"])
def retrieve():
    return render_template('index.html')


@application.route('/ajax/search/', methods=['GET', 'POST'])
def search():
    keyword = request.form['keyword']
    size = request.form['size']
    ret = es.search(keyword, size)
    print("keywords:%s" % (keyword))
    print("ret:%s" % (json.dumps(ret)))
    ret = ret['hits']['hits']
    ret = json.dumps(ret)
    return ret


@application.route('/ajax/geosearch/', methods=['GET', 'POST'])
def geosearch():
    print("geosearch")
    location = request.form['location']
    size = request.form['size']
    keywords = request.form['keywords']
    coords = location.split(',')
    coords_float = [float(x) for x in coords]
    distance = request.form['distance']
    print("geo location:%s" % (location))

    ret = es.geosearch(keywords, coords_float, distance, size)
    ret = ret['hits']['hits']
    ret = json.dumps(ret)

    return ret


if __name__ == "__main__":
    application.run(debug=is_debug, port=service_port)
    print("done.")
