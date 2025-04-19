for i in `ls -1 -d */ | grep -v module | grep -v docs | grep -v clue-its | grep -v clue-catalog | grep -v dataset-store | grep -v object-schema | grep -v query-tests | grep -v graph-data-structure | grep -v clue-session-store`; do
    echo $i 
    cd $i 
        
    if [[ -f "package.json" ]]; then
        echo "Compiling source for $i"
        pwd
        npm run compile-ts
    fi
    cd ..

done
