for i in `ls -1 -d */`; do
    cd $i 
    if [[ -f "package.json" ]]; then
        echo "Building $i"
        npm install
    fi
    cd ..
done