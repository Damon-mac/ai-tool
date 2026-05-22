import { Injectable, Logger } from '@nestjs/common';

interface EastmoneySuggestItem {
  Code?: string;
  Name?: string;
  QuoteID?: string;
  Classify?: string;
  SecurityTypeName?: string;
}

interface EastmoneySuggestResponse {
  QuotationCodeTable?: {
    Data?: EastmoneySuggestItem[];
    Status?: number;
    Message?: string;
  };
}

interface EastmoneyQuoteResponse {
  data?: {
    f43?: number;
    f44?: number;
    f45?: number;
    f46?: number;
    f47?: number;
    f48?: number;
    f57?: string;
    f58?: string;
    f60?: number;
    f62?: number;
    f116?: number;
    f164?: number;
    f167?: number;
    f168?: number;
    f170?: number;
  };
}

export interface StockLookupResult {
  symbol: string;
  shortName: string;
  exchange?: string;
  market?: string;
}

export interface StockSnapshotData {
  symbol: string;
  shortName: string;
  market: string;
  price: number;
  changePercent: number;
  volume?: number;
  amount?: number;
  turnover?: number;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  mainFundFlow?: number;
  raw: Record<string, unknown>;
}

@Injectable()
export class StockMarketService {
  private readonly logger = new Logger(StockMarketService.name);
  private readonly eastmoneyToken = 'D43BF722C8E33BDC906FB84D85E326E8';
  private yahooFinancePromise?: Promise<any>;

  async search(keyword: string): Promise<StockLookupResult[]> {
    const candidates = this.normalizeCandidates(keyword);
    if (!candidates.length) {
      return [];
    }

    const eastmoneyResults = await this.searchEastmoney(candidates[0]);
    if (eastmoneyResults.length) {
      return eastmoneyResults;
    }

    const merged = new Map<string, StockLookupResult>();
    let yahooFinance: any;

    try {
      yahooFinance = await this.getYahooFinance();
    } catch (error) {
      this.logger.warn(`Failed to load yahoo-finance2 for stock search: ${error instanceof Error ? error.message : 'unknown error'}`);
      return this.buildFallbackResults(candidates[0]);
    }

    for (const candidate of candidates) {
      try {
        const result = await yahooFinance.search(candidate, { quotesCount: 8, newsCount: 0 });
        for (const quote of result.quotes ?? []) {
          if (!quote.symbol || !quote.shortname) {
            continue;
          }
          if (!this.isSupportedQuote(quote.symbol, quote.exchange)) {
            continue;
          }
          merged.set(quote.symbol, {
            symbol: quote.symbol,
            shortName: quote.shortname,
            exchange: quote.exchange,
            market: this.detectMarket(quote.symbol, quote.exchange),
          });
        }
      } catch {
        continue;
      }
    }

    const resolved = Array.from(merged.values()).slice(0, 8);
    if (resolved.length) {
      return resolved;
    }

    return this.buildFallbackResults(candidates[0]);
  }

  async getSnapshot(symbol: string): Promise<StockSnapshotData | null> {
    const normalized = this.normalizeSymbol(symbol);

    const eastmoneySnapshot = await this.getSnapshotFromEastmoney(normalized);
    if (eastmoneySnapshot) {
      return eastmoneySnapshot;
    }

    try {
      const yahooFinance = await this.getYahooFinance();
      const quote = await yahooFinance.quote(normalized);
      const summary = await yahooFinance.quoteSummary(normalized, {
        modules: ['price', 'summaryDetail', 'financialData', 'defaultKeyStatistics'],
      });
      const price = Number(quote.regularMarketPrice || 0);
      const volume = quote.regularMarketVolume ? Number(quote.regularMarketVolume) : undefined;
      const sharesOutstanding = summary.defaultKeyStatistics?.sharesOutstanding
        ? Number(summary.defaultKeyStatistics.sharesOutstanding)
        : undefined;

      return {
        symbol: normalized,
        shortName: quote.shortName || quote.longName || normalized,
        market: this.detectMarket(normalized, quote.fullExchangeName),
        price,
        changePercent: Number(quote.regularMarketChangePercent || 0),
        volume,
        amount: volume ? Number((volume * price).toFixed(2)) : undefined,
        turnover: volume && sharesOutstanding ? Number(((volume / sharesOutstanding) * 100).toFixed(2)) : undefined,
        high: quote.regularMarketDayHigh ? Number(quote.regularMarketDayHigh) : undefined,
        low: quote.regularMarketDayLow ? Number(quote.regularMarketDayLow) : undefined,
        open: quote.regularMarketOpen ? Number(quote.regularMarketOpen) : undefined,
        previousClose: quote.regularMarketPreviousClose ? Number(quote.regularMarketPreviousClose) : undefined,
        marketCap: summary.price?.marketCap ? Number(summary.price.marketCap) : undefined,
        peRatio: summary.summaryDetail?.trailingPE ? Number(summary.summaryDetail.trailingPE) : undefined,
        pbRatio: summary.defaultKeyStatistics?.priceToBook ? Number(summary.defaultKeyStatistics.priceToBook) : undefined,
        mainFundFlow: summary.financialData?.operatingCashflow ? Number(summary.financialData.operatingCashflow) : undefined,
        raw: {
          quote,
          summary,
        },
      };
    } catch (error) {
      this.logger.warn(`Failed to load stock snapshot for ${normalized}: ${error instanceof Error ? error.message : 'unknown error'}`);
      return null;
    }
  }

  private normalizeCandidates(keyword: string) {
    const cleaned = keyword?.trim();
    if (!cleaned) {
      return [];
    }

    if (/^\d{6}$/.test(cleaned)) {
      return [`${cleaned}.SS`, `${cleaned}.SZ`, cleaned];
    }
    return [cleaned];
  }

  private async getYahooFinance(): Promise<any> {
    if (!this.yahooFinancePromise) {
      this.yahooFinancePromise = import('yahoo-finance2').then((module) => module.default || module);
    }
    return this.yahooFinancePromise;
  }

  private async searchEastmoney(keyword: string): Promise<StockLookupResult[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const url = new URL('https://searchapi.eastmoney.com/api/suggest/get');
      url.searchParams.set('input', keyword.replace(/\.(SS|SZ)$/i, ''));
      url.searchParams.set('type', '14');
      url.searchParams.set('token', this.eastmoneyToken);
      url.searchParams.set('count', '10');

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://quote.eastmoney.com/',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(`Eastmoney stock search failed with status ${response.status}`);
        return [];
      }

      const data = await response.json() as EastmoneySuggestResponse;
      const rows = data.QuotationCodeTable?.Data ?? [];

      return rows
        .filter((item) => item.Code && item.Name)
        .filter((item) => this.isSupportedEastmoneyItem(item))
        .map((item) => ({
          symbol: this.normalizeEastmoneySymbol(item),
          shortName: item.Name as string,
          market: this.detectEastmoneyMarket(item),
          exchange: item.SecurityTypeName,
        }))
        .filter((item, index, arr) => arr.findIndex((candidate) => candidate.symbol === item.symbol) === index)
        .slice(0, 8);
    } catch (error) {
      this.logger.warn(`Eastmoney stock search request failed: ${error instanceof Error ? error.message : 'unknown error'}`);
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  private async getSnapshotFromEastmoney(symbol: string): Promise<StockSnapshotData | null> {
    const secId = this.resolveEastmoneySecId(symbol);
    if (!secId) {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const url = new URL('https://push2.eastmoney.com/api/qt/stock/get');
      url.searchParams.set('secid', secId);
      url.searchParams.set('fields', 'f57,f58,f43,f44,f45,f46,f47,f48,f60,f62,f116,f164,f167,f168,f170');

      const response = await fetch(url.toString(), {
        headers: {
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://quote.eastmoney.com/',
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(`Eastmoney stock snapshot failed with status ${response.status} for ${symbol}`);
        return null;
      }

      const payload = await response.json() as EastmoneyQuoteResponse;
      const data = payload.data;
      if (!data?.f57 || !data.f58 || typeof data.f43 !== 'number') {
        return null;
      }

      const resolvedSymbol = this.normalizeSymbol(data.f57);
      return {
        symbol: resolvedSymbol,
        shortName: data.f58,
        market: this.detectMarket(resolvedSymbol),
        price: this.parseEastmoneyPrice(data.f43) ?? 0,
        changePercent: this.parseEastmoneyRatio(data.f170) ?? 0,
        volume: this.parseEastmoneyNumber(data.f47),
        amount: this.parseEastmoneyNumber(data.f48),
        turnover: this.parseEastmoneyRatio(data.f168),
        high: this.parseEastmoneyPrice(data.f44),
        low: this.parseEastmoneyPrice(data.f45),
        open: this.parseEastmoneyPrice(data.f46),
        previousClose: this.parseEastmoneyPrice(data.f60),
        marketCap: this.parseEastmoneyNumber(data.f116),
        peRatio: this.parseEastmoneyRatio(data.f164),
        pbRatio: this.parseEastmoneyRatio(data.f167),
        mainFundFlow: this.parseEastmoneyNumber(data.f62),
        raw: {
          eastmoney: data,
        },
      };
    } catch (error) {
      this.logger.warn(`Eastmoney stock snapshot request failed for ${symbol}: ${error instanceof Error ? error.message : 'unknown error'}`);
      return null;
    } finally {
      clearTimeout(timeout);
    }
  }

  private normalizeSymbol(symbol: string) {
    const cleaned = symbol.trim().toUpperCase();
    if (/^\d{6}$/.test(cleaned)) {
      if (cleaned.startsWith('6')) {
        return `${cleaned}.SS`;
      }
      return `${cleaned}.SZ`;
    }
    return cleaned;
  }

  private resolveEastmoneySecId(symbol: string) {
    const normalized = this.normalizeSymbol(symbol);
    if (/^\d{6}\.SS$/.test(normalized)) {
      return `1.${normalized.slice(0, 6)}`;
    }

    if (/^\d{6}\.SZ$/.test(normalized)) {
      return `0.${normalized.slice(0, 6)}`;
    }

    return null;
  }

  private buildFallbackResults(keyword: string): StockLookupResult[] {
    const normalized = keyword.trim().toUpperCase();
    if (!/^\d{6}(\.SS|\.SZ)?$/.test(normalized)) {
      return [];
    }

    const symbol = this.normalizeSymbol(normalized.replace(/\.(SS|SZ)$/i, ''));
    return [
      {
        symbol,
        shortName: normalized.replace(/\.(SS|SZ)$/i, ''),
        market: this.detectMarket(symbol),
      },
    ];
  }

  private isSupportedEastmoneyItem(item: EastmoneySuggestItem) {
    if (item.Classify !== 'AStock') {
      return false;
    }

    const code = item.Code ?? '';
    return /^\d{6}$/.test(code);
  }

  private normalizeEastmoneySymbol(item: EastmoneySuggestItem) {
    const quoteId = item.QuoteID ?? '';
    const code = item.Code ?? '';

    if (quoteId.startsWith('1.')) {
      return `${code}.SS`;
    }

    if (quoteId.startsWith('0.')) {
      return `${code}.SZ`;
    }

    return this.normalizeSymbol(code);
  }

  private detectEastmoneyMarket(item: EastmoneySuggestItem) {
    const quoteId = item.QuoteID ?? '';
    if (quoteId.startsWith('1.')) {
      return 'A股·上证';
    }

    if (quoteId.startsWith('0.')) {
      return 'A股·深证';
    }

    return item.SecurityTypeName || 'A股';
  }

  private parseEastmoneyPrice(value?: number) {
    return typeof value === 'number' ? Number((value / 100).toFixed(2)) : undefined;
  }

  private parseEastmoneyRatio(value?: number) {
    return typeof value === 'number' ? Number((value / 100).toFixed(2)) : undefined;
  }

  private parseEastmoneyNumber(value?: number) {
    return typeof value === 'number' ? Number(value) : undefined;
  }

  private detectMarket(symbol: string, exchange?: string) {
    if (symbol.endsWith('.SS') || exchange?.includes('Shanghai')) {
      return 'A股·上证';
    }
    if (symbol.endsWith('.SZ') || exchange?.includes('Shenzhen')) {
      return 'A股·深证';
    }
    return exchange || '未知市场';
  }

  private isSupportedQuote(symbol: string, exchange?: string) {
    return symbol.endsWith('.SS') || symbol.endsWith('.SZ') || exchange?.includes('Shanghai') || exchange?.includes('Shenzhen');
  }
}
