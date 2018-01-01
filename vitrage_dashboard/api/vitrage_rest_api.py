# Copyright 2015 - Alcatel-Lucent
#
# Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#        http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

from django.views import generic
import logging
from openstack_dashboard.api.rest import urls
from openstack_dashboard.api.rest import utils as rest_utils
from vitrage_dashboard.api import vitrage

LOG = logging.getLogger(__name__)


@urls.register
class Topolgy(generic.View):
    """API for vitrage topology."""

    url_regex = r'vitrage/topology/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a single volume's details with the volume id.

        The following get parameters may be passed in the GET

        :param volume_id the id of the volume

        The result is a volume object.
        """

        ''' original default is graph '''

        LOG.info("--------- reques --------------- %s", str(request))

        graph_type = 'tree'
        all_tenants = 'false'
        root = None
        limit = None

        if 'graph_type' in request.GET:
            graph_type = request.GET.get('graph_type')
        if 'all_tenants' in request.GET:
                        all_tenants = request.GET.get('all_tenants')
        if 'root' in request.GET:
                        root = request.GET.get('root')
        if 'depth' in request.GET:
                        limit = int(request.GET.get('depth'))

        query = None
        if 'query' in request.GET:
            query = request.GET.get('query')
            LOG.info("--A request QUERY -- %s", str(query))
        elif graph_type == 'tree':
            ''' Default tree query - get computes, used by Sunburst'''
            query = '{"and": [{"==": {"vitrage_category": "RESOURCE"}},' \
                    '{"==": {"vitrage_is_deleted": false}},' \
                    '{"==": {"vitrage_is_placeholder": false}},' \
                    '{"or": [{"==": {"vitrage_type": "openstack.cluster"}},' \
                    '{"==": {"vitrage_type": "nova.instance"}},' \
                    '{"==": {"vitrage_type": "nova.host"}},' \
                    '{"==": {"vitrage_type": "nova.scheduler"}},' \
                    '{"==": {"vitrage_type": "nova.zone"}}]}]}'

        return vitrage.topology(request=request,
                                query=query,
                                graph_type=graph_type,
                                all_tenants=all_tenants,
                                root=root,
                                limit=limit)


@urls.register
class Alarms(generic.View):
    """API for vitrage alarms."""

    url_regex = r'vitrage/alarm/(?P<vitrage_id>.+|default)/' \
                '(?P<all_tenants>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, vitrage_id, all_tenants):
        """Get a single entity's alarm with the vitrage id.

        The following get alarm may be passed in the GET

        :param vitrage_id the id of the vitrage entity

        The result is a alarms object.
        """

        return vitrage.alarms(request, vitrage_id, all_tenants)


@urls.register
class Rca(generic.View):
    """API for vitrage rca."""

    url_regex = r'vitrage/rca/(?P<alarm_id>.+|default)/' \
                '(?P<all_tenants>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, alarm_id, all_tenants):
        """Get rca graph for an alarm.

        :param alarm_id the id of the alarm

        The result is an rca graph.
        """

        return vitrage.rca(request, alarm_id, all_tenants)


@urls.register
class Templates(generic.View):
    """API for vitrage templates."""

    url_regex = r'vitrage/template/(?P<template_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, template_id):
        """Get a single template with the vitrage id.

        The following get template may be passed in the GET

        :param template_id the id of the vitrage template

        The result is a template object.
        """

        return vitrage.templates(request, template_id)
