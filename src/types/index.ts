export type Product = {
    id: string | number;
    category: string;
    name: string;
    price: string;
    image: string;
    datasheet?: string;
    desc: string;
    specs: string[];
    stock?: number;
};

export type CartItem = {
    product: Product;
    quantity: number;
};
