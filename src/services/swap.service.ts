import { HttpClient } from '../lib/http-client';
import {
  ApiResponse,
  Fungible,
  SwapOffer,
  SwapFungiblesParams,
  SwapOffersParams
} from '../types';
import { buildQueryParams, validateRequired } from '../utils';

export class SwapService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get fungibles available for bridge/swap
   */
  async getSwapFungibles(params?: SwapFungiblesParams): Promise<ApiResponse<Fungible[]>> {
    const query = params ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<Fungible[]>>(
      `/v1/swap/fungibles/${query}`
    );
  }

  /**
   * Get available swap offers
   */
  async getSwapOffers(params: SwapOffersParams): Promise<ApiResponse<SwapOffer[]>> {
    validateRequired({ 
      input: params.input, 
      output: params.output 
    }, ['input', 'output']);
    
    const query = `?${buildQueryParams(params)}`;
    
    return this.httpClient.get<ApiResponse<SwapOffer[]>>(
      `/v1/swap/offers/${query}`
    );
  }

  /**
   * Get the best swap offer
   */
  async getBestSwapOffer(params: SwapOffersParams): Promise<SwapOffer | null> {
    const response = await this.getSwapOffers({
      ...params,
      sort: 'amount' // Sort by amount to get best rate
    });
    
    const offers = Array.isArray(response.data) ? response.data : [];
    return offers.length > 0 ? offers[0] : null;
  }

  /**
   * Get swap offers with gas optimization
   */
  async getGasOptimizedOffers(params: SwapOffersParams): Promise<SwapOffer[]> {
    const response = await this.getSwapOffers({
      ...params,
      sort: 'gas_fee' // Sort by gas fee
    });
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get input fungibles for a specific output chain
   */
  async getInputFungibles(outputChainId: string): Promise<Fungible[]> {
    validateRequired({ outputChainId }, ['outputChainId']);
    
    const response = await this.getSwapFungibles({
      output: { chain_id: outputChainId },
      direction: 'input'
    });
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get output fungibles for a specific input chain
   */
  async getOutputFungibles(inputChainId: string): Promise<Fungible[]> {
    validateRequired({ inputChainId }, ['inputChainId']);
    
    const response = await this.getSwapFungibles({
      input: { chain_id: inputChainId },
      direction: 'output'
    });
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get bridge fungibles (input and output chains are different)
   */
  async getBridgeFungibles(
    inputChainId: string, 
    outputChainId: string
  ): Promise<Fungible[]> {
    validateRequired({ inputChainId, outputChainId }, ['inputChainId', 'outputChainId']);
    
    const response = await this.getSwapFungibles({
      input: { chain_id: inputChainId },
      output: { chain_id: outputChainId },
      direction: 'both'
    });
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Compare swap rates across different providers
   */
  async compareSwapRates(params: SwapOffersParams): Promise<{
    offers: SwapOffer[];
    bestRate: SwapOffer | null;
    worstRate: SwapOffer | null;
    averageRate: number;
    rateSpread: number;
  }> {
    const response = await this.getSwapOffers(params);
    const offers = Array.isArray(response.data) ? response.data : [];
    
    if (offers.length === 0) {
      return {
        offers: [],
        bestRate: null,
        worstRate: null,
        averageRate: 0,
        rateSpread: 0
      };
    }

    // Calculate rates (output amount / input amount)
    const rates = offers.map(offer => 
      offer.attributes.receive_quantity.float / offer.attributes.send_quantity.float
    );
    
    const sortedRates = [...rates].sort((a, b) => b - a);
    const bestRate = offers[rates.indexOf(sortedRates[0])];
    const worstRate = offers[rates.indexOf(sortedRates[sortedRates.length - 1])];
    const averageRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const rateSpread = sortedRates[0] - sortedRates[sortedRates.length - 1];

    return {
      offers,
      bestRate,
      worstRate,
      averageRate,
      rateSpread
    };
  }

  /**
   * Estimate swap with different slippage tolerances
   */
  async estimateSwapWithSlippage(
    params: Omit<SwapOffersParams, 'slippage_percent'>
  ): Promise<Record<string, SwapOffer | null>> {
    const slippages = ['0.5', '1', '2', '5'];
    const results: Record<string, SwapOffer | null> = {};
    
    await Promise.allSettled(
      slippages.map(async (slippage) => {
        try {
          const offer = await this.getBestSwapOffer({
            ...params,
            slippage_percent: parseFloat(slippage)
          });
          results[`${slippage}%`] = offer;
        } catch (error) {
          results[`${slippage}%`] = null;
        }
      })
    );
    
    return results;
  }

  /**
   * Get cross-chain swap options
   */
  async getCrossChainSwapOptions(
    fromChainId: string,
    toChainId: string,
    tokenSymbol?: string
  ): Promise<{
    availableTokens: Fungible[];
    sampleOffers: SwapOffer[];
  }> {
    validateRequired({ fromChainId, toChainId }, ['fromChainId', 'toChainId']);
    
    const availableTokens = await this.getBridgeFungibles(fromChainId, toChainId);
    
    // Get sample offers for the first few tokens
    const sampleOffers: SwapOffer[] = [];
    const tokensToSample = tokenSymbol 
      ? availableTokens.filter(t => t.attributes.symbol.toLowerCase() === tokenSymbol.toLowerCase())
      : availableTokens.slice(0, 3);
    
    for (const token of tokensToSample) {
      try {
        const implementation = token.attributes.implementations.find(
          impl => impl.chain_id === fromChainId
        );
        
        if (implementation) {
          const offer = await this.getBestSwapOffer({
            input: {
              chain_id: fromChainId,
              address: implementation.address,
              amount: '1000000000000000000' // 1 token (18 decimals)
            },
            output: {
              chain_id: toChainId,
              address: implementation.address
            }
          });
          
          if (offer) {
            sampleOffers.push(offer);
          }
        }
      } catch (error) {
        // Continue with next token if this one fails
        continue;
      }
    }
    
    return {
      availableTokens,
      sampleOffers
    };
  }

  /**
   * Calculate swap impact and fees
   */
  async calculateSwapImpact(params: SwapOffersParams): Promise<{
    offer: SwapOffer | null;
    priceImpact: number;
    gasFee: string;
    protocolFee: number;
    totalCost: number;
  }> {
    const offer = await this.getBestSwapOffer(params);
    
    if (!offer) {
      return {
        offer: null,
        priceImpact: 0,
        gasFee: '0',
        protocolFee: 0,
        totalCost: 0
      };
    }

    // Extract gas fee from transaction data
    const gasFee = offer.attributes.data.gas_limit;
    
    // Calculate price impact (simplified - would need reference price for accuracy)
    const inputAmount = offer.attributes.send_quantity.float;
    const outputAmount = offer.attributes.receive_quantity.float;
    const rate = outputAmount / inputAmount;
    
    // Assuming 0.5% protocol fee (adjust based on actual implementation)
    const protocolFee = inputAmount * 0.005;
    
    return {
      offer,
      priceImpact: 0, // Would need reference price to calculate
      gasFee,
      protocolFee,
      totalCost: protocolFee
    };
  }

  /**
   * Get quote for exact input amount
   */
  async getQuoteExactIn(
    inputToken: { chainId: string; address?: string },
    outputToken: { chainId: string; address?: string },
    inputAmount: string,
    options?: {
      slippage?: number;
      gasPrice?: string;
    }
  ): Promise<SwapOffer | null> {
    return this.getBestSwapOffer({
      input: {
        chain_id: inputToken.chainId,
        address: inputToken.address,
        amount: inputAmount
      },
      output: {
        chain_id: outputToken.chainId,
        address: outputToken.address
      },
      slippage_percent: options?.slippage || 2,
      gas_price: options?.gasPrice
    });
  }

  /**
   * Get supported liquidity sources
   */
  async getSupportedLiquiditySources(): Promise<string[]> {
    // This would typically come from an endpoint or be predefined
    return [
      'uniswap_v2',
      'uniswap_v3',
      'sushiswap',
      'curve',
      'balancer',
      'pancakeswap',
      '1inch',
      'paraswap',
      'kyber',
      'bancor'
    ];
  }

  /**
   * Validate swap parameters
   */
  validateSwapParams(params: SwapOffersParams): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!params.input?.chain_id) {
      errors.push('Input chain ID is required');
    }
    
    if (!params.output?.chain_id) {
      errors.push('Output chain ID is required');
    }
    
    if (!params.input?.amount) {
      errors.push('Input amount is required');
    } else {
      const amount = parseFloat(params.input.amount);
      if (isNaN(amount) || amount <= 0) {
        errors.push('Input amount must be a positive number');
      }
    }
    
    if (params.slippage_percent !== undefined) {
      if (params.slippage_percent < 0 || params.slippage_percent > 50) {
        errors.push('Slippage percent must be between 0 and 50');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if tokens can be swapped
   */
  async canSwap(
    inputToken: { chainId: string; address?: string },
    outputToken: { chainId: string; address?: string }
  ): Promise<boolean> {
    try {
      if (inputToken.chainId === outputToken.chainId) {
        // Same chain swap
        const fungibles = await this.getSwapFungibles({
          input: { chain_id: inputToken.chainId },
          output: { chain_id: outputToken.chainId },
          direction: 'both'
        });
        return Array.isArray(fungibles.data) && fungibles.data.length > 0;
      } else {
        // Cross-chain bridge
        const bridgeFungibles = await this.getBridgeFungibles(
          inputToken.chainId,
          outputToken.chainId
        );
        return bridgeFungibles.length > 0;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Get swap route information
   */
  async getSwapRoute(params: SwapOffersParams): Promise<{
    route: string[];
    hops: number;
    protocols: string[];
    estimatedGas: string;
  } | null> {
    const offer = await this.getBestSwapOffer(params);
    
    if (!offer) {
      return null;
    }

    // Extract route information from offer metadata
    const liquiditySource = offer.attributes.meta.liquidity_source;
    const isDirectSwap = params.input.chain_id === params.output.chain_id;
    
    return {
      route: isDirectSwap 
        ? ['input_token', 'output_token']
        : ['input_token', 'bridge', 'output_token'],
      hops: isDirectSwap ? 1 : 2,
      protocols: liquiditySource ? [liquiditySource.name] : ['unknown'],
      estimatedGas: offer.attributes.data.gas_limit
    };
  }
}