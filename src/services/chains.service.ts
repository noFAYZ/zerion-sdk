import { HttpClient } from '../lib/http-client';
import { ApiResponse, Chain } from '../types';
import { validateRequired } from '../utils';

export class ChainsService {
  private chainsCache: Chain[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private httpClient: HttpClient) {}

  /**
   * Get list of all supported chains
   */
  async getChains(useCache: boolean = true): Promise<ApiResponse<Chain[]>> {
    if (useCache && this.isCacheValid()) {
      return {
        data: this.chainsCache!,
        links: { self: '/v1/chains/' }
      };
    }

    const response = await this.httpClient.get<ApiResponse<Chain[]>>('/v1/chains/');
    
    if (Array.isArray(response.data)) {
      this.chainsCache = response.data;
      this.cacheTimestamp = Date.now();
    }
    
    return response;
  }

  /**
   * Get chain by ID
   */
  async getChain(chainId: string): Promise<ApiResponse<Chain>> {
    validateRequired({ chainId }, ['chainId']);
    
    return this.httpClient.get<ApiResponse<Chain>>(`/v1/chains/${chainId}`);
  }

  /**
   * Get all chains as a simple array
   */
  async getAllChains(useCache: boolean = true): Promise<Chain[]> {
    const response = await this.getChains(useCache);
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Find chains by name (case-insensitive search)
   */
  async findChainsByName(name: string): Promise<Chain[]> {
    const chains = await this.getAllChains();
    const searchTerm = name.toLowerCase();
    
    return chains.filter(chain => 
      chain.attributes.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get chain by external ID (e.g., Ethereum chain ID)
   */
  async getChainByExternalId(externalId: string): Promise<Chain | null> {
    const chains = await this.getAllChains();
    
    return chains.find(chain => 
      chain.attributes.external_id === externalId
    ) || null;
  }

  /**
   * Get chains that support trading
   */
  async getTradingChains(): Promise<Chain[]> {
    const chains = await this.getAllChains();
    
    return chains.filter(chain => 
      chain.attributes.flags?.supports_trading === true
    );
  }

  /**
   * Get mainnet chains (exclude testnets)
   */
  async getMainnetChains(): Promise<Chain[]> {
    const chains = await this.getAllChains();
    
    // Filter out common testnet patterns
    const testnetPatterns = [
      'testnet',
      'test',
      'goerli',
      'ropsten',
      'rinkeby',
      'kovan',
      'sepolia',
      'mumbai'
    ];
    
    return chains.filter(chain => {
      const name = chain.attributes.name.toLowerCase();
      return !testnetPatterns.some(pattern => name.includes(pattern));
    });
  }

  /**
   * Get popular/major chains
   */
  async getPopularChains(): Promise<Chain[]> {
    const chains = await this.getAllChains();
    
    // Define popular chain external IDs
    const popularChainIds = [
      '1',      // Ethereum
      '137',    // Polygon
      '56',     // BSC
      '43114',  // Avalanche
      '250',    // Fantom
      '42161',  // Arbitrum
      '10',     // Optimism
      '100',    // Gnosis
      '1285',   // Moonriver
      '25'      // Cronos
    ];
    
    const popularChains = chains.filter(chain => 
      popularChainIds.includes(chain.attributes.external_id)
    );
    
    // Sort by the order defined above
    return popularChains.sort((a, b) => {
      const indexA = popularChainIds.indexOf(a.attributes.external_id);
      const indexB = popularChainIds.indexOf(b.attributes.external_id);
      return indexA - indexB;
    });
  }

  /**
   * Get L2 chains
   */
  async getL2Chains(): Promise<Chain[]> {
    const chains = await this.getAllChains();
    
    const l2ChainIds = [
      '42161',  // Arbitrum One
      '10',     // Optimism
      '137',    // Polygon
      '324',    // zkSync Era
      '1101',   // Polygon zkEVM
      '8453',   // Base
      '59144',  // Linea
      '534352', // Scroll
    ];
    
    return chains.filter(chain => 
      l2ChainIds.includes(chain.attributes.external_id)
    );
  }

  /**
   * Get EVM compatible chains
   */
  async getEVMChains(): Promise<Chain[]> {
    const chains = await this.getAllChains();
    
    // Most chains in Zerion are EVM compatible, but we can filter out known non-EVM chains
    const nonEvmChainIds = [
      'solana',
      'near',
      'cosmos',
      'terra',
      'algorand'
    ];
    
    return chains.filter(chain => 
      !nonEvmChainIds.some(id => chain.id.toLowerCase().includes(id))
    );
  }

  /**
   * Refresh the chains cache
   */
  async refreshCache(): Promise<void> {
    this.chainsCache = null;
    this.cacheTimestamp = 0;
    await this.getChains(false);
  }

  /**
   * Get chain statistics
   */
  async getChainStats(): Promise<{
    total: number;
    mainnet: number;
    testnet: number;
    trading: number;
    l2: number;
  }> {
    const [allChains, mainnetChains, tradingChains, l2Chains] = await Promise.all([
      this.getAllChains(),
      this.getMainnetChains(),
      this.getTradingChains(),
      this.getL2Chains()
    ]);
    
    return {
      total: allChains.length,
      mainnet: mainnetChains.length,
      testnet: allChains.length - mainnetChains.length,
      trading: tradingChains.length,
      l2: l2Chains.length
    };
  }

  /**
   * Validate if a chain ID exists
   */
  async isValidChainId(chainId: string): Promise<boolean> {
    try {
      await this.getChain(chainId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get chain display information
   */
  async getChainDisplayInfo(chainId: string): Promise<{
    name: string;
    icon?: string;
    externalId: string;
    supportsTrading: boolean;
  } | null> {
    try {
      const response = await this.getChain(chainId);
      const chain = response.data;
      
      return {
        name: chain.attributes.name,
        icon: chain.attributes.icon?.url,
        externalId: chain.attributes.external_id,
        supportsTrading: chain.attributes.flags?.supports_trading || false
      };
    } catch {
      return null;
    }
  }

  private isCacheValid(): boolean {
    return this.chainsCache !== null && 
           (Date.now() - this.cacheTimestamp) < this.CACHE_TTL;
  }
}