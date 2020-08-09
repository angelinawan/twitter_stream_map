import yaml
import os


def load_cfg():
	with open("config/base.yaml", 'r') as stream:
		cfg = yaml.safe_load(stream)
	cur_env = os.environ.get('ENV', 'prod')
	with open("config/{}.yaml".format(cur_env), 'r') as stream:
		cfg.update(yaml.safe_load(stream))
	cfg['env'] = cur_env
	print("cfg loaded: {}".format(cfg))
	return cfg
