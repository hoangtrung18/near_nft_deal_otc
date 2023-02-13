// Find all our documentation at https://docs.near.org
import {
  NearBindgen,
  near,
  call,
  view,
  LookupMap,
  initialize,
} from "near-sdk-js";
import { AccountId } from "near-sdk-js/lib/types";
class NftDeal {
  token_id: number;
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
  amount: number;
  makerNfts: NftDeal[];
  takerNfts: NftDeal[];
  constructor(payload: any) {
    this.makerAddress = payload.makerAddress;
    this.takerAddress = payload.takerAddress;
    this.zeroForMaker = payload.zeroForMaker;
    this.amount = payload.amount;
  }
}
@NearBindgen({})
class Contract {
  deal_by_id: LookupMap<any>;
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
    this.deal_by_id = new LookupMap("t");
    this.owner_id = owner_id;
  }

  @call({}) // This method changes the state, for which it cost gas
  create_deal({
    takerAddress,
    zeroForMaker,
    amount,
    makerNfts,
    takerNfts,
  }: {
    takerAddress: AccountId;
    zeroForMaker: boolean;
    amount: number;
    makerNfts: NftDeal[];
    takerNfts: NftDeal[];
  }): Deal {
    const newId = this.deal_current_index.toString();
    const newDeal: Deal = {
      takerAddress,
      makerAddress: near.predecessorAccountId(),
      zeroForMaker,
      amount,
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
}
