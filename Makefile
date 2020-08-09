AWS_ES_URL := search-twittermap-es-js5vr5nuvms4jaasag4nermqbi.us-west-2.es.amazonaws.com
LOCAL_ES_URL := http://localhost:9200
ES_INDEX_NAME := twitter

install:
	pip3 install virtualenv
	python3 -m virtualenv env
	env/bin/pip install --upgrade pip && \
	env/bin/pip install -r requirements.txt

clean:
	rm -rf env __pycache__

local-clean:
	curl -XDELETE $(LOCAL_URL)/$(ES_INDEX_NAME)

aws-clean:
	curl -XDELETE $(AWS_ES_URL)/$(ES_INDEX_NAME)

local-start:
	elasticsearch &
	sleep 5
	curl $(LOCAL_ES_URL) &
	ENV=dev python application.py

aws-start:
	eb init -p python3 twittmap7
	eb create twittmap-env7

aws-create:
	aws es create-elasticsearch-domain --domain-name twitterMap --elasticsearch-version 5.1 --elasticsearch-cluster-config InstanceType=t2.small.elasticsearch,InstanceCount=1 --ebs-options EBSEnabled=true,VolumeType=gp2,VolumeSize=10
	aws es describe-elasticsearch-domain --domain twitterMap
