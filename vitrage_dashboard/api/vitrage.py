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

import json
import logging

from horizon.utils.memoized import memoized
from keystoneauth1.identity.generic.token import Token
from keystoneauth1.session import Session
from openstack_dashboard.api import base
from vitrageclient import client as vitrage_client

"""
https://docs.openstack.org/horizon/latest/contributor/tutorials/plugin.html
"""

""" This file will likely be necessary if creating a Django or Angular driven
    plugin. This file is intended to act as a convenient location for
    interacting with the new service this plugin is supporting.
    While interactions with the service can be handled in the views.py,
    isolating the logic is an established pattern in Horizon.
"""
LOG = logging.getLogger(__name__)


@memoized
def vitrageclient(request, password=None):
    endpoint = base.url_for(request, 'identity')
    token_id = request.user.token.id
    tenant_name = request.user.tenant_name
    project_domain_id = request.user.token.project.get('domain_id', 'Default')
    auth = Token(auth_url=endpoint, token=token_id,
                 project_name=tenant_name,
                 project_domain_id=project_domain_id)
    session = Session(auth=auth, timeout=600)
    return vitrage_client.Client('1', session)


def topology(request, query=None, graph_type='tree', all_tenants='false',
             root=None, limit=None):
    LOG.info("--------- CALLING VITRAGE_CLIENT ---request %s", str(request))
    LOG.info("--------- CALLING VITRAGE_CLIENT ---query %s", str(query))
    LOG.info("------ CALLING VITRAGE_CLIENT --graph_type %s", str(graph_type))
    LOG.info("---- CALLING VITRAGE_CLIENT --all_tenants %s", str(all_tenants))
    LOG.info("--------- CALLING VITRAGE_CLIENT --------root %s", str(root))
    LOG.info("--------- CALLING VITRAGE_CLIENT --------limit %s", str(limit))
    return vitrageclient(request).topology.get(query=query,
                                               graph_type=graph_type,
                                               all_tenants=all_tenants,
                                               root=root,
                                               limit=limit)


def alarms(request, vitrage_id='all', all_tenants='false',
           limit=1000,
           sort_by=('start_timestamp', 'vitrage_id'),
           sort_dirs=['asc', 'asc'],
           filter_by=None,
           filter_vals=None,
           next_page=True,
           marker=None
           ):
    return vitrageclient(request).alarm.list(vitrage_id=vitrage_id,
                                             all_tenants=all_tenants,
                                             limit=limit,
                                             sort_by=sort_by,
                                             sort_dirs=sort_dirs,
                                             filter_by=filter_by,
                                             filter_vals=filter_vals,
                                             next_page=next_page,
                                             marker=marker
                                             )


def history(request, all_tenants='false',
            start=None, end=None,
            limit=1000,
            sort_by=('start_timestamp', 'vitrage_id'),
            sort_dirs=['asc', 'asc'],
            filter_by=None,
            filter_vals=None,
            next_page=True,
            marker=None
            ):
    return vitrageclient(request).alarm.history(all_tenants=all_tenants,
                                                start=start,
                                                end=end,
                                                limit=limit,
                                                sort_by=sort_by,
                                                sort_dirs=sort_dirs,
                                                filter_by=filter_by,
                                                filter_vals=filter_vals,
                                                next_page=next_page,
                                                marker=marker
                                                )


def alarm_counts(request, all_tenants='false'):
    counts = vitrageclient(request).alarm.count(all_tenants=all_tenants)
    counts['NA'] = counts.get("N/A")
    return counts


def rca(request, alarm_id, all_tenants='false'):
    return vitrageclient(request).rca.get(alarm_id=alarm_id,
                                          all_tenants=all_tenants)


def template_show(request, template_id='all'):
    if template_id == 'all':
        return vitrageclient(request).template.list()
    return vitrageclient(request).template.show(template_id)


def template_delete(request, template_id):
    return vitrageclient(request).template.delete(template_id)


def template_add(request):
    template = json.loads(request.body)
    type = template.get('type')
    params = template.get('params')
    template_str = template.get('template')
    response = vitrageclient(request).template \
        .add(template_type=type,
             params=params,
             template_str=template_str)
    return response


def template_validate(request):
    template = json.loads(request.body)
    type = template.get('type')
    params = template.get('params')
    template_str = template.get('template')
    response = vitrageclient(request).template \
        .validate(template_type=type,
                  params=params,
                  template_str=template_str)
    return response
