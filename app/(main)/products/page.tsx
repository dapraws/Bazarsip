async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products");
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <h1>Products</h1>
      {products.map((p: any) => (
        <div key={p.id}>
          <h3>{p.name}</h3>
          <p>Rp {p.price}</p>
        </div>
      ))}
    </div>
  );
}
