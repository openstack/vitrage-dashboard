#!/usr/bin/env bash
# plugin.sh - DevStack plugin.sh dispatch script vitrage-dashboard

VITRAGE_DASHBOARD_DIR=$(cd $(dirname $BASH_SOURCE)/.. && pwd)

function install_vitrage_dashboard {
    sudo pip install --upgrade ${VITRAGE_DASHBOARD_DIR}
    cp -a ${VITRAGE_DASHBOARD_DIR}/vitragedashboard/static ${DEST}/horizon/
    cp -a ${VITRAGE_DASHBOARD_DIR}/vitragedashboard/enabled/* ${DEST}/horizon/openstack_dashboard/enabled/
    cp -a ${VITRAGE_DASHBOARD_DIR}/vitrageclient/api/* ${DEST}/horizon/openstack_dashboard/api/
    python ${DEST}/horizon/manage.py compress --force
}

# check for service enabled
if is_service_enabled vitrage-dashboard; then

    if [[ "$1" == "stack" && "$2" == "pre-install" ]]; then
        # Set up system services
        # no-op
        :

    elif [[ "$1" == "stack" && "$2" == "install" ]]; then
        # Perform installation of service source
        # no-op
        :
    elif [[ "$1" == "stack" && "$2" == "post-config" ]]; then
        # Configure after the other layer 1 and 2 services have been configured
        echo_summary "Installing Vitrage Dashboard"
        install_vitrage_dashboard

    elif [[ "$1" == "stack" && "$2" == "extra" ]]; then
        # Initialize and start the vitrage-dashboard service
        # no-op
        :
    fi

    if [[ "$1" == "unstack" ]]; then
        # Shut down vitrage-dashboard services
        # no-op
        :
    fi

    if [[ "$1" == "clean" ]]; then
        # Remove state and transient data
        # Remember clean.sh first calls unstack.sh
        # no-op
        :
    fi
fi