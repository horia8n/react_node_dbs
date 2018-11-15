#!/bin/bash
if [ -d "seeding_done" ]; then
  exit 0
fi
while !(ps -ef | grep mongod | grep -v grep | wc -l | tr -d ' '); do
  exit 1
done
mkdir -p seeding_done
mongoimport --host localhost --username horia8n --password password --authenticationDatabase admin --db demo --collection demotable --type json --jsonArray --file /tmp/seed/seeding.json
exit 0
