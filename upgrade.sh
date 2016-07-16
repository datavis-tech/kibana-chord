# This script will re-install the latest version of the plugin and launch Kibana.
git pull
npm install
cd ..
zip -r kibana-chord.zip kibana-chord -x "*.git*" "*node_modules*"
/opt/kibana/bin/kibana plugin --remove kibana-chord
/opt/kibana/bin/kibana plugin --install kibana-chord -u file://`pwd`/kibana-chord.zip
/opt/kibana/bin/kibana

# If ElasticSearch is not running already, run this:
#sudo service elasticsearch restart
