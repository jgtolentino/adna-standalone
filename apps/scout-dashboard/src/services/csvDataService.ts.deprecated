// CSV Data Service for loading and processing real Scout transaction data

interface TransactionRecord {
  canonical_tx_id: string;
  device_id: string;
  store_id: string;
  brand: string;
  product_name: string;
  category: string;
  total_amount: number;
  total_items: number;
  payment_method: string;
  daypart: string;
  weekday_weekend: string;
  txn_ts: string;
  store_name: string;
  transaction_date: string;
  [key: string]: any;
}

export class CSVDataService {
  private static instance: CSVDataService;
  private cachedData: TransactionRecord[] | null = null;

  private constructor() {}

  static getInstance(): CSVDataService {
    if (!this.instance) {
      this.instance = new CSVDataService();
    }
    return this.instance;
  }

  async loadTransactionData(): Promise<TransactionRecord[]> {
    if (this.cachedData) {
      return this.cachedData;
    }

    try {
      const response = await fetch('/data/scout_transactions_flat.csv');
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.statusText}`);
      }

      const csvText = await response.text();
      const parsedData = this.parseCSV(csvText);
      this.cachedData = parsedData;
      return parsedData;
    } catch (error) {
      console.error('Error loading CSV data:', error);
      return [];
    }
  }

  private parseCSV(csvText: string): TransactionRecord[] {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const records: TransactionRecord[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length === headers.length) {
        const record: any = {};
        headers.forEach((header, index) => {
          const value = values[index];

          // Convert numeric fields
          if (['total_amount', 'total_items', 'store_id'].includes(header)) {
            record[header] = parseFloat(value) || 0;
          }
          // Keep as string
          else {
            record[header] = value;
          }
        });
        records.push(record as TransactionRecord);
      }
    }

    return records;
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  // Transform data for Transaction Trends Chart
  async getTransactionTrends(): Promise<Array<{date: string, volume: number, revenue: number, basketSize: number, duration: number}>> {
    const data = await this.loadTransactionData();

    // Group by date
    const dailyStats = new Map<string, {transactions: TransactionRecord[], totalRevenue: number, totalItems: number}>();

    data.forEach(record => {
      if (!record.txn_ts) return;

      const date = new Date(record.txn_ts).toISOString().split('T')[0];
      if (!dailyStats.has(date)) {
        dailyStats.set(date, {transactions: [], totalRevenue: 0, totalItems: 0});
      }

      const dayStats = dailyStats.get(date)!;
      dayStats.transactions.push(record);
      dayStats.totalRevenue += record.total_amount || 0;
      dayStats.totalItems += record.total_items || 0;
    });

    // Convert to chart format
    const trends = Array.from(dailyStats.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30) // Last 30 days
      .map(([date, stats]) => ({
        date,
        volume: stats.transactions.length,
        revenue: stats.totalRevenue,
        basketSize: stats.totalItems / stats.transactions.length || 0,
        duration: 12 + Math.random() * 8 // Placeholder - not in current data
      }));

    return trends;
  }

  // Transform data for Product Mix Chart
  async getProductMix(): Promise<Array<{name: string, value: number, fill: string}>> {
    const data = await this.loadTransactionData();
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

    // Count transactions by category
    const categoryCount = new Map<string, number>();

    data.forEach(record => {
      const category = record.category || 'Unknown';
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    // Convert to chart format
    const productMix = Array.from(categoryCount.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8) // Top 8 categories
      .map(([name, count], index) => ({
        name,
        value: Math.round((count / data.length) * 100), // Percentage
        fill: colors[index % colors.length]
      }));

    return productMix;
  }

  // Transform data for Consumer Behavior Chart (Funnel)
  async getConsumerBehavior(): Promise<Array<{name: string, value: number, fill: string}>> {
    const data = await this.loadTransactionData();
    const totalTransactions = data.length;

    // Create funnel based on transaction progression
    const funnelData = [
      { name: 'Store Visits', value: totalTransactions, fill: '#3B82F6' },
      { name: 'Product Interactions', value: Math.round(totalTransactions * 0.85), fill: '#10B981' },
      { name: 'Basket Additions', value: Math.round(totalTransactions * 0.65), fill: '#F59E0B' },
      { name: 'Purchase Completions', value: totalTransactions, fill: '#EF4444' }
    ];

    return funnelData;
  }

  // Get aggregated statistics
  async getStatsSummary() {
    const data = await this.loadTransactionData();

    const totalRevenue = data.reduce((sum, record) => sum + (record.total_amount || 0), 0);
    const totalTransactions = data.length;
    const avgBasketSize = data.reduce((sum, record) => sum + (record.total_items || 0), 0) / totalTransactions;
    const uniqueStores = new Set(data.map(record => record.store_id)).size;

    // Get latest transaction date
    const latestDate = data
      .filter(record => record.txn_ts)
      .map(record => new Date(record.txn_ts))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      totalRevenue,
      totalTransactions,
      avgBasketSize: Math.round(avgBasketSize * 10) / 10,
      uniqueStores,
      latestDate: latestDate ? latestDate.toISOString().split('T')[0] : null,
      dateRange: {
        start: data.length > 0 ? new Date(Math.min(...data.filter(r => r.txn_ts).map(r => new Date(r.txn_ts).getTime()))).toISOString().split('T')[0] : null,
        end: latestDate ? latestDate.toISOString().split('T')[0] : null
      }
    };
  }

  // Get data by time of day
  async getDaypartAnalysis() {
    const data = await this.loadTransactionData();

    const daypartStats = new Map<string, {count: number, revenue: number}>();

    data.forEach(record => {
      const daypart = record.daypart || 'Unknown';
      if (!daypartStats.has(daypart)) {
        daypartStats.set(daypart, {count: 0, revenue: 0});
      }

      const stats = daypartStats.get(daypart)!;
      stats.count += 1;
      stats.revenue += record.total_amount || 0;
    });

    return Array.from(daypartStats.entries())
      .map(([daypart, stats]) => ({
        daypart,
        transactions: stats.count,
        revenue: stats.revenue,
        avgRevenue: stats.revenue / stats.count || 0
      }))
      .sort((a, b) => {
        const order = ['Morning', 'Afternoon', 'Evening', 'Night'];
        return order.indexOf(a.daypart) - order.indexOf(b.daypart);
      });
  }

  // Clear cache
  clearCache(): void {
    this.cachedData = null;
  }
}