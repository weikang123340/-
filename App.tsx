
import React, { useState, useEffect, useMemo } from 'react';
import { Package, PackageStatus, StationStats } from './types';
import { COURIER_COMPANIES, SHELF_ZONES, ROWS, SLOTS } from './constants';
import { analyzeStationData } from './services/geminiService';

const App: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inbound' | 'outbound' | 'inventory'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState('加载AI经营建议...');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Form States
  const [inboundForm, setInboundForm] = useState({
    trackingNumber: '',
    recipientPhone: '',
    recipientName: '',
    courierCompany: COURIER_COMPANIES[0],
    shelfZone: SHELF_ZONES[0],
    row: '1',
    slot: '1'
  });

  // Derived Stats
  const stats = useMemo((): StationStats => {
    const today = new Date().setHours(0,0,0,0);
    const inboundToday = packages.filter(p => p.inboundTime >= today).length;
    const pending = packages.filter(p => p.status === PackageStatus.ARRIVED).length;
    const delivered = packages.filter(p => p.status === PackageStatus.PICKED_UP && (p.outboundTime || 0) >= today).length;
    return {
      totalInboundToday: inboundToday,
      pendingPickup: pending,
      deliveredToday: delivered,
      shelfUtilization: Math.round((pending / (SHELF_ZONES.length * ROWS.length * SLOTS.length)) * 100)
    };
  }, [packages]);

  // Load AI Analysis
  useEffect(() => {
    const timer = setTimeout(async () => {
      const analysis = await analyzeStationData(packages);
      setAiAnalysis(analysis);
    }, 1000);
    return () => clearTimeout(timer);
  }, [packages.length]);

  const handleInbound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inboundForm.trackingNumber || !inboundForm.recipientPhone) return;

    const newPackage: Package = {
      id: Math.random().toString(36).substr(2, 9),
      trackingNumber: inboundForm.trackingNumber,
      recipientName: inboundForm.recipientName || '收件人',
      recipientPhone: inboundForm.recipientPhone,
      shelfLocation: `${inboundForm.shelfZone}-${inboundForm.row}-${inboundForm.slot}`,
      inboundTime: Date.now(),
      status: PackageStatus.ARRIVED,
      courierCompany: inboundForm.courierCompany
    };

    setPackages([newPackage, ...packages]);
    setInboundForm({ ...inboundForm, trackingNumber: '', recipientPhone: '', recipientName: '' });
    alert('入库成功！位置: ' + newPackage.shelfLocation);
    // Optional: Close menu on mobile after action if it was a nav action, keeping form open for continuous scanning
  };

  const handlePickup = (id: string) => {
    setPackages(packages.map(p => 
      p.id === id ? { ...p, status: PackageStatus.PICKED_UP, outboundTime: Date.now() } : p
    ));
  };

  const filteredPackages = packages.filter(p => 
    p.trackingNumber.includes(searchQuery) || 
    p.recipientPhone.includes(searchQuery) ||
    p.recipientName.includes(searchQuery)
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 relative">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Responsive */}
      <nav className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-xl 
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xl">
              EP
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">站点管理 Pro</h1>
              <span className="text-slate-500 text-xs">Express Station</span>
            </div>
          </div>
          {/* Close button for mobile */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        <div className="flex-1 py-6 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: '工作台', icon: '📊' },
            { id: 'inbound', label: '扫码入库', icon: '📥' },
            { id: 'outbound', label: '查询出库', icon: '📤' },
            { id: 'inventory', label: '库存明细', icon: '📦' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-colors ${
                activeTab === item.id ? 'bg-blue-600 text-white border-r-4 border-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-6 border-t border-slate-800 safe-area-bottom">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Station ID</p>
            <p className="text-sm font-mono text-blue-400">#ST_PUXI_0821</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 w-full">
        {/* Header - Responsive */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-bold truncate">
                {activeTab === 'dashboard' && '数字化大屏'}
                {activeTab === 'inbound' && '快件入库登记'}
                {activeTab === 'outbound' && '快件出库受理'}
                {activeTab === 'inventory' && '实时库存管理'}
              </h2>
              <p className="text-slate-500 text-xs md:text-sm mt-1 hidden sm:block">
                {new Date().toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder="搜索..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-full text-sm w-full md:w-64 focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-100 transition-colors shadow-sm">
              🔔
            </button>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-blue-100 border-2 border-white overflow-hidden shadow-sm shrink-0">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Manager" alt="Avatar" />
            </div>
          </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: '今日入库', value: stats.totalInboundToday, sub: '较昨日 +12%', color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: '待取快件', value: stats.pendingPickup, sub: '占库容 ' + stats.shelfUtilization + '%', color: 'text-orange-600', bg: 'bg-orange-50' },
                { label: '今日出库', value: stats.deliveredToday, sub: '签收率 ' + (stats.totalInboundToday > 0 ? Math.round((stats.deliveredToday / stats.totalInboundToday) * 100) : 0) + '%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: '站点状态', value: '正常', sub: '环境温度 24°C', color: 'text-indigo-600', bg: 'bg-indigo-50' }
              ].map((card, i) => (
                <div key={i} className={`${card.bg} p-5 rounded-2xl border border-white shadow-sm`}>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">{card.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* AI Insights */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">✨</span>
                <h3 className="font-bold text-slate-800">AI 智能经营分析</h3>
              </div>
              <div className="bg-blue-50/50 p-4 rounded-xl text-blue-800 text-sm leading-relaxed">
                {aiAnalysis}
              </div>
            </div>

            {/* Recent Activity - Mobile Optimized */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                <h3 className="font-bold">最新动态</h3>
                <button className="text-blue-600 text-xs font-bold bg-blue-50 px-3 py-1.5 rounded-full">全部</button>
              </div>
              <div className="divide-y divide-slate-50">
                {packages.slice(0, 5).map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between active:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === PackageStatus.ARRIVED ? 'bg-orange-400' : 'bg-emerald-400'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{p.trackingNumber}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-none">{p.courierCompany} · {p.recipientName}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block">{p.shelfLocation}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(p.inboundTime).getHours()}:{String(new Date(p.inboundTime).getMinutes()).padStart(2,'0')}</p>
                    </div>
                  </div>
                ))}
                {packages.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <p>暂无快件动态</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Inbound Form View - Mobile Friendly */}
        {activeTab === 'inbound' && (
          <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500 pb-20">
            <form onSubmit={handleInbound} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">快递单号</label>
                    <div className="flex gap-2">
                      <input
                        required
                        type="text" // Changed to text to support external scanners or keyboard
                        inputMode="numeric" // Hints numeric keyboard on mobile
                        placeholder="扫描或输入"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-lg"
                        value={inboundForm.trackingNumber}
                        onChange={e => setInboundForm({...inboundForm, trackingNumber: e.target.value})}
                      />
                      <button type="button" className="p-3 bg-slate-100 rounded-xl text-xl">📷</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">快递公司</label>
                    <select
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={inboundForm.courierCompany}
                      onChange={e => setInboundForm({...inboundForm, courierCompany: e.target.value})}
                    >
                      {COURIER_COMPANIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">手机号码</label>
                    <input
                      required
                      type="tel"
                      placeholder="手机号后四位或全号"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-lg"
                      value={inboundForm.recipientPhone}
                      onChange={e => setInboundForm({...inboundForm, recipientPhone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">收件人姓名 (可选)</label>
                    <input
                      type="text"
                      placeholder="姓名"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={inboundForm.recipientName}
                      onChange={e => setInboundForm({...inboundForm, recipientName: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-700 flex flex-wrap items-center gap-2">
                    货架位置 <span className="text-blue-500 text-xs font-normal bg-blue-50 px-2 py-0.5 rounded-full">系统推荐</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">Zone</span>
                      <select 
                        className="w-full px-2 md:px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                        value={inboundForm.shelfZone}
                        onChange={e => setInboundForm({...inboundForm, shelfZone: e.target.value})}
                      >
                        {SHELF_ZONES.map(z => <option key={z}>{z}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">Row</span>
                      <select 
                        className="w-full px-2 md:px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                        value={inboundForm.row}
                        onChange={e => setInboundForm({...inboundForm, row: e.target.value})}
                      >
                        {ROWS.map(r => <option key={r}>{r} 层</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold ml-1 uppercase">Slot</span>
                      <select 
                        className="w-full px-2 md:px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold"
                        value={inboundForm.slot}
                        onChange={e => setInboundForm({...inboundForm, slot: e.target.value})}
                      >
                        {SLOTS.map(s => <option key={s}>{s} 号</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-5 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4 sticky bottom-0 z-10">
                <button type="button" className="flex-1 md:flex-none px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all">
                  重置
                </button>
                <button type="submit" className="flex-1 md:flex-none md:w-48 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all text-lg">
                  确认入库
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Outbound/Pickup List View */}
        {(activeTab === 'outbound' || activeTab === 'inventory') && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500 pb-20">
            <div className="p-4 md:p-6 border-b border-slate-50 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-3">
               <div className="flex w-full sm:w-auto gap-3">
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm">批量操作</button>
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm">导出</button>
               </div>
               <div className="text-sm text-slate-500">共 {filteredPackages.length} 件</div>
            </div>
            
            {/* Mobile Card View for Tables */}
            <div className="block sm:hidden">
              {filteredPackages.map(p => (
                <div key={p.id} className="p-4 border-b border-slate-100 active:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-lg">{p.trackingNumber}</span>
                      <p className="text-xs text-slate-500">{p.courierCompany}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-mono font-bold rounded-full">{p.shelfLocation}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                       <p className="text-sm font-medium">{p.recipientName} <span className="text-slate-400">|</span> {p.recipientPhone}</p>
                       <p className="text-[10px] text-slate-400 mt-1">{new Date(p.inboundTime).toLocaleString()}</p>
                    </div>
                    {p.status === PackageStatus.ARRIVED ? (
                      <button
                        onClick={() => handlePickup(p.id)}
                        className="px-5 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
                      >
                        出库
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">已取走</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredPackages.length === 0 && (
                <div className="p-10 text-center text-slate-400">未找到结果</div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                    <th className="px-6 py-4">快件详情</th>
                    <th className="px-6 py-4">收件人</th>
                    <th className="px-6 py-4">存放位置</th>
                    <th className="px-6 py-4">入库时间</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPackages.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold font-mono">{p.trackingNumber}</p>
                        <p className="text-xs text-slate-500">{p.courierCompany}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold">{p.recipientName}</p>
                        <p className="text-xs text-slate-500">{p.recipientPhone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-mono font-bold rounded-full border border-blue-200">
                          {p.shelfLocation}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(p.inboundTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                          p.status === PackageStatus.ARRIVED ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {p.status === PackageStatus.ARRIVED ? '待取件' : '已签收'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {p.status === PackageStatus.ARRIVED ? (
                          <button
                            onClick={() => handlePickup(p.id)}
                            className="px-4 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            确认出库
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">已于 {p.outboundTime && new Date(p.outboundTime).toLocaleTimeString()} 领取</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredPackages.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-400">
                        <div className="text-4xl mb-2">🔎</div>
                        <p>未找到匹配的快件</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Quick Tools Panel - Hidden on mobile, visible on XL screens */}
      <aside className="w-80 bg-white border-l border-slate-200 p-6 space-y-8 hidden xl:block">
        <div>
          <h4 className="font-bold text-slate-800 mb-4">库位概览</h4>
          <div className="grid grid-cols-4 gap-2">
            {SHELF_ZONES.map(z => (
              <div key={z} className="group relative">
                <div className={`aspect-square rounded-lg flex flex-col items-center justify-center border transition-all ${
                  z === 'A' ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  <span className="text-xs font-bold">{z}</span>
                  <span className="text-[8px] opacity-70">85%</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-blue-600 text-xs font-bold hover:bg-blue-50 rounded-lg transition-all">
            整理库位建议
          </button>
        </div>

        <div className="p-4 bg-slate-900 rounded-2xl text-white">
          <h4 className="font-bold mb-2">通知公告</h4>
          <div className="space-y-3">
            <div className="p-2 bg-slate-800 rounded-lg border-l-2 border-orange-500">
              <p className="text-[10px] font-bold">⚠️ 今日揽收截止</p>
              <p className="text-[8px] text-slate-400 mt-1">顺丰揽收截止时间调整为 18:30，请合理安排。</p>
            </div>
            <div className="p-2 bg-slate-800 rounded-lg border-l-2 border-blue-500">
              <p className="text-[10px] font-bold">📢 系统更新</p>
              <p className="text-[8px] text-slate-400 mt-1">AI 经营分析模型已更新，支持更多公司统计。</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-800 mb-4">快捷操作</h4>
          <div className="space-y-2">
            <button className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium hover:border-blue-300 transition-all text-left px-4">🖨️ 打印取件凭条</button>
            <button className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium hover:border-blue-300 transition-all text-left px-4">📲 一键短信通知</button>
            <button className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium hover:border-blue-300 transition-all text-left px-4">📷 异常件拍照</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
