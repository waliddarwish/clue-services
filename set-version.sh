
if [ -z "$1" ]; then 
    echo '  Usage set-version.sh version'
    echo '  Example version 1.1.1'
else
    echo Setting version for authenticator
    cd authenticator
    npm version $1
    cd ..

    echo Setting version for Database Module
    cd database-module
    npm version $1
    cd ..

    echo Setting version for Catalog Module
    cd catalog-module
    npm version $1
    cd ..

    echo Setting version for HA Module
    cd ha-module
    npm version $1
    cd ..

    echo Setting version for Log Module
    cd log-module
    npm version $1
    cd ..

    echo Setting version for Object Schema Module

    cd object-schema
    npm version $1
    cd ..

    echo Setting version for Orchestrator

    cd orchestrator
    npm version $1
    cd ..

    echo Setting version for Logger

    cd logger
    npm version $1

    cd ..

    echo Setting version for Log Module

    cd log-module
    npm version $1
    cd ..

    echo Setting version for Globalization Module

    cd globalization-module
    npm version $1
    cd ..

    echo Setting version for Globalizer 

    cd globalizer
    npm version $1
    cd ..

    echo Setting version for Mail Module

    cd mail-module
    npm version $1
    cd ..

    echo Setting version for Mailer

    cd mailer
    npm version $1
    cd ..

    echo Setting version for Authentication Module

    cd authentication-module
    ./clean.sh 
    cd ..

    echo Setting version for Connection Tester

    cd connection-tester
    ./clean.sh 
    cd ..

    echo Setting version for App Module

    cd app-module
    npm version $1
    cd ..

    echo Setting version for Scheduler 

    cd scheduler
    npm version $1
    cd ..

    echo Setting version for Scheduler Module

    cd scheduler-module
    npm version $1
    cd ..

    echo Setting version for Connection Test Module

    cd connection-test-module
    npm version $1
    cd ..

    echo Setting version for Metadata Importer

    cd metadata-importer
    npm version $1
    cd ..

    echo Setting version for Metadata Importing Module

    cd metadata-importing-module
    npm version $1
    cd ..


    echo Setting version for Metadata Coordinator

    cd metadata-coordinator
    npm version $1
    cd ..

    echo Setting version for Metadata Coordination Module

    cd metadata-coordination-module
    npm version $1
    cd ..

    echo Setting version for Connection Tracking Module 

    cd connection-tracking-module
    npm version $1
    cd ..

    echo Setting version for Query Generator
    cd query-generator
    npm version $1
    cd ..

    echo Setting version for Query Executor
    cd query-executor
    npm version $1
    cd ..

    echo Setting version for Query Generator Module
    cd query-generator-module
    npm version $1
    cd ..

    echo Setting version for Query Executor Module
    cd query-executor-module
    npm version $1
    cd ..

    echo Setting version for Datasets Module

    cd datasets-controller-module
    npm version $1
    cd ..

    echo Setting version for Datasets Controller

    cd dataset-controller
    npm version $1
    cd ..

    echo Setting version for Clue DFS Module

    cd clue-dfs-module
    npm version $1
    cd ..

    echo Setting version for Clue ITS

    Cleaning Clue-ITS
    cd clue-its
    npm version $1
    cd ..

    echo Setting version for Dataset Store
    cd dataset-store
    npm version $1
    cd ..

    echo Setting version for Authentication Module

    cd authentication-module
    npm version $1
    cd ..


    echo Setting version for Connection Tester
    cd connection-tester
    npm version $1
    cd ..

    echo Setting version for Modelling Service
    cd modelling-service
    npm version $1
    cd ..

    echo Setting version for Document Retrieving Module
    cd document-retrieving-module
    npm version $1
    cd ..

    echo Setting version for Document Retriever 
    cd document-retriever
    npm version $1
    cd ..

    npm version $1
fi
