#!/bin/sh
sed -i '1s/bash/sh/' bin/*.sh
${DISCOVERY_HOME}/bin/metatron.sh --config=$DISCOVERY_HOME/conf foreground