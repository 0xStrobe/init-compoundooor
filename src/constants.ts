export const PAIR = {
    USDC_INIT: "0x543b35a39cfadad3da3c23249c474455d15efd2f94f849473226dee8a3c7a9e1",
    ETH_INIT: "0x7474cfe3c89670ec70dacb438f7fbc4ffef712b5d7e5ad9137c98e403df71d1b",
} as const;
export type Pair = (typeof PAIR)[keyof typeof PAIR];
export type PairName = keyof typeof PAIR;

export const getPairDisplayName = (moveAddress: `move/${string}`) => {
    const pair = "0x" + moveAddress.split("/")[1];
    return (Object.keys(PAIR).find((key) => PAIR[key as keyof typeof PAIR] === pair) ?? null) as PairName | null;
};

export const getPair = (moveAddress: `move/${string}`) => {
    const pair = "0x" + moveAddress.split("/")[1];
    return Object.values(PAIR).find((value) => value === pair) ?? null;
};

export const ASSET_METADATA = {
    INIT: "0x8e4733bdabcf7d4afc3d14f0dd46c9bf52fb0fce9e4b996c939e195b8bc891d9",
    USDC: "0xe0e9394b24e53775d6af87934ac02d73536ad58b7894f6ccff3f5e7c0d548e55",
    ETH: "0xedfcddacac79ab86737a1e9e65805066d8be286a37cb94f4884b892b0e39f954",
} as const;
export type AssetMetadata = (typeof ASSET_METADATA)[keyof typeof ASSET_METADATA];

export const VALIDATOR = {
    DELPHI: "initvaloper1qgje6dgazcruzsashpqektp2yaf47x2wyysjqx",
    A41: "initvaloper1uzg06y6u7j9qw4cz9ff7v72v2p8hxse5phl8c5",
    VALIDAO: "initvaloper16nxknnlh7jua8586vrw9nmlggu5wyflyry2unw",
    KEPLR: "initvaloper1qvmhe73us6z3h72j06d0sqsxqxt5pa6ak2aczx",
    INERTIA: "initvaloper1gs7kwd5jm8ghnvx4z973aqcenfcej6ykpuydc4",
    LUGANODES: "initvaloper14pslrmhz2w4ufjlup4s53zsapwv269lv7agf9z",
    COINAGE_DAIC: "initvaloper1y89ehx5z3ycyzc402sadnfevwg057vtjxxg8sq",
    ZELLIC: "initvaloper1r20z6zmlnqrea5p9cendrgeke35nxzfueqwaz6",
} as const;
export type Validator = (typeof VALIDATOR)[keyof typeof VALIDATOR];
