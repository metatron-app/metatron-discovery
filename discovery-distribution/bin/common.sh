#!/bin/bash

if [ -L "${BASH_SOURCE-$0}" ]; then
  FWDIR=$(dirname $(readlink "${BASH_SOURCE-$0}"))
else
  FWDIR=$(dirname "${BASH_SOURCE-$0}")
fi

if [[ -z "${METATRON_HOME}" ]]; then
  # Make METATRON_HOME look cleaner in logs by getting rid of the
  # extra ../
  export METATRON_HOME="$(cd "${FWDIR}/.."; pwd)"
fi

if [[ -z "${METATRON_CONF_DIR}" ]]; then
  export METATRON_CONF_DIR="${METATRON_HOME}/conf"
fi

if [[ -z "${METATRON_LOG_DIR}" ]]; then
  export METATRON_LOG_DIR="${METATRON_HOME}/logs"
fi

if [[ -z "$METATRON_PID_DIR" ]]; then
  export METATRON_PID_DIR="${METATRON_HOME}/run"
fi

if [[ -z "${METATRON_JAR}" ]]; then
  if [[ -d "${METATRON_HOME}/discovery-server/target" ]]; then
    export METATRON_JAR="${METATRON_HOME}/discovery-server/target"
  else
    export METATRON_JAR=$(find -L "${METATRON_HOME}" -name "discovery-server*.jar")
  fi
fi

if [[ -f "${METATRON_CONF_DIR}/metatron-env.sh" ]]; then
  . "${METATRON_CONF_DIR}/metatron-env.sh"
fi

if [[ -z "${METATRON_ENCODING}" ]]; then
  export METATRON_ENCODING="UTF-8"
fi

if [[ -z "${METATRON_MEM}" ]]; then
  export METATRON_MEM="-Xms2048m -Xmx2048m -XX:MaxMetaspaceSize=512m"
fi

JAVA_OPTS+=" ${METATRON_JAVA_OPTS} -Dfile.encoding=${METATRON_ENCODING} ${METATRON_MEM}"
#JAVA_OPTS+=" -Dlog4j.configuration=file://${METATRON_CONF_DIR}/log4j.properties"
export JAVA_OPTS


if [[ -n "${JAVA_HOME}" ]]; then
  METATRON_RUNNER="${JAVA_HOME}/bin/java"
else
  METATRON_RUNNER=java
fi
export METATRON_RUNNER

if [[ -z "$METATRON_IDENT_STRING" ]]; then
  export METATRON_IDENT_STRING="${USER}"
fi

if [[ -z "$METATRON_DB_TYPE" ]]; then
  export METATRON_DB_TYPE="h2"
fi

if [[ -z "${METATRON_H2_DATA_DIR}" ]]; then
  export METATRON_H2_DATA_DIR="${METATRON_HOME}"
fi

if [[ -z "${METATRON_INDEX_DIR}" ]]; then
  export METATRON_INDEX_DIR="${METATRON_HOME}/indexes"
fi

METATRON_CLASSPATH="${METATRON_CONF_DIR}"

function addEachJarInDir(){
  if [[ -d "${1}" ]]; then
    for jar in "$(find -L "${1}" -maxdepth 1 -name '*jar')"; do
      METATRON_CLASSPATH="$jar:${METATRON_CLASSPATH}"
    done
  fi
}

function addEachJarInDirRecursive(){
  if [[ -d "${1}" ]]; then
    for jar in $(find -L "${1}" -type f -name '*jar'); do
      METATRON_CLASSPATH="$jar:$METATRON_CLASSPATH"
    done
  fi
}

function addJarInDir(){
  if [[ -d "${1}" ]]; then
    METATRON_CLASSPATH="${1}/*:${METATRON_CLASSPATH}"
  fi
}