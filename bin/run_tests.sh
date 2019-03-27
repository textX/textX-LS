ROOT_PATH=`dirname $( cd "$(dirname "$0")" ; pwd -P )`

CORE_PATH=$ROOT_PATH/textX-LS/core
SERVER_PATH=$ROOT_PATH/textX-LS/server

cd $CORE_PATH && pytest --cov-report term-missing --cov=textx_ls_core tests/ --cov-fail-under 100
cd $SERVER_PATH && pytest --cov-report term-missing --cov=textx_ls_server tests/ --cov-fail-under 100
