========================
Team and repository tags
========================

.. image:: http://governance.openstack.org/badges/vitrage-dashboard.svg
    :target: http://governance.openstack.org/reference/tags/index.html

.. Change things from this point on

=================
Vitrage Dashboard
=================

Vitrage is the Openstack RCA (Root Cause Analysis) Engine for organizing,
analyzing and expanding OpenStack alarms & events, yielding insights
regarding the root cause of problems and deducing the existence of problems
before they are directly detected.

Vitrage Dashboard
-----------------
Vitrage Dashboard is an extension for OpenStack Dashboard that provides a UI for
Vitrage.

Project Resources
-----------------

* `Vitrage at Launchpad <http://launchpad.net/vitrage>`_
* `Wiki <https://wiki.openstack.org/wiki/Vitrage>`_
* `Code Review <https://review.openstack.org/>`_

How to use this package
-----------------------

With Devstack
-------------

Add the following to your Devstack local.conf file

::

  enable_plugin vitrage-dashboard https://git.openstack.org/openstack/vitrage-dashboard

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
