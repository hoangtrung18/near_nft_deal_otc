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
  token_id: string;

  nftAddress: AccountId;
  constructor(payload: any) {
    this.token_id = payload.token_id;

    this.nftAddress = payload.nftAddress;
  }
}

class Deal {
  makerAddress: AccountId;
  takerAddress: AccountId;
  zeroForMaker: boolean;
  approvalId: number;
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
    this.approvalId = payload.approvalId;
  }
}
@NearBindgen({})
export class Contract {
  deal_by_id: LookupMap<any>;
  byOwnerId: LookupMap<any>;
  byNftContractId: LookupMap<any>;
  deal_current_index: number;
  owner_id: AccountId;
  constructor() {
    this.owner_id = "";

    this.deal_by_id = new LookupMap("t");
    this.deal_current_index = 1;
  }

  @initialize({})
  init({ owner_id }: { owner_id: AccountId }) {
    this.deal_current_index = 1;
    this.byOwnerId = new LookupMap("byOwnerId");
    this.byNftContractId = new LookupMap("byNftContractId");
    this.deal_by_id = new LookupMap("t");
    this.owner_id = owner_id;
  }

  @call({}) // This method changes the state, for which it cost gas
  create_deal({
    takerAddress,
    zeroForMaker,
    amount,
    makerApprovalId,
    makerNfts,
    takerNfts,
  }: {
    takerAddress: AccountId;
    zeroForMaker: boolean;
    amount: number;
    makerApprovalId: number;
    makerNfts: NftDeal;
    takerNfts: NftDeal;
  }): Deal {
    const newId = this.deal_current_index.toString();
    const newDeal: Deal = {
      takerAddress,
      makerAddress: near.predecessorAccountId(),
      zeroForMaker,
      amount,
      approvalId: makerApprovalId,
      makerNfts,
      takerNfts,
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

  @call({}) // This method changes the state, for which it cost gas
  take_deal({
    deal_id,
    taker_approval_id,
  }: {
    deal_id: number;
    taker_approval_id: number;
  }): Deal {
    const deal: Deal = this.deal_by_id.get(deal_id.toString());
    let amount = near.attachedDeposit().valueOf();
    if (deal.zeroForMaker && deal.amount > 0) {
      assert(
        amount >= deal.amount,
        `Requires minimum deposit of ${deal.amount}`
      );
    }
    transfer_nft({
      contract: this,
      to: deal.takerAddress,
      approvalId: deal.approvalId,
      nftAddress: deal.makerNfts.nftAddress,
      tokenId: deal.makerNfts.token_id,
    });

    transfer_nft({
      contract: this,
      to: deal.makerAddress,
      approvalId: taker_approval_id,
      nftAddress: deal.takerNfts.nftAddress,
      tokenId: deal.makerNfts.token_id,
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
}
