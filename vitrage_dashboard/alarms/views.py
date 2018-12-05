# Copyright 2012 Alcatel-Lucent, Inc.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

from horizon import views

from vitrage_dashboard.api import vitrage

import json


class IndexView(views.APIView):
    # A very simple class-based view...
    template_name = 'alarms/index.html'

    def get_data(self, request, context, *args, **kwargs):
        topology_settings = {
            'VITRAGE_VERSION': {
                'VER': 1,
                'REL': 1
            }
        }
        context['TOPOLOGY_VITRAGE_SETTINGS'] = json.dumps(topology_settings)
        return context


class AlarmBannerView(views.HorizonTemplateView):
    template_name = 'alarms/banner.html'

    def get_context_data(self, **kwargs):
        context = super(AlarmBannerView, self).get_context_data(**kwargs)

        is_admin = 'admin' in self.request.META.get('HTTP_REFERER')
        counts = vitrage.alarm_counts(self.request, is_admin)
        context['counts'] = counts
        return context
