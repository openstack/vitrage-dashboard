=================
Vitrage Dashboard
=================

.. image:: https://governance.openstack.org/tc/badges/vitrage-dashboard.svg
    :target: https://governance.openstack.org/tc/reference/tags/index.html

.. Change things from this point on

Vitrage is the Openstack RCA (Root Cause Analysis) Engine for organizing,
analyzing and expanding OpenStack alarms & events, yielding insights
regarding the root cause of problems and deducing the existence of problems
before they are directly detected.

Vitrage Dashboard is an extension for OpenStack Dashboard that provides a UI for
Vitrage.

Project Resources
-----------------

* `Wiki <https://wiki.openstack.org/wiki/Vitrage>`_
* `Code Review <https://review.opendev.org/>`_
* `Storyboard <https://storyboard.openstack.org/#!/project/openstack/vitrage-dashboard>`_
* `Release notes <https://docs.openstack.org/releasenotes/vitrage-dashboard/>`_

How to use this package
-----------------------

With Devstack
-------------

Add the following to your Devstack local.conf file

::

  enable_plugin vitrage-dashboard https://opendev.org/openstack/vitrage-dashboard

With Horizon
------------

::


    git clone https://github.com/openstack/horizon.git

    git clone https://github.com/openstack/vitrage-dashboard.git

    git clone https://github.com/openstack/python-vitrageclient.git

    cd ../horizon

    ./run_tests.sh -f --docs

    cp ./openstack_dashboard/local/local_settings.py.example ./openstack_dashboard/local/local_settings.py

    pushd ../vitrage-dashboard

    ../horizon/tools/with_venv.sh pip install -e.

    cp -a vitrage_dashboard/enabled/* ../horizon/openstack_dashboard/enabled/

    popd

    cd python-vitrageclient

    ../horizon/tools/with_venv.sh pip install -e.
