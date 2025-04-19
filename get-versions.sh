
for i in `find . -name package.json -print | grep -v node_modules | grep -v query-tests`; do
    echo "`cat $i | grep \"name\"` `cat $i | grep \"version\"`"
done


