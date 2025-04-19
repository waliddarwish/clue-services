for i in `ls -1 -d */`; do
    if [[ $i != "clue-catalog/" && $i != "dataset-store/" && $i != "clue-its/" && $i != "clue-session-store/" && $i != "docs/" && $i != "node_modules/" && $i != "query-tests/" ]]; then
        cd $i 
        if [[ -f "package.json" ]]; then
            echo '\033[0;32m\033[1m' Running tests for $i '\033[0m'
            npm run test:cov
        fi
        cd ..
    fi

done