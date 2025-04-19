if [[ "$OSTYPE" == "linux-gnu" ]]; then
    OS_DIR=ubuntu
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS_DIR=macos
fi
 
if [ -z "$1" ] || [ -z "$1" ] ; then
    HOST=localhost
    PORT=8250
else
    HOST=$1
    PORT=$2
fi 

for file in `ls test-data`
do
    echo Importing $file
    ../clue-catalog/mongo/$OS_DIR/bin/mongoimport --username catalog-owner --password 4lzahraa2 --host clueData01/$HOST --port $PORT --db catalog --collection=${file%.json} --upsert --file=./test-data/$file --verbose --jsonArray  --numInsertionWorkers=4
done
