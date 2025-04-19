ifneq (,$(wildcard ./.env))
    include .env
    export
endif

TAG := $$(git log -1 --pretty=%h)

list:
	cat Makefile | sed -n -e '/^$$/ { n ; /^[^ .#][^ ]*:/ { s/:.*$$// ; p ; } ; }' ; \

list-all:
	cat Makefile | sed -n -e '/^$$/ { n ; /^[^ .#][^ ]*:/p ; }' | egrep --color '^[^ ]*:';\

help:
	./help.sh \	

build-nginx:
	sh -c "cd nginx && docker build -f Dockerfile -t clueanalytics/nginx ."; \

build-clue-dependencies:
	docker build -f Dockerfile.cluedependencies.dev -t clueanalytics/dependencies .; \

build-authenticator:
	sh -c "cd authenticator && docker build -f Dockerfile.authenticator.dev -t clueanalytics/authenticator ."; \

build-orchestrator:
	sh -c "cd orchestrator && docker build -f Dockerfile.orchestrator.dev -t clueanalytics/orchestrator ."; \

build-globalizer:
	sh -c "cd globalizer && docker build -f Dockerfile.globalizer.dev -t clueanalytics/globalizer ."; \

build-mailer:
	sh -c "cd mailer && docker build -f Dockerfile.mailer.dev -t clueanalytics/mailer ."; \

build-logger:
	sh -c "cd logger && docker build -f Dockerfile.logger.dev -t clueanalytics/logger ."; \

build-scheduler:
	sh -c "cd scheduler && docker build -f Dockerfile.scheduler.dev -t clueanalytics/scheduler ."; \

build-connection-tester:
	sh -c "cd connection-tester && docker build -f Dockerfile.connection-tester.dev -t clueanalytics/connection-tester ."; \

build-dataset-controller:
	sh -c "cd dataset-controller && docker build -f Dockerfile.dataset-controller.dev -t clueanalytics/dataset-controller ."; \

build-metadata-coordinator:
	sh -c "cd metadata-coordinator && docker build -f Dockerfile.metadata-coordinator.dev -t clueanalytics/metadata-coordinator ."; \

build-metadata-importer:
	sh -c "cd metadata-importer && docker build -f Dockerfile.metadata-importer.dev -t clueanalytics/metadata-importer ."; \

build-query-executor:
	sh -c "cd query-executor && docker build -f Dockerfile.query-executor.dev -t clueanalytics/query-executor ."; \

build-query-generator:
	sh -c "cd query-generator && docker build -f Dockerfile.query-generator.dev -t clueanalytics/query-generator ."; \

build-document-retriever:
	sh -c "cd document-retriever && docker build -f Dockerfile.document-retriever.dev -t clueanalytics/document-retriever ."; \

build-dev-image: 
	docker build -f Dockerfile.dev-image -t clueanalytics/dev-image .; \

build-services: build-clue-dependencies build-authenticator build-orchestrator build-globalizer build-mailer build-logger build-scheduler build-connection-tester build-dataset-controller  build-metadata-coordinator build-metadata-importer build-query-executor build-query-generator build-document-retriever

build-services-light: build-clue-dependencies build-authenticator build-orchestrator  build-connection-tester build-dataset-controller  build-metadata-coordinator build-metadata-importer build-query-executor build-query-generator

build-services-no-dependencies: build-authenticator build-orchestrator build-globalizer build-mailer build-logger build-scheduler build-connection-tester build-dataset-controller  build-metadata-coordinator build-metadata-importer build-query-executor build-query-generator

build-catalog:
	sh -c "docker build -t clueanalytics/clue-catalog-shard0-replica0 ./clue-catalog/mongod"; \
	sh -c "docker build -t clueanalytics/clue-catalog-configdb-replica0 ./clue-catalog/mongod"; \
	sh -c "docker build -t clueanalytics/clue-catalog-mongos-router0 ./clue-catalog/mongos"; \

build-dataset-store:
	sh -c "docker build -f ./dataset-store/Dockerfile.datasetStore.firstNode -t clueanalytics/dataset-store-node_1 ./dataset-store"; \
	sh -c "docker build -f ./dataset-store/Dockerfile.datasetStore.otherNodes -t clueanalytics/dataset-store-node_2 --build-arg HOST=dataset-store-node-2 ./dataset-store"; \

build-dfs:
	docker pull chrislusf/seaweedfs:1.83

build-redis:
	docker pull redis:6.0.5

build-all: build-services build-catalog build-dataset-store build-dfs build-redis build-nginx
	docker-compose -f docker-compose.yml down

	docker-compose -f docker-compose.yml up -d --scale dev=0

	sleep 30

	# Wait until local MongoDB instance is up and running
	until docker exec  `docker ps | grep mongos-router0 | cut -b1-12` /usr/bin/mongo --port 27017 --quiet --eval 'db.getMongo()'; do \
		echo "Retrying until catalog cluster is up"; \
		sleep 5; \
	done

	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  /usr/bin/mongo --port 27017 /etc/clue-catalog/clean.js; \
	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  /usr/bin/mongo --port 27017 /etc/clue-catalog/setup.js; \
	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  sh /etc/clue-catalog/static-data/load.sh; \

	docker exec -it `docker ps | grep dataset-store-node_1 | cut -b1-12` bash ./setup.sh

	docker-compose -f docker-compose.yml down 


	# npm install

	docker-compose -f docker-compose.yml down; \


build-light: build-services-light build-catalog build-dataset-store build-dfs build-redis 
	docker-compose -f docker-compose.yml down

	docker-compose -f docker-compose.yml up -d --scale dev=0

	sleep 30

	# Wait until local MongoDB instance is up and running
	until docker exec  `docker ps | grep mongos-router0 | cut -b1-12` /usr/bin/mongo --port 27017 --quiet --eval 'db.getMongo()'; do \
		echo "Retrying until catalog cluster is up"; \
		sleep 5; \
	done

	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  /usr/bin/mongo --port 27017 /etc/clue-catalog/clean.js; \
	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  /usr/bin/mongo --port 27017 /etc/clue-catalog/setup.js; \
	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  sh /etc/clue-catalog/static-data/load.sh; \

	docker exec -it `docker ps | grep dataset-store-node_1 | cut -b1-12` bash ./setup.sh

	docker-compose -f docker-compose.yml down 


	# npm install

	docker-compose -f docker-compose.yml down; \

clean-all:
	docker-compose -f docker-compose.yml down

	containers=`docker ps -a | grep -v postgres | grep -v oracle | grep -v CONTAINER | cut -b 1-12`
	for container in $$containers; do \
		echo "Removing container $$container" ; \
		docker rm $$container -f; \
	done

	
	for image in `docker images -a  --filter=reference='clueanalytics/*' --format='{{.ID}}'`; do \
		echo "Removing image $$image" ; \
		docker rmi $$image -f ; \
	done

	rm -fr ./dataset-store/data/*
	echo "Pruning containers"
	docker system prune 

	docker volume prune

	rm -fr ./clue-catalog/data/ 

	rm -fr ./clue-session-store/redis/redis-data

clean-local-cluster-data:
	docker-compose -f docker-compose.yml down 
	rm -fr ./clue-catalog/data/
	rm -fr ./dataset-store/data/* 
	rm -fr ./clue-session-store/redis/redis-data
	
	containers=`docker ps -a | grep -v postgres | grep -v oracle | grep -v CONTAINER | cut -b 1-12`
	echo $$containers; \
	for container in $$containers; do \
		echo Removing container $$container ; \
		docker rm $$container -f; \
	done

	echo "Pruning containers"
	docker system prune

	docker volume prune


	[ ! -d "./clue-catalog/data/shard0-replica0" ] && mkdir -p ./clue-catalog/data/shard0-replica0; \
	[ ! -d "./clue-catalog/data/shard0-replica1" ] && mkdir -p ./clue-catalog/data/shard0-replica1; \
	[ ! -d "./clue-catalog/data/shard0-replica2" ] && mkdir -p ./clue-catalog/data/shard0-replica2; \
	[ ! -d "./clue-catalog/data/shard1-replica0" ] && mkdir -p ./clue-catalog/data/shard1-replica0; \
	[ ! -d "./clue-catalog/data/shard1-replica1" ] && mkdir -p ./clue-catalog/data/shard1-replica1; \
	[ ! -d "./clue-catalog/data/shard1-replica2" ] && mkdir -p ./clue-catalog/data/shard1-replica2; \
	[ ! -d "./clue-catalog/data/configdb-replica0" ] && mkdir -p ./clue-catalog/data/configdb-replica0; \
	[ ! -d "./clue-catalog/data/configdb-replica1" ] && mkdir -p ./clue-catalog/data/configdb-replica1; \
	[ ! -d "./clue-catalog/data/configdb-replica2" ] && mkdir -p ./clue-catalog/data/configdb-replica2; \

	docker-compose -f docker-compose.yml up -d --scale dev=0

	sleep 30

	# Wait until local MongoDB instance is up and running
	until docker exec  `docker ps | grep mongos-router0 | cut -b1-12` /usr/bin/mongo --port 27017 --quiet --eval 'db.getMongo()'; do \
		echo "Retrying until catalog cluster is up" ; \
		sleep 5; \
	done

	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  /usr/bin/mongo --port 27017 /etc/clue-catalog/clean.js; \
	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  /usr/bin/mongo --port 27017 /etc/clue-catalog/setup.js; \
	docker exec -it `docker ps | grep mongos-router0 | cut -b1-12`  sh /etc/clue-catalog/static-data/load.sh; \

	#Setup dataset store
	
	docker exec -it `docker ps | grep dataset-store-node_1 | cut -b1-12` bash ./setup.sh
	docker-compose -f docker-compose.yml down 

start-postgres:
	docker login -u darwishwalid -p 4lzahraa2; \
	docker-compose -f connection-tester/db-docker/postgres/postgres.yaml up -d 
	sleep 2
	echo "Creating Postgres Samples"

	docker exec -it `docker ps | grep postgres_db | cut -b1-12` bash -c "export PGPASSWORD=example"

	docker exec -it `docker ps | grep postgres_db | cut -b1-12` bash -c "psql --username=postgres -f /samples/create_dvdrentaldb.sql"

	docker exec -it `docker ps | grep postgres_db | cut -b1-12` bash -c "pg_restore --username=postgres -d dvdrental  /samples/dvdrental.tar"

	echo "Done Creating Postgres Samples!"

start-oracle:
	docker login -u darwishwalid -p 4lzahraa2; \
	docker-compose -f ./connection-tester/db-docker/oracle/oracle.yaml up -d
	echo "Waiting for oracle database to start"
	#sleep 120
	echo "Oracle Docker Container:  `docker ps | grep oracle | cut -b1-12`"
	
	echo "Waiting for oracle" 
	docker exec `docker ps | grep oracle | cut -b1-12` bash -c "/u01/samples/wait-for-oracle.sh"
	echo "Oracle instance is up"

	echo "CREATING SAMPLES Database"
	docker exec -it `docker ps | grep oracle | cut -b1-12`  bash -c "source /home/oracle/.bashrc; sqlplus  / as sysdba  @/u01/samples/create-pluggable-database.sql "

	echo "Dropping sample OT schema if exists"
	docker exec -it `docker ps | grep oracle | cut -b1-12`  bash -c "source /home/oracle/.bashrc; sqlplus  system/Oradoc_db1@ORCLCDB  @/u01/samples/commercial/ot_dropuser.sql "


	echo "Creating OT user"
	docker exec -it `docker ps | grep oracle | cut -b1-12`  bash -c "source /home/oracle/.bashrc; sqlplus system/Oradoc_db1@ORCLCDB  @/u01/samples/commercial/ot_create_user.sql "


	echo "Creating OT Tables"
	docker exec -it `docker ps | grep oracle | cut -b1-12`  bash -c "source /home/oracle/.bashrc; sqlplus otuser/Oradoc_db1@SAMPLES @/u01/samples/commercial/ot_schema.sql "


	echo "Loading OT data"
	docker exec -it `docker ps | grep oracle | cut -b1-12`  bash -c "source /home/oracle/.bashrc; sqlplus otuser/Oradoc_db1@SAMPLES @/u01/samples/commercial/ot_data.sql "


	echo "Loading Oracle Samples data"
	docker exec -it `docker ps | grep oracle | cut -b1-12`  bash -c "source /home/oracle/.bashrc; sqlplus system/Oradoc_db1@ORCLCDB @/u01/samples/mksample "

	echo "Done Creating Oracle Samples!"


start-mysql:
	docker login -u darwishwalid -p 4lzahraa2; \
	docker-compose -f connection-tester/db-docker/mysql/mysql.yaml up -d 
	sleep 2
	echo "Creating MySQL Samples"

	docker exec -it `docker ps | grep mysql_db | cut -b1-12` bash -c "export MYSQL_ROOT_PASSWORD=example"

	docker exec -it `docker ps | grep mysql_db | cut -b1-12` bash -c "mysql -h localhost -P 3306 --protocol=tcp --user=root --password=example -f -t < /samples/employees.sql"

	echo "Done Creating MySQL Samples!"

start-maria-db:
	docker login -u darwishwalid -p 4lzahraa2; \
	docker-compose -f connection-tester/db-docker/maria-db/maria-db.yaml up -d 
	sleep 2
	echo "Creating Maria DB Samples"

	docker exec -it `docker ps | grep maria-db_db | cut -b1-12` bash -c "export MYSQL_ROOT_PASSWORD=example"

	docker exec -it `docker ps | grep maria-db_db | cut -b1-12` bash -c "mysql -h localhost -P 3306 --protocol=tcp --user=root --password=example -f -t < samples/nation.sql"

	echo "Done Creating Maria DB Samples!"

start-mssql:
	docker login -u darwishwalid -p 4lzahraa2; \
	docker-compose -f connection-tester/db-docker/mssql/mssql.yaml up -d 
	sleep 2
	echo "Creating MSSQL Samples"

	curl -L -o connection-tester/db-docker/mssql/samples/aw2016.bak 'https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2016_EXT.bak'

	docker exec -it `docker ps | grep sql-server-db | cut -b1-12` bash -c "/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Ottawa@12345' -Q 'RESTORE FILELISTONLY FROM DISK = "/samples/aw2016.bak"'"

	echo "Done Creating MSSQL Samples!"

start-databases: start-postgres start-oracle start-mysql start-maria-db

stop-postgres:
	docker-compose -f connection-tester/db-docker/postgres/postgres.yaml down

stop-oracle:
	docker-compose -f ./connection-tester/db-docker/mysql/oracle.yaml down

stop-mysql:
	docker-compose -f connection-tester/db-docker/mysql/mysql.yaml down

stop-maria-db:
	docker-compose -f connection-tester/db-docker/maria-db/maria-db.yaml down

stop-databases: stop-postgres stop-oracle stop-mysql stop-maria-db

cluster-start: 
	docker-compose -f docker-compose.yml up -d --scale dev=0; \

run: 
	docker-compose -f docker-compose.yml up -d --scale dev=0; \

cluster-start-verbose: 
	docker-compose -f docker-compose.yml up --scale dev=0; \

run-verbose: 
	docker-compose -f docker-compose.yml up --scale dev=0; \


cluster-stop: 
	docker-compose -f docker-compose.yml stop ; \

stop: 
	docker-compose -f docker-compose.yml stop ; \

cluster-down: 
	docker-compose -f docker-compose.yml down; \

cluster-status: 
	docker-compose ps; \


stop-%:
	docker-compose stop $* ;\

start-%:
	docker-compose start $* ;\


reload-%:
	docker-compose stop $* ;\
	docker-compose start $* ;\

test-dependencies: build-clue-dependencies
	docker run clueanalytics/dependencies sh -c "cd /home/src/app-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/authentication-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/catalog-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/clue-dfs-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/connection-test-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/connection-tracking-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/database-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/datasets-controller-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/globalization-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/graph-data-structure/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/log-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/mail-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/metadata-coordination-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/metadata-importing-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/query-executor-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/query-generator-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/scheduler-module/ && npm test"
	docker run clueanalytics/dependencies sh -c "cd /home/src/document-retrieving-module/ && npm test"

test-%: build-clue-dependencies build-%
	docker run clueanalytics/$* sh -c "cd /home/src/$*/ && npm test"

test-all: test-dependencies build-services
	docker run clueanalytics/orchestrator sh -c "cd /home/src/orchestrator/ && npm test"
	docker run clueanalytics/authenticator sh -c "cd /home/src/authenticator/ && npm test"
	docker run clueanalytics/globalizer sh -c "cd /home/src/globalizer/ && npm test"
	docker run clueanalytics/mailer sh -c "cd /home/src/mailer/ && npm test"
	docker run clueanalytics/logger sh -c "cd /home/src/logger/ && npm test"
	docker run clueanalytics/connection-tester sh -c "cd /home/src/connection-tester/ && npm test"
	docker run clueanalytics/metadata-importer sh -c "cd /home/src/metadata-importer/ && npm test"
	docker run clueanalytics/metadata-coordinator sh -c "cd /home/src/metadata-coordinator/ && npm test"
	docker run clueanalytics/query-executor sh -c "cd /home/src/query-executor/ && npm test"
	docker run clueanalytics/query-generator sh -c "cd /home/src/query-generator/ && npm test"
	docker run clueanalytics/scheduler sh -c "cd /home/src/scheduler/ && npm test"
	docker run clueanalytics/dataset-controller sh -c "cd /home/src/dataset-controller/ && npm test"
	docker run clueanalytics/document-retriever sh -c "cd /home/src/doument-retriever/ && npm test"


clean-everything:
	docker-compose -f docker-compose.yml down

	containers=`docker ps -a | grep -v postgres | grep -v oracle | grep -v CONTAINER | cut -b 1-12`
	for container in $$containers; do \
		echo "Removing container $$container" ; \
		docker rm $$container -f; \
	done

	
	for image in `docker images -a  --filter=reference='clueanalytics/*' --format='{{.ID}}'`; do \
		echo "Removing image $$image" ; \
		docker rmi $$image -f ; \
	done

	docker system prune 

	docker volume prune

build-local:
	./build-local-dev-env.sh

compile-type-script:
	./compile-all-services.sh

compile-%: 
	sh -c "cd $* && npm run compile-ts && cd .."; \

run-unit-test-local:
	./run-unit-test-locally.sh

run-unit-test-on-docker:
	./run-unit-test-on-docker.sh



tag:
	echo "Tagging images to: ${TAG}" 
	@docker tag clueanalytics/nginx clueanalytics/nginx:${TAG}
	@docker tag clueanalytics/dataset-store-node_2 clueanalytics/dataset-store-node_2:${TAG}
	@docker tag clueanalytics/dataset-store-node_1 clueanalytics/dataset-store-node_1:${TAG}
	@docker tag clueanalytics/clue-catalog-mongos-router0 clueanalytics/clue-catalog-mongos-router0:${TAG}
	@docker tag clueanalytics/clue-catalog-shard0-replica0 clueanalytics/clue-catalog-shard0-replica0:${TAG}
	@docker tag clueanalytics/clue-catalog-configdb-replica0 clueanalytics/clue-catalog-configdb-replica0:${TAG}
	@docker tag clueanalytics/document-retriever clueanalytics/document-retriever:${TAG}
	@docker tag clueanalytics/query-generator clueanalytics/query-generator:${TAG}
	@docker tag clueanalytics/query-executor clueanalytics/query-executor:${TAG}
	@docker tag clueanalytics/metadata-importer clueanalytics/metadata-importer:${TAG}
	@docker tag clueanalytics/metadata-coordinator clueanalytics/metadata-coordinator:${TAG}
	@docker tag clueanalytics/dataset-controller clueanalytics/dataset-controller:${TAG}
	@docker tag clueanalytics/connection-tester clueanalytics/connection-tester:${TAG}
	@docker tag clueanalytics/scheduler clueanalytics/scheduler:${TAG}
	@docker tag clueanalytics/logger clueanalytics/logger:${TAG}
	@docker tag clueanalytics/mailer clueanalytics/mailer:${TAG}
	@docker tag clueanalytics/globalizer clueanalytics/globalizer:${TAG}
	@docker tag clueanalytics/orchestrator clueanalytics/orchestrator:${TAG}
	@docker tag clueanalytics/authenticator clueanalytics/authenticator:${TAG}
	@docker tag clueanalytics/dependencies clueanalytics/dependencies:${TAG}
	echo "Done tagging images to: ${TAG}"

docker-logout:
	@docker logout

docker-login:
	@docker login -u="${DOCKERUSERNAME}" -p="${DOCKERPASSWORD}"

push-to-docker:
	echo "Pushing images with: ${TAG}" 
	@docker push clueanalytics/nginx:${TAG}
	@docker push clueanalytics/dataset-store-node_2:${TAG}
	@docker push clueanalytics/dataset-store-node_1:${TAG}
	@docker push clueanalytics/clue-catalog-mongos-router0:${TAG}
	@docker push clueanalytics/clue-catalog-shard0-replica0:${TAG}
	@docker push clueanalytics/clue-catalog-configdb-replica0:${TAG}
	@docker push clueanalytics/document-retriever:${TAG}
	@docker push clueanalytics/query-generator:${TAG}
	@docker push clueanalytics/query-executor:${TAG}
	@docker push clueanalytics/metadata-importer:${TAG}
	@docker push clueanalytics/metadata-coordinator:${TAG}
	@docker push clueanalytics/dataset-controller:${TAG}
	@docker push clueanalytics/connection-tester:${TAG}
	@docker push clueanalytics/scheduler:${TAG}
	@docker push clueanalytics/logger:${TAG}
	@docker push clueanalytics/mailer:${TAG}
	@docker push clueanalytics/globalizer:${TAG}
	@docker push clueanalytics/orchestrator:${TAG}
	@docker push clueanalytics/authenticator:${TAG}
	@docker push clueanalytics/dependencies:${TAG}
	echo "Done pushing images with tag: ${TAG}"

tag-and-push: docker-logout docker-login tag push-to-docker docker-logout
