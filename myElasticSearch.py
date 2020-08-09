from elasticsearch import Elasticsearch
from elasticsearch import RequestsHttpConnection
from config.config import load_cfg


class myElasticSearch:
    def __init__(self):
        self.cfg = load_cfg()

        self.index = self.cfg["elastic_search"]["index"]
        self.mapping_name = self.cfg["elastic_search"]["mapping_name"]
        self.end_point = self.cfg["elastic_search"]["url"]
        self.port = int(self.cfg["elastic_search"]["port"])

        print("try connecting to ES...")
        self.es = self.connectES()
        print("connect to ES successfully, ES info:")
        print(self.es.info())
        print("ElasticSearch init done")

    def connectES(self):
        print("Connecting to the ES Endpoint: {}".format(self.end_point))
        try:
            # esClient = Elasticsearch(
            #     # http_auth=('user', 'secret'),
            #     # scheme="https",
            #     # port=self.port)
            #     hosts=[{'host': self.end_point, 'port': self.port}],
            #     use_ssl=True,
            #     verify_certs=True,
            #     connection_class=RequestsHttpConnection)
            if self.cfg['env'] == 'dev':
                esClient = Elasticsearch([{'host': self.end_point, 'port': 9200}])
            else:
                esClient = Elasticsearch([{'host': self.end_point, 'port': 9200}])
            if not esClient.ping():
                raise Exception("can't ping to es after client created")
            return esClient
        except Exception as E:
            print("Unable to connect to {}".format(self.end_point))
            print(E)
            exit(3)

    def clear(self, index_):
        self.es.indices.delete(index=index_, ignore=[400, 404])

    def create_index(self):
        print("create index {}".format(self.index))
        if self.es.indices.exists(self.index):
            print("index {} already existed, return.".format(self.index))
            return

        mapping = {
            "mappings": {
                "properties": {
                    "location": {
                        "type": "geo_point"
                    },
                    "name": {
                        "type": "keyword"
                    },
                    "text": {
                        "type": "keyword"
                    }
                },
            }
        }
        self.es.indices.create(index=self.index, body=mapping)
        print("create index done")

    def upload(self, data):
        return self.es.index(index=self.index, body=data)

    def search(self, keyword, size):
        data = {
            "query":
                {"match":
                     {"_all": keyword}
                 },
            "size": size,
        }
        newRes = self.es.search(index=self.index, body=data)
        return newRes

    def geosearch(self, keyword, coords, distance, size):
        data = {
            "query": {
                "bool": {
                    "must": {
                        "query_string": {
                            "query": "*{}*".format(keyword.strip()),
                            "default_field": "text"
                        },
                    },
                    "filter": {
                        "geo_distance": {
                            "distance": '%skm' % (distance),
                            "location": {
                                'lat': "%f" % (coords[0]),
                                'lon': "%f" % (coords[1])
                            }
                        }
                    }
                }
            },
            "size": size,
        }
        print("geosearch request data: {}".format(data))
        newRes = self.es.search(index=self.index, body=data)
        return newRes
