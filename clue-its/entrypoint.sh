#!/bin/bash

case $1 in
  "run")
    [ ! -z "$2" ] && ARGS=" -f $2" 
    npm install
    ARGUMENTS=$ARGS npm start 
    ;;
  *)
    echo "usage: $0 [run]"
    exit 1
    ;;
esac

if [[ -z "$ARGUMENTS" ]]
    then
        echo "Test Failed"
        exit 1
    fi
