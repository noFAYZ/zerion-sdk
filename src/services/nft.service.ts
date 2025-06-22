import { HttpClient } from '../lib/http-client';
import {
  ApiResponse,
  NFT,
  NFTsParams
} from '../types';
import { buildQueryParams, validateRequired, createNFTReference, parseNFTReference } from '../utils';

export class NFTService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get list of NFTs by references
   */
  async getNFTs(params: NFTsParams): Promise<ApiResponse<NFT[]>> {
    validateRequired({ 
      'filter.references': params.filter?.references 
    }, ['filter.references']);
    
    const query = `?${buildQueryParams(params)}`;
    
    return this.httpClient.get<ApiResponse<NFT[]>>(
      `/v1/nfts/${query}`
    );
  }

  /**
   * Get single NFT by ID
   */
  async getNFT(
    nftId: string, 
    options?: { include?: string[] }
  ): Promise<ApiResponse<NFT>> {
    validateRequired({ nftId }, ['nftId']);
    
    const params: Record<string, any> = {};
    if (options?.include) {
      params.include = options.include.join(',');
    }
    
    const query = Object.keys(params).length > 0 ? `?${buildQueryParams(params)}` : '';
    
    return this.httpClient.get<ApiResponse<NFT>>(
      `/v1/nfts/${nftId}${query}`
    );
  }

  /**
   * Get NFT by chain, contract address, and token ID
   */
  async getNFTByReference(
    chainId: string,
    contractAddress: string,
    tokenId: string,
    options?: { include?: string[] }
  ): Promise<NFT | null> {
    validateRequired({ 
      chainId, 
      contractAddress, 
      tokenId 
    }, ['chainId', 'contractAddress', 'tokenId']);
    
    const reference = createNFTReference(chainId, contractAddress, tokenId);
    
    try {
      const response = await this.getNFTs({
        filter: { references: [reference] },
        include: options?.include
      });
      
      const nfts = Array.isArray(response.data) ? response.data : [];
      return nfts.length > 0 ? nfts[0] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get multiple NFTs by references
   */
  async getNFTsByReferences(
    references: string[],
    options?: { include?: string[] }
  ): Promise<NFT[]> {
    validateRequired({ references }, ['references']);
    
    if (references.length === 0) {
      return [];
    }
    
    const response = await this.getNFTs({
      filter: { references },
      include: options?.include
    });
    
    return Array.isArray(response.data) ? response.data : [];
  }

  /**
   * Get NFTs from a specific collection
   */
  async getNFTsFromCollection(
    chainId: string,
    contractAddress: string,
    tokenIds: string[],
    options?: { include?: string[] }
  ): Promise<NFT[]> {
    validateRequired({ 
      chainId, 
      contractAddress, 
      tokenIds 
    }, ['chainId', 'contractAddress', 'tokenIds']);
    
    const references = tokenIds.map(tokenId => 
      createNFTReference(chainId, contractAddress, tokenId)
    );
    
    return this.getNFTsByReferences(references, options);
  }

  /**
   * Batch get NFTs (handles large numbers of references by chunking)
   */
  async batchGetNFTs(
    references: string[],
    options?: { 
      include?: string[];
      chunkSize?: number;
    }
  ): Promise<NFT[]> {
    validateRequired({ references }, ['references']);
    
    if (references.length === 0) {
      return [];
    }

    const chunkSize = options?.chunkSize || 50; // API might have limits
    const chunks: string[][] = [];
    
    for (let i = 0; i < references.length; i += chunkSize) {
      chunks.push(references.slice(i, i + chunkSize));
    }
    
    const allNFTs: NFT[] = [];
    
    for (const chunk of chunks) {
      try {
        const nfts = await this.getNFTsByReferences(chunk, options);
        allNFTs.push(...nfts);
      } catch (error) {
        console.warn('Failed to fetch chunk of NFTs:', error);
        // Continue with other chunks
      }
    }
    
    return allNFTs;
  }

  /**
   * Get NFT metadata with enhanced information
   */
  async getNFTWithMetadata(nftId: string): Promise<{
    nft: NFT;
    metadata: {
      hasImage: boolean;
      hasVideo: boolean;
      hasAudio: boolean;
      contentUrls: string[];
      estimatedValue?: number;
    };
  } | null> {
    try {
      const response = await this.getNFT(nftId, { 
        include: ['collection', 'chain'] 
      });
      
      const nft = response.data;
      const content = nft.attributes.content;
      
      const metadata = {
        hasImage: Boolean(content?.preview?.url || content?.detail?.url),
        hasVideo: Boolean(content?.detail?.url?.includes('.mp4') || content?.detail?.url?.includes('.webm')),
        hasAudio: Boolean(content?.detail?.url?.includes('.mp3') || content?.detail?.url?.includes('.wav')),
        contentUrls: [
          content?.preview?.url,
          content?.detail?.url
        ].filter(Boolean) as string[],
        estimatedValue: undefined // Would need market data integration
      };
      
      return { nft, metadata };
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate NFT reference format
   */
  validateNFTReference(reference: string): {
    isValid: boolean;
    parsed?: {
      chainId: string;
      contractAddress: string;
      tokenId: string;
    };
    error?: string;
  } {
    try {
      const parsed = parseNFTReference(reference);
      return {
        isValid: true,
        parsed
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Invalid reference format'
      };
    }
  }

  /**
   * Create NFT reference from components
   */
  createReference(
    chainId: string,
    contractAddress: string,
    tokenId: string
  ): string {
    return createNFTReference(chainId, contractAddress, tokenId);
  }

  /**
   * Parse NFT reference into components
   */
  parseReference(reference: string): {
    chainId: string;
    contractAddress: string;
    tokenId: string;
  } {
    return parseNFTReference(reference);
  }

  /**
   * Get NFT collection summary from NFTs
   */
  async getCollectionSummary(
    chainId: string,
    contractAddress: string,
    sampleTokenIds: string[]
  ): Promise<{
    collectionInfo?: {
      name: string;
      description?: string;
      icon?: string;
    };
    sampleNFTs: NFT[];
    totalSampled: number;
  }> {
    const nfts = await this.getNFTsFromCollection(
      chainId, 
      contractAddress, 
      sampleTokenIds
    );
    
    const collectionInfo = nfts.length > 0 
      ? nfts[0].attributes.collection_info 
      : undefined;
    
    return {
      collectionInfo: collectionInfo ? {
        name: collectionInfo.name,
        description: collectionInfo.description,
        icon: collectionInfo.icon?.url
      } : undefined,
      sampleNFTs: nfts,
      totalSampled: nfts.length
    };
  }

  /**
   * Check if NFT exists
   */
  async nftExists(
    chainId: string,
    contractAddress: string,
    tokenId: string
  ): Promise<boolean> {
    try {
      const nft = await this.getNFTByReference(chainId, contractAddress, tokenId);
      return nft !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get NFTs with error handling for individual failures
   */
  async getNFTsSafely(references: string[]): Promise<{
    success: NFT[];
    failed: { reference: string; error: string }[];
  }> {
    const results = await Promise.allSettled(
      references.map(async (reference) => {
        const nfts = await this.getNFTsByReferences([reference]);
        return { reference, nft: nfts[0] || null };
      })
    );
    
    const success: NFT[] = [];
    const failed: { reference: string; error: string }[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.nft) {
        success.push(result.value.nft);
      } else {
        failed.push({
          reference: references[index],
          error: result.status === 'rejected' 
            ? result.reason?.message || 'Unknown error'
            : 'NFT not found'
        });
      }
    });
    
    return { success, failed };
  }
}