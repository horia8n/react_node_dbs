#!/bin/bash
#if [ -d "seeded_done" ]; then
#  exit 0
#fi
#set -eo pipefail
#
#host="$(hostname -i || echo '127.0.0.1')"
#
#while !(ping="$(redis-cli -h "$host" ping)" && [ "$ping" = 'PONG' ]); do
#  exit 1
#done
#mkdir -p seeded_done
redis-cli
HSET demotable id somethingfromdocker
HSET demotable id2 somethingfromdocker2
#exit 0