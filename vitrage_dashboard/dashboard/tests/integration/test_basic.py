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


from openstack_dashboard.test.integration_tests import helpers


class TestVitrageDashboardInstalled(helpers.TestCase):
    # TODO(e0ne): investigate issue with Network Topology confilct
    # and implement test

    def test_alarms_page_opened(self):
        alarms_page = self.home_pg.go_to_project_vitrage_alarmspage()
        self.assertEqual(alarms_page.page_title,
                         'Alarms Analysis - OpenStack Dashboard')

    def test_entity_graph_page_opened(self):
        egraph_page = self.home_pg.go_to_project_vitrage_entitygraphpage()
        self.assertEqual(egraph_page.page_title,
                         'Entity Graph - OpenStack Dashboard')

    def test_templates_page_opened(self):
        templates_page = self.home_pg.go_to_project_vitrage_templatespage()
        self.assertEqual(templates_page.page_title,
                         'Templates List - OpenStack Dashboard')
