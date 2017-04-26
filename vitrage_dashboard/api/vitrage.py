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


from horizon.utils.memoized import memoized  # noqa
from keystoneauth1.identity.generic.token import Token
from keystoneauth1.session import Session
from openstack_dashboard.api import base
from vitrageclient import client as vitrage_client


@memoized
def vitrageclient(request, password=None):
    endpoint = base.url_for(request, 'identity')
    tokenId = request.user.token.id
    tenentName = request.user.tenant_name
    auth = Token(auth_url=endpoint, token=tokenId, project_name=tenentName)
    session = Session(auth=auth, timeout=600)
    return vitrage_client.Client('1', session)


def topology(request, query=None, graph_type='tree', all_tenants='false'):
    return vitrageclient(request).topology.get(query=query,
                                               graph_type=graph_type,
                                               all_tenants=all_tenants)


def alarms(request, vitrage_id='all', all_tenants='false'):
    return vitrageclient(request).alarm.list(vitrage_id=vitrage_id,
                                             all_tenants=all_tenants)


def rca(request, alarm_id, all_tenants='false'):
    return vitrageclient(request).rca.get(alarm_id=alarm_id,
                                          all_tenants=all_tenants)


def templates(request, template_id='all'):
    if template_id == 'all':
        return vitrageclient(request).template.list()
    return vitrageclient(request).template.show(template_id)
