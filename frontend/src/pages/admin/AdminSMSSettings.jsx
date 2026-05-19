import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { MessageSquare, Settings, FileText, Activity, Save } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminSMSSettings = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [settings, setSettings] = useState({ provider: 'The SMS Works', apiKey: '', apiSecret: '', senderId: 'Winkin', adminPhone: '', isEnabled: false });
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get('/api/sms/settings', {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
      });
      setSettings(data);
    } catch (error) { console.error('Failed to load SMS settings', error); }
  };

  const fetchTemplates = async () => {
    try {
      const { data } = await axios.get('/api/sms/templates', {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
      });
      setTemplates(data);
    } catch (error) { console.error('Failed to load SMS templates', error); }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await axios.get('/api/sms/logs', {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
      });
      setLogs(data);
    } catch (error) { console.error('Failed to load SMS logs', error); }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await fetchSettings();
      await fetchTemplates();
      await fetchLogs();
      setLoading(false);
    };
    loadAll();
  }, []);

  const saveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/sms/settings', settings, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
      });
      Swal.fire({ title: 'Success', text: 'Settings updated successfully', icon: 'success', confirmButtonColor: '#22c55e' });
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to update', icon: 'error' });
    }
  };

  const saveTemplate = async (templateId, updatedBody, isEnabled) => {
    try {
      await axios.put(`/api/sms/templates/${templateId}`, { body: updatedBody, isEnabled }, {
        headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('userInfo'))?.token}` }
      });
      Swal.fire({ title: 'Success', text: 'Template updated successfully', icon: 'success', confirmButtonColor: '#22c55e' });
      fetchTemplates();
    } catch (error) {
      Swal.fire({ title: 'Error', text: error.response?.data?.message || 'Failed to update', icon: 'error' });
    }
  };

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-500" />
            SMS Notification System
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Configure your automated SMS messaging system</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'settings' ? 'border-b-2 border-green-500 text-green-600 bg-green-50 dark:bg-green-900/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <Settings className="h-4 w-4" /> Gateway Settings
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'templates' ? 'border-b-2 border-green-500 text-green-600 bg-green-50 dark:bg-green-900/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <FileText className="h-4 w-4" /> Message Templates
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors ${activeTab === 'logs' ? 'border-b-2 border-green-500 text-green-600 bg-green-50 dark:bg-green-900/10' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
          >
            <Activity className="h-4 w-4" /> Delivery Logs
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'settings' && (
            <form onSubmit={saveSettings} className="space-y-6 max-w-2xl">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-100 dark:border-gray-600">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">Enable SMS System</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Master switch to turn all SMS on or off.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.isEnabled} onChange={(e) => setSettings({...settings, isEnabled: e.target.checked})} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                </label>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
                  <select 
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white"
                    value={settings.provider}
                    onChange={(e) => setSettings({...settings, provider: e.target.value})}
                  >
                    <option value="The SMS Works">The SMS Works (UK Focused)</option>
                    <option value="Vonage">Vonage (Nexmo)</option>
                    <option value="Twilio">Twilio</option>
                    <option value="Mock">Mock (Testing Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
                  <input type="password" value={settings.apiKey} onChange={(e) => setSettings({...settings, apiKey: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white" />
                </div>
                
                {settings.provider === 'Vonage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Secret</label>
                    <input type="password" value={settings.apiSecret} onChange={(e) => setSettings({...settings, apiSecret: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sender ID (max 11 chars)</label>
                  <input type="text" maxLength={11} value={settings.senderId} onChange={(e) => setSettings({...settings, senderId: e.target.value})} className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Notification Phone Number</label>
                  <input type="text" value={settings.adminPhone} onChange={(e) => setSettings({...settings, adminPhone: e.target.value})} placeholder="+447712345678" className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2.5 text-gray-900 dark:text-white" />
                </div>
              </div>

              <button type="submit" className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors">
                <Save className="h-4 w-4" /> Save Settings
              </button>
            </form>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {templates.map(tpl => (
                  <div key={tpl._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 bg-gray-50 dark:bg-gray-800">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{tpl.name}</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={tpl.isEnabled} onChange={(e) => saveTemplate(tpl._id, tpl.body, e.target.checked)} />
                        <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                      </label>
                    </div>
                    <textarea 
                      className="w-full h-24 p-3 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
                      value={tpl.body}
                      onChange={(e) => {
                        const newTemplates = [...templates];
                        const idx = newTemplates.findIndex(t => t._id === tpl._id);
                        newTemplates[idx].body = e.target.value;
                        setTemplates(newTemplates);
                      }}
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Variables: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{"{customer_name}"}</code>, <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{"{order_id}"}</code>
                    </div>
                    <button 
                      onClick={() => saveTemplate(tpl._id, tpl.body, tpl.isEnabled)}
                      className="mt-3 text-sm bg-gray-800 dark:bg-gray-600 text-white px-3 py-1.5 rounded hover:bg-gray-700"
                    >
                      Update Template
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">Date</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 rounded-tr-lg">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-4">No logs found</td></tr>
                  ) : logs.map(log => (
                    <tr key={log._id} className="border-b dark:border-gray-700 bg-white dark:bg-gray-800">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{log.phone}</td>
                      <td className="px-4 py-3">{log.eventId}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          log.status === 'sent' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                          log.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-red-500 max-w-xs truncate" title={log.errorMessage}>{log.errorMessage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSMSSettings;
