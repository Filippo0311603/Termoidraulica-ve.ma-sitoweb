export type Product = {
    id: string | number;
    category: string;
    name: string;
    price: string;
    image: string;
    desc: string;
    specs: string[];
    stock?: number;
};
