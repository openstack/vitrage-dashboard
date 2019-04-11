#!/usr/bin/env bash
# plugin.sh - DevStack plugin.sh dispatch script vitrage-dashboard


function install_vitrage_dashboard {
    setup_develop ${VITRAGE_DASHBOARD_DIR}
}

function configure_vitrage_dashboard {
    cp -a ${VITRAGE_DASHBOARD_DIR}/vitrage_dashboard/enabled/* ${HORIZON_DIR}/openstack_dashboard/local/enabled/
}

function init_vitrage_dashboard {
    $PYTHON ${DEST}/horizon/manage.py collectstatic --noinput
    $PYTHON ${DEST}/horizon//manage.py compress --force
}

# check for service enabled
if is_service_enabled vitrage-dashboard; then

    if [[ "$1" == "stack" && "$2" == "pre-install" ]]; then
        # Set up system services
        # no-op
        :

    elif [[ "$1" == "stack" && "$2" == "install" ]]; then
        # Perform installation of service source
        echo_summary "Installing Vitrage Dashboard"
        install_vitrage_dashboard

    elif [[ "$1" == "stack" && "$2" == "post-config" ]]; then
        # Configure after the other layer 1 and 2 services have been configured
        echo_summary "Configuring Vitrage Dashboard"
        configure_vitrage_dashboard
        init_vitrage_dashboard

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
       rm -f ${HORIZON_DIR}/openstack_dashboard/local/enabled/_40*
       rm -f ${HORIZON_DIR}/openstack_dashboard/local/enabled/_41*

       # for backward computability
       rm -f ${HORIZON_DIR}/openstack_dashboard/enabled/_40*
       rm -f ${HORIZON_DIR}/openstack_dashboard/enabled/_41*
    fi
fi
