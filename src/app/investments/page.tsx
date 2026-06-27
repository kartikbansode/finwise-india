'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Plus, Edit2, Trash2, 
  PieChart, BarChart3, Target, Wallet, Building2, 
  Landmark, Coins, Shield, RefreshCw, Calendar,
  ArrowUpRight, ArrowDownRight, Info, X, Check
} from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const INVESTMENT_TYPES = [
  { value: 'mutual_fund', label: 'Mutual Funds', icon: BarChart3, color: '#3B82F6' },
  { value: 'stocks', label: 'Stocks', icon: TrendingUp, color: '#10B981' },
  { value: 'fixed_deposit', label: 'Fixed Deposits', icon: Landmark, color: '#8B5CF6' },
  { value: 'ppf', label: 'PPF', icon: Shield, color: '#F59E0B' },
  { value: 'epf', label: 'EPF', icon: Building2, color: '#EF4444' },
  { value: 'nps', label: 'NPS', icon: Target, color: '#06B6D4' },
  { value: 'bonds', label: 'Bonds', icon: Wallet, color: '#EC4899' },
  { value: 'real_estate', label: 'Real Estate', icon: Building2, color: '#84CC16' },
  { value: 'gold', label: 'Gold', icon: Coins, color: '#EAB308' },
  { value: 'crypto', label: 'Crypto', icon: Coins, color: '#F97316' },
  { value: 'other', label: 'Other', icon: Wallet, color: '#6B7280' },
];

const CURRENCY_FORMAT = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const CURRENCY_FORMAT_DECIMAL = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

interface Investment {
  id: string;
  name: string;
  type: string;
  category?: string;
  purchase_price: number;
  current_value: number;
  quantity: number;
  unit_price?: number;
  purchase_date: string;
  maturity_date?: string;
  last_updated?: string;
  expected_return_rate?: number;
  actual_return_rate?: number;
  capital_gain?: number;
  dividend_received?: number;
  tax_saving_eligible?: boolean;
  section_80c?: boolean;
  section_80ccd1b?: boolean;
  capital_gain_tax_applicable?: boolean;
  stcg_rate?: number;
  ltcg_rate?: number;
  status: string;
  notes?: string;
  created_at: string;
}

export default function InvestmentsPage() {
  const supabase = createClient();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'value' | 'gain' | 'name' | 'date'>('value');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'mutual_fund',
    category: '',
    purchase_price: '',
    current_value: '',
    quantity: '1',
    unit_price: '',
    purchase_date: new Date().toISOString().split('T')[0],
    maturity_date: '',
    expected_return_rate: '',
    tax_saving_eligible: false,
    section_80c: false,
    section_80ccd1b: false,
    notes: '',
  });

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const investmentData = {
        user_id: user.id,
        name: formData.name,
        type: formData.type,
        category: formData.category || null,
        purchase_price: parseFloat(formData.purchase_price),
        current_value: parseFloat(formData.current_value),
        quantity: parseFloat(formData.quantity) || 1,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
        purchase_date: formData.purchase_date,
        maturity_date: formData.maturity_date || null,
        expected_return_rate: formData.expected_return_rate ? parseFloat(formData.expected_return_rate) : null,
        tax_saving_eligible: formData.tax_saving_eligible,
        section_80c: formData.section_80c,
        section_80ccd1b: formData.section_80ccd1b,
        capital_gain: parseFloat(formData.current_value) - parseFloat(formData.purchase_price),
        actual_return_rate: ((parseFloat(formData.current_value) - parseFloat(formData.purchase_price)) / parseFloat(formData.purchase_price)) * 100,
        status: 'active',
        notes: formData.notes || null,
        last_updated: new Date().toISOString().split('T')[0],
      };

      if (editingInvestment) {
        const { error } = await supabase
          .from('investments')
          .update(investmentData)
          .eq('id', editingInvestment.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('investments')
          .insert([investmentData]);
        if (error) throw error;
      }

      resetForm();
      fetchInvestments();
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      fetchInvestments();
    } catch (error) {
      console.error('Error deleting investment:', error);
    }
  };

  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      category: investment.category || '',
      purchase_price: investment.purchase_price.toString(),
      current_value: investment.current_value.toString(),
      quantity: investment.quantity.toString(),
      unit_price: investment.unit_price?.toString() || '',
      purchase_date: investment.purchase_date,
      maturity_date: investment.maturity_date || '',
      expected_return_rate: investment.expected_return_rate?.toString() || '',
      tax_saving_eligible: investment.tax_saving_eligible || false,
      section_80c: investment.section_80c || false,
      section_80ccd1b: investment.section_80ccd1b || false,
      notes: investment.notes || '',
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setShowAddModal(false);
    setEditingInvestment(null);
    setFormData({
      name: '',
      type: 'mutual_fund',
      category: '',
      purchase_price: '',
      current_value: '',
      quantity: '1',
      unit_price: '',
      purchase_date: new Date().toISOString().split('T')[0],
      maturity_date: '',
      expected_return_rate: '',
      tax_saving_eligible: false,
      section_80c: false,
      section_80ccd1b: false,
      notes: '',
    });
  };

  // Calculations
  const portfolioStats = useMemo(() => {
    const totalValue = investments.reduce((sum, inv) => sum + inv.current_value, 0);
    const totalCost = investments.reduce((sum, inv) => sum + inv.purchase_price, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    const totalDividends = investments.reduce((sum, inv) => sum + (inv.dividend_received || 0), 0);
    const taxSavings = investments
      .filter(inv => inv.section_80c || inv.section_80ccd1b)
      .reduce((sum, inv) => sum + inv.current_value, 0);

    return {
      totalValue,
      totalCost,
      totalGain,
      totalGainPercent,
      totalDividends,
      taxSavings,
      investmentCount: investments.length,
    };
  }, [investments]);

  const filteredInvestments = useMemo(() => {
    let filtered = [...investments];
    
    if (filterType !== 'all') {
      filtered = filtered.filter(inv => inv.type === filterType);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(inv => 
        inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    switch (sortBy) {
      case 'value':
        filtered.sort((a, b) => b.current_value - a.current_value);
        break;
      case 'gain':
        filtered.sort((a, b) => (b.current_value - b.purchase_price) - (a.current_value - a.purchase_price));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'date':
        filtered.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime());
        break;
    }
    
    return filtered;
  }, [investments, filterType, sortBy, searchQuery]);

  const allocationData = useMemo(() => {
    const typeMap = new Map<string, number>();
    investments.forEach(inv => {
      const current = typeMap.get(inv.type) || 0;
      typeMap.set(inv.type, current + inv.current_value);
    });
    
    return Array.from(typeMap.entries()).map(([type, value]) => ({
      name: INVESTMENT_TYPES.find(t => t.value === type)?.label || type,
      value,
      color: INVESTMENT_TYPES.find(t => t.value === type)?.color || '#6B7280',
    }));
  }, [investments]);

  const performanceData = useMemo(() => {
    const monthlyMap = new Map<string, number>();
    investments.forEach(inv => {
      const month = inv.purchase_date.substring(0, 7);
      const current = monthlyMap.get(month) || 0;
      monthlyMap.set(month, current + inv.current_value);
    });
    
    return Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, value]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        value,
      }));
  }, [investments]);

  const getTypeColor = (type: string) => {
    return INVESTMENT_TYPES.find(t => t.value === type)?.color || '#6B7280';
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = INVESTMENT_TYPES.find(t => t.value === type);
    const Icon = typeInfo?.icon || Wallet;
    return Icon;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ml-64 min-h-screen bg-gray-50 dark:bg-zinc-950 p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Investments Portfolio</h1>
          <p className="text-muted-foreground">Track and manage your investment portfolio</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Investment
        </Button>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CURRENCY_FORMAT.format(portfolioStats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              {investments.length} investments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gain/Loss</CardTitle>
            {portfolioStats.totalGain >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              portfolioStats.totalGain >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {portfolioStats.totalGain >= 0 ? '+' : ''}{CURRENCY_FORMAT.format(portfolioStats.totalGain)}
            </div>
            <p className={cn(
              "text-xs",
              portfolioStats.totalGainPercent >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {portfolioStats.totalGainPercent >= 0 ? '+' : ''}{portfolioStats.totalGainPercent.toFixed(2)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CURRENCY_FORMAT.format(portfolioStats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">Total invested amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tax Savings (80C/80CCD)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{CURRENCY_FORMAT.format(portfolioStats.taxSavings)}</div>
            <p className="text-xs text-muted-foreground">Section 80C & 80CCD(1B)</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="all">All Investments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="tax">Tax Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Allocation Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation</CardTitle>
                <CardDescription>Distribution of your investments</CardDescription>
              </CardHeader>
              <CardContent>
                {allocationData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPie>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPie>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-75 text-muted-foreground">
                    No investments to display
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Best performing investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments
                    .map(inv => ({
                      ...inv,
                      gain: inv.current_value - inv.purchase_price,
                      gainPercent: ((inv.current_value - inv.purchase_price) / inv.purchase_price) * 100,
                    }))
                    .sort((a, b) => b.gainPercent - a.gainPercent)
                    .slice(0, 5)
                    .map((inv, index) => {
                      const Icon = getTypeIcon(inv.type);
                      return (
                        <div key={inv.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${getTypeColor(inv.type)}20` }}
                            >
                              <Icon className="h-4 w-4" style={{ color: getTypeColor(inv.type) }} />
                            </div>
                            <div>
                              <p className="font-medium">{inv.name}</p>
                              <p className="text-xs text-muted-foreground">{inv.type.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-medium",
                              inv.gain >= 0 ? "text-green-500" : "text-red-500"
                            )}>
                              {inv.gain >= 0 ? '+' : ''}{inv.gainPercent.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {CURRENCY_FORMAT.format(inv.gain)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  {investments.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No investments yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Input
                  placeholder="Search investments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="all">All Types</option>
                  {INVESTMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="value">Sort by Value</option>
                  <option value="gain">Sort by Gain</option>
                  <option value="name">Sort by Name</option>
                  <option value="date">Sort by Date</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Investments List */}
          <div className="grid gap-4">
            {filteredInvestments.map((investment) => {
              const Icon = getTypeIcon(investment.type);
              const gain = investment.current_value - investment.purchase_price;
              const gainPercent = ((gain) / investment.purchase_price) * 100;
              
              return (
                <Card key={investment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div 
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: `${getTypeColor(investment.type)}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: getTypeColor(investment.type) }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{investment.name}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {INVESTMENT_TYPES.find(t => t.value === investment.type)?.label}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Purchased: {new Date(investment.purchase_date).toLocaleDateString('en-IN')}
                            </span>
                            {investment.quantity > 1 && (
                              <span className="text-sm text-muted-foreground">
                                Qty: {investment.quantity}
                              </span>
                            )}
                          </div>
                          {investment.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{investment.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Current Value</p>
                          <p className="text-xl font-bold">{CURRENCY_FORMAT.format(investment.current_value)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Cost</p>
                          <p className="text-lg font-semibold">{CURRENCY_FORMAT.format(investment.purchase_price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Gain/Loss</p>
                          <p className={cn(
                            "text-lg font-semibold",
                            gain >= 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {gain >= 0 ? '+' : ''}{CURRENCY_FORMAT.format(gain)}
                            <span className="text-sm ml-1">
                              ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(investment)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(investment.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Tax Badges */}
                    {(investment.section_80c || investment.section_80ccd1b) && (
                      <div className="flex gap-2 mt-4">
                        {investment.section_80c && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Section 80C
                          </Badge>
                        )}
                        {investment.section_80ccd1b && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Section 80CCD(1B)
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {filteredInvestments.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No investments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Start tracking your investments by adding your first one'}
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Investment
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Performance Chart */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Value over time</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis 
                        tickFormatter={(value) => `₹${(Number(value)/100000).toFixed(1)}L`}
                      />
                      <Tooltip 
                        formatter={(value: any) => CURRENCY_FORMAT.format(Number(value ?? 0))}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-75 text-muted-foreground">
                    Add more investments to see performance chart
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Returns by Type */}
            <Card>
              <CardHeader>
                <CardTitle>Returns by Type</CardTitle>
                <CardDescription>Performance breakdown by asset class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {allocationData.map((type) => {
                    const typeInvestments = investments.filter(inv => inv.type === type.name.toLowerCase().replace(' ', '_'));
                    const totalCost = typeInvestments.reduce((sum, inv) => sum + inv.purchase_price, 0);
                    const totalValue = typeInvestments.reduce((sum, inv) => sum + inv.current_value, 0);
                    const gain = totalValue - totalCost;
                    const gainPercent = totalCost > 0 ? (gain / totalCost) * 100 : 0;
                    
                    return (
                      <div key={type.name} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{type.name}</span>
                          <span className={gain >= 0 ? "text-green-500" : "text-red-500"}>
                            {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              gain >= 0 ? "bg-green-500" : "bg-red-500"
                            )}
                            style={{ width: `${Math.min(Math.abs(gainPercent), 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Investment Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest investment additions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 5)
                    .map((inv) => {
                      const Icon = getTypeIcon(inv.type);
                      return (
                        <div key={inv.id} className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${getTypeColor(inv.type)}20` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: getTypeColor(inv.type) }} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{inv.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Added {new Date(inv.created_at).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <p className="font-medium">{CURRENCY_FORMAT.format(inv.current_value)}</p>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Tax Saving Investments */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Saving Investments</CardTitle>
                <CardDescription>Section 80C & 80CCD(1B) eligible investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {investments.filter(inv => inv.section_80c || inv.section_80ccd1b).length > 0 ? (
                    investments
                      .filter(inv => inv.section_80c || inv.section_80ccd1b)
                      .map((inv) => {
                        const Icon = getTypeIcon(inv.type);
                        return (
                          <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div className="flex items-center gap-3">
                              <Icon className="h-5 w-5" style={{ color: getTypeColor(inv.type) }} />
                              <div>
                                <p className="font-medium">{inv.name}</p>
                                <div className="flex gap-2">
                                  {inv.section_80c && (
                                    <Badge variant="outline" className="text-xs">80C</Badge>
                                  )}
                                  {inv.section_80ccd1b && (
                                    <Badge variant="outline" className="text-xs">80CCD(1B)</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p className="font-semibold">{CURRENCY_FORMAT.format(inv.current_value)}</p>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No tax-saving investments added yet</p>
                      <p className="text-sm">Add investments eligible for Section 80C/80CCD(1B) deductions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tax Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Summary</CardTitle>
                <CardDescription>Potential tax benefits from investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Section 80C (Max ₹1.5L)</span>
                      <span className="font-medium">{CURRENCY_FORMAT.format(Math.min(portfolioStats.taxSavings, 150000))}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${Math.min((portfolioStats.taxSavings / 150000) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Math.min(portfolioStats.taxSavings, 150000) >= 150000
                        ? '✅ Limit reached'
                        : `₹${CURRENCY_FORMAT.format(150000 - portfolioStats.taxSavings).replace('₹', '')} remaining`}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-muted-foreground">Section 80CCD(1B) (Max ₹50,000)</span>
                      <span className="font-medium">
                        {CURRENCY_FORMAT.format(
                          investments
                            .filter(inv => inv.section_80ccd1b)
                            .reduce((sum, inv) => sum + inv.current_value, 0)
                        )}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ 
                          width: `${Math.min(
                            (investments.filter(inv => inv.section_80ccd1b).reduce((sum, inv) => sum + inv.current_value, 0) / 50000) * 100,
                            100
                          )}%` 
                        }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Tax Savings Potential</span>
                      <span className="font-bold text-green-600">
                        Up to ₹{CURRENCY_FORMAT.format(Math.min(portfolioStats.taxSavings, 200000)).replace('₹', '')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Based on your highest tax slab rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Capital Gains Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Capital Gains Summary</CardTitle>
                <CardDescription>STCG & LTCG details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div>
                      <p className="font-medium text-green-600">Short Term Capital Gains</p>
                      <p className="text-sm text-muted-foreground">Held Less than 1 year</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        {CURRENCY_FORMAT.format(
                          investments
                            .filter(inv => {
                              const months = (new Date().getTime() - new Date(inv.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
                              return months < 12 && (inv.current_value - inv.purchase_price) > 0;
                            })
                            .reduce((sum, inv) => sum + (inv.current_value - inv.purchase_price), 0)
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">@ 20% tax rate</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div>
                      <p className="font-medium text-blue-600">Long Term Capital Gains</p>
                      <p className="text-sm text-muted-foreground">Held Less than 1 year</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">
                        {CURRENCY_FORMAT.format(
                          investments
                            .filter(inv => {
                              const months = (new Date().getTime() - new Date(inv.purchase_date).getTime()) / (1000 * 60 * 60 * 24 * 30);
                              return months >= 12 && (inv.current_value - inv.purchase_price) > 0;
                            })
                            .reduce((sum, inv) => sum + (inv.current_value - inv.purchase_price), 0)
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">@ 12.5% tax rate (exempt up to ₹1.25L)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tax Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Tax Calendar</CardTitle>
                <CardDescription>Important tax-related dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">FY End - Capital Gains Reporting</p>
                      <p className="text-sm text-muted-foreground">March 31, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">NPS Contribution Deadline</p>
                      <p className="text-sm text-muted-foreground">March 31, 2025 (80CCD(1B))</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">Section 80C Investment Lock-in</p>
                      <p className="text-sm text-muted-foreground">ELSS funds - 3 years</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={resetForm}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{editingInvestment ? 'Edit Investment' : 'Add New Investment'}</CardTitle>
                      <CardDescription>
                        {editingInvestment ? 'Update investment details' : 'Track a new investment in your portfolio'}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={resetForm}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-sm font-medium mb-2 block">Investment Name *</label>
                        <Input
                          required
                          placeholder="e.g., HDFC Equity Fund"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Type *</label>
                        <select
                          required
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                        >
                          {INVESTMENT_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Purchase Date *</label>
                        <Input
                          type="date"
                          required
                          value={formData.purchase_date}
                          onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Purchase Price (₹) *</label>
                        <Input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="100000"
                          value={formData.purchase_price}
                          onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Current Value (₹) *</label>
                        <Input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="120000"
                          value={formData.current_value}
                          onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Quantity</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Unit Price</label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="100"
                          value={formData.unit_price}
                          onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Expected Return (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          placeholder="12"
                          value={formData.expected_return_rate}
                          onChange={(e) => setFormData({ ...formData, expected_return_rate: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">Maturity Date</label>
                        <Input
                          type="date"
                          value={formData.maturity_date}
                          onChange={(e) => setFormData({ ...formData, maturity_date: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Tax Saving Options */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium mb-2 block">Tax Saving Options</label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.section_80c}
                            onChange={(e) => setFormData({ ...formData, section_80c: e.target.checked })}
                            className="rounded border-input"
                          />
                          <span className="text-sm">Section 80C (ELSS, PPF, FD, etc.)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.section_80ccd1b}
                            onChange={(e) => setFormData({ ...formData, section_80ccd1b: e.target.checked })}
                            className="rounded border-input"
                          />
                          <span className="text-sm">Section 80CCD(1B) (NPS)</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes</label>
                      <textarea
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-20"
                        placeholder="Additional notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingInvestment ? 'Update' : 'Add'} Investment
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
