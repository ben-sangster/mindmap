#!/bin/sh

. ../scripts/envsetup.sh
export MINDMAP_WORKING_DIR="./"
$RUN_DEBUG$BIN_HOME/mindmap $*
