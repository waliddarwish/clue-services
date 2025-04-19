#!/bin/sh
rm -rf partialfile results output errors err.txt
mkdir -p output errors
value=$(cat queryblob.txt)
# echo $value

echo "Generating Jmeter Tests ..."
echo "---------------------------"
for file in `ls input`
do
    # echo $file
    name=$(basename $file | cut -f 1 -d '.')
    # echo $name
    portion=$value
    # echo $portion
    echo $portion | sed -e "s/INPUTDATA/"${name}"/g" >> partialfile
done
cat Head.jmx partialfile Tail.jmx > QueryTestPlan.jmx

echo "Running Jmeter Tests ..."
echo "------------------------"
apache-jmeter-5.2.1/bin/jmeter.sh -n -t QueryTestPlan.jmx -p test.properties -l results.log -j logfile.log
echo "Jmeter Tests Done ..."
echo "---------------------"
echo "\nStarting Json Diffs ..."
echo "-----------------------"

for file in `ls output`
do  
    diffline=$(echo "json-diff master/$file output/$file")
    echo "Comparing" $diffline
        
    diff=`json-diff master/$file output/$file`
    if [[ ! -z "$diff" ]]
    then
        echo $diff > errors/$file
        echo "Mismatch for $file"
        echo "Test Failed for $file" >> err.txt
    fi
done

if [ -s "err.txt" ]
then
    echo "\n-------\nSummary\n-------\n"
    cat err.txt
    exit 1
fi

echo "Query Tests Done ...\n\n"
