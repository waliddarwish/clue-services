


cockroach init --certs-dir=/opt/dataset-store/certs  --host=dataset-store-node-1:9600

cockroach sql  --certs-dir=/opt/dataset-store/certs --host dataset-store-node-1 --port 9600 < /opt/dataset-store/datasets.sql




node upload-certs.js mongos-router0 27017 catalog /opt/dataset-store/certs/ca.crt /opt/dataset-store/safe/ca.key /opt/dataset-store/certs/client.root.crt /opt/dataset-store/certs/client.root.key /opt/dataset-store/certs/client.dsuser.crt /opt/dataset-store/certs/client.dsuser.key

