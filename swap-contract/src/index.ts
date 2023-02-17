export const DELIMETER = ".";
// Find all our documentation at https://docs.near.org
import {
  NearBindgen,
  near,
  call,
  view,
  LookupMap,
  initialize,
  assert,
} from "near-sdk-js";
import { transfer_nft } from "./takedeal";
import { AccountId } from "near-sdk-js/lib/types";
import { internalNftOnApprove } from "./nft_callbacks";
//the minimum storage to have a sale on the contract.
export const STORAGE_PER_SALE: bigint =
  BigInt(1000) * near.storageByteCost().valueOf();
class NftDeal {
  tokenId: string;

  nftAddress: AccountId;
  constructor(payload: any) {
    this.tokenId = payload.token_id;
    this.nftAddress = payload.nft_address;
  }
}

class Deal {
  makerAddress: AccountId;
  takerAddress: AccountId;
  zeroForMaker: boolean;
  amount: number;
  makerNfts: NftDeal;
  takerNfts: NftDeal;
  constructor(payload: any) {
    this.makerAddress = payload.makerAddress;
    this.takerAddress = payload.takerAddress;
    this.zeroForMaker = payload.zeroForMaker;
    this.makerNfts = payload.makerNfts;
    this.takerNfts = payload.takerNfts;
    this.amount = payload.amount;
  }
}
@NearBindgen({})
export class Contract {
  deal_by_id: LookupMap<any>;
  byOwnerId: LookupMap<any>;
  byNftContractId: LookupMap<any>;
  storageApproved: LookupMap<number>;
  deal_current_index: number;
  owner_id: AccountId;
  constructor() {
    this.owner_id = "";
    this.byOwnerId = new LookupMap("byOwnerId");
    this.byNftContractId = new LookupMap("byNftContractId");
    this.storageApproved = new LookupMap("storageApproved");
    this.deal_by_id = new LookupMap("t");
    this.deal_current_index = 1;
  }

  @initialize({})
  init({ owner_id }: { owner_id: AccountId }) {
    this.deal_current_index = 1;
    this.byOwnerId = new LookupMap("byOwnerId");
    this.byNftContractId = new LookupMap("byNftContractId");
    this.storageApproved = new LookupMap("storageApproved");
    this.deal_by_id = new LookupMap("t");
    this.owner_id = owner_id;
  }

  @call({ payableFunction: true }) // This method changes the state, for which it cost gas
  create_deal({
    taker_address,
    zero_for_maker,
    amount,
    maker_nfts,
    taker_nfts,
  }: {
    taker_address: AccountId;
    zero_for_maker: boolean;
    amount: number;
    maker_nfts: NftDeal;
    taker_nfts: NftDeal;
  }): Deal {
    const newId = this.deal_current_index.toString();
    let makerAmount = near.attachedDeposit().valueOf();
    if (!zero_for_maker) {
      assert(makerAmount >= amount, `Requires minimum deposit of ${amount}`);
    }
    const newDeal: Deal = {
      takerAddress: taker_address,
      makerAddress: near.predecessorAccountId(),
      zeroForMaker: zero_for_maker,
      amount,
      makerNfts: maker_nfts,
      takerNfts: taker_nfts,
    };
    this.deal_by_id.set(newId, newDeal);
    this.deal_current_index += 1;
    return newDeal;
  }

  @view({})
  get_deal({ deal_id }: { deal_id: number }): Deal {
    return this.deal_by_id.get(deal_id.toString());
  }

  @view({})
  //return the minimum storage for 1 sale
  storage_minimum_balance(): string {
    return STORAGE_PER_SALE.toString();
  }

  @call({ payableFunction: true }) // This method changes the state, for which it cost gas
  take_deal({ deal_id }: { deal_id: number; taker_approval_id: number }): Deal {
    const deal: Deal = this.deal_by_id.get(deal_id.toString());
    let amount = near.attachedDeposit().valueOf();
    if (deal.zeroForMaker && deal.amount > 0) {
      assert(
        amount >= deal.amount,
        `Requires minimum deposit of ${deal.amount}`
      );
    }
    let contractAndTokenIdMaker = `${deal.makerNfts.nftAddress}${DELIMETER}${deal.makerNfts.tokenId}`;
    const approvalIdForTaker = this.storageApproved.get(
      contractAndTokenIdMaker
    );
    transfer_nft({
      contract: this,
      to: deal.takerAddress,
      approvalId: approvalIdForTaker,
      nftAddress: deal.makerNfts.nftAddress,
      tokenId: deal.makerNfts.tokenId,
    });
    let contractAndTokenIdTaker = `${deal.takerNfts.nftAddress}${DELIMETER}${deal.takerNfts.tokenId}`;
    const approvalIdForMaker = this.storageApproved.get(
      contractAndTokenIdTaker
    );

    transfer_nft({
      contract: this,
      to: deal.makerAddress,
      approvalId: approvalIdForMaker,
      nftAddress: deal.takerNfts.nftAddress,
      tokenId: deal.makerNfts.tokenId,
    });
    return deal;
  }

  /*
      APPROVALS
  */
  @call({})
  /// where we add the sale because we know nft owner can only call nft_approve
  nft_on_approve({
    token_id,
    owner_id,
    approval_id,
    msg,
  }: {
    token_id: string;
    owner_id: string;
    approval_id: number;
    msg: string;
  }) {
    return internalNftOnApprove({
      contract: this,
      tokenId: token_id,
      ownerId: owner_id,
      approvalId: approval_id,
      msg: msg,
    });
  }

  @view({})
  /// where we add the sale because we know nft owner can only call nft_approve
  check_approve({
    token_id,
    contract_id,
  }: {
    token_id: string;
    contract_id: string;
  }) {
    return this.storageApproved.get(`${contract_id}${DELIMETER}${token_id}`);
  }
}
