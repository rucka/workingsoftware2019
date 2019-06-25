#if [ ! -f ./node_modules/.bin/yarn ]; then
#    echo "installing local yarn..."
#    npm run setup
#fi
#
#./node_modules/.bin/yarn $@
node ./yarn-1.15.2.js $@