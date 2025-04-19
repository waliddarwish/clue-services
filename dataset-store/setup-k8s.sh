
cockroach init --certs-dir=/opt/dataset-store/certs  --host=dataset-store-node-1:9600

cockroach sql  --certs-dir=/opt/dataset-store/certs --host dataset-store-node-1 --port 9600  < /var/clue/datasets.sql