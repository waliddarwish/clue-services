
cd clue-catalog
./clean-db.sh yes
cd ..
./start-local-cluster.sh 
cd query-tests/
./loadModels.sh
./createJmeter.sh
cd ..