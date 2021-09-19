// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  Address,
  DataSourceTemplate,
  DataSourceContext
} from "@graphprotocol/graph-ts";

export class FundingRound extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("FundingRound", [address.toHex()]);
  }

  static createWithContext(address: Address, context: DataSourceContext): void {
    DataSourceTemplate.createWithContext(
      "FundingRound",
      [address.toHex()],
      context
    );
  }
}

export class OptimisticRecipientRegistry extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("OptimisticRecipientRegistry", [address.toHex()]);
  }

  static createWithContext(address: Address, context: DataSourceContext): void {
    DataSourceTemplate.createWithContext(
      "OptimisticRecipientRegistry",
      [address.toHex()],
      context
    );
  }
}

export class BrightIdUserRegistry extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("BrightIdUserRegistry", [address.toHex()]);
  }

  static createWithContext(address: Address, context: DataSourceContext): void {
    DataSourceTemplate.createWithContext(
      "BrightIdUserRegistry",
      [address.toHex()],
      context
    );
  }
}