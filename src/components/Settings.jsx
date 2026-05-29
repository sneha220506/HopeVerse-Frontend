import React, { useState } from 'react';

export default function SettingsPage({ user, perms }) {
  const [activeTab, setActiveTab] = useState('profile');
  const brandColor = "#8E7CC3";

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'appearance', label: 'Interface', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'data', label: 'Data & Privacy', icon: '🛡️' },
  ];

  return (
    <section className="py-10 bg-[#F8FAFC] min-h-screen relative overflow-hidden text-black">
     <div className="max-w-7xl mx-auto px-4 py-8 ">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-slate-dark">Settings</h1>
        <p className="text-slate-dark/60">Manage your account preferences and system configuration.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-white shadow-lg'
                  : 'text-slate-dark/60 hover:bg-surface'
              }`}
              style={{ backgroundColor: activeTab === tab.id ? brandColor : 'white' }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && <ProfileSection user={user} brandColor={brandColor} />}
          {activeTab === 'appearance' && <InterfaceSection brandColor={brandColor} />}
          {activeTab === 'notifications' && <NotificationSection brandColor={brandColor} />}
          {activeTab === 'data' && <DataPrivacySection brandColor={brandColor} />}
        </div>
      </div>
    </div>
   </section>
  );
}

function ProfileSection({ user, brandColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-dark">Profile Customization</h2>
        <button style={{ backgroundColor: brandColor }} className="text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          Save Profile
        </button>
      </div>
      
      {/* Basic Info - From WhatsApp Image 2026-05-29 at 12.47.34.jpeg */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="relative group">
          <div className="w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl shadow-inner">
            {user?.avatar || '👤'}
          </div>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField label="Full Name" defaultValue={user?.name || "Raj Sharma"} />
          <InputField label="Email" defaultValue={user?.email || "raj@communitypulse.org"} disabled />
          <InputField label="Location" defaultValue={user?.location || "Jaipur"} />
          <InputField label="Region" defaultValue={user?.region || "Rajasthan"} />
          <InputField label="Phone" defaultValue={user?.phone || "1234567899"} />
        </div>
      </div>

      {/* Volunteer Specific - From WhatsApp Image 2026-05-29 at 12.47.35_2.jpeg */}
      {user?.role === 'volunteer' && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
          <h3 className="font-bold text-slate-700">Volunteer Professional Data</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField label="Availability" defaultValue={user?.availability || "full-time"} />
            <InputField label="Status" defaultValue={user?.status || "active"} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-dark/50">Weekly Schedule</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                <div key={day} className={`px-3 py-1 rounded-full text-xs font-medium border ${user?.schedule?.[day] ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InterfaceSection({ brandColor }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-dark">Interface & Display</h2>
        <button style={{ backgroundColor: brandColor }} className="text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          Save Settings
        </button>
      </div>
      <div className="space-y-4">
        <label className="block text-sm font-semibold">Theme Preference</label>
        <div className="grid grid-cols-3 gap-3">
          {['Light', 'Dark', 'System'].map((mode) => (
            <button key={mode} className="px-4 py-3 rounded-xl border border-slate-200 hover:border-[#8E7CC3] text-sm font-medium transition-all">
              {mode} Mode
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationSection({ brandColor }) {
  const rows = [
    { id: 'new_task', label: 'New Task Assigned' },
    { id: 'status_update', label: 'Task Status Updated' },
    { id: 'security', label: 'System & Security' },
    { id: 'new_vol', label: 'New Volunteer Registered' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-dark">Notification Settings</h2>
        <button style={{ backgroundColor: brandColor }} className="text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90">
          Save Preferences
        </button>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs font-bold text-slate-dark/40 uppercase tracking-widest border-b border-slate-100">
            <th className="pb-4">Trigger</th>
            <th className="pb-4 text-center">Email</th>
            <th className="pb-4 text-center">Push</th>
            <th className="pb-4 text-center">SMS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((row) => (
            <tr key={row.id} className="group hover:bg-slate-50 transition-colors">
              <td className="py-4 text-sm font-medium text-slate-dark">{row.label}</td>
              <td className="py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: brandColor }} /></td>
              <td className="py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: brandColor }} /></td>
              <td className="py-4 text-center"><input type="checkbox" className="w-4 h-4 rounded" style={{ accentColor: brandColor }} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DataPrivacySection({ brandColor }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-dark mb-2">Data Portability</h2>
        <p className="text-sm text-slate-dark/60 mb-4">Download a copy of your task history and profile data.</p>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-100 text-slate-dark font-semibold rounded-xl text-sm border border-slate-200 hover:bg-slate-200">Export as JSON</button>
          <button className="px-4 py-2 bg-slate-100 text-slate-dark font-semibold rounded-xl text-sm border border-slate-200 hover:bg-slate-200">Export as CSV</button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, defaultValue, disabled = false }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-dark/50">{label}</label>
      <input 
        type="text" 
        defaultValue={defaultValue} 
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#8E7CC3]/20 ${disabled ? 'bg-slate-50 cursor-not-allowed' : ''}`} 
      />
    </div>
  );
}