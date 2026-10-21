"use client";

import { useState } from "react";

import { PRODUCTS, PRODUCT_LABELS, type ProductType } from "@/lib/db/enums";
import { defaultPriceUsd, formatPriceRange, getProduct } from "@/lib/pricing";

import { enumOptions } from "../format";
import { SelectField, TextField } from "../form-fields";

/** Default case price for a product, from src/lib/pricing.ts (retainer work: 0). */
export function casePriceDefault(product: ProductType): number {
  return product === "retainer" ? 0 : defaultPriceUsd(product);
}

function priceHint(product: ProductType) {
  if (product === "retainer") return "Work under a retainer is billed monthly; usually 0 here.";
  return `List price ${formatPriceRange(getProduct(product))}.`;
}

/** Product select plus a price field that follows the product's list price. */
export function ProductPriceFields({
  defaultProduct = "assessment",
  defaultPrice,
}: {
  defaultProduct?: ProductType;
  defaultPrice?: number;
}) {
  const [product, setProduct] = useState<ProductType>(defaultProduct);
  const [price, setPrice] = useState<string>(String(defaultPrice ?? casePriceDefault(defaultProduct)));
  return (
    <>
      <SelectField
        name="product"
        label="Product"
        required
        options={enumOptions(PRODUCTS, PRODUCT_LABELS)}
        value={product}
        onValueChange={(v) => {
          const p = v as ProductType;
          setProduct(p);
          setPrice(String(casePriceDefault(p)));
        }}
      />
      <TextField
        name="priceUsd"
        label="Price (USD)"
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        required
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        description={priceHint(product)}
      />
    </>
  );
}
