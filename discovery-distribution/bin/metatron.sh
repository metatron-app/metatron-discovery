#!/bin/bash

USAGE="-e Usage: metatron.sh\n\t
        [--config=directory] [--init] [--management] [--debug=port] {start|stop|restart|status}"

while [ $# -gt 0 ]; do
  case "$1" in
    --config=*)
      conf_dir="${1#*=}"
      if [[ ! -d "${conf_dir}" ]]; then
        echo "ERROR : ${conf_dir} is not a directory"
        echo ${USAGE}
        exit 1
      else
        export METATRON_CONF_DIR="${conf_dir}"
      fi
      ;;
    --init)
      METATRON_INIT_MODE=",initial"
      ;;
    --management)
      METATRON_MGMT_MODE=",management"
      ;;
    --debug=*)
      JAVA_OPTS="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=${1#*=} ${JAVA_OPTS}"
      ;;
    start)
      MODE="start"
      ;;
    foreground)
      MODE="foreground"
      ;;
    stop)
      MODE="stop"
      ;;
    restart)
      MODE="restart"
      ;;
    status)
      MODE="status"
      ;;
    *)
      printf "* Error: Invalid argument. $1 \n"
      exit 1
  esac
  shift
done

if [ -L ${BASH_SOURCE-$0} ]; then
  BIN=$(dirname $(readlink "${BASH_SOURCE-$0}"))
else
  BIN=$(dirname ${BASH_SOURCE-$0})
fi
BIN=$(cd "${BIN}">/dev/null; pwd)

. "${BIN}/common.sh"

HOSTNAME=$(hostname)
METATRON_NAME="metatron"
METATRON_LOGFILE="${METATRON_LOG_DIR}/metatron-${METATRON_IDENT_STRING}-${HOSTNAME}.log"
METATRON_OUTFILE="${METATRON_LOG_DIR}/metatron-${METATRON_IDENT_STRING}-${HOSTNAME}.out"
METATRON_PID="${METATRON_PID_DIR}/metatron-${METATRON_IDENT_STRING}-${HOSTNAME}.pid"
METATRON_MAIN=org.springframework.boot.loader.PropertiesLauncher

if [[ -n "${HADOOP_CONF_DIR}" ]] && [[ -d "${HADOOP_CONF_DIR}" ]]; then
  METATRON_CLASSPATH+=":${HADOOP_CONF_DIR}"
fi

addEachJarInDir "${METATRON_HOME}"

CLASSPATH="${METATRON_CLASSPATH}"

if [[ -z "${METATRON_NICENESS}" ]]; then
    export METATRON_NICENESS=0
fi

if [[ -f "${METATRON_CONF_DIR}/application-config.yaml" ]]; then
  export METATRON_CONF_FILE=",${METATRON_CONF_DIR}/application-config.yaml"
fi

if [[ -z "${METATRON_ENV_MODE}" ]]; then
  export METATRON_ENV_MODE="local"
fi

if [[ -n "${METATRON_EXTRA_PROFILE}" ]]; then
  export METATRON_EXTRA_PROFILE=",${METATRON_EXTRA_PROFILE},${METATRON_ENV_MODE}"
else
  export METATRON_EXTRA_PROFILE=",${METATRON_ENV_MODE}"
fi


METATRON_APP_PROFILE="${METATRON_DB_TYPE}-default-db,logging-console-debug,scheduling${METATRON_MGMT_MODE}${METATRON_PREP_MODE}${METATRON_EXTRA_PROFILE}${METATRON_INIT_MODE}"
METATRON_OPTION="--loader.system=true --spring.config.location=classpath:application.yaml${METATRON_CONF_FILE}"
METATRON_OPTION="${METATRON_OPTION} --spring.profiles.active=${METATRON_APP_PROFILE}"

function initialize_default_directories() {
  if [[ ! -d "${METATRON_LOG_DIR}" ]]; then
    echo "Log dir doesn't exist, create ${METATRON_LOG_DIR}"
    $(mkdir -p "${METATRON_LOG_DIR}")
  fi

  if [[ ! -d "${METATRON_PID_DIR}" ]]; then
    echo "Pid dir doesn't exist, create ${METATRON_PID_DIR}"
    $(mkdir -p "${METATRON_PID_DIR}")
  fi
}

function wait_for_metatron_to_die() {
  local pid
  local count
  pid=$1
  timeout=$2
  count=0
  timeoutTime=$(date "+%s")
  let "timeoutTime+=$timeout"
  currentTime=$(date "+%s")
  forceKill=1

  while [[ $currentTime -lt $timeoutTime ]]; do
    $(kill ${pid} > /dev/null 2> /dev/null)
    if kill -0 ${pid} > /dev/null 2>&1; then
      sleep 3
    else
      forceKill=0
      break
    fi
    currentTime=$(date "+%s")
  done

  if [[ forceKill -ne 0 ]]; then
    $(kill -9 ${pid} > /dev/null 2> /dev/null)
  fi
}

function check_if_process_is_alive() {
  local pid
  pid=$(cat "${METATRON_PID}")
  if ! kill -0 ${pid} >/dev/null 2>&1; then
    echo "${METATRON_NAME} process died" "${SET_ERROR}"
    return 1
  fi
}

function foreground() {

  initialize_default_directories

  echo "METATRON_CLASSPATH: ${METATRON_CLASSPATH_OVERRIDES}:${CLASSPATH}"

  $METATRON_RUNNER $JAVA_OPTS -cp "${METATRON_CLASSPATH_OVERRIDES}:${CLASSPATH}" $METATRON_MAIN $METATRON_OPTION
}

function start() {
  local pid

  if [[ -f "${METATRON_PID}" ]]; then
    pid=$(cat "${METATRON_PID}")
    if kill -0 ${pid} >/dev/null 2>&1; then
      echo "${METATRON_NAME} is already running"
      return 0;
    fi
  fi

  initialize_default_directories

  echo "METATRON_CLASSPATH: ${METATRON_CLASSPATH_OVERRIDES}:${CLASSPATH}" >> "${METATRON_OUTFILE}"

  nohup nice -n $METATRON_NICENESS $METATRON_RUNNER $JAVA_OPTS -cp "${METATRON_CLASSPATH_OVERRIDES}:${CLASSPATH}" $METATRON_MAIN $METATRON_OPTION >> "${METATRON_OUTFILE}" 2>&1 < /dev/null &
  pid=$!
  if [[ -z "${pid}" ]]; then
    echo "${METATRON_NAME} start" "${SET_ERROR}"
    return 1;
  else
    echo "${METATRON_NAME} start" "${SET_OK}"
    echo ${pid} > "${METATRON_PID}"
  fi

  sleep 2
  check_if_process_is_alive
}

function stop() {
  local pid

  # zeppelin daemon kill
  if [[ ! -f "${METATRON_PID}" ]]; then
    echo "${METATRON_NAME} is not running"
  else
    pid=$(cat "${METATRON_PID}")
    if [[ -z "${pid}" ]]; then
      echo "${METATRON_NAME} is not running"
    else
      wait_for_metatron_to_die $pid 40
      $(rm -f "${METATRON_PID}")
      echo "${METATRON_NAME} stop" "${SET_OK}"
    fi
  fi

  # list all pid that used in remote interpreter and kill them
  for f in "${METATRON_PID_DIR}/*.pid"; do
    if [[ ! -f ${f} ]]; then
      continue;
    fi

    pid=$(cat "${f}")
    wait_for_metatron_to_die $pid 20
    $(rm -f ${f})
  done

}

function find_metatron_process() {
  local pid

  if [[ -f "${METATRON_PID}" ]]; then
    pid=$(cat "${METATRON_PID}")
    if ! kill -0 ${pid} > /dev/null 2>&1; then
      echo "${METATRON_NAME} running but process is dead" "${SET_ERROR}"
      return 1
    else
      echo "${METATRON_NAME} is running" "${SET_OK}"
    fi
  else
    echo "${METATRON_NAME} is not running" "${SET_ERROR}"
    return 1
  fi
}

case "${MODE}" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  foreground)
    foreground
    ;;
  reload)
    stop
    start
    ;;
  restart)
    echo "${METATRON_NAME} is restarting" >> "${METATRON_OUTFILE}"
    stop
    start
    ;;
  status)
    find_metatron_process
    ;;
  *)
    echo ${USAGE}
esac
