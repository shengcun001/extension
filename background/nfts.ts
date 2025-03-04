import {
  ETHEREUM,
  POLYGON,
  OPTIMISM,
  ARBITRUM_ONE,
  AVALANCHE,
  BINANCE_SMART_CHAIN,
} from "./constants"
import { EVMNetwork } from "./networks"
// Networks that are not added to this struct will
// not have an in-wallet NFT tab
export const CHAIN_ID_TO_NFT_METADATA_PROVIDER: {
  [chainID: string]: ("simplehash" | "poap")[]
} = {
  [ETHEREUM.chainID]: ["simplehash", "poap"],
  [POLYGON.chainID]: ["simplehash"],
  [OPTIMISM.chainID]: ["simplehash"],
  [ARBITRUM_ONE.chainID]: ["simplehash"],
  [AVALANCHE.chainID]: ["simplehash"],
  [BINANCE_SMART_CHAIN.chainID]: ["simplehash"],
}

export const NFT_PROVIDER_TO_CHAIN = {
  poap: [ETHEREUM.chainID],
  simplehash: [
    ETHEREUM.chainID,
    POLYGON.chainID,
    OPTIMISM.chainID,
    ARBITRUM_ONE.chainID,
    AVALANCHE.chainID,
    BINANCE_SMART_CHAIN.chainID,
  ],
}

export const NETWORKS_SUPPORTING_NFTS = new Set(
  Object.keys(CHAIN_ID_TO_NFT_METADATA_PROVIDER)
)

export type NFTsWithPagesResponse = {
  nfts: NFT[]
  nextPageURL: string | null
}

export type NFT = {
  id: string
  tokenId: string
  collectionID: string
  name: string
  description: string
  thumbnailURL?: string
  previewURL?: string
  transferDate?: string
  attributes: { trait: string; value: string }[]
  contract: string
  owner: string
  network: EVMNetwork
  isBadge: boolean
}

export type NFTCollection = {
  id: string
  name: string
  owner: string
  network: EVMNetwork
  hasBadges: boolean
  thumbnailURL?: string
  nftCount?: number
  totalNftCount?: number
  floorPrice?: {
    value: bigint
    token: {
      name: string
      symbol: string
      decimals: number
    }
  }
}

export type TransferredNFT = {
  id: string
  chainID: string
  from: string | null
  to: string | null
  type: "sell" | "buy"
  collectionID: string | null
}
