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

# Default to Horizons test settings to avoid any missing keys

import openstack_dashboard.enabled  # noqa: F811
from openstack_dashboard.test.settings import *  # noqa: F403,H303
from openstack_dashboard.utils import settings

import vitrage_dashboard.enabled

# pop these keys to avoid log warnings about deprecation
# update_dashboards will populate them anyway
HORIZON_CONFIG.pop('dashboards', None)  # noqa: F405
HORIZON_CONFIG.pop('default_dashboard', None)  # noqa: F405

# Update the dashboards with heat_dashboard enabled files
# and current INSTALLED_APPS
settings.update_dashboards(
    [
        openstack_dashboard.enabled,
        vitrage_dashboard.enabled,
    ],
    HORIZON_CONFIG,  # noqa: F405
    INSTALLED_APPS  # noqa: F405
)

# Remove duplicated apps
INSTALLED_APPS = list(set(INSTALLED_APPS))  # noqa: F405
